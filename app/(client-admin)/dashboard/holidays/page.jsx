import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { getBusinessHolidays } from "@/actions/holidays";
import HolidaysClient from "./HolidaysClient";
import { ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HolidaysPage() {
  const user = await checkUser();
  if (!user || user.role !== "CLIENT_ADMIN") {
    redirect("/sign-in");
  }

  const business = await db.business.findUnique({
    where: { ownerId: user.id }
  });

  if (!business) {
    redirect("/dashboard");
  }

  const res = await getBusinessHolidays();

  if (!res.success) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Error Loading Holidays</h3>
        <p className="text-muted-foreground">{res.error}</p>
      </div>
    );
  }

  return <HolidaysClient initialHolidays={res.holidays} />;
}
