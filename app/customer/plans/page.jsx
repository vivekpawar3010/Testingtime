import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getMessSubscriptionPlansForCustomer, getCustomerSubscriptionRequests } from "@/actions/subscriptions";
import PlansClient from "./PlansClient";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CustomerPlansPage() {
  const user = await checkUser();
  if (!user || user.role !== "CUSTOMER") {
    redirect("/sign-in");
  }

  if (!user.businessId) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
        <ShieldAlert className="h-12 w-12 text-indigo-500 animate-bounce" />
        <h3 className="text-xl font-bold">No Active Mess Associated</h3>
        <p className="text-muted-foreground text-sm">
          You are not associated with an active mess yet. Explore verified messes across Pune and request to join with a plan.
        </p>
        <Link href="/customer/dashboard">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md">
            Browse Messes in Pune
          </Button>
        </Link>
      </div>
    );
  }

  const plansRes = await getMessSubscriptionPlansForCustomer();
  const requestsRes = await getCustomerSubscriptionRequests();

  if (!plansRes.success || !requestsRes.success) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Error Loading Plans</h3>
        <p className="text-muted-foreground">{plansRes.error || requestsRes.error}</p>
      </div>
    );
  }

  // Fetch current active subscription if any
  const activeSubscription = await db.subscription.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <PlansClient 
      plans={plansRes.plans} 
      requests={requestsRes.requests} 
      activeSub={activeSubscription} 
    />
  );
}
