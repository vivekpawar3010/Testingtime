"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { requestToJoinMess, checkCustomerRegistrationLockStatus, checkCustomerProfileStatus } from "@/actions/user";
import { getApprovedBusinesses } from "@/actions/business";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import Link from "next/link";

function CustomerJoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messId = searchParams.get("messId") || "";
  const { user: clerkUser, isLoaded } = useUser();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMess, setSelectedMess] = useState(null);
  const [lockStatus, setLockStatus] = useState({ locked: false, reason: "" });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!messId) {
        setError("No Mess ID specified.");
        setChecking(false);
        return;
      }

      try {
        // Check profile status first to ensure they have name and phone
        const profileStatus = await checkCustomerProfileStatus();
        if (profileStatus.success) {
          if (!profileStatus.loggedIn) {
            router.push("/login-redirect");
            return;
          }
          if (!profileStatus.isRegistered) {
            // Redirect to register name/phone first, keeping messId
            router.push(`/customer/register?messId=${messId}`);
            return;
          }
        }

        // Check lock status
        const lockRes = await checkCustomerRegistrationLockStatus();
        if (lockRes.success && lockRes.locked) {
          setLockStatus({ locked: true, reason: lockRes.reason });
          setChecking(false);
          return;
        }

        // Get the specific mess details
        const messRes = await getApprovedBusinesses();
        if (messRes.success) {
          const match = messRes.businesses.find(b => b.uniqueId === messId);
          if (match) {
            setSelectedMess(match);
          } else {
            setError("The specified mess could not be found or is not approved.");
          }
        } else {
          setError(messRes.error || "Failed to load mess data.");
        }
      } catch (err) {
        setError("An error occurred while loading request data.");
      } finally {
        setChecking(false);
      }
    }
    loadData();
  }, [messId, router]);

  if (!isLoaded || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (lockStatus.locked) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6 lg:p-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-50 via-background to-background" />
        <Card className="w-full max-w-md border shadow-2xl bg-card/70 backdrop-blur-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-2 animate-bounce">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-indigo-950">Join Request Locked</CardTitle>
            <CardDescription>
              You cannot request to join a new mess at this time.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 text-left text-xs space-y-2">
              <p className="font-bold text-amber-950">Lockout details:</p>
              <p className="text-amber-900 leading-relaxed font-medium">
                {lockStatus.reason}
              </p>
              <p className="text-amber-700/80 text-[10px] leading-normal pt-1 border-t border-amber-200/50">
                To switch food providers, your active subscription balance must reach zero, or your current mess owner must suspend or remove your profile.
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

  if (error) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6 lg:p-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-50 via-background to-background" />
        <Card className="w-full max-w-md border shadow-2xl bg-card">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-2">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-red-950">Request Failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="pt-2">
            <Link href="/find-mess" className="w-full">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-2xl h-11">
                Back to Mess Explorer
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleConfirmJoin = async () => {
    setLoading(true);
    try {
      const res = await requestToJoinMess(messId);
      if (res.success) {
        toast.success("Join request submitted successfully!");
        router.push("/pending-approval");
      } else {
        toast.error(res.error || "Failed to submit request.");
      }
    } catch (err) {
      toast.error("An error occurred while submitting request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6 lg:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-50 via-background to-background" />
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-200/20 blur-3xl" />

      <Card className="w-full max-w-md border shadow-2xl bg-card/70 backdrop-blur-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mb-2">
            <UserCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Join Mess Request</CardTitle>
          <CardDescription>
            Submit a request to join the following mess.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-4">
          <div className="rounded-2xl border p-4 bg-slate-50 border-neutral-200/60">
            <h3 className="font-extrabold text-indigo-950 text-base">{selectedMess?.name}</h3>
            <p className="text-xs text-indigo-600 font-mono font-bold mt-1">ID: {selectedMess?.uniqueId}</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{selectedMess?.address}</p>
            {selectedMess?.phone && (
              <p className="text-xs text-muted-foreground mt-1">Phone: {selectedMess.phone}</p>
            )}
          </div>

          <div className="text-xs text-muted-foreground leading-relaxed bg-indigo-50/40 rounded-xl p-3 border border-indigo-100/40">
            <strong>Note:</strong> Once submitted, the mess owner will receive your request and can assign you to a dining plan. You will be redirected to the pending approval screen.
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2.5">
          <Button 
            onClick={handleConfirmJoin}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl h-11 shadow-sm transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Submitting Request...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                Confirm Join Request <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
          
          <Link href="/find-mess" className="w-full">
            <Button variant="ghost" className="w-full rounded-2xl h-10 text-xs font-semibold">
              Cancel
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function CustomerJoinPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    }>
      <CustomerJoinForm />
    </Suspense>
  );
}
