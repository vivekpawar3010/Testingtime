"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function submitBusinessProfile(data) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    // Prevent customers or users linked to a mess from creating a business profile
    if (user.role === "CUSTOMER" || user.businessId) {
      throw new Error("You are registered as a customer at a mess. A customer account cannot create a mess profile.");
    }

    const business = await db.business.create({
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        ownerId: user.id,
      }
    });

    await db.user.update({
      where: { id: user.id },
      data: { businessId: business.id }
    });

    revalidatePath("/");
    return { success: true, businessId: business.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getPendingBusinesses() {
  const user = await checkUser();
  if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  return await db.business.findMany({
    where: { status: "PENDING" },
    include: { owner: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function approveBusiness(businessId, uniqueId) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

    const updatedBusiness = await db.business.update({
      where: { id: businessId },
      data: { status: "APPROVED", uniqueId }
    });

    // Also update the business owner's user status to ACTIVE
    await db.user.update({
      where: { id: updatedBusiness.ownerId },
      data: { status: "ACTIVE" }
    });

    // Check and auto-assign DEFAULT platform plan
    const defaultPlan = await db.businessPlan.findFirst({
      where: { type: "DEFAULT" }
    });

    if (defaultPlan) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + defaultPlan.validityDays);

      await db.businessSubscription.create({
        data: {
          businessId: updatedBusiness.id,
          planId: defaultPlan.id,
          status: "ACTIVE",
          startDate: new Date(),
          endDate
        }
      });
    }

    revalidatePath("/super-admin/requests");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function rejectBusiness(businessId) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

    await db.business.update({
      where: { id: businessId },
      data: { status: "REJECTED" }
    });

    revalidatePath("/super-admin/requests");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getApprovedBusinesses() {
  try {
    const businesses = await db.business.findMany({
      where: { status: "APPROVED" },
      include: { holidays: true },
      orderBy: { name: "asc" }
    });
    return { success: true, businesses };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getBusinessPlansByUniqueId(uniqueId) {
  try {
    const business = await db.business.findUnique({
      where: { uniqueId }
    });
    if (!business) throw new Error("Mess not found");

    const plans = await db.subscriptionPlan.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, plans };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getBusinessDailyMenuByUniqueId(uniqueId) {
  try {
    const business = await db.business.findUnique({
      where: { uniqueId }
    });
    if (!business) throw new Error("Mess not found");

    const dailyMenu = await db.menu.findFirst({
      where: {
        businessId: business.id,
        type: "DAILY",
        status: "ACTIVE"
      }
    });

    return { success: true, dailyMenu };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
