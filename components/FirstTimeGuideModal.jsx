"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Search, 
  Utensils, 
  QrCode, 
  CheckCircle2, 
  Store, 
  Users, 
  Receipt, 
  CalendarOff,
  ArrowRight,
  HelpCircle
} from "lucide-react";

export default function FirstTimeGuideModal({ defaultOpenIfNew = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("diner");

  useEffect(() => {
    if (defaultOpenIfNew) {
      const hasSeen = localStorage.getItem("messapp_first_time_guide_seen");
      if (!hasSeen) {
        setIsOpen(true);
      }
    }
  }, [defaultOpenIfNew]);

  const handleDismiss = () => {
    localStorage.setItem("messapp_first_time_guide_seen", "true");
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border shadow-2xl bg-white/95 backdrop-blur-md">
          <DialogHeader className="text-center space-y-2 pb-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
              <Sparkles className="h-7 w-7 animate-pulse" />
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">
              Welcome to MessApp!
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Here is your quick step-by-step guide to get the most out of our smart digital mess platform.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
            <TabsList className="grid grid-cols-2 max-w-md mx-auto p-1 bg-slate-100/80 rounded-2xl">
              <TabsTrigger value="diner" className="rounded-xl text-xs font-bold py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                For Diners & Students
              </TabsTrigger>
              <TabsTrigger value="owner" className="rounded-xl text-xs font-bold py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                For Mess Owners
              </TabsTrigger>
            </TabsList>

            {/* Diner Walkthrough */}
            <TabsContent value="diner" className="space-y-4 pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">1</span>
                    Search Messes
                  </div>
                  <h4 className="font-extrabold text-indigo-950 text-sm">Find by City or Area</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Search for messes in Pune, Kothrud, Hinjawadi or filter by quick area chips to locate nearby dining services.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">2</span>
                    Inspect Profiles
                  </div>
                  <h4 className="font-extrabold text-indigo-950 text-sm">Check Menus & Plans</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Click "View Mess Profile" to review meal service hours, daily menu items, holidays, and available thali packages (30-60 meals).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">3</span>
                    Send Join Request
                  </div>
                  <h4 className="font-extrabold text-indigo-950 text-sm">Request & Track</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Submit your join request. You can browse other messes anytime and track all your requests under "My Join Requests".
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">4</span>
                    QR Check-In
                  </div>
                  <h4 className="font-extrabold text-indigo-950 text-sm">Scan to Dine</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Scan the mess counter QR code when taking your meal. Your dashboard automatically tracks consumed, remaining, and absent meals.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl text-emerald-950 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Tip:</strong> Scheduled mess holidays or weekly offs never count as absent days!
                </span>
              </div>
            </TabsContent>

            {/* Owner Walkthrough */}
            <TabsContent value="owner" className="space-y-4 pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">1</span>
                    Mess Profile Setup
                  </div>
                  <h4 className="font-extrabold text-indigo-950 text-sm">Brand & Hours</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Add your Mess brand logo, location address, contact phone, and operating timing windows for Breakfast, Lunch, and Dinner.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">2</span>
                    Packages & Plans
                  </div>
                  <h4 className="font-extrabold text-indigo-950 text-sm">Custom Meal Plans</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Define flexible subscription tiers (e.g. 30 thalis ₹1,800 or 60 thalis ₹3,200) with validity duration and reminder alerts.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">3</span>
                    Counter Scanner
                  </div>
                  <h4 className="font-extrabold text-indigo-950 text-sm">Live QR Console</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Display your Unique Mess QR code at the service counter. Each diner scan instantly validates their active subscription.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">4</span>
                    Holidays & Absent Meals
                  </div>
                  <h4 className="font-extrabold text-indigo-950 text-sm">Offs & Meal Conversion</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Schedule weekly offs (e.g. Sunday dinner closed). You can also convert any diner's absent days back into active meals anytime!
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t">
            <span className="text-[11px] text-muted-foreground text-center sm:text-left">
              You can reopen this guide anytime from the top navigation.
            </span>
            <Button 
              onClick={handleDismiss} 
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6 h-10 shadow-md cursor-pointer"
            >
              Got it, let's go! <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GuideTriggerButton({ className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setOpen(true)}
        className={`rounded-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs gap-1.5 shadow-xs ${className}`}
      >
        <HelpCircle className="h-3.5 w-3.5" /> How It Works
      </Button>

      {open && <FirstTimeGuideModal defaultOpenIfNew={false} />}
    </>
  );
}
