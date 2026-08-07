import React from "react";
import { db } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { Users, UserCheck, ShieldAlert, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuperAdminUsersPage({ searchParams }) {
  const adminUser = await checkUser();
  if (!adminUser || adminUser.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  // Parse page
  const params = await searchParams;
  const page = parseInt(params?.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  // Retrieve total count
  const totalUsers = await db.user.count();
  const totalPages = Math.ceil(totalUsers / limit);

  // Retrieve users
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    skip,
    take: limit
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-indigo-950">System Users</h2>
        <p className="text-muted-foreground mt-2">View all registered client admins, customers, and system admins.</p>
      </div>

      <Card className="shadow-lg border-indigo-50 overflow-hidden">
        <CardHeader className="bg-slate-50/30 border-b">
          <CardTitle className="text-lg font-bold text-indigo-950">User Registry</CardTitle>
          <CardDescription>Total system accounts: {totalUsers}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="font-bold text-indigo-950 text-xs">Name</TableHead>
                <TableHead className="font-bold text-indigo-950 text-xs">Email / ID</TableHead>
                <TableHead className="font-bold text-indigo-950 text-xs">System Role</TableHead>
                <TableHead className="font-bold text-indigo-950 text-xs">Status</TableHead>
                <TableHead className="font-bold text-indigo-950 text-xs">Registered At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50/30">
                  <TableCell className="font-bold text-indigo-950 text-xs">{u.name || "No Name"}</TableCell>
                  <TableCell className="text-xs">
                    <p className="text-slate-800 flex items-center gap-1">
                      <Mail className="h-3 w-3 text-neutral-400" /> {u.email}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">UID: {u.clerkUserId}</p>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === "SUPER_ADMIN" 
                        ? "bg-red-50 text-red-700 border border-red-100"
                        : u.role === "CLIENT_ADMIN"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}>
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-semibold">
                    {u.status === "ACTIVE" ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <UserCheck className="h-3.5 w-3.5" /> Active
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1">
                        <ShieldAlert className="h-3.5 w-3.5" /> {u.status}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination control */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={`/super-admin/users?page=${page - 1}`} className="inline-flex h-9 items-center justify-center rounded-xl border bg-background px-4 text-xs font-medium hover:bg-muted">
                Previous
              </a>
            )}
            {page < totalPages && (
              <a href={`/super-admin/users?page=${page + 1}`} className="inline-flex h-9 items-center justify-center rounded-xl border bg-background px-4 text-xs font-medium hover:bg-muted">
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
