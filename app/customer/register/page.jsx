"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { registerCustomerInitialProfile } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

function CustomerRegisterForm() {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const email = clerkUser?.primaryEmailAddress?.emailAddress || "";

  const derivedName = (() => {
    if (clerkUser?.fullName) return clerkUser.fullName;
    const first = clerkUser?.firstName || "";
    const last = clerkUser?.lastName || "";
    if (first || last) return `${first} ${last}`.trim();
    if (email) {
      const username = email.split("@")[0];
      const cleaned = username.replace(/[0-9]+/g, " ").trim();
      const parts = cleaned.split(/[\._\- ]+/).filter(Boolean);
      if (parts.length > 0) {
        return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
      }
    }
    return "";
  })();

  const derivedPhone = clerkUser?.primaryPhoneNumber?.phoneNumber || clerkUser?.phoneNumbers?.[0]?.phoneNumber || "";

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone")
    };

    const res = await registerCustomerInitialProfile(data);
    if (res.success) {
      toast.success("Profile registered successfully! Welcome to MessApp.");
      router.push("/customer/dashboard?welcome=true");
    } else {
      setError(res.error || "Failed to submit registration.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6 lg:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-50 via-background to-background" />
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/20 blur-3xl" />

      <Card className="w-full max-w-md border shadow-2xl bg-card/80 backdrop-blur-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-2 border border-indigo-100 shadow-sm">
            <UserCheck className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-indigo-950">
            Diner Profile Setup
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Confirm your details to connect with top messes near you.
          </CardDescription>
        </CardHeader>
        
        {error && (
          <div className="mx-6 rounded-xl bg-destructive/15 p-3 text-sm text-destructive font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-2">
            {/* Account Email Display */}
            {email && (
              <div className="rounded-xl bg-indigo-50/70 border border-indigo-100/60 p-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-950 truncate max-w-[220px]">{email}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ✓ Verified Account
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Full Name (Extracted from Email/Account)
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={derivedName}
                placeholder="Enter your full name"
                className="w-full rounded-xl border-indigo-100 focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Mobile Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                defaultValue={derivedPhone}
                placeholder="e.g. 9876543210"
                className="w-full rounded-xl border-indigo-100 focus:ring-2 focus:ring-indigo-600"
              />
              <p className="text-[11px] text-muted-foreground">
                Mess owners will use this mobile number for attendance and invoice notifications.
              </p>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 shadow-md transition-all cursor-pointer" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving Profile...
                </span>
              ) : (
                "Save & Explore Messes →"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    }>
      <CustomerRegisterForm />
    </Suspense>
  );
}
