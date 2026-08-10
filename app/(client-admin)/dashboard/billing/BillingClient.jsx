"use client";

import { useState, useEffect } from "react";
import { createCustomBill, recordBillPayment } from "@/actions/billing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, Plus, DollarSign, CreditCard, Clock, Printer, FileText } from "lucide-react";
import { toast } from "sonner";

export default function BillingClient({ initialBills, activeCustomers, businessSettings }) {
  const [bills, setBills] = useState(initialBills);
  const [activeTab, setActiveTab] = useState("invoices");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    setPage(1);
  }, [bills]);

  const paginatedBills = bills.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(bills.length / itemsPerPage);

  // Default parameters from settings
  const defaultGstRate = businessSettings?.defaultGst || 0;
  const defaultDueDays = businessSettings?.invoiceDueDays || 7;
  const calculatedDefaultDueDate = new Date(Date.now() + defaultDueDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Custom Bill Form States
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [extraCharges, setExtraCharges] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [gst, setGst] = useState("0");
  const [dueDate, setDueDate] = useState(calculatedDefaultDueDate);

  const handleBillAmountChange = (val) => {
    setBillAmount(val);
    const amountNum = parseFloat(val) || 0;
    if (defaultGstRate > 0) {
      const calculatedGst = (amountNum * defaultGstRate) / 100;
      setGst(calculatedGst.toFixed(2));
    }
  };

  // Record Payment Modal States
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [transactionId, setTransactionId] = useState("");

  // Invoice Print View State
  const [selectedBillForPrint, setSelectedBillForPrint] = useState(null);

  const handlePrintInvoice = () => {
    if (!selectedBillForPrint) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to print invoices.");
      return;
    }

    const bill = selectedBillForPrint;
    const dateStr = new Date(bill.createdAt).toLocaleDateString();
    const dueDateStr = bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "N/A";
    const subtotal = (bill.totalAmount + bill.discount - bill.extraCharges - bill.gst).toFixed(2);
    
    const logoHtml = businessSettings?.logoUrl 
      ? `<img src="${businessSettings.logoUrl}" style="height: 50px; width: 50px; border-radius: 8px; object-fit: cover;" />`
      : "";

    const statusClass = bill.status === "PAID" 
      ? "badge-paid" 
      : bill.status === "PARTIAL" 
      ? "badge-partial" 
      : "badge-unpaid";

    let paymentsHtml = "";
    if (bill.payments && bill.payments.length > 0) {
      paymentsHtml = `
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #1e293b;">Transaction Payments Log:</h4>
          ${bill.payments.map((pm, idx) => `
            <div style="display: flex; justify-content: space-between; font-size: 12px; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
              <span style="color: #64748b;">
                Payment #${idx + 1} (${pm.paymentMethod} ${pm.transactionId ? `[TXID: ${pm.transactionId}]` : ""}) - ${new Date(pm.paymentDate).toLocaleDateString()}
              </span>
              <span style="font-weight: bold; color: #16a34a;">+₹${pm.amount}</span>
            </div>
          `).join("")}
        </div>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${bill.invoiceNumber}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; padding: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; align-items: center; }
            .title { font-size: 24px; font-weight: bold; color: #4f46e5; margin: 0; }
            .details { display: flex; justify-content: space-between; margin-top: 30px; }
            .section-title { font-weight: bold; font-size: 12px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.5px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .table th { border-bottom: 2px solid #cbd5e1; padding: 12px 8px; text-align: left; font-size: 12px; color: #475569; font-weight: bold; text-transform: uppercase; }
            .table td { border-bottom: 1px solid #e2e8f0; padding: 12px 8px; font-size: 13px; }
            .summary-box { display: flex; justify-content: space-between; margin-top: 30px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
            .summary-item { display: flex; flex-direction: column; }
            .summary-label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
            .summary-value { font-size: 16px; font-weight: bold; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .badge-paid { background-color: #dcfce7; color: #15803d; }
            .badge-unpaid { background-color: #fee2e2; color: #b91c1c; }
            .badge-partial { background-color: #fef3c7; color: #b45309; }
            .print-btn { background-color: #4f46e5; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-bottom: 20px; }
            @media print {
              body { padding: 0; }
              .print-btn { display: none; }
            }
          </style>
        </head>
        <body>
          <button class="print-btn" onclick="window.print()">Print Invoice</button>
          <div class="header">
            <div>
              <h2 class="title">INVOICE</h2>
              <p style="font-size: 13px; color: #64748b; margin: 4px 0 0 0;">Invoice Number: <strong>${bill.invoiceNumber}</strong></p>
              <p style="font-size: 13px; color: #64748b; margin: 2px 0 0 0;">Date: ${dateStr}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="text-align: right;">
                <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #0f172a;">${businessSettings?.name || "MessApp Operations"}</h3>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; max-width: 200px;">${businessSettings?.address || ""}</p>
                ${businessSettings?.phone ? `<p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Phone: ${businessSettings.phone}</p>` : ""}
              </div>
              ${logoHtml}
            </div>
          </div>

          <div class="details">
            <div>
              <div class="section-title">Billed To</div>
              <p style="margin: 0; font-size: 14px; font-weight: bold; color: #0f172a;">${bill.user.name}</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">${bill.user.email}</p>
              <p style="margin: 2px 0 0 0; font-size: 13px; color: #475569;">${bill.user.phone || ""}</p>
            </div>
            <div style="text-align: right;">
              <div class="section-title">Payment Status</div>
              <span class="badge ${statusClass}">${bill.status}</span>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">Due Date: ${dueDateStr}</p>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <p style="margin: 0; font-weight: bold; color: #0f172a;">Mess Subscription package</p>
                  <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Standard meals assignment</p>
                </td>
                <td style="text-align: right; font-weight: bold;">₹${subtotal}</td>
              </tr>
              ${bill.gst > 0 ? `
                <tr>
                  <td style="color: #475569;">Taxes & GST</td>
                  <td style="text-align: right;">₹${bill.gst.toFixed(2)}</td>
                </tr>
              ` : ""}
              ${bill.extraCharges > 0 ? `
                <tr>
                  <td style="color: #475569;">Additional Service Charges</td>
                  <td style="text-align: right;">₹${bill.extraCharges.toFixed(2)}</td>
                </tr>
              ` : ""}
              ${bill.discount > 0 ? `
                <tr style="color: #b91c1c;">
                  <td>Discount Offer Applied</td>
                  <td style="text-align: right;">-₹${bill.discount.toFixed(2)}</td>
                </tr>
              ` : ""}
              <tr style="background: #f8fafc; font-weight: bold; font-size: 15px;">
                <td style="padding: 14px 8px;">Grand Total:</td>
                <td style="text-align: right; color: #4f46e5; padding: 14px 8px;">₹${bill.totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          ${paymentsHtml}

          <div class="summary-box">
            <div class="summary-item">
              <span class="summary-label">Total Collected Balance</span>
              <span class="summary-value" style="color: #16a34a;">₹${bill.paidAmount.toFixed(2)}</span>
            </div>
            <div class="summary-item" style="text-align: right;">
              <span class="summary-label">Net Dues Outstanding</span>
              <span class="summary-value" style="color: #b91c1c;">₹${bill.remainingAmount.toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p style="font-size: 10px; margin-top: 5px;">Powered by MessApp Operations</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error("Please select a diner.");
      return;
    }
    setLoading(true);
    try {
      const res = await createCustomBill({
        userId: selectedCustomerId,
        amount: parseFloat(billAmount),
        extraCharges: parseFloat(extraCharges || 0),
        discount: parseFloat(discount || 0),
        gst: parseFloat(gst || 0),
        dueDate
      });

      if (res.success) {
        toast.success(`Invoice ${res.bill.invoiceNumber} created successfully!`);
        // Reload or update list
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to create invoice");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentModal = (bill) => {
    setSelectedBillForPayment(bill);
    setPayAmount(bill.remainingAmount.toString());
  };

  const handleRecordPayment = async () => {
    if (!selectedBillForPayment) return;
    setLoading(true);
    try {
      const res = await recordBillPayment(selectedBillForPayment.id, {
        amount: parseFloat(payAmount),
        paymentMethod,
        transactionId
      });

      if (res.success) {
        toast.success("Payment recorded successfully!");
        setSelectedBillForPayment(null);
        setPayAmount("");
        setTransactionId("");
        
        // Reload page to refresh calculations
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to record payment");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage invoices, collect outstanding payments, and record transactions.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card border p-1.5 rounded-lg flex-wrap h-auto gap-1">
          <TabsTrigger value="invoices" className="rounded-md text-sm font-bold md:text-base px-5 py-2.5 relative flex items-center gap-1.5">
            All Invoices ({bills.length})
            {bills.filter(b => b.status === "UNPAID").length > 0 && (
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-extrabold text-white animate-pulse">
                {bills.filter(b => b.status === "UNPAID").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="create" className="rounded-md text-sm font-bold md:text-base px-5 py-2.5 gap-1.5">
            <Plus className="h-5 w-5 text-indigo-600" /> Create Custom Bill
          </TabsTrigger>
        </TabsList>

        {/* LIST INVOICES */}
        <TabsContent value="invoices">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Invoices Ledger</CardTitle>
              <CardDescription>Comprehensive record of all diner billing history.</CardDescription>
            </CardHeader>
            <CardContent>
              {bills.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <Receipt className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h3 className="font-bold text-lg">No Invoices Found</h3>
                  <p className="text-muted-foreground text-sm">Create a custom bill or assign a subscription to generate invoices.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Diner</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid Balance</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-mono font-bold text-indigo-600">{bill.invoiceNumber}</TableCell>
                          <TableCell>
                            <div className="font-semibold">{bill.user.name}</div>
                            <div className="text-[10px] text-muted-foreground">{bill.user.email}</div>
                          </TableCell>
                          <TableCell className="font-semibold">₹{bill.totalAmount}</TableCell>
                          <TableCell>
                            <div className="text-xs font-semibold text-emerald-600">Paid: ₹{bill.paidAmount}</div>
                            <div className="text-[10px] text-amber-600">Remaining: ₹{bill.remainingAmount}</div>
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {new Date(bill.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              bill.status === "PAID" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                : bill.status === "PARTIAL" 
                                ? "bg-amber-50 text-amber-700 border-amber-100" 
                                : "bg-red-50 text-red-700 border-red-100"
                            }`}>
                              {bill.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                              onClick={() => {
                                setSelectedBillForPrint(bill);
                                setIsPrintOpen(true);
                              }}
                              disabled={loading}
                            >
                              Invoice
                            </Button>
                            {bill.status !== "PAID" && (
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                onClick={() => handleOpenPaymentModal(bill)}
                                disabled={loading}
                              >
                                Record Payment
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Invoices Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs">
                    <span className="text-muted-foreground">
                      Showing invoices {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, bills.length)} of {bills.length}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-xl h-8 text-[11px] font-bold">
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl h-8 text-[11px] font-bold">
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

        {/* CREATE CUSTOM BILL */}
        <TabsContent value="create">
          <Card className="shadow-md max-w-xl">
            <CardHeader>
              <CardTitle>Generate Custom Invoice</CardTitle>
              <CardDescription>Generate a bill for custom expenses (e.g. extra meals, special events, guest entry).</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateBill}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bill-customer">Select Diner</Label>
                  <select
                    id="bill-customer"
                    required
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
                  >
                    <option value="">-- Choose Diner --</option>
                    {activeCustomers.map((cust) => (
                      <option key={cust.id} value={cust.id}>
                        {cust.name} ({cust.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bill-base">Base Amount (₹)</Label>
                    <Input 
                      id="bill-base" 
                      type="number" 
                      required 
                      value={billAmount} 
                      onChange={(e) => handleBillAmountChange(e.target.value)} 
                      placeholder="E.g. 500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bill-due">Due Date</Label>
                    <Input 
                      id="bill-due" 
                      type="date" 
                      required 
                      value={dueDate} 
                      onChange={(e) => setDueDate(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="bill-gst">GST (₹)</Label>
                    <Input 
                      id="bill-gst" 
                      type="number" 
                      value={gst} 
                      onChange={(e) => setGst(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bill-extra">Extra Charges (₹)</Label>
                    <Input 
                      id="bill-extra" 
                      type="number" 
                      value={extraCharges} 
                      onChange={(e) => setExtraCharges(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bill-discount">Discount (₹)</Label>
                    <Input 
                      id="bill-discount" 
                      type="number" 
                      value={discount} 
                      onChange={(e) => setDiscount(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs flex justify-between items-center mt-2">
                  <span className="font-semibold text-indigo-900">Total Calculated Invoice:</span>
                  <span className="font-mono font-bold text-indigo-700 text-lg">
                    ₹{((parseFloat(billAmount || 0) + parseFloat(extraCharges || 0) + parseFloat(gst || 0)) - parseFloat(discount || 0)).toFixed(2)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4 border-t gap-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium" disabled={loading}>
                  {loading ? "Generating..." : "Generate Invoice"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {/* RECORD PAYMENT MODAL */}
      <Dialog open={selectedBillForPayment !== null} onOpenChange={(open) => !open && setSelectedBillForPayment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Diner Payment</DialogTitle>
            <DialogDescription>
              Log manual payments received from **{selectedBillForPayment?.user.name}**.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted-foreground">Invoice Reference:</span>
              <span className="font-mono font-bold text-indigo-600">{selectedBillForPayment?.invoiceNumber}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted-foreground">Total Dues Outstanding:</span>
              <span className="font-semibold text-amber-600 text-sm">₹{selectedBillForPayment?.remainingAmount}</span>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="pay-amount">Payment Amount Received (₹)</Label>
              <Input 
                id="pay-amount" 
                type="number" 
                value={payAmount} 
                onChange={(e) => setPayAmount(e.target.value)} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pay-method">Payment Method</Label>
                <select
                  id="pay-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
                >
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay-txid">Transaction ID (Optional)</Label>
                <Input 
                  id="pay-txid" 
                  value={transactionId} 
                  onChange={(e) => setTransactionId(e.target.value)} 
                  placeholder="E.g. Ref #12345"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => setSelectedBillForPayment(null)} disabled={loading}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium" onClick={handleRecordPayment} disabled={loading}>
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PRINT PREVIEW INVOICE MODAL */}
      <Dialog open={selectedBillForPrint !== null} onOpenChange={(open) => !open && setSelectedBillForPrint(null)}>
        <DialogContent className="sm:max-w-2xl bg-white text-black p-8 rounded-xl print:p-0 print:border-none print:shadow-none max-h-[95vh] overflow-y-auto">
          {selectedBillForPrint && (
            <div className="space-y-6 printable-invoice-content">
              <style dangerouslySetInnerHTML={{__html: `
                @media print {
                  body * {
                    visibility: hidden !important;
                  }
                  .printable-invoice-content, .printable-invoice-content * {
                    visibility: visible !important;
                  }
                  .printable-invoice-content {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    padding: 20px !important;
                    margin: 0 !important;
                    border: none !important;
                    box-shadow: none !important;
                  }
                }
              `}} />
              {/* Invoice Banner */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-indigo-700 uppercase">INVOICE</h2>
                  <p className="text-xs text-muted-foreground mt-1">Invoice Number: <span className="font-mono font-bold text-black">{selectedBillForPrint.invoiceNumber}</span></p>
                  <p className="text-xs text-muted-foreground">Date: {new Date(selectedBillForPrint.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right flex items-center gap-2.5">
                  {businessSettings?.logoUrl && (
                    <img 
                      src={businessSettings.logoUrl} 
                      alt="Mess Logo"
                      className="h-10 w-10 rounded-lg object-cover border bg-neutral-50 shrink-0"
                    />
                  )}
                  <div className="text-right">
                    <h3 className="font-extrabold text-sm text-indigo-950">{businessSettings?.name || "MessApp Operations"}</h3>
                    <p className="text-[10px] text-muted-foreground max-w-[200px] leading-tight block">
                      {businessSettings?.address || "Premium dining management"}
                    </p>
                    {businessSettings?.phone && (
                      <p className="text-[9px] text-muted-foreground mt-0.5">Phone: {businessSettings.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-semibold uppercase text-muted-foreground tracking-wider mb-1">Billed To:</h4>
                  <p className="font-bold text-sm">{selectedBillForPrint.user.name}</p>
                  <p className="text-muted-foreground">{selectedBillForPrint.user.email}</p>
                  <p className="text-muted-foreground">{selectedBillForPrint.user.phone}</p>
                </div>
                <div className="text-right">
                  <h4 className="font-semibold uppercase text-muted-foreground tracking-wider mb-1">Payment Status:</h4>
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold ${
                    selectedBillForPrint.status === "PAID" 
                      ? "bg-green-100 text-green-800" 
                      : selectedBillForPrint.status === "PARTIAL" 
                      ? "bg-amber-100 text-amber-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {selectedBillForPrint.status}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1.5">Due Date: {selectedBillForPrint.dueDate ? new Date(selectedBillForPrint.dueDate).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>

              {/* Bill Details Table */}
              <table className="w-full border-collapse text-xs mt-6">
                <thead>
                  <tr className="border-b-2 border-black bg-neutral-50 font-bold">
                    <th className="py-2 text-left">Description</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2.5">
                      <p className="font-bold">Mess Subscription package</p>
                      <p className="text-[10px] text-muted-foreground">Standard meals assignment</p>
                    </td>
                    <td className="py-2.5 text-right font-semibold">₹{(selectedBillForPrint.totalAmount + selectedBillForPrint.discount - selectedBillForPrint.extraCharges - selectedBillForPrint.gst).toFixed(2)}</td>
                  </tr>
                  {selectedBillForPrint.gst > 0 && (
                    <tr className="border-b text-[11px]">
                      <td className="py-1.5 text-muted-foreground">Taxes & GST</td>
                      <td className="py-1.5 text-right">₹{selectedBillForPrint.gst}</td>
                    </tr>
                  )}
                  {selectedBillForPrint.extraCharges > 0 && (
                    <tr className="border-b text-[11px]">
                      <td className="py-1.5 text-muted-foreground">Additional Service Charges</td>
                      <td className="py-1.5 text-right">₹{selectedBillForPrint.extraCharges}</td>
                    </tr>
                  )}
                  {selectedBillForPrint.discount > 0 && (
                    <tr className="border-b text-[11px] text-red-600">
                      <td className="py-1.5">Discount Offer Applied</td>
                      <td className="py-1.5 text-right">-₹{selectedBillForPrint.discount}</td>
                    </tr>
                  )}
                  <tr className="font-bold text-sm bg-neutral-50">
                    <td className="py-2.5 px-2">Grand Total:</td>
                    <td className="py-2.5 px-2 text-right text-indigo-700">₹{selectedBillForPrint.totalAmount}</td>
                  </tr>
                </tbody>
              </table>

              {/* Payments History */}
              {selectedBillForPrint.payments.length > 0 && (
                <div className="space-y-2 border-t pt-4 text-xs">
                  <h4 className="font-bold text-neutral-800">Transaction Payments Log:</h4>
                  <div className="space-y-1">
                    {selectedBillForPrint.payments.map((pm, idx) => (
                      <div key={pm.id} className="flex justify-between items-center text-[11px] border-b pb-1">
                        <span className="text-muted-foreground">
                          Payment #{idx+1} ({pm.paymentMethod} {pm.transactionId ? `[TXID: ${pm.transactionId}]` : ""}) - {new Date(pm.paymentDate).toLocaleDateString()}
                        </span>
                        <span className="font-semibold text-emerald-600">+₹{pm.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Dues summary block */}
              <div className="flex justify-between items-center border-t pt-4 text-xs font-semibold bg-neutral-50 p-3 rounded-lg">
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-[10px]">TOTAL COLLECTED BALANCE</p>
                  <p className="text-emerald-700 text-base font-bold">₹{selectedBillForPrint.paidAmount}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-muted-foreground text-[10px]">NET DUES OUTSTANDING</p>
                  <p className="text-amber-700 text-base font-bold">₹{selectedBillForPrint.remainingAmount}</p>
                </div>
              </div>

              {/* UPI Amount QR Section */}
              {businessSettings?.upiId && selectedBillForPrint.status !== "PAID" && selectedBillForPrint.remainingAmount > 0 && (
                <div className="flex flex-col items-center justify-center p-4 border border-dashed rounded-lg bg-neutral-50/50 mt-4">
                  <p className="text-[10px] font-extrabold text-indigo-950 mb-1.5 tracking-wider uppercase">SCAN TO PAY UPI</p>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      `upi://pay?pa=${businessSettings.upiId}&pn=${encodeURIComponent(businessSettings.name || "Mess Payment")}&am=${selectedBillForPrint.remainingAmount}&cu=INR`
                    )}`}
                    alt="UPI Payment QR"
                    className="h-32 w-32 bg-white p-1.5 border rounded-lg shadow-sm"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">{businessSettings.upiId}</p>
                </div>
              )}

              {/* Print Footer buttons */}
              <div className="flex justify-end gap-2 pt-6 border-t print:hidden">
                <Button variant="ghost" onClick={() => setSelectedBillForPrint(null)}>
                  Close
                </Button>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-1.5"
                  onClick={handlePrintInvoice}
                >
                  <Printer className="h-4 w-4" /> Print Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
