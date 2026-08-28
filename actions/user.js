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

    if (!user.businessId) {
      return { success: true, locked: false };
    }

    // If pending approval, they are locked to this mess
    if (user.status === "PENDING") {
      const currentMess = await db.business.findUnique({
        where: { id: user.businessId }
      });
      return { 
        success: true,
        locked: true, 
        reason: `You have a pending registration request at "${currentMess?.name || 'another mess'}".`,
        messName: currentMess?.name || "another mess"
      };
    }

    // If active, check remaining tokens (meals)
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
        const currentMess = await db.business.findUnique({
          where: { id: user.businessId }
        });
        const remaining = activeSub.mealCount - activeSub.usedMeals;
        return {
          success: true,
          locked: true,
          reason: `You still have ${remaining} active meal tokens at "${currentMess?.name || 'your current mess'}".`,
          messName: currentMess?.name || "your current mess"
        };
      }
    }

    // In other cases (SUSPENDED, EXPIRED, etc. or ACTIVE with 0 remaining tokens), they are unlocked
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
    if (user.status === "PENDING" && user.businessId) {
      return "/pending-approval";
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
        status: "ACTIVE", // Set to ACTIVE initially so they can access dashboard/explore messes
        businessId: null  // Not linked to any mess initially
      }
    });

    revalidatePath("/");
    return { success: true, user: updatedUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function requestToJoinMess(messId) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");
    if (user.role !== "CUSTOMER") throw new Error("Only customers can join a mess");

    // Find the business by uniqueId
    const business = await db.business.findUnique({
      where: { uniqueId: messId }
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
        businessId: business.id,
        status: "PENDING" // Set to PENDING awaiting approval
      }
    });

    revalidatePath("/");
    return { success: true, user: updatedUser };
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
