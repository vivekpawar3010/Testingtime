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
      toast.success("Profile registered successfully!");
      router.push("/customer/dashboard");
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

      <Card className="w-full max-w-md border shadow-2xl bg-card/70 backdrop-blur-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-2">
            <UserCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Customer Registration</CardTitle>
          <CardDescription>
            Complete your profile details to get started.
          </CardDescription>
        </CardHeader>
        
        {error && (
          <div className="mx-6 rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={clerkUser?.fullName || ""}
                placeholder="Enter your full name"
                className="w-full rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="10-digit phone number"
                className="w-full rounded-2xl"
              />
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl h-11 shadow-sm" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </span>
              ) : (
                "Complete Registration"
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
