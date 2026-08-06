"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toggleBusinessActiveState, assignBusinessSubscription, getMessesConsole } from "@/actions/super-admin";
import { Search, ShieldAlert, CheckCircle, XCircle, AlertTriangle, Calendar, RefreshCw, ChevronLeft, ChevronRight, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function MessesClient({ initialData, plans }) {
  const [messes, setMesses] = useState(initialData.messes || []);
  const [pagination, setPagination] = useState(initialData.pagination || { page: 1, limit: 10, totalPages: 1, totalMesses: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterExpiringSoon, setFilterExpiringSoon] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Assign plan modal states
  const [selectedMess, setSelectedMess] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const loadData = async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await getMessesConsole({
        page: targetPage,
        limit: 10,
        searchQuery,
        filterExpiringSoon
      });
      if (res.success) {
        setMesses(res.messes);
        setPagination(res.pagination);
      } else {
        toast.error(res.error || "Failed to load mess list.");
      }
    } catch (err) {
      toast.error("Error loading console data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [searchQuery, filterExpiringSoon]);

  const handleToggleActive = async (messId, currentActive) => {
    const actionText = currentActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${actionText} this mess account?`)) return;

    try {
      const res = await toggleBusinessActiveState(messId, !currentActive);
      if (res.success) {
        toast.success(`Mess account ${actionText}d successfully.`);
        setMesses(messes.map((m) => m.id === messId ? { ...m, isActive: !currentActive } : m));
      } else {
        toast.error(res.error || "Failed to toggle mess state.");
      }
    } catch (err) {
      toast.error("Error updating account state.");
    }
  };

  const handleAssignPlan = async (e) => {
    e.preventDefault();
    if (!selectedMess || (!selectedPlanId && !customEndDate)) {
      toast.error("Please select a platform plan template or enter a custom expiry date.");
      return;
    }

    setLoading(true);
    try {
      const res = await assignBusinessSubscription(selectedMess.id, selectedPlanId || null, customEndDate || null);
      if (res.success) {
        toast.success("Platform subscription assigned successfully!");
        setSelectedMess(null);
        setSelectedPlanId("");
        setCustomEndDate("");
        loadData(pagination.page);
      } else {
        toast.error(res.error || "Failed to assign subscription.");
      }
    } catch (err) {
      toast.error("Error assigning subscription plan.");
    } finally {
      setLoading(false);
    }
  };

  // Helper: check if subscription is expiring within 10 days
  const getExpiringDetails = (mess) => {
    const activeSub = mess.platformSubscriptions?.[0];
    if (!activeSub || activeSub.status !== "ACTIVE") {
      return { isExpiringSoon: false, daysLeft: 0, text: "No Active Subscription" };
    }

    const end = new Date(activeSub.endDate);
    const now = new Date();
    const diffTime = end - now;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { isExpiringSoon: false, daysLeft: 0, text: "Expired" };
    }

    return {
      isExpiringSoon: daysLeft <= 10,
      daysLeft,
      text: `${daysLeft} Days Left`
    };
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-indigo-950">Messes Directory</h2>
          <p className="text-muted-foreground mt-2">Manage mess account operations, active status and billing contracts.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-card/70 border rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between bg-white">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-75" />
          <Input
            type="text"
            placeholder="Search messes by name, ID or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border-slate-200 focus:ring-indigo-500 text-xs rounded-xl"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto shrink-0 justify-end">
          <div className="flex items-center gap-2">
            <input 
              id="filter-expiring"
              type="checkbox"
              checked={filterExpiringSoon}
              onChange={(e) => setFilterExpiringSoon(e.target.checked)}
              className="rounded border-input text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <Label htmlFor="filter-expiring" className="cursor-pointer text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-500" /> Show Expiring Soon (&le; 10 Days)
            </Label>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadData(pagination.page)}
            className="rounded-xl font-bold text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Reload
          </Button>
        </div>
      </div>

      {/* Directory Table */}
      <Card className="shadow-lg border-indigo-50 overflow-hidden">
        <CardContent className="p-0">
          {messes.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs space-y-2">
              <AlertTriangle className="h-10 w-10 mx-auto text-amber-500/50" />
              <span>No messes matches filter rules.</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="font-bold text-indigo-950 text-xs">Mess / Unique ID</TableHead>
                  <TableHead className="font-bold text-indigo-950 text-xs">Business Owner</TableHead>
                  <TableHead className="font-bold text-indigo-950 text-xs">Plan Template</TableHead>
                  <TableHead className="font-bold text-indigo-950 text-xs">Contract Period</TableHead>
                  <TableHead className="font-bold text-indigo-950 text-xs">Status</TableHead>
                  <TableHead className="font-bold text-indigo-950 text-xs text-center">Admin Controls</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messes.map((mess) => {
                  const expDetails = getExpiringDetails(mess);
                  const activeSub = mess.platformSubscriptions?.[0];
                  
                  return (
                    <TableRow 
                      key={mess.id} 
                      className={`hover:bg-slate-50/30 transition-colors ${
                        expDetails.isExpiringSoon ? "bg-amber-50/30" : ""
                      }`}
                    >
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-indigo-950 text-xs">{mess.name}</h4>
                          <span className="inline-block text-[9px] font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/50">
                            {mess.uniqueId || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4">
                        <div className="space-y-0.5 text-xs text-muted-foreground">
                          <p className="font-medium text-slate-800 flex items-center gap-1">
                            <User className="h-3 w-3 text-neutral-400" /> {mess.owner?.name || "No name"}
                          </p>
                          <p className="text-[10px]">{mess.owner?.email}</p>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-indigo-950 text-xs">
                            {activeSub?.plan?.name || "No Plan Template"}
                          </p>
                          {activeSub && (
                            <p className="text-[10px] text-muted-foreground">
                              ₹{activeSub.plan?.price} / {activeSub.plan?.validityDays} Days
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        {activeSub ? (
                          <div className="space-y-1 text-xs">
                            <p className="text-slate-800 text-[11px] font-medium flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                              {new Date(activeSub.startDate).toLocaleDateString()} - {new Date(activeSub.endDate).toLocaleDateString()}
                            </p>
                            
                            {expDetails.isExpiringSoon ? (
                              <span className="inline-flex items-center gap-1 bg-amber-100/60 text-amber-700 px-2 py-0.5 rounded-md font-bold text-[9px] border border-amber-200 mt-1 animate-pulse">
                                <ShieldAlert className="h-3 w-3" /> EXPIRING IN {expDetails.daysLeft} DAYS
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground block">
                                {expDetails.text}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not Subscribed</span>
                        )}
                      </TableCell>

                      <TableCell className="py-4">
                        <button 
                          onClick={() => handleToggleActive(mess.id, mess.isActive)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                            mess.isActive 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" 
                              : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                          }`}
                        >
                          {mess.isActive ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" /> ACTIVE
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5" /> DEACTIVATED
                            </>
                          )}
                        </button>
                      </TableCell>

                      <TableCell className="py-4 text-center">
                        <Button 
                          onClick={() => setSelectedMess(mess)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl h-8 px-4"
                        >
                          Assign Plan
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Showing Messes {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalMesses)} of {pagination.totalMesses}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => loadData(pagination.page - 1)}
              className="rounded-xl h-9"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadData(pagination.page + 1)}
              className="rounded-xl h-9"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Assign Plan Dialog */}
      <Dialog open={selectedMess !== null} onOpenChange={(open) => !open && setSelectedMess(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-indigo-950 font-bold text-lg">Assign Subscription Contract</DialogTitle>
            <DialogDescription>
              Assign or renew platform subscription parameters for <strong>{selectedMess?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignPlan}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="plan" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Choose Platform Plan Template (Optional)</Label>
                <select
                  id="plan"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">-- Choose Template (Or leave blank for custom expiry) --</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.price} / {p.validityDays} Days)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Custom Expiry Date (Optional)</Label>
                <Input
                  id="expiry"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="border-neutral-200"
                />
                <span className="text-[10px] text-muted-foreground block">
                  * Leave blank to use default plan duration.
                </span>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setSelectedMess(null)}
                className="rounded-xl h-10"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10"
              >
                {loading ? "Assigning..." : "Activate Contract"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
