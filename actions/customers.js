"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";
import { generateUniqueInvoiceNumber } from "./billing";

export async function getBusinessCustomers() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });

    if (!business) throw new Error("Business profile not found");

    const customers = await db.user.findMany({
      where: { businessId: business.id, role: "CUSTOMER" },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        bills: {
          orderBy: { createdAt: "desc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, customers };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function approveCustomerRegistration(customerId) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business profile not found");

    // 1. Update customer status to ACTIVE
    await db.user.update({
      where: { id: customerId },
      data: { status: "ACTIVE" }
    });

    // Update pending subscription requests for this customer to APPROVED
    await db.subscriptionRequest.updateMany({
      where: {
        userId: customerId,
        businessId: business.id,
        status: "PENDING"
      },
      data: { status: "APPROVED" }
    });

    // 2. Create welcome notification
    await db.notification.create({
      data: {
        userId: customerId,
        type: "SYSTEM",
        message: `Welcome to ${business.name}! Your registration request has been approved. You can now request subscription plans from your plans portal.`,
        status: "UNREAD"
      }
    });

    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard");
    revalidatePath("/customer/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function rejectCustomerRegistration(customerId) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });

    // Unlink the user and set status back to PENDING so they can resubmit
    await db.user.update({
      where: { id: customerId },
      data: {
        businessId: null,
        status: "PENDING",
        requestedPlan: null
      }
    });

    // Update pending subscription requests to REJECTED
    if (business) {
      await db.subscriptionRequest.updateMany({
        where: {
          userId: customerId,
          businessId: business.id,
          status: "PENDING"
        },
        data: { status: "REJECTED" }
      });
    }

    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard");
    revalidatePath("/customer/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function suspendCustomer(customerId) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    await db.user.update({
      where: { id: customerId },
      data: { status: "SUSPENDED" }
    });

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function activateCustomer(customerId) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    await db.user.update({
      where: { id: customerId },
      data: { status: "ACTIVE" }
    });

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteCustomer(customerId) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    // Unlink the customer
    await db.user.update({
      where: { id: customerId },
      data: {
        businessId: null,
        status: "PENDING",
        role: "CUSTOMER",
        requestedPlan: null
      }
    });

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function manuallyAddCustomer(customerData, subData) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business profile not found");

    // Check if the user already exists by email
    let targetUser = await db.user.findUnique({
      where: { email: customerData.email }
    });

    if (targetUser) {
      // 1. Check if they are a mess owner or admin
      const existingBiz = await db.business.findUnique({
        where: { ownerId: targetUser.id }
      });
      if (targetUser.role === "CLIENT_ADMIN" || targetUser.role === "SUPER_ADMIN" || existingBiz) {
        throw new Error("This email is registered to a mess owner or platform administrator. They cannot be added as a customer.");
      }

      // 2. Check if they are locked to a different mess
      if (targetUser.businessId && targetUser.businessId !== business.id) {
        if (targetUser.status === "PENDING") {
          throw new Error("This customer already has a pending registration request at another mess.");
        }
        if (targetUser.status === "ACTIVE") {
          const activeSub = await db.subscription.findFirst({
            where: {
              userId: targetUser.id,
              businessId: targetUser.businessId,
              status: "ACTIVE"
            },
            orderBy: { createdAt: "desc" }
          });
          if (activeSub && activeSub.usedMeals < activeSub.mealCount) {
            const remaining = activeSub.mealCount - activeSub.usedMeals;
            throw new Error(`This customer cannot be added because they still have ${remaining} active meal tokens at another mess.`);
          }
        }
      }
    }

    if (!targetUser) {
      // Create user record (clerkUserId is generated as a mock since they don't have Clerk account yet)
      targetUser = await db.user.create({
        data: {
          clerkUserId: `MOCK-${Math.floor(100000 + Math.random() * 900000)}`,
          email: customerData.email,
          name: customerData.name,
          phone: customerData.phone,
          role: "CUSTOMER",
          status: "ACTIVE",
          businessId: business.id
        }
      });
    } else {
      // Update role and link
      targetUser = await db.user.update({
        where: { id: targetUser.id },
        data: {
          role: "CUSTOMER",
          status: "ACTIVE",
          businessId: business.id,
          phone: customerData.phone
        }
      });
    }

    // Create subscription
    const mealCount = parseInt(subData.mealCount);
    const mealPrice = parseFloat(subData.mealPrice);
    const totalAmount = subData.totalAmount ? parseFloat(subData.totalAmount) : (mealCount * mealPrice);
    const validityDays = parseInt(subData.validityDays);

    await db.subscription.create({
      data: {
        userId: targetUser.id,
        businessId: business.id,
        mealCount,
        usedMeals: 0,
        mealPrice,
        totalAmount,
        validityDays,
        reminderCount: parseInt(subData.reminderCount || 2),
        status: "ACTIVE"
      }
    });

    // Generate Invoice
    const invoiceNumber = await generateUniqueInvoiceNumber();

    await db.bill.create({
      data: {
        invoiceNumber,
        userId: targetUser.id,
        businessId: business.id,
        totalAmount,
        paidAmount: customerData.paidImmediately ? totalAmount : 0,
        remainingAmount: customerData.paidImmediately ? 0 : totalAmount,
        status: customerData.paidImmediately ? "PAID" : "UNPAID",
        dueDate: new Date(Date.now() + (business.invoiceDueDays || 7) * 24 * 60 * 60 * 1000)
      }
    });

    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function convertCustomerAbsentMeals(customerId, daysToConvert, note) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business profile not found");

    const activeSub = await db.subscription.findFirst({
      where: { userId: customerId, businessId: business.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" }
    });

    if (!activeSub) throw new Error("No active subscription found for this diner.");

    const count = parseInt(daysToConvert);
    if (isNaN(count) || count <= 0) throw new Error("Please enter a valid meal count to convert.");

    // Add meals to mealCount so remaining meals increase
    await db.subscription.update({
      where: { id: activeSub.id },
      data: {
        mealCount: activeSub.mealCount + count
      }
    });

    // Notify customer
    await db.notification.create({
      data: {
        userId: customerId,
        type: "SYSTEM",
        message: `${business.name} credited ${count} absent meal(s) back into your subscription! Reason: ${note || "Leave / holiday compensation"}.`,
        status: "UNREAD"
      }
    });

    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard");
    revalidatePath("/customer/dashboard");
    return { success: true, newMealCount: activeSub.mealCount + count };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
