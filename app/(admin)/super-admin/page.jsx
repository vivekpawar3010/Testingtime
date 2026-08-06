import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, ClipboardList, TrendingUp, Clock, ShieldAlert, ArrowRight, ShieldCheck } from "lucide-react";
import { getSuperAdminOverviewStats, getExpiringMesses } from "@/actions/super-admin";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
  const [statsRes, expiringRes] = await Promise.all([
    getSuperAdminOverviewStats(),
    getExpiringMesses(10)
  ]);

  const stats = statsRes.success ? statsRes.stats : { totalMesses: 0, pendingRequests: 0, totalUsers: 0, platformRevenue: 0 };
  const recentMesses = statsRes.success ? statsRes.recentMesses : [];
  const expiringMesses = expiringRes.success ? expiringRes.messes : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-indigo-950">Super Admin Console</h2>
        <p className="text-muted-foreground mt-2">Manage mess applications, billing models, and server configurations.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md hover:shadow-lg transition-all border-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Messes</CardTitle>
            <ClipboardList className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-indigo-950">{stats.totalMesses}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved operational mess facilities</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-all border-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Approvals</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-indigo-950">{stats.pendingRequests}</div>
            <p className="text-xs text-amber-600 font-medium mt-1">Requires review attention</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-all border-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Platform Revenue</CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-indigo-950">₹{stats.platformRevenue}</div>
            <p className="text-xs text-muted-foreground mt-1">Total platform subscription sales</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-all border-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-indigo-950">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered clients & diners</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Mess Applications */}
        <Card className="shadow-md border-indigo-50 flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div>
                <CardTitle className="text-lg font-bold text-indigo-950">Recent Applications</CardTitle>
                <CardDescription>Review new requests</CardDescription>
              </div>
              <Link href="/super-admin/requests">
                <Button size="sm" variant="ghost" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold gap-1">
                  View <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {recentMesses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-xl text-muted-foreground text-xs space-y-2">
                  <ShieldCheck className="h-10 w-10 text-emerald-500/50" />
                  <span>No recent applications</span>
                </div>
              ) : (
                <div className="divide-y space-y-3">
                  {recentMesses.map((mess) => (
                    <div key={mess.id} className="flex items-center justify-between pt-3 first:pt-0">
                      <div>
                        <h4 className="text-sm font-bold text-indigo-950">{mess.name}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Owner: {mess.owner?.name || mess.owner?.email || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          mess.status === "APPROVED" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : mess.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}>
                          {mess.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* Expiring Subscriptions (Under 10 Days) */}
        <Card className="shadow-md border-indigo-50 flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div>
                <CardTitle className="text-lg font-bold text-indigo-950">Expiring Soon</CardTitle>
                <CardDescription>Messes expiring in &le; 10 days</CardDescription>
              </div>
              <ShieldAlert className="h-5 w-5 text-amber-500 animate-pulse" />
            </CardHeader>
            <CardContent className="pt-4 max-h-[350px] overflow-y-auto">
              {expiringMesses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-xl text-muted-foreground text-xs space-y-2">
                  <ShieldCheck className="h-10 w-10 text-emerald-500/50" />
                  <span>No expiring subscriptions</span>
                </div>
              ) : (
                <div className="divide-y space-y-3">
                  {expiringMesses.map((mess) => {
                    const sub = mess.platformSubscriptions?.[0];
                    const daysLeft = sub ? Math.ceil((new Date(sub.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                    
                    return (
                      <div key={mess.id} className="pt-3 first:pt-0 space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-indigo-950 leading-tight pr-2">{mess.name}</h4>
                          <span className="bg-amber-55 text-amber-800 font-bold text-[9px] border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                            {daysLeft} days left
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground space-y-0.5">
                          <p>Owner: {mess.owner?.name || "No Name"}</p>
                          <p className="font-mono">Email: {mess.owner?.email || "N/A"}</p>
                          {mess.phone && <p>Phone: {mess.phone}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* Quick Operations Links */}
        <Card className="shadow-md border-indigo-50 flex flex-col justify-between">
          <div>
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-bold text-indigo-950">Quick Actions</CardTitle>
              <CardDescription>Access shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-3">
              <Link href="/super-admin/messes" className="w-full">
                <Button className="w-full justify-between bg-indigo-50 hover:bg-indigo-100/80 text-indigo-950 text-xs font-bold rounded-xl h-11 border border-indigo-100">
                  <span>Manage Messes & Status</span>
                  <ArrowRight className="h-4 w-4 text-indigo-600" />
                </Button>
              </Link>

              <Link href="/super-admin/settings" className="w-full">
                <Button className="w-full justify-between bg-slate-50 hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-xl h-11 border border-slate-100">
                  <span>Subscription Plan Config</span>
                  <ArrowRight className="h-4 w-4 text-slate-600" />
                </Button>
              </Link>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
