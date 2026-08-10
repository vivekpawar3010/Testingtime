"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitContactMessage } from "@/actions/super-admin";
import { toast } from "sonner";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      message: formData.get("message")
    };

    try {
      const res = await submitContactMessage(data);
      if (res.success) {
        toast.success("Thank you! Your message has been sent successfully. We'll get back to you shortly.");
        e.target.reset();
      } else {
        toast.error(res.error || "Failed to send message.");
      }
    } catch (err) {
      toast.error("An error occurred while sending your message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card/60 backdrop-blur-md p-8 rounded-3xl border border-neutral-100 shadow-xl">
      <h3 className="text-lg font-bold text-indigo-950 mb-6 font-heading">Send Us a Message</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">First Name</Label>
            <Input id="firstName" name="firstName" placeholder="John" className="border-neutral-200 focus:ring-indigo-500 rounded-xl" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Name</Label>
            <Input id="lastName" name="lastName" placeholder="Doe" className="border-neutral-200 focus:ring-indigo-500 rounded-xl" required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</Label>
          <Input id="email" name="email" type="email" placeholder="john@example.com" className="border-neutral-200 focus:ring-indigo-500 rounded-xl" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="message" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Message</Label>
          <textarea 
            id="message" 
            name="message"
            rows={4}
            placeholder="How can we help you today?" 
            className="flex w-full rounded-xl border border-neutral-200 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            required
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shadow-md shadow-indigo-100 h-11 mt-2 rounded-xl transition-all"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Sending...
            </span>
          ) : (
            <>
              <Send className="h-4 w-4" /> Send Message
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
