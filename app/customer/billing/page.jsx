import { getCustomerBills } from "@/actions/billing";
import BillingClient from "./BillingClient";
import { ShieldAlert } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CustomerBillingPage() {
  const user = await checkUser();
  if (!user) {
    redirect("/sign-in");
  }

  if (!user.businessId) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
        <ShieldAlert className="h-12 w-12 text-amber-500 animate-bounce" />
        <h3 className="text-xl font-bold">No Mess Associated</h3>
        <p className="text-muted-foreground text-sm">
          You are not associated with any mess yet. Please link a mess from your dashboard first to view invoices.
        </p>
      </div>
    );
  }

  const res = await getCustomerBills();

  let business = null;
  if (user.businessId) {
    business = await db.business.findUnique({
      where: { id: user.businessId }
    });
  }

  if (!res.success) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Error Loading Bills</h3>
        <p className="text-muted-foreground">{res.error}</p>
      </div>
    );
  }

  return <BillingClient initialBills={res.bills} businessSettings={business} />;
}
