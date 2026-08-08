"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { registerCustomerProfile, checkCustomerRegistrationLockStatus } from "@/actions/user";
import { getApprovedBusinesses } from "@/actions/business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import Link from "next/link";

function CustomerRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messIdParam = searchParams.get("messId") || "";
  const { user: clerkUser, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [fetchingMesses, setFetchingMesses] = useState(true);
  const [selectedMessId, setSelectedMessId] = useState("");

  const [lockStatus, setLockStatus] = useState({ locked: false, reason: "" });
  const [checkingLock, setCheckingLock] = useState(true);

  useEffect(() => {
    async function verifyLock() {
      try {
        const res = await checkCustomerRegistrationLockStatus();
        if (res.success && res.locked) {
          setLockStatus({ locked: true, reason: res.reason });
        }
      } catch (err) {
        console.error("Error verifying registration lock:", err);
      } finally {
        setCheckingLock(false);
      }
    }
    verifyLock();
  }, []);

  useEffect(() => {
    async function loadMesses() {
      try {
        const res = await getApprovedBusinesses();
        if (res.success) {
          setBusinesses(res.businesses);
        } else {
          toast.error(res.error || "Failed to load approved messes list.");
        }
      } catch (err) {
        toast.error("Error loading messes list.");
      } finally {
        setFetchingMesses(false);
      }
    }
    loadMesses();
  }, []);

  useEffect(() => {
    if (messIdParam) {
      setSelectedMessId(messIdParam);
    }
  }, [messIdParam]);

  if (!isLoaded || checkingLock) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (lockStatus.locked) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6 lg:p-8">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-50 via-background to-background" />
        <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/20 blur-3xl" />

        <Card className="w-full max-w-md border shadow-2xl bg-card/70 backdrop-blur-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-2 animate-bounce">
              <UserCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-indigo-950">Registration Locked</CardTitle>
            <CardDescription>
              You are already associated with an active food provider mess.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 text-left text-xs space-y-2">
              <p className="font-bold text-amber-950">Lockout details:</p>
              <p className="text-amber-900 leading-relaxed font-medium">
                {lockStatus.reason}
              </p>
              <p className="text-amber-700/80 text-[10px] leading-normal pt-1 border-t border-amber-200/50">
                To switch food providers, your active subscription balance must reach zero, or the mess owner must suspend or remove your profile.
              </p>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Link href="/customer/dashboard" className="w-full">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-2xl h-11 shadow-sm">
                Go to Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
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
      phone: formData.get("phone"),
      messId: selectedMessId,
      requestedPlan: "",
    };

    if (!data.messId) {
      setError("Please select a mess to request joining.");
      setLoading(false);
      return;
    }

    const res = await registerCustomerProfile(data);
    if (res.success) {
      router.push("/pending-approval");
    } else {
      setError(res.error || "Failed to submit registration request.");
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
            Join your mess by completing your profile.
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
                className="w-full"
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
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="messId">Select Mess (Mess Name & ID)</Label>
              {fetchingMesses ? (
                <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mr-2" />
                  Loading available messes...
                </div>
              ) : (
                <select
                  id="messId"
                  name="messId"
                  required
                  value={selectedMessId}
                  onChange={(e) => setSelectedMessId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">-- Choose Mess --</option>
                  {businesses.map((biz) => (
                    <option key={biz.id} value={biz.uniqueId}>
                      {biz.name} ({biz.uniqueId})
                    </option>
                  ))}
                </select>
              )}
            </div>

          </CardContent>

          <CardFooter className="pt-2">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting Registration...
                </span>
              ) : (
                "Submit Request"
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
