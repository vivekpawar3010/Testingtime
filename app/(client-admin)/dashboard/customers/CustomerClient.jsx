"use client";

import { useState } from "react";
import { 
  approveCustomerRegistration, 
  rejectCustomerRegistration, 
  suspendCustomer, 
  activateCustomer, 
  deleteCustomer,
  manuallyAddCustomer,
  convertCustomerAbsentMeals
} from "@/actions/customers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, ShieldAlert, UserMinus, ToggleLeft, ToggleRight, UserCheck, Plus, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function CustomerClient({ initialCustomers, plans = [] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(false);

  // Convert Absent Meals Modal States
  const [convertCustomer, setConvertCustomer] = useState(null);
  const [convertMealsCount, setConvertMealsCount] = useState(1);
  const [convertReason, setConvertReason] = useState("Leave / holiday adjustment");
  const [convertLoading, setConvertLoading] = useState(false);

  // Approval Modal States
  const [selectedApprovee, setSelectedApprovee] = useState(null);
  const [mealCount, setMealCount] = useState(56);
  const [mealPrice, setMealPrice] = useState(57.14); // 3200 / 56
  const [validityDays, setValidityDays] = useState(30);
  const [reminderCount, setReminderCount] = useState(5);

  // Manual Add Form States
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [addMealCount, setAddMealCount] = useState(56);
  const [addMealPrice, setAddMealPrice] = useState(57.14);
  const [addTotalAmount, setAddTotalAmount] = useState(3200);
  const [addValidityDays, setAddValidityDays] = useState(30);
  const [addReminderCount, setAddReminderCount] = useState(5);
  const [paidImmediately, setPaidImmediately] = useState(false);

  const handleAddMealCountChange = (val) => {
    setAddMealCount(val);
    setAddTotalAmount(val * addMealPrice);
  };
  const handleAddMealPriceChange = (val) => {
    setAddMealPrice(val);
    setAddTotalAmount(addMealCount * val);
  };
  const handleAddTotalAmountChange = (val) => {
    setAddTotalAmount(val);
    if (addMealCount > 0) {
      setAddMealPrice(val / addMealCount);
    }
  };

  const handleSelectPlanForAdd = (planId) => {
    setSelectedPlanId(planId);
    if (!planId) return;
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setAddMealCount(plan.mealCount);
      setAddMealPrice(plan.mealPrice);
      setAddTotalAmount(plan.totalAmount);
      setAddValidityDays(plan.validityDays);
      setAddReminderCount(plan.reminderCount);
    }
  };

  const [activePage, setActivePage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [suspendedPage, setSuspendedPage] = useState(1);
  const itemsPerPage = 10;

  const activeUsers = customers.filter(c => c.status === "ACTIVE");
  const paginatedActiveUsers = activeUsers.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);
  const totalActivePages = Math.ceil(activeUsers.length / itemsPerPage);

  const pendingUsers = customers.filter(c => c.status === "PENDING");
  const paginatedPendingUsers = pendingUsers.slice((pendingPage - 1) * itemsPerPage, pendingPage * itemsPerPage);
  const totalPendingPages = Math.ceil(pendingUsers.length / itemsPerPage);

  const suspendedUsers = customers.filter(c => c.status === "SUSPENDED" || c.status === "EXPIRED");
  const paginatedSuspendedUsers = suspendedUsers.slice((suspendedPage - 1) * itemsPerPage, suspendedPage * itemsPerPage);
  const totalSuspendedPages = Math.ceil(suspendedUsers.length / itemsPerPage);

  // Pre-fill subscription details based on selected requestedPlan
  const handleOpenApproveModal = (customer) => {
    setSelectedApprovee(customer);
    const plan = customer.requestedPlan || "";
    if (plan.includes("30")) {
      setMealCount(30);
      setMealPrice(60);
      setValidityDays(30);
    } else if (plan.includes("90")) {
      setMealCount(90);
      setMealPrice(55.55);
      setValidityDays(45);
    } else {
      // Default to Monthly 56
      setMealCount(56);
      setMealPrice(57.14);
      setValidityDays(30);
    }
    setReminderCount(5);
  };

  const handleApprove = async () => {
    if (!selectedApprovee) return;
    setLoading(true);
    try {
      const res = await approveCustomerRegistration(selectedApprovee.id);

      if (res.success) {
        toast.success(`Approved ${selectedApprovee.name || selectedApprovee.email} successfully!`);
        // Refresh local customers list
        setCustomers(prev => 
          prev.map(c => c.id === selectedApprovee.id ? { ...c, status: "ACTIVE" } : c)
        );
        setSelectedApprovee(null);
      } else {
        toast.error(res.error || "Failed to approve customer");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (customerId, name) => {
    if (!confirm(`Are you sure you want to reject ${name}?`)) return;
    setLoading(true);
    try {
      const res = await rejectCustomerRegistration(customerId);
      if (res.success) {
        toast.success(`Rejected and unlinked registration for ${name}.`);
        setCustomers(prev => prev.filter(c => c.id !== customerId));
      } else {
        toast.error(res.error || "Failed to reject registration");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (customerId, name) => {
    setLoading(true);
    try {
      const res = await suspendCustomer(customerId);
      if (res.success) {
        toast.success(`Suspended ${name} successfully.`);
        setCustomers(prev => 
          prev.map(c => c.id === customerId ? { ...c, status: "SUSPENDED" } : c)
        );
      } else {
        toast.error(res.error || "Failed to suspend customer");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (customerId, name) => {
    setLoading(true);
    try {
      const res = await activateCustomer(customerId);
      if (res.success) {
        toast.success(`Activated ${name} successfully.`);
        setCustomers(prev => 
          prev.map(c => c.id === customerId ? { ...c, status: "ACTIVE" } : c)
        );
      } else {
        toast.error(res.error || "Failed to activate customer");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId, name) => {
    if (!confirm(`Are you sure you want to remove ${name} from your mess? This will unlink their profile.`)) return;
    setLoading(true);
    try {
      const res = await deleteCustomer(customerId);
      if (res.success) {
        toast.success(`Removed ${name} successfully.`);
        setCustomers(prev => prev.filter(c => c.id !== customerId));
      } else {
        toast.error(res.error || "Failed to remove customer");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await manuallyAddCustomer(
        { name: addName, email: addEmail, phone: addPhone, paidImmediately },
        { planId: selectedPlanId, mealCount: addMealCount, mealPrice: addMealPrice, totalAmount: addTotalAmount, validityDays: addValidityDays, reminderCount: addReminderCount }
      );

      if (res.success) {
        toast.success("Customer added manually and subscription created!");
        // Reset forms
        setAddName("");
        setAddEmail("");
        setAddPhone("");
        setPaidImmediately(false);
        setActiveTab("active");
        
        // Reload page since we need latest relations
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to add customer");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertAbsentMeals = async (e) => {
    e.preventDefault();
    if (!convertCustomer) return;
    setConvertLoading(true);
    try {
      const res = await convertCustomerAbsentMeals(convertCustomer.id, convertMealsCount, convertReason);
      if (res.success) {
        toast.success(`Successfully converted ${convertMealsCount} absent meal(s) into active balance for ${convertCustomer.name}!`);
        setConvertCustomer(null);
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to convert absent meals.");
      }
    } catch (err) {
      toast.error("Error converting absent meals.");
    } finally {
      setConvertLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">Manage approvals, active users, suspensions, and manual additions.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card border p-1.5 rounded-lg flex-wrap h-auto gap-1">
          <TabsTrigger value="active" className="rounded-md text-sm font-bold md:text-base px-5 py-2.5">
            Active ({activeUsers.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-md text-sm font-bold md:text-base px-5 py-2.5 relative flex items-center gap-1.5">
            Pending Approvals
            {pendingUsers.length > 0 ? (
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-extrabold text-white animate-pulse">
                {pendingUsers.length}
              </span>
            ) : (
              <span>(0)</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="suspended" className="rounded-md text-sm font-bold md:text-base px-5 py-2.5">
            Suspended ({suspendedUsers.length})
          </TabsTrigger>
          <TabsTrigger value="add" className="rounded-md text-sm font-bold md:text-base px-5 py-2.5 gap-1.5">
            <Plus className="h-5 w-5 text-indigo-600" /> Add Customer
          </TabsTrigger>
        </TabsList>

        {/* ACTIVE CUSTOMERS */}
        <TabsContent value="active">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Active Customers</CardTitle>
              <CardDescription>Customers currently authorized to dine and scan QR codes.</CardDescription>
            </CardHeader>
            <CardContent>
              {activeUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No active customers found.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Remaining Meals</TableHead>
                        <TableHead>Bill Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedActiveUsers.map((cust) => {
                        const activeSub = cust.subscriptions?.[0];
                        const remaining = activeSub ? (activeSub.mealCount - activeSub.usedMeals) : 0;
                        const total = activeSub ? activeSub.mealCount : 0;
                        const latestBill = cust.bills?.[0];

                        return (
                          <TableRow key={cust.id}>
                            <TableCell className="font-semibold">{cust.name || "N/A"}</TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">{cust.phone || "N/A"}</div>
                              <div className="text-xs text-muted-foreground">{cust.email}</div>
                            </TableCell>
                            <TableCell>
                              {activeSub ? (
                                <div className="space-y-1">
                                  <div className="text-xs font-semibold text-indigo-950">{activeSub.planName || "Active Plan"}</div>
                                  <div className="text-[10px] text-muted-foreground">Expires: {activeSub.endDate ? new Date(activeSub.endDate).toLocaleDateString() : "Never"}</div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">No active plan</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {activeSub ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-neutral-100 rounded-full h-2 overflow-hidden border">
                                    <div 
                                      className={`h-full ${remaining <= activeSub.reminderCount ? "bg-amber-500" : "bg-indigo-600"}`} 
                                      style={{ width: `${Math.min(100, (remaining / total) * 100)}%` }} 
                                    />
                                  </div>
                                  <span className="font-mono font-bold text-xs text-indigo-950">
                                    {remaining} / {total}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {latestBill ? (
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  latestBill.status === "PAID" 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                    : latestBill.status === "PARTIAL" 
                                    ? "bg-amber-50 text-amber-700 border-amber-100" 
                                    : "bg-red-50 text-red-700 border-red-100"
                                }`}>
                                  {latestBill.status}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">No invoices</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {activeSub && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs"
                                  onClick={() => {
                                    setConvertCustomer(cust);
                                    setConvertMealsCount(1);
                                    setConvertReason("Leave / holiday adjustment");
                                  }}
                                  disabled={loading}
                                >
                                  <RotateCcw className="h-3 w-3 mr-1" /> Convert Absent
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 border-amber-300 text-amber-700 hover:bg-amber-50"
                                onClick={() => handleSuspend(cust.id, cust.name)}
                                disabled={loading}
                              >
                                Suspend
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="h-8"
                                onClick={() => handleDelete(cust.id, cust.name)}
                                disabled={loading}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination Controls */}
                {totalActivePages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs">
                    <span className="text-muted-foreground">
                      Showing active diners {((activePage - 1) * itemsPerPage) + 1} to {Math.min(activePage * itemsPerPage, activeUsers.length)} of {activeUsers.length}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={activePage <= 1} onClick={() => setActivePage(p => p - 1)} className="rounded-xl h-8 text-[11px] font-bold">
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" disabled={activePage >= totalActivePages} onClick={() => setActivePage(p => p + 1)} className="rounded-xl h-8 text-[11px] font-bold">
                        Next
                      </Button>
                    </div>
                  </div>
                )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PENDING APPROVALS */}
        <TabsContent value="pending">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Pending Customer Approvals</CardTitle>
              <CardDescription>Verify and assign subscription plans to approving customers.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No pending registration requests.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Info</TableHead>
                        <TableHead>Requested Plan</TableHead>
                        <TableHead>Submitted Contact</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPendingUsers.map((cust) => (
                        <TableRow key={cust.id}>
                          <TableCell className="font-semibold">{cust.name || "N/A"}</TableCell>
                          <TableCell className="font-semibold text-indigo-600">{cust.requestedPlan || "Basic (30 Meals)"}</TableCell>
                          <TableCell>
                            <div className="text-xs text-muted-foreground">{cust.email}</div>
                            <div className="text-xs text-foreground font-medium">{cust.phone}</div>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              className="h-8 bg-green-600 hover:bg-green-700 text-white" 
                              size="sm"
                              onClick={() => handleOpenApproveModal(cust)}
                              disabled={loading}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="h-8"
                              size="sm"
                              onClick={() => handleReject(cust.id, cust.name)}
                              disabled={loading}
                            >
                              Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Pending Pagination Controls */}
                {totalPendingPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs">
                    <span className="text-muted-foreground">
                      Showing pending requests {((pendingPage - 1) * itemsPerPage) + 1} to {Math.min(pendingPage * itemsPerPage, pendingUsers.length)} of {pendingUsers.length}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={pendingPage <= 1} onClick={() => setPendingPage(p => p - 1)} className="rounded-xl h-8 text-[11px] font-bold">
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" disabled={pendingPage >= totalPendingPages} onClick={() => setPendingPage(p => p + 1)} className="rounded-xl h-8 text-[11px] font-bold">
                        Next
                      </Button>
                    </div>
                  </div>
                )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUSPENDED CUSTOMERS */}
        <TabsContent value="suspended">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Suspended or Inactive Customers</CardTitle>
              <CardDescription>Diners whose scanner access has been suspended or expired.</CardDescription>
            </CardHeader>
            <CardContent>
              {suspendedUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No suspended customers found.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSuspendedUsers.map((cust) => (
                        <TableRow key={cust.id}>
                          <TableCell className="font-semibold text-muted-foreground">{cust.name}</TableCell>
                          <TableCell>
                            <div className="text-xs text-muted-foreground">{cust.email}</div>
                            <div className="text-xs text-foreground font-medium">{cust.phone}</div>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                              {cust.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 border-green-300 text-green-700 hover:bg-green-50"
                              onClick={() => handleActivate(cust.id, cust.name)}
                              disabled={loading}
                            >
                              Re-activate
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="h-8"
                              onClick={() => handleDelete(cust.id, cust.name)}
                              disabled={loading}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Suspended Pagination Controls */}
                {totalSuspendedPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs">
                    <span className="text-muted-foreground">
                      Showing suspended diners {((suspendedPage - 1) * itemsPerPage) + 1} to {Math.min(suspendedPage * itemsPerPage, suspendedUsers.length)} of {suspendedUsers.length}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={suspendedPage <= 1} onClick={() => setSuspendedPage(p => p - 1)} className="rounded-xl h-8 text-[11px] font-bold">
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" disabled={suspendedPage >= totalSuspendedPages} onClick={() => setSuspendedPage(p => p + 1)} className="rounded-xl h-8 text-[11px] font-bold">
                        Next
                      </Button>
                    </div>
                  </div>
                )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MANUALLY ADD CUSTOMER */}
        <TabsContent value="add">
          <Card className="shadow-md max-w-xl">
            <CardHeader>
              <CardTitle>Add Diner Manually</CardTitle>
              <CardDescription>Directly register a student or employee without they having to register online first.</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddCustomer}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-name">Full Name</Label>
                    <Input 
                      id="add-name" 
                      required 
                      value={addName} 
                      onChange={(e) => setAddName(e.target.value)} 
                      placeholder="E.g. Rahul Patil" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-phone">Phone Number</Label>
                    <Input 
                      id="add-phone" 
                      required 
                      value={addPhone} 
                      onChange={(e) => setAddPhone(e.target.value)} 
                      placeholder="10-digit number" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-email">Email Address</Label>
                  <Input 
                    id="add-email" 
                    type="email" 
                    required 
                    value={addEmail} 
                    onChange={(e) => setAddEmail(e.target.value)} 
                    placeholder="email@example.com" 
                  />
                </div>

                <div className="border-t pt-4 mt-2">
                  <h4 className="text-sm font-semibold mb-3 text-indigo-600">Assign Subscription Plan</h4>
                  
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="add-plan-template">Choose Subscription Plan Template</Label>
                    <select
                      id="add-plan-template"
                      value={selectedPlanId}
                      onChange={(e) => handleSelectPlanForAdd(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
                    >
                      <option value="">-- Custom Plan (Define below) --</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.mealCount} Meals, ₹{p.totalAmount})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-meals">Meal Count</Label>
                      <Input 
                        id="add-meals" 
                        type="number" 
                        required 
                        value={addMealCount} 
                        onChange={(e) => handleAddMealCountChange(parseInt(e.target.value) || 0)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-price">Price Per Meal (₹)</Label>
                      <Input 
                        id="add-price" 
                        type="number" 
                        step="0.01" 
                        required 
                        value={addMealPrice} 
                        onChange={(e) => handleAddMealPriceChange(parseFloat(e.target.value) || 0)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-total">Total Price (₹)</Label>
                      <Input 
                        id="add-total" 
                        type="number" 
                        step="0.01" 
                        required 
                        value={addTotalAmount} 
                        onChange={(e) => handleAddTotalAmountChange(parseFloat(e.target.value) || 0)} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="space-y-2">
                      <Label htmlFor="add-validity">Validity (Days)</Label>
                      <Input 
                        id="add-validity" 
                        type="number" 
                        required 
                        value={addValidityDays} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setAddValidityDays(val);
                        }} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-reminder">Low Meals Alert Threshold</Label>
                      <Input 
                        id="add-reminder" 
                        type="number" 
                        required 
                        value={addReminderCount} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setAddReminderCount(val);
                        }} 
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <input 
                      id="paid-immediately" 
                      type="checkbox" 
                      checked={paidImmediately}
                      onChange={(e) => setPaidImmediately(e.target.checked)}
                      className="rounded border-input text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                    />
                    <Label htmlFor="paid-immediately" className="cursor-pointer text-sm">
                      Mark subscription invoice as **PAID** immediately (Cash/UPI received upfront)
                    </Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                  {loading ? "Adding Diner..." : "Add Diner & Activate Plan"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {/* APPROVAL DIALOG MODAL */}
      <Dialog open={selectedApprovee !== null} onOpenChange={(open) => !open && setSelectedApprovee(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Diner Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve **{selectedApprovee?.name || selectedApprovee?.email}**?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs text-muted-foreground">
            <p>
              This will approve their request to join your mess. Once approved, you can assign them a subscription plan from your Subscriptions console, or they can request a renewal package from their client dashboard.
            </p>
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => setSelectedApprovee(null)} disabled={loading}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-medium" onClick={handleApprove} disabled={loading}>
              {loading ? "Approving..." : "Yes, Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONVERT ABSENT MEALS DIALOG MODAL */}
      <Dialog open={convertCustomer !== null} onOpenChange={(open) => !open && setConvertCustomer(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white">
          <DialogHeader>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <RotateCcw className="h-4 w-4" /> Convert Absent Meals
            </div>
            <DialogTitle className="text-xl font-bold text-indigo-950">
              Credit Meals for {convertCustomer?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Convert missed / absent operating days back into the diner's active meal balance.
            </DialogDescription>
          </DialogHeader>

          {convertCustomer && (
            <form onSubmit={handleConvertAbsentMeals} className="space-y-4 py-2">
              <div className="p-3 bg-indigo-50/50 rounded-2xl border text-xs space-y-1">
                <span className="font-semibold text-indigo-950 block">Current Subscription Details:</span>
                <p className="text-muted-foreground text-[11px]">
                  Total Meals: <strong>{convertCustomer.subscriptions?.[0]?.mealCount || 0}</strong> • Used/Scanned: <strong>{convertCustomer.subscriptions?.[0]?.usedMeals || 0}</strong> • Available: <strong>{Math.max(0, (convertCustomer.subscriptions?.[0]?.mealCount || 0) - (convertCustomer.subscriptions?.[0]?.usedMeals || 0))} thalis</strong>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="convert-count" className="text-xs font-bold text-muted-foreground uppercase">
                  Number of Absent Meals / Days to Credit
                </Label>
                <Input
                  id="convert-count"
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={convertMealsCount}
                  onChange={(e) => setConvertMealsCount(parseInt(e.target.value) || 1)}
                  className="rounded-xl border-neutral-200"
                />
                <span className="text-[10px] text-muted-foreground">
                  This will increase the diner's remaining balance by {convertMealsCount} meal(s).
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="convert-reason" className="text-xs font-bold text-muted-foreground uppercase">
                  Reason / Adjustment Note
                </Label>
                <Input
                  id="convert-reason"
                  type="text"
                  required
                  value={convertReason}
                  onChange={(e) => setConvertReason(e.target.value)}
                  placeholder="e.g. Vacation leave, Exam leave, Missed holiday credit"
                  className="rounded-xl border-neutral-200"
                />
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button variant="outline" type="button" onClick={() => setConvertCustomer(null)} disabled={convertLoading} className="rounded-xl text-xs font-bold">
                  Cancel
                </Button>
                <Button type="submit" disabled={convertLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md">
                  {convertLoading ? "Crediting..." : `Credit +${convertMealsCount} Meals`}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
