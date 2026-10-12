import { getCustomerBills } from "@/actions/billing";
import BillingClient from "./BillingClient";
import { ShieldAlert } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CustomerBillingPage() {
  const user = await checkUser();
  if (!user) {
    redirect("/sign-in");
  }

  if (!user.businessId) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
        <ShieldAlert className="h-12 w-12 text-indigo-500 animate-bounce" />
        <h3 className="text-xl font-bold">No Active Mess Associated</h3>
        <p className="text-muted-foreground text-sm">
          You are not associated with an active mess yet. Explore messes across Pune to start your dining plan and manage invoices.
        </p>
        <Link href="/customer/dashboard">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md">
            Browse Messes in Pune
          </Button>
        </Link>
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
