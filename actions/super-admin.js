"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

// Access verification helper
async function verifySuperAdmin() {
  const user = await checkUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized access. Super Admin role required.");
  }
  return user;
}

// 1. Get Overview Stats
export async function getSuperAdminOverviewStats() {
  try {
    await verifySuperAdmin();

    const totalMesses = await db.business.count({
      where: { status: "APPROVED" }
    });

    const pendingRequests = await db.business.count({
      where: { status: "PENDING" }
    });

    const totalUsers = await db.user.count();

    const subscriptions = await db.businessSubscription.findMany({
      include: { plan: true }
    });

    const platformRevenue = subscriptions.reduce((sum, sub) => sum + (sub.plan?.price || 0), 0);

    const recentMesses = await db.business.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { owner: true }
    });

    return {
      success: true,
      stats: {
        totalMesses,
        pendingRequests,
        totalUsers,
        platformRevenue
      },
      recentMesses
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 2. Get Business Plans
export async function getBusinessPlans() {
  try {
    await verifySuperAdmin();
    const plans = await db.businessPlan.findMany({
      orderBy: { createdAt: "desc" }
    });
    return { success: true, plans };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 3. Create Business Plan
export async function createBusinessPlan(data) {
  try {
    await verifySuperAdmin();

    const price = parseFloat(data.price);
    const validityDays = parseInt(data.validityDays);
    const type = data.type || "REGULAR";

    if (type === "DEFAULT") {
      // Set all existing default plans to regular
      await db.businessPlan.updateMany({
        where: { type: "DEFAULT" },
        data: { type: "REGULAR" }
      });
    }

    const plan = await db.businessPlan.create({
      data: {
        name: data.name,
        price,
        validityDays,
        type
      }
    });

    revalidatePath("/super-admin/settings");
    return { success: true, plan };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 4. Delete Business Plan
export async function deleteBusinessPlan(planId) {
  try {
    await verifySuperAdmin();

    await db.businessPlan.delete({
      where: { id: planId }
    });

    revalidatePath("/super-admin/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 5. Get Messes with Pagination and Expiry Filters
export async function getMessesConsole(params = {}) {
  try {
    await verifySuperAdmin();

    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = params.searchQuery || "";
    const filterExpiringSoon = params.filterExpiringSoon === true || params.filterExpiringSoon === "true";

    let whereClause = {
      status: "APPROVED"
    };

    if (searchQuery) {
      whereClause.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { uniqueId: { contains: searchQuery, mode: "insensitive" } },
        { address: { contains: searchQuery, mode: "insensitive" } }
      ];
    }

    if (filterExpiringSoon) {
      const tenDaysFromNow = new Date();
      tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);
      whereClause.platformSubscriptions = {
        some: {
          status: "ACTIVE",
          endDate: {
            gte: new Date(),
            lte: tenDaysFromNow
          }
        }
      };
    }

    const totalMesses = await db.business.count({ where: whereClause });

    const messes = await db.business.findMany({
      where: whereClause,
      include: {
        owner: true,
        platformSubscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { plan: true }
        }
      },
      orderBy: { name: "asc" },
      skip,
      take: limit
    });

    return {
      success: true,
      messes,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalMesses / limit),
        totalMesses
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 6. Toggle Mess Active/Inactive Status
export async function toggleBusinessActiveState(businessId, isActive) {
  try {
    await verifySuperAdmin();

    const updated = await db.business.update({
      where: { id: businessId },
      data: { isActive: Boolean(isActive) }
    });

    revalidatePath("/super-admin/messes");
    return { success: true, business: updated };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 7. Assign subscription plan to a mess
export async function assignBusinessSubscription(businessId, planId = null, customEndDate = null) {
  try {
    await verifySuperAdmin();

    let targetPlanId = planId;

    if (!targetPlanId) {
      if (!customEndDate) {
        throw new Error("Please select a subscription plan template or enter a custom expiry date.");
      }
      
      // Find or create mock Custom Expiry Extension plan
      let customPlan = await db.businessPlan.findFirst({
        where: { name: "Custom Expiry Extension" }
      });
      if (!customPlan) {
        customPlan = await db.businessPlan.create({
          data: {
            name: "Custom Expiry Extension",
            price: 0,
            validityDays: 0,
            type: "REGULAR"
          }
        });
      }
      targetPlanId = customPlan.id;
    }

    const plan = await db.businessPlan.findUnique({
      where: { id: targetPlanId }
    });

    if (!plan) throw new Error("Subscription plan template not found.");

    // Deactivate previous active subscriptions for this mess
    await db.businessSubscription.updateMany({
      where: { businessId, status: "ACTIVE" },
      data: { status: "EXPIRED" }
    });

    // Calculate Expiry Date
    let endDate = new Date();
    if (customEndDate) {
      endDate = new Date(customEndDate);
    } else {
      endDate.setDate(endDate.getDate() + plan.validityDays);
    }

    const sub = await db.businessSubscription.create({
      data: {
        businessId,
        planId: targetPlanId,
        status: "ACTIVE",
        startDate: new Date(),
        endDate
      }
    });

    revalidatePath("/super-admin/messes");
    return { success: true, subscription: sub };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 8. Get Messes Expiring in 10 Days
export async function getExpiringMesses(daysLimit = 10) {
  try {
    await verifySuperAdmin();

    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + daysLimit);

    const messes = await db.business.findMany({
      where: {
        status: "APPROVED",
        platformSubscriptions: {
          some: {
            status: "ACTIVE",
            endDate: {
              gte: new Date(),
              lte: limitDate
            }
          }
        }
      },
      include: {
        owner: true,
        platformSubscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { name: "asc" }
    });

    return { success: true, messes };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function submitContactMessage(data) {
  try {
    const message = await db.contactMessage.create({
      data: {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        message: data.message
      }
    });
    return { success: true, message };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getContactMessages(page = 1) {
  try {
    await verifySuperAdmin();
    const limit = 10;
    const skip = (page - 1) * limit;

    const totalMessages = await db.contactMessage.count();
    const totalPages = Math.ceil(totalMessages / limit);

    const messages = await db.contactMessage.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    });

    return {
      success: true,
      messages,
      pagination: {
        page,
        limit,
        totalPages,
        totalMessages
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function replyToContactMessage(messageId, replyText) {
  try {
    await verifySuperAdmin();

    const updated = await db.contactMessage.update({
      where: { id: messageId },
      data: {
        status: "REPLIED",
        replyText
      }
    });

    revalidatePath("/super-admin/messages");
    return { success: true, message: updated };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
