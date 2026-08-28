"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function saveHoliday(data) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business not found");

    const mealType = data.mealType || "ALL";

    let holiday;
    if (data.type === "WEEKLY") {
      if (!data.dayOfWeek) throw new Error("Day of week is required for weekly off.");
      
      const existing = await db.holiday.findFirst({
        where: {
          businessId: business.id,
          dayOfWeek: data.dayOfWeek,
          mealType: mealType
        }
      });

      if (existing) {
        holiday = await db.holiday.update({
          where: { id: existing.id },
          data: {
            title: data.title || `${data.dayOfWeek} Off`
          }
        });
      } else {
        holiday = await db.holiday.create({
          data: {
            businessId: business.id,
            dayOfWeek: data.dayOfWeek,
            mealType: mealType,
            title: data.title || `${data.dayOfWeek} Off`
          }
        });
      }
    } else {
      if (!data.date) throw new Error("Date is required for calendar holiday.");
      const dateObj = new Date(data.date);
      dateObj.setHours(0,0,0,0);

      const existing = await db.holiday.findFirst({
        where: {
          businessId: business.id,
          date: dateObj,
          mealType: mealType
        }
      });

      if (existing) {
        holiday = await db.holiday.update({
          where: { id: existing.id },
          data: {
            title: data.title || "Holiday"
          }
        });
      } else {
        holiday = await db.holiday.create({
          data: {
            businessId: business.id,
            date: dateObj,
            mealType: mealType,
            title: data.title || "Holiday"
          }
        });
      }
    }

    revalidatePath("/dashboard/settings");
    return { success: true, holiday };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getBusinessHolidays() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business not found");

    const holidays = await db.holiday.findMany({
      where: { businessId: business.id },
      orderBy: [
        { dayOfWeek: "asc" },
        { date: "asc" }
      ]
    });

    return { success: true, holidays };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteHoliday(id) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business not found");

    const holiday = await db.holiday.findUnique({
      where: { id }
    });
    if (!holiday || holiday.businessId !== business.id) {
      throw new Error("Unauthorized or holiday not found");
    }

    await db.holiday.delete({
      where: { id }
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
