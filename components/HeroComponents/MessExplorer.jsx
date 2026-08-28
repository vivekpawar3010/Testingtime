"use client";

import React, { useState } from "react";
import { Search, MapPin, Phone, ArrowRight, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getBusinessPlansByUniqueId, getBusinessDailyMenuByUniqueId } from "@/actions/business";

export default function MessExplorer({ initialBusinesses }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [activeDialog, setActiveDialog] = useState(null); // { type: 'plans' | 'menu', mess: any }
  const [dialogLoading, setDialogLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [menu, setMenu] = useState(null);

  const handleOpenDialog = async (type, mess) => {
    setActiveDialog({ type, mess });
    setDialogLoading(true);
    setPlans([]);
    setMenu(null);
    try {
      if (type === "plans") {
        const res = await getBusinessPlansByUniqueId(mess.uniqueId);
        if (res.success) {
          setPlans(res.plans);
        }
      } else if (type === "menu") {
        const res = await getBusinessDailyMenuByUniqueId(mess.uniqueId);
        if (res.success) {
          setMenu(res.dailyMenu);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDialogLoading(false);
    }
  };

  const getTodayHolidayStatus = (holidays) => {
    if (!holidays || holidays.length === 0) return null;

    const today = new Date();
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const currentDayName = days[today.getDay()];
    const todayStr = today.toDateString();

    // Check date-specific holiday
    const specificHoliday = holidays.find(
      (h) => h.date && new Date(h.date).toDateString() === todayStr
    );
    if (specificHoliday) {
      return {
        mealType: specificHoliday.mealType,
        title: specificHoliday.title || "Holiday"
      };
    }

    // Check weekly recurring off
    const weeklyOff = holidays.find(
      (h) => h.dayOfWeek && h.dayOfWeek.toUpperCase() === currentDayName
    );
    if (weeklyOff) {
      return {
        mealType: weeklyOff.mealType,
        title: weeklyOff.title || `${currentDayName} Off`
      };
    }

    return null;
  };

  const filteredMesses = initialBusinesses.filter((biz) => {
    const nameMatch = biz.name.toLowerCase().includes(searchQuery.toLowerCase());
    const addressMatch = (biz.address || "").toLowerCase().includes(searchQuery.toLowerCase());
    const idMatch = (biz.uniqueId || "").toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || addressMatch || idMatch;
  });

  return (
    <section className="py-16 bg-slate-50/30 relative">
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        
        {/* Search Header */}
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-12">
          <h2 className="text-3xl font-extrabold text-indigo-950 tracking-tight">
            Find & Join a Connected Mess
          </h2>
          <p className="text-sm text-muted-foreground">
            Search by mess name, unique ID, or location address to request a subscription.
          </p>
          
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-60" />
            <Input
              type="text"
              placeholder="Search messes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-6 border-indigo-100 bg-white/80 backdrop-blur-sm rounded-full shadow-md shadow-indigo-50/50 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Mess Cards Grid */}
        {filteredMesses.length === 0 ? (
          <div className="text-center py-16 bg-white/40 border border-dashed rounded-3xl max-w-md mx-auto space-y-3">
            <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground opacity-40 animate-pulse" />
            <h3 className="font-bold text-lg text-indigo-950">No Messes Found</h3>
            <p className="text-xs text-muted-foreground px-4">
              We couldn't find any approved messes matching your search query. Try typing something else!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMesses.map((biz) => {
              const holidayInfo = getTodayHolidayStatus(biz.holidays);
              return (
                <div 
                  key={biz.id}
                  className="group flex flex-col justify-between bg-white/80 backdrop-blur-md border border-neutral-100 rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="space-y-4">
                    {/* Top line with logo/avatar */}
                    <div className="flex items-center gap-4">
                      {biz.logoUrl ? (
                        <img 
                          src={biz.logoUrl} 
                          alt={biz.name}
                          className="h-14 w-14 object-cover rounded-2xl border bg-white shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                          <UtensilsCrossed className="h-6 w-6" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-extrabold text-indigo-950 text-base leading-snug group-hover:text-indigo-600 transition-colors">
                          {biz.name}
                        </h3>
                        <span className="inline-block text-[10px] font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-1 border border-indigo-100/50">
                          ID: {biz.uniqueId || "PENDING"}
                        </span>
                      </div>
                    </div>

                    {holidayInfo && (
                      <div className={`text-[10px] font-bold px-3 py-1 rounded-full w-fit flex items-center gap-1.5 shadow-sm border ${holidayInfo.mealType === 'ALL' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${holidayInfo.mealType === 'ALL' ? 'bg-red-400' : 'bg-amber-400'}`}></span>
                          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${holidayInfo.mealType === 'ALL' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                        </span>
                        <span>
                          CLOSED: {holidayInfo.title} ({holidayInfo.mealType === 'ALL' ? 'All Day' : holidayInfo.mealType})
                        </span>
                      </div>
                    )}

                    {/* Details */}
                  <div className="space-y-2 text-xs text-muted-foreground pt-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{biz.address || "Location address not set"}</span>
                    </div>
                    {biz.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                        <span>{biz.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-6 mt-auto space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => handleOpenDialog("plans", biz)}
                      className="border-indigo-100 text-indigo-700 hover:bg-indigo-50 font-semibold text-[11px] rounded-xl h-9"
                    >
                      Dine Plans
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleOpenDialog("menu", biz)}
                      className="border-indigo-100 text-indigo-700 hover:bg-indigo-50 font-semibold text-[11px] rounded-xl h-9"
                    >
                      Daily Menu
                    </Button>
                  </div>
                  <Link href={`/customer/join?messId=${biz.uniqueId}`} className="block w-full">
                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs gap-1.5 rounded-2xl h-10 shadow-sm transition-all"
                    >
                      Join Mess <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Dynamic Info Modals */}
      <Dialog open={activeDialog !== null} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activeDialog?.type === "plans" ? "Mess Subscription Packages" : "Today's Daily Menu"}
            </DialogTitle>
            <DialogDescription>
              Viewing from <strong>{activeDialog?.mess?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {dialogLoading ? (
              <div className="flex h-32 items-center justify-center">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
            ) : activeDialog?.type === "plans" ? (
              plans.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No subscription plans published by this mess yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {plans.map((p) => (
                    <div key={p.id} className="rounded-xl border p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-indigo-950">{p.name}</h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Validity: {p.validityDays} Days | Total: {p.mealCount} Meals</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-indigo-600">₹{p.totalAmount}</span>
                          <p className="text-[9px] text-muted-foreground mt-0.5">₹{p.mealPrice}/meal</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              !menu ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  Today's menu hasn't been posted by this mess yet.
                </div>
              ) : (
                <div className="rounded-2xl border bg-slate-50/50 p-4 space-y-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-indigo-950 uppercase tracking-wider">{menu.title}</h4>
                    {menu.date && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">Date: {new Date(menu.date).toLocaleDateString()}</p>
                    )}
                  </div>
                  {menu.description ? (
                    <div className="bg-white rounded-xl p-3 border border-slate-100 text-xs text-indigo-900 font-medium whitespace-pre-wrap leading-relaxed">
                      {menu.description}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No menu details provided.</p>
                  )}
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
