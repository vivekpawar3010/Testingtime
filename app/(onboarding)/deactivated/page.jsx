import React from "react";
import { AlertOctagon } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DeactivatedPage() {
  const user = await checkUser();

  if (!user) {
    redirect("/");
  }

  // Redirect if they are active again
  if (user.role === "CLIENT_ADMIN" && user.ownedBusiness?.isActive !== false) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-red-50/20 p-4">
      <div className="mx-auto max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4 animate-pulse">
            <AlertOctagon className="h-12 w-12 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-red-950">
          Account Suspended
        </h1>
        
        <p className="text-base text-red-800/80 leading-relaxed">
          {user.role === "CUSTOMER" 
            ? "The mess you are registered with is currently inactive or deactivated on the platform. Please contact your mess manager/owner for assistance." 
            : "Your mess account has been marked as inactive by the platform administrator. This could be due to an expired subscription plan or verification review. Please contact support@messapp.com for renewal."
          }
        </p>
        
        <div className="rounded-xl border border-red-200 bg-white p-6 shadow-lg text-left space-y-4">
          <h3 className="font-semibold text-red-950 flex items-center gap-2">
            Why am I seeing this?
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-xs text-muted-foreground">
            {user.role === "CUSTOMER" ? (
              <>
                <li>Your mess's billing subscription to the platform may have expired.</li>
                <li>Your mess owner may have requested deactivation temporarily.</li>
                <li>Once the mess owner reactivates their plan, your access will be restored immediately.</li>
              </>
            ) : (
              <>
                <li>Your platform subscription plan has expired.</li>
                <li>Compliance verification hold.</li>
                <li>Please email our Billing Desk at <strong>billing@messapp.com</strong> to pay and renew.</li>
              </>
            )}
          </ul>
        </div>

        <div className="pt-4 flex flex-col items-center gap-2">
          <span className="text-sm text-muted-foreground">Logged in as {user.email}</span>
          <div className="flex gap-4 items-center">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-10 w-10" } }} />
          </div>
        </div>
      </div>
    </div>
  );
}
