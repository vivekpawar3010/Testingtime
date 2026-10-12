"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

export async function getCustomerDashboardData() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CUSTOMER") throw new Error("Unauthorized");

    // Fetch diner's join / subscription requests
    const customerRequests = await db.subscriptionRequest.findMany({
      where: { userId: user.id },
      include: { business: true, plan: true },
      orderBy: { createdAt: "desc" }
    });

    // Fetch approved businesses for exploration
    const approvedMesses = await db.business.findMany({
      where: { status: "APPROVED" },
      include: { holidays: true, plans: true },
      orderBy: { name: "asc" }
    });

    if (!user.businessId) {
      return {
        success: true,
        data: {
          notJoined: true,
          userName: user.name || user.email,
          userPhone: user.phone || "",
          customerRequests,
          approvedMesses
        }
      };
    }

    const business = await db.business.findUnique({
      where: { id: user.businessId }
    });

    if (!business) {
      return {
        success: true,
        data: {
          notJoined: true,
          userName: user.name || user.email,
          userPhone: user.phone || "",
          customerRequests,
          approvedMesses
        }
      };
    }

    // Fetch active subscription
    const subscription = await db.subscription.findFirst({
      where: {
        userId: user.id,
        businessId: business.id,
        status: "ACTIVE"
      },
      orderBy: { createdAt: "desc" }
    });

    if (!subscription || user.status === "PENDING") {
      return {
        success: true,
        data: {
          notJoined: true,
          userName: user.name || user.email,
          userPhone: user.phone || "",
          customerRequests,
          approvedMesses,
          pendingBusinessName: business.name
        }
      };
    }

    // Fetch recent meal logs (last 5)
    const logs = await db.mealLog.findMany({
      where: { userId: user.id, businessId: business.id },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    // Fetch all logs under this subscription to calculate attendance & absence
    const allSubLogs = subscription ? await db.mealLog.findMany({
      where: {
        userId: user.id,
        businessId: business.id,
        createdAt: { gte: subscription.createdAt }
      },
      select: { createdAt: true }
    }) : [];

    // Fetch invoices
    const bills = await db.bill.findMany({
      where: { userId: user.id, businessId: business.id },
      orderBy: { createdAt: "desc" }
    });

    // Fetch recent notifications
    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    // Fetch today's menu broadcast (if any)
    const dailyMenu = await db.menu.findFirst({
      where: {
        businessId: business.id,
        type: "DAILY",
        status: "ACTIVE"
      }
    });

    // Fetch holiday/off configurations
    const holidays = await db.holiday.findMany({
      where: { businessId: business.id }
    });

    // Calculate 3-part meal breakdown:
    // a. Initial / Total Starting Meals (30-60)
    // b. Consumed Meals / Present Days (scanned via QR)
    // c. Absent Meals (operating days elapsed without scans, excluding all holidays)
    let mealBreakdown = {
      startingMeals: subscription ? subscription.mealCount : 0,
      consumedMeals: subscription ? subscription.usedMeals : 0,
      absentMeals: 0,
      absentDays: 0,
      operatingDaysElapsed: 0,
      holidaysExcluded: 0,
      remainingMeals: subscription ? Math.max(0, subscription.mealCount - subscription.usedMeals) : 0,
      attendedDays: 0
    };

    if (subscription) {
      const kolkataFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });

      const attendedDateSet = new Set(
        allSubLogs.map(l => kolkataFormatter.format(new Date(l.createdAt)))
      );
      mealBreakdown.attendedDays = attendedDateSet.size;

      const daysList = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
      const startDate = new Date(subscription.createdAt);
      const now = new Date();

      let cur = new Date(startDate);
      cur.setHours(0, 0, 0, 0);
      const endDay = new Date(now);
      endDay.setHours(0, 0, 0, 0);

      let operatingCount = 0;
      let holidaysCount = 0;
      let absentCount = 0;

      while (cur <= endDay) {
        const dayOfWeek = daysList[cur.getDay()];
        const curDateStr = kolkataFormatter.format(cur);

        // Check if day is holiday (specific date or recurring weekly off)
        const isSpecificHoliday = holidays.some(h => h.date && kolkataFormatter.format(new Date(h.date)) === curDateStr);
        const isWeeklyOff = holidays.some(h => h.dayOfWeek && h.dayOfWeek.toUpperCase() === dayOfWeek);

        if (isSpecificHoliday || isWeeklyOff) {
          holidaysCount++;
        } else {
          operatingCount++;
          if (!attendedDateSet.has(curDateStr)) {
            absentCount++;
          }
        }

        cur.setDate(cur.getDate() + 1);
      }

      mealBreakdown.operatingDaysElapsed = operatingCount;
      mealBreakdown.holidaysExcluded = holidaysCount;
      mealBreakdown.absentDays = absentCount;
      mealBreakdown.absentMeals = absentCount;
    }

    const latestLog = logs[0] || null;
    let activeDinePass = null;
    if (latestLog) {
      const passDurationMins = business.dinePassDurationMins || 30;
      const differenceMins = (Date.now() - new Date(latestLog.createdAt).getTime()) / (1000 * 60);
      if (differenceMins < passDurationMins) {
        activeDinePass = {
          dinerName: user.name || user.email,
          mealType: latestLog.mealType,
          timestamp: latestLog.createdAt,
          remainingMeals: mealBreakdown.remainingMeals,
          totalMeals: mealBreakdown.startingMeals,
          businessName: business.name,
          expiresInMins: Math.max(1, Math.round(passDurationMins - differenceMins))
        };
      }
    }

    return {
      success: true,
      data: {
        userName: user.name || user.email,
        userPhone: user.phone || "",
        clerkUserId: user.clerkUserId,
        businessName: business.name,
        uniqueId: business.uniqueId,
        subscription,
        mealBreakdown,
        logs,
        bills,
        notifications,
        dailyMenu,
        activeDinePass,
        holidays,
        customerRequests,
        approvedMesses,
        businessSettings: {
          qrScanEnabled: business.qrScanEnabled,
          breakfastEnabled: business.breakfastEnabled,
          breakfastStart: business.breakfastStart,
          breakfastEnd: business.breakfastEnd,
          lunchEnabled: business.lunchEnabled,
          lunchStart: business.lunchStart,
          lunchEnd: business.lunchEnd,
          dinnerEnabled: business.dinnerEnabled,
          dinnerStart: business.dinnerStart,
          dinnerEnd: business.dinnerEnd,
        }
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
