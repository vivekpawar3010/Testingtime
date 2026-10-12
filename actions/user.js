"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function setUserRole(role) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { role }
    });

    revalidatePath("/");
    return { success: true, user: updatedUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function registerCustomerProfile(data) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    // Prevent mess owners or admins from registering as customers
    const existingBusiness = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (user.role === "CLIENT_ADMIN" || user.role === "SUPER_ADMIN" || existingBusiness) {
      throw new Error("You are registered as a mess owner or platform administrator. You cannot register as a customer.");
    }

    // Check registration lock status
    if (user.businessId) {
      if (user.status === "PENDING") {
        throw new Error("You already have a pending registration request at another mess. You cannot join another mess until this is resolved.");
      }

      if (user.status === "ACTIVE") {
        const activeSub = await db.subscription.findFirst({
          where: {
            userId: user.id,
            businessId: user.businessId,
            status: "ACTIVE"
          },
          orderBy: { createdAt: "desc" }
        });

        if (activeSub && activeSub.usedMeals < activeSub.mealCount) {
          const remaining = activeSub.mealCount - activeSub.usedMeals;
          throw new Error(`You cannot register at a different mess because you still have ${remaining} active meal tokens at your current mess.`);
        }
      }
    }

    // Find the business by uniqueId
    const business = await db.business.findUnique({
      where: { uniqueId: data.messId }
    });

    if (!business) {
      throw new Error("Mess not found with this ID.");
    }
    
    if (business.status !== "APPROVED") {
      throw new Error("This mess is not yet approved by the platform administrator.");
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        phone: data.phone,
        businessId: business.id,
        requestedPlan: data.requestedPlan,
        role: "CUSTOMER", // Explicitly set role to CUSTOMER
        status: "PENDING" // Explicitly set status to PENDING
      }
    });

    revalidatePath("/");
    return { success: true, user: updatedUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function checkCustomerRegistrationLockStatus() {
  try {
    const user = await checkUser();
    if (!user) {
      return { success: true, locked: false };
    }

    // Lock registration if user is a mess owner or admin
    const existingBusiness = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (user.role === "CLIENT_ADMIN" || user.role === "SUPER_ADMIN" || existingBusiness) {
      return {
        success: true,
        locked: true,
        reason: "You are registered as a mess owner or platform administrator. Mess owners cannot register as customers.",
        messName: "Owner Profile"
      };
    }

    // Only lock if actively enrolled at a mess with remaining active meals
    if (user.status === "ACTIVE" && user.businessId) {
      const activeSub = await db.subscription.findFirst({
        where: {
          userId: user.id,
          businessId: user.businessId,
          status: "ACTIVE"
        },
        orderBy: { createdAt: "desc" }
      });

      if (activeSub && activeSub.usedMeals < activeSub.mealCount) {
        const currentMess = await db.business.findUnique({
          where: { id: user.businessId }
        });
        const remaining = activeSub.mealCount - activeSub.usedMeals;
        return {
          success: true,
          locked: true,
          reason: `You still have ${remaining} active meal tokens at "${currentMess?.name || 'your current mess'}". Please finish or exhaust your remaining tokens before switching.`,
          messName: currentMess?.name || "your current mess"
        };
      }
    }

    return { success: true, locked: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getUserRedirectPathHelper(user) {
  if (!user) return "/";
  
  if (user.role === "SUPER_ADMIN") {
    return "/super-admin";
  }
  
  if (user.role === "CLIENT_ADMIN") {
    if (!user.ownedBusiness) {
      return "/choose-role";
    }
    if (user.ownedBusiness.status === "PENDING") {
      return "/pending-approval";
    }
    if (user.ownedBusiness.status === "APPROVED") {
      return "/dashboard";
    }
  }
  
  if (user.role === "CUSTOMER") {
    if (!user.name || !user.phone) {
      return "/customer/register";
    }
    return "/customer/dashboard";
  }
  
  return "/";
}

export async function registerCustomerInitialProfile(data) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        phone: data.phone,
        role: "CUSTOMER",
        status: "ACTIVE", // Active so customer can explore and request messes freely
        businessId: null
      }
    });

    revalidatePath("/");
    return { success: true, user: updatedUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function requestToJoinMess(messId, planId) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");
    if (user.role !== "CUSTOMER") throw new Error("Only customers can join a mess");

    // Find the business by uniqueId or id
    const business = await db.business.findFirst({
      where: {
        OR: [{ uniqueId: messId }, { id: messId }]
      },
      include: { plans: true }
    });

    if (!business) {
      throw new Error("Mess not found with this ID.");
    }
    
    if (business.status !== "APPROVED") {
      throw new Error("This mess is not yet approved by the platform administrator.");
    }

    // Check if customer already has a pending subscription request for this mess
    const existingReq = await db.subscriptionRequest.findFirst({
      where: {
        userId: user.id,
        businessId: business.id,
        status: "PENDING"
      }
    });

    if (existingReq) {
      throw new Error(`You already have a pending request for ${business.name}. Please wait for the owner to review.`);
    }

    // Determine target plan
    let targetPlanId = planId;
    if (!targetPlanId && business.plans && business.plans.length > 0) {
      targetPlanId = business.plans[0].id;
    }

    if (!targetPlanId) {
      const defaultPlan = await db.subscriptionPlan.create({
        data: {
          businessId: business.id,
          name: "Standard Monthly Plan",
          mealCount: 60,
          mealPrice: 50,
          totalAmount: 3000,
          validityDays: 30,
          reminderCount: 3
        }
      });
      targetPlanId = defaultPlan.id;
    }

    // Create SubscriptionRequest so it is stored in diner's requests list
    const newRequest = await db.subscriptionRequest.create({
      data: {
        userId: user.id,
        businessId: business.id,
        planId: targetPlanId,
        status: "PENDING"
      }
    });

    // Link customer to business if not linked
    if (!user.businessId) {
      await db.user.update({
        where: { id: user.id },
        data: {
          businessId: business.id,
          requestedPlan: targetPlanId
        }
      });
    }

    // Create customer notification
    await db.notification.create({
      data: {
        userId: user.id,
        type: "SYSTEM",
        message: `Your request to join ${business.name} has been submitted! Waiting for owner approval.`,
        status: "UNREAD"
      }
    });

    revalidatePath("/customer/dashboard");
    revalidatePath("/find-mess");
    return { success: true, request: newRequest, businessName: business.name };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getCustomerJoinRequests() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CUSTOMER") throw new Error("Unauthorized");

    const requests = await db.subscriptionRequest.findMany({
      where: { userId: user.id },
      include: {
        business: true,
        plan: true
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, requests };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function checkCustomerProfileStatus() {
  try {
    const user = await checkUser();
    if (!user) {
      return { success: true, loggedIn: false };
    }
    const isRegistered = !!(user.name && user.phone);
    return { success: true, loggedIn: true, isRegistered, role: user.role };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
