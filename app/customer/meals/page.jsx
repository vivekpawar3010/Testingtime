import { getCustomerMealLogs } from "@/actions/meals";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CustomerMealsPage({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params?.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const res = await getCustomerMealLogs();

  if (!res.success) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Error Loading Dine History</h3>
        <p className="text-muted-foreground">{res.error}</p>
      </div>
    );
  }

  const { logs } = res;
  const paginatedLogs = logs.slice(skip, skip + limit);
  const totalPages = Math.ceil(logs.length / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dine History</h1>
        <p className="text-muted-foreground">Log of your past checked-in meals at this mess.</p>
      </div>

      <Card className="shadow-md bg-card">
        <CardHeader>
          <CardTitle>Meal Logs Ledger</CardTitle>
          <CardDescription>Track all deduction scans performed on your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-card">
              <History className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <h3 className="font-bold text-lg">No Diner Logs Yet</h3>
              <p className="text-muted-foreground text-sm">Your dine logs will appear here as soon as you scan your QR ticket.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Meal Event Type</TableHead>
                      <TableHead>Check-in Date</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.map((log) => {
                      const dateObj = new Date(log.createdAt);
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              log.mealType === "BREAKFAST" 
                                ? "bg-amber-50 text-amber-700" 
                                : log.mealType === "LUNCH" 
                                ? "bg-indigo-50 text-indigo-700" 
                                : "bg-orange-50 text-orange-700"
                            }`}>
                              {log.mealType}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {dateObj.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" })}
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground text-xs">
                            {dateObj.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                              ● Verified check-in
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t text-xs">
                  <span className="text-muted-foreground">
                    Showing logs {skip + 1} to {Math.min(skip + limit, logs.length)} of {logs.length}
                  </span>
                  <div className="flex gap-2">
                    {page > 1 ? (
                      <a href={`/customer/meals?page=${page - 1}`} className="inline-flex h-9 items-center justify-center rounded-xl border bg-background px-4 font-semibold hover:bg-muted transition-colors">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </a>
                    ) : (
                      <button disabled className="inline-flex h-9 items-center justify-center rounded-xl border bg-background px-4 font-semibold opacity-50 cursor-not-allowed">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </button>
                    )}

                    {page < totalPages ? (
                      <a href={`/customer/meals?page=${page + 1}`} className="inline-flex h-9 items-center justify-center rounded-xl border bg-background px-4 font-semibold hover:bg-muted transition-colors">
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </a>
                    ) : (
                      <button disabled className="inline-flex h-9 items-center justify-center rounded-xl border bg-background px-4 font-semibold opacity-50 cursor-not-allowed">
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
