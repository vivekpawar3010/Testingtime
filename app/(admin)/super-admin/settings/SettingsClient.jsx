"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createBusinessPlan, deleteBusinessPlan } from "@/actions/super-admin";
import { Trash, Check, AlertCircle, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function SettingsClient({ initialPlans }) {
  const [plans, setPlans] = useState(initialPlans || []);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [validityDays, setValidityDays] = useState("30");
  const [type, setType] = useState("REGULAR");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !validityDays) {
      toast.error("Please fill in all plan parameters.");
      return;
    }

    setLoading(true);
    try {
      const res = await createBusinessPlan({ name, price, validityDays, type });
      if (res.success) {
        toast.success("Business subscription plan created successfully!");
        setName("");
        setPrice("");
        setValidityDays("30");
        setType("REGULAR");
        
        // Reload plans list or append
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to create business subscription plan.");
      }
    } catch (err) {
      toast.error("Error creating plan template.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId) => {
    if (!confirm("Are you sure you want to delete this subscription plan?")) return;

    try {
      const res = await deleteBusinessPlan(planId);
      if (res.success) {
        toast.success("Subscription plan deleted successfully.");
        setPlans(plans.filter((p) => p.id !== planId));
      } else {
        toast.error(res.error || "Failed to delete plan.");
      }
    } catch (err) {
      toast.error("Error deleting plan.");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-indigo-950">Subscription Templates</h2>
        <p className="text-muted-foreground mt-2">Create and manage billing plans for hostel/PG mess vendors.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-5 items-start">
        {/* Left side: Form */}
        <div className="md:col-span-2">
          <Card className="shadow-lg border-indigo-50">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-indigo-950 flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" /> New Platform Plan
              </CardTitle>
              <CardDescription>Define a subscription package for mess halls</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Plan Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Monthly Trial, Gold Annual"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="price" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Price (₹)</Label>
                    <Input 
                      id="price" 
                      type="number"
                      placeholder="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="validity" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Validity (Days)</Label>
                    <Input 
                      id="validity" 
                      type="number"
                      placeholder="30"
                      value={validityDays}
                      onChange={(e) => setValidityDays(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Plan Type</Label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="REGULAR">Regular Business Plan</option>
                    <option value="DEFAULT">Default (Onboard Free Trial)</option>
                  </select>
                  <span className="text-[10px] text-muted-foreground block mt-1">
                    * Selecting "Default" sets this plan to be automatically assigned when a mess application is first approved.
                  </span>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl"
                >
                  {loading ? "Creating..." : "Save Plan Template"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right side: Table List */}
        <div className="md:col-span-3">
          <Card className="shadow-lg border-indigo-50">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-indigo-950">Active Templates</CardTitle>
              <CardDescription>Available subscription setups across the platform</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {plans.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs space-y-2">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground opacity-40 animate-pulse" />
                  <span>No subscription plans created yet.</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead className="font-bold text-indigo-950 text-xs">Plan Name</TableHead>
                      <TableHead className="font-bold text-indigo-950 text-xs">Price</TableHead>
                      <TableHead className="font-bold text-indigo-950 text-xs">Validity</TableHead>
                      <TableHead className="font-bold text-indigo-950 text-xs">Type</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((p) => (
                      <TableRow key={p.id} className="hover:bg-slate-50/30">
                        <TableCell className="font-bold text-indigo-950 text-xs">{p.name}</TableCell>
                        <TableCell className="text-xs font-medium">₹{p.price}</TableCell>
                        <TableCell className="text-xs">{p.validityDays} Days</TableCell>
                        <TableCell className="text-xs">
                          {p.type === "DEFAULT" ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-amber-100">
                              <Sparkles className="h-3 w-3" /> DEFAULT
                            </span>
                          ) : (
                            <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              REGULAR
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(p.id)}
                            className="h-8 w-8 text-neutral-400 hover:text-red-600 rounded-lg"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
