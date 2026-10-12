"use client";

import React, { useState } from "react";
import { 
  Search, 
  MapPin, 
  Phone, 
  ArrowRight, 
  UtensilsCrossed, 
  Sparkles, 
  MessageSquare, 
  Clock, 
  Calendar, 
  CalendarOff, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  CreditCard,
  ChefHat,
  Send
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getBusinessPlansByUniqueId, getBusinessDailyMenuByUniqueId } from "@/actions/business";
import { requestToJoinMess } from "@/actions/user";
import { formatDistanceToNow } from "date-fns";

const POPULAR_LOCATIONS = [
  "All",
  "Pune",
  "Kothrud",
  "Hinjawadi",
  "Wakad",
  "Shivajinagar",
  "Hadapsar",
  "Viman Nagar",
  "Pandharpur"
];

export default function MessExplorer({ 
  initialBusinesses = [], 
  initialRequests = [],
  userName = "",
  userPhone = "",
  showWelcomeSms = false,
  isCustomer = true
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [activeTab, setActiveTab] = useState("messes");
  const [requests, setRequests] = useState(initialRequests);

  // Profile Modal State
  const [selectedProfileMess, setSelectedProfileMess] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profilePlans, setProfilePlans] = useState([]);
  const [profileMenu, setProfileMenu] = useState(null);

  // Join Modal State
  const [joinModalMess, setJoinModalMess] = useState(null);
  const [joinPlans, setJoinPlans] = useState([]);
  const [selectedJoinPlanId, setSelectedJoinPlanId] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  // Open Full Profile Modal
  const handleOpenProfile = async (mess) => {
    setSelectedProfileMess(mess);
    setProfileLoading(true);
    setProfilePlans([]);
    setProfileMenu(null);
    try {
      const [plansRes, menuRes] = await Promise.all([
        getBusinessPlansByUniqueId(mess.uniqueId),
        getBusinessDailyMenuByUniqueId(mess.uniqueId)
      ]);

      if (plansRes.success) setProfilePlans(plansRes.plans);
      if (menuRes.success) {
        setProfileMenu({
          dailyMenu: menuRes.dailyMenu,
          weeklyToday: menuRes.weeklyToday
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Open Direct Join Dialog
  const handleOpenJoin = async (mess) => {
    setJoinModalMess(mess);
    setJoinLoading(true);
    setSelectedJoinPlanId("");
    setJoinPlans([]);
    try {
      const res = await getBusinessPlansByUniqueId(mess.uniqueId);
      if (res.success && res.plans.length > 0) {
        setJoinPlans(res.plans);
        setSelectedJoinPlanId(res.plans[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setJoinLoading(false);
    }
  };

  // Submit Join Request
  const handleSubmitJoin = async () => {
    if (!joinModalMess) return;
    setJoinLoading(true);
    try {
      const res = await requestToJoinMess(joinModalMess.uniqueId, selectedJoinPlanId);
      if (res.success) {
        toast.success(`Request sent to ${joinModalMess.name}! Waiting for owner approval.`);
        setJoinModalMess(null);
        setSelectedProfileMess(null);
        // Add to local requests
        if (res.request) {
          const matchedPlan = joinPlans.find(p => p.id === selectedJoinPlanId);
          setRequests(prev => [
            {
              ...res.request,
              business: joinModalMess,
              plan: matchedPlan || null
            },
            ...prev
          ]);
        }
        setActiveTab("requests");
      } else {
        toast.error(res.error || "Failed to submit request.");
      }
    } catch (err) {
      toast.error("Error submitting request.");
    } finally {
      setJoinLoading(false);
    }
  };

  const getTodayHolidayStatus = (holidays) => {
    if (!holidays || holidays.length === 0) return null;

    const today = new Date();
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const currentDayName = days[today.getDay()];
    const todayStr = today.toDateString();

    const specificHoliday = holidays.find(
      (h) => h.date && new Date(h.date).toDateString() === todayStr
    );
    if (specificHoliday) {
      return {
        mealType: specificHoliday.mealType,
        title: specificHoliday.title || "Holiday"
      };
    }

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

  // Filtering
  const filteredMesses = initialBusinesses.filter((biz) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = biz.name.toLowerCase().includes(q);
    const addressMatch = (biz.address || "").toLowerCase().includes(q);
    const idMatch = (biz.uniqueId || "").toLowerCase().includes(q);
    const matchesSearch = nameMatch || addressMatch || idMatch;

    if (selectedLocation === "All") return matchesSearch;
    const matchesLoc = (biz.address || "").toLowerCase().includes(selectedLocation.toLowerCase()) ||
                       biz.name.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchesSearch && matchesLoc;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      
      {/* 1. Welcome SMS Notification Banner */}
      {showWelcomeSms && (
        <div className="rounded-3xl bg-linear-to-r from-blue-700 via-indigo-600 to-indigo-800 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md text-indigo-100">
                <MessageSquare className="h-3.5 w-3.5 text-indigo-200" />
                SMS Alert Delivered {userPhone ? `to ${userPhone}` : ""}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome to MessApp, {userName || "Diner"}! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl leading-relaxed">
                Your profile is active. Find top hygienic messes in Pune and surrounding areas below. View daily menus, compare thali plans, and request to join in one click.
              </p>
            </div>
            {requests.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("requests")}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-2xl text-xs font-bold h-10 px-5 shrink-0"
              >
                View My Requests ({requests.length})
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Tabs Switcher: Available Messes vs My Requests */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="p-1 bg-slate-100 rounded-2xl">
            <TabsTrigger value="messes" className="rounded-xl text-xs font-bold py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-xs">
              <UtensilsCrossed className="h-3.5 w-3.5 mr-1.5" /> Available Messes ({filteredMesses.length})
            </TabsTrigger>
            {isCustomer && (
              <TabsTrigger value="requests" className="rounded-xl text-xs font-bold py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-xs">
                <Send className="h-3.5 w-3.5 mr-1.5" /> My Join Requests ({requests.length})
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Tab 1: Available Messes Explorer */}
        <TabsContent value="messes" className="space-y-6">
          
          {/* Search Header & Location Filter Chips */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground opacity-60" />
                <Input
                  type="text"
                  placeholder="Search Pune messes, area (e.g. Kothrud, Hinjawadi), or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-5 border-indigo-100 bg-slate-50/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 font-medium"
                />
              </div>

              <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 shrink-0">
                <MapPin className="h-4 w-4 text-indigo-600" />
                Showing {filteredMesses.length} dining messes
              </div>
            </div>

            {/* Quick Area Filter Chips */}
            <div className="space-y-2 pt-2 border-t">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Quick Area Filters (Pune & Regional Clusters):
              </span>
              <div className="flex flex-wrap gap-2">
                {POPULAR_LOCATIONS.map((loc) => {
                  const isActive = selectedLocation === loc;
                  const count = loc === "All" 
                    ? initialBusinesses.length 
                    : initialBusinesses.filter(b => 
                        (b.address || "").toLowerCase().includes(loc.toLowerCase()) ||
                        b.name.toLowerCase().includes(loc.toLowerCase())
                      ).length;

                  return (
                    <button
                      key={loc}
                      onClick={() => setSelectedLocation(loc)}
                      className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                          : "bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      <span>{loc}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? "bg-white/25 text-white" : "bg-slate-200 text-slate-600"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mess Cards Grid */}
          {filteredMesses.length === 0 ? (
            <div className="text-center py-20 bg-white/60 border border-dashed rounded-3xl max-w-md mx-auto space-y-4">
              <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground opacity-40 animate-pulse" />
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-indigo-950">No Messes Found in This Area</h3>
                <p className="text-xs text-muted-foreground px-4">
                  We couldn't find any approved mess matching "{searchQuery || selectedLocation}". Try clearing filters or exploring other Pune areas!
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { setSearchQuery(""); setSelectedLocation("All"); }}
                className="rounded-full text-xs font-bold"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMesses.map((biz) => {
                const holidayInfo = getTodayHolidayStatus(biz.holidays);
                const hasPendingRequest = requests.some(r => r.businessId === biz.id && r.status === "PENDING");

                return (
                  <div 
                    key={biz.id}
                    className="group flex flex-col justify-between bg-white/90 backdrop-blur-md border border-neutral-100 rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="space-y-4">
                      {/* Brand Logo & Name */}
                      <div className="flex items-center gap-4">
                        {biz.logoUrl ? (
                          <img 
                            src={biz.logoUrl} 
                            alt={biz.name}
                            className="h-14 w-14 object-cover rounded-2xl border bg-white shadow-xs shrink-0"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                            <UtensilsCrossed className="h-6 w-6" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-extrabold text-indigo-950 text-base leading-snug group-hover:text-indigo-600 transition-colors truncate">
                            {biz.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/50">
                              ID: {biz.uniqueId || "MESS"}
                            </span>
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              ✓ Verified
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Holiday / Status Badge */}
                      {holidayInfo ? (
                        <div className={`text-[10px] font-bold px-3 py-1 rounded-full w-fit flex items-center gap-1.5 shadow-xs border ${
                          holidayInfo.mealType === 'ALL' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          <CalendarOff className="h-3 w-3" />
                          CLOSED: {holidayInfo.title} ({holidayInfo.mealType === 'ALL' ? 'All Day' : holidayInfo.mealType})
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold px-3 py-1 rounded-full w-fit flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-xs">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                          OPEN FOR DINING
                        </div>
                      )}

                      {/* Address & Contact */}
                      <div className="space-y-2 text-xs text-muted-foreground pt-1">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                          <span className="leading-relaxed line-clamp-2">{biz.address || "Pune Area"}</span>
                        </div>
                        {biz.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-indigo-500 shrink-0" />
                            <a href={`tel:${biz.phone}`} className="hover:text-indigo-600 font-medium">
                              {biz.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 mt-auto space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => handleOpenProfile(biz)}
                          className="border-indigo-100 text-indigo-700 hover:bg-indigo-50 font-bold text-xs rounded-xl h-9 cursor-pointer"
                        >
                          View Profile
                        </Button>
                        <Button 
                          onClick={() => {
                            if (hasPendingRequest) {
                              setActiveTab("requests");
                            } else {
                              handleOpenJoin(biz);
                            }
                          }}
                          className={`font-bold text-xs rounded-xl h-9 cursor-pointer transition-all ${
                            hasPendingRequest 
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300" 
                              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                          }`}
                        >
                          {hasPendingRequest ? "Track Request ⏳" : "Join Mess →"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: My Join Requests */}
        <TabsContent value="requests" className="space-y-6">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-indigo-950">My Join Requests</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track the status of your join applications. You can still explore other messes anytime!
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab("messes")}
                className="rounded-full text-xs font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              >
                + Browse More Messes
              </Button>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-16 border border-dashed rounded-2xl max-w-md mx-auto space-y-3">
                <Send className="h-10 w-10 mx-auto text-muted-foreground opacity-40 animate-bounce" />
                <h4 className="font-bold text-sm text-indigo-950">No Join Requests Yet</h4>
                <p className="text-xs text-muted-foreground">
                  Browse available messes in Pune and submit a request to start your meal subscription.
                </p>
                <Button 
                  size="sm" 
                  onClick={() => setActiveTab("messes")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
                >
                  Explore Messes
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => {
                  const isPending = req.status === "PENDING";
                  const isApproved = req.status === "APPROVED";
                  const isRejected = req.status === "REJECTED";

                  return (
                    <div 
                      key={req.id} 
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-2xl border bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-indigo-950 text-sm">
                            {req.business?.name || "Connected Mess"}
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            ID: {req.business?.uniqueId || "MESS"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Plan: <strong>{req.plan?.name || "Standard Plan"}</strong> • {req.plan?.mealCount ? `${req.plan.mealCount} Meals @ ₹${req.plan.totalAmount}` : "Custom Package"}
                        </p>
                        <span className="text-[10px] text-muted-foreground block">
                          Submitted {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                            Pending Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            Approved & Active
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                            Declined
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Comprehensive Mess Profile Modal */}
      <Dialog open={selectedProfileMess !== null} onOpenChange={(open) => !open && setSelectedProfileMess(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border shadow-2xl bg-white">
          {selectedProfileMess && (
            <>
              <DialogHeader className="border-b pb-4">
                <div className="flex items-center gap-4">
                  {selectedProfileMess.logoUrl ? (
                    <img 
                      src={selectedProfileMess.logoUrl} 
                      alt={selectedProfileMess.name} 
                      className="h-16 w-16 rounded-2xl object-cover border bg-white shadow-xs"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                      <UtensilsCrossed className="h-8 w-8" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-xl font-black text-indigo-950">
                        {selectedProfileMess.name}
                      </DialogTitle>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        ✓ Verified
                      </span>
                    </div>
                    <DialogDescription className="text-xs font-mono font-bold text-indigo-600 mt-0.5">
                      Mess Code: {selectedProfileMess.uniqueId}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4 text-xs">
                {/* Location & Contact Bar */}
                <div className="grid gap-3 sm:grid-cols-2 p-4 rounded-2xl bg-slate-50 border">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-indigo-600" /> Location Address
                    </span>
                    <p className="font-semibold text-neutral-800 leading-relaxed">
                      {selectedProfileMess.address || "Pune, Maharashtra"}
                    </p>
                  </div>
                  {selectedProfileMess.phone && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-indigo-600" /> Contact Phone
                      </span>
                      <a href={`tel:${selectedProfileMess.phone}`} className="font-bold text-indigo-600 text-sm hover:underline block">
                        {selectedProfileMess.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Operating Service Timings */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-indigo-950 text-sm flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-indigo-600" /> Daily Meal Service Hours
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-center">
                      <span className="text-[10px] font-bold text-muted-foreground block uppercase">Breakfast</span>
                      <span className="font-extrabold text-indigo-950 text-xs">
                        {selectedProfileMess.breakfastStart || "07:00"} - {selectedProfileMess.breakfastEnd || "10:30"}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-center">
                      <span className="text-[10px] font-bold text-muted-foreground block uppercase">Lunch</span>
                      <span className="font-extrabold text-indigo-950 text-xs">
                        {selectedProfileMess.lunchStart || "11:30"} - {selectedProfileMess.lunchEnd || "15:30"}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-center">
                      <span className="text-[10px] font-bold text-muted-foreground block uppercase">Dinner</span>
                      <span className="font-extrabold text-indigo-950 text-xs">
                        {selectedProfileMess.dinnerStart || "19:00"} - {selectedProfileMess.dinnerEnd || "22:30"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Available Subscription Packages */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-indigo-950 text-sm flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-indigo-600" /> Available Subscription Plans
                  </h4>
                  {profileLoading ? (
                    <div className="text-center py-6">
                      <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent inline-block" />
                    </div>
                  ) : profilePlans.length === 0 ? (
                    <p className="text-muted-foreground italic text-xs py-2">
                      Standard customized plans available upon joining.
                    </p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {profilePlans.map((p) => (
                        <div key={p.id} className="p-3.5 rounded-2xl border bg-slate-50/60 hover:bg-slate-50 transition-colors flex justify-between items-center">
                          <div>
                            <span className="font-bold text-indigo-950 block text-xs">{p.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {p.mealCount} Meals • {p.validityDays} Days
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-indigo-600 text-sm block">₹{p.totalAmount}</span>
                            <span className="text-[9px] text-muted-foreground">₹{p.mealPrice}/thali</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Today's Menu Section */}
                {profileMenu?.dailyMenu && (
                  <div className="space-y-1.5 p-4 rounded-2xl bg-amber-50/40 border border-amber-100">
                    <h4 className="font-bold text-amber-900 text-xs uppercase flex items-center gap-1.5">
                      <ChefHat className="h-4 w-4 text-amber-600" /> Today's Menu Broadcast: {profileMenu.dailyMenu.title}
                    </h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {profileMenu.dailyMenu.description}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="border-t pt-4 flex flex-col sm:flex-row justify-between gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedProfileMess(null)}
                  className="rounded-xl text-xs font-bold"
                >
                  Close Profile
                </Button>
                <Button 
                  onClick={() => {
                    const m = selectedProfileMess;
                    setSelectedProfileMess(null);
                    handleOpenJoin(m);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs px-6 h-10 shadow-md cursor-pointer"
                >
                  Request to Join This Mess →
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Join Mess Plan Selection Modal */}
      <Dialog open={joinModalMess !== null} onOpenChange={(open) => !open && setJoinModalMess(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8 bg-white">
          {joinModalMess && (
            <>
              <DialogHeader className="text-center space-y-1">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-1 border border-indigo-100">
                  <Send className="h-6 w-6" />
                </div>
                <DialogTitle className="text-xl font-bold text-indigo-950">
                  Join {joinModalMess.name}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Choose a subscription package to submit your join request.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-4">
                {joinLoading && joinPlans.length === 0 ? (
                  <div className="text-center py-6">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent inline-block" />
                  </div>
                ) : joinPlans.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border text-center text-xs text-indigo-950">
                    Standard 60 Thalis Monthly Package (Owner will confirm price on review).
                  </div>
                ) : (
                  joinPlans.map((plan) => {
                    const isSelected = selectedJoinPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedJoinPlanId(plan.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-600/10"
                            : "border-neutral-100 hover:border-indigo-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold text-sm text-indigo-950 block">{plan.name}</span>
                            <span className="text-xs text-muted-foreground">{plan.mealCount} Meals • {plan.validityDays} Days</span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-base text-indigo-600 block">₹{plan.totalAmount}</span>
                            <span className="text-[10px] text-muted-foreground">₹{plan.mealPrice}/meal</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setJoinModalMess(null)}
                  className="rounded-xl text-xs font-bold w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitJoin}
                  disabled={joinLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs w-full sm:w-auto flex-1 h-10 shadow-md cursor-pointer"
                >
                  {joinLoading ? "Submitting..." : "Send Join Request"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
