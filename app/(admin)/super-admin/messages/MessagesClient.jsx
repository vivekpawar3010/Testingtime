"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Clock, CheckCircle2, ChevronLeft, ChevronRight, MessageSquare, Reply } from "lucide-react";
import { useRouter } from "next/navigation";
import { replyToContactMessage } from "@/actions/super-admin";
import { toast } from "sonner";

export default function MessagesClient({ initialData }) {
  const router = useRouter();
  const { messages, pagination } = initialData;

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOpenMessage = (msg) => {
    setSelectedMessage(msg);
    setReplyText(msg.replyText || "");
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error("Reply text cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      const res = await replyToContactMessage(selectedMessage.id, replyText);
      if (res.success) {
        toast.success("Reply recorded successfully!");
        setSelectedMessage(null);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to submit reply.");
      }
    } catch (err) {
      toast.error("An error occurred while saving the reply.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    router.push(`/super-admin/messages?page=${newPage}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
        <p className="text-muted-foreground">Monitor public inquiries, client requests, and answer them directly.</p>
      </div>

      <Card className="shadow-md bg-card">
        <CardHeader>
          <CardTitle>Inbox Log</CardTitle>
          <CardDescription>Records of messages sent from the Contact page.</CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground opacity-30 animate-pulse" />
              <h3 className="font-bold text-lg">No Messages Received</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                No visitor inquiries or contact requests have been recorded in the database yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border bg-white overflow-hidden">
                <Table>
                  <TableHeader className="bg-neutral-50/50">
                    <TableRow>
                      <TableHead>Sender Name</TableHead>
                      <TableHead>Email Address</TableHead>
                      <TableHead>Date Sent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((msg) => (
                      <TableRow key={msg.id} className="hover:bg-neutral-50/30 transition-colors">
                        <TableCell className="font-bold text-slate-800">{msg.name}</TableCell>
                        <TableCell className="font-medium text-slate-600">{msg.email}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            msg.status === "REPLIED" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}>
                            {msg.status === "REPLIED" ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" /> Replied
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3" /> Pending
                              </>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenMessage(msg)}
                            className="h-8 border-indigo-100 text-indigo-700 hover:bg-indigo-50 font-semibold gap-1 rounded-xl"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> View & Reply
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-xs text-muted-foreground">
                    Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.totalMessages} total)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Modal */}
      <Dialog open={selectedMessage !== null} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-600" /> Message Details
            </DialogTitle>
            <DialogDescription>
              Inquiry from <strong>{selectedMessage?.name}</strong> ({selectedMessage?.email})
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-50 border rounded-2xl p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Message Content:</p>
                <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Reply/Action Text:
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply text or internal logs here..."
                  className="flex w-full rounded-2xl border border-neutral-200 bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>

              <DialogFooter className="pt-4 border-t">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedMessage(null)}
                  className="rounded-xl h-10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendReply}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 rounded-xl h-10 px-5 shadow-sm"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Reply className="h-4 w-4" /> Save Reply
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
