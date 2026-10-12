import { getCustomerDashboardData } from "@/actions/customer-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  QrCode, 
  ShieldAlert, 
  Clock, 
  Utensils, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Receipt, 
  Scan,
  TrendingDown,
  CalendarX,
  Sparkles,
  HelpCircle,
  Compass
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import MessExplorer from "@/components/HeroComponents/MessExplorer";
import FirstTimeGuideModal, { GuideTriggerButton } from "@/components/FirstTimeGuideModal";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage({ searchParams }) {
  const params = await searchParams;
  const isWelcome = params?.welcome === "true";
  const res = await getCustomerDashboardData();

  if (!res.success) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Error Loading Dashboard</h3>
        <p className="text-muted-foreground">{res.error}</p>
      </div>
    );
  }

  const { data } = res;

  // If customer is not linked to an active approved mess yet:
  if (data.notJoined) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-4 font-sans">
        <FirstTimeGuideModal defaultOpenIfNew={true} />
        
        {/* Onboarding Stepper Hub for Diners */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-md p-6 border shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  Diner Portal Hub
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Signed in as <strong>{data.userName}</strong>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-indigo-950 mt-1">
                How It Works: 3 Simple Steps
              </h2>
            </div>
            <GuideTriggerButton />
          </div>

          <div className="grid gap-3 sm:grid-cols-3 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Step 1: Registered
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">✓ Done</span>
              </div>
              <h4 className="font-extrabold text-xs text-emerald-950">Profile Verified</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your email and mobile number are ready.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border-2 border-indigo-500 shadow-sm space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" /> Step 2: Choose Mess
                </span>
                <span className="text-[10px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full">Current Step</span>
              </div>
              <h4 className="font-extrabold text-xs text-indigo-950">Explore & Request</h4>
              <p className="text-[11px] text-indigo-900 leading-relaxed">
                Filter by Pune areas, check timings & menus, then send a join request.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 opacity-80">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-slate-500" /> Step 3: Scan & Dine
                </span>
                <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">Upcoming</span>
              </div>
              <h4 className="font-extrabold text-xs text-slate-800">QR Check-In</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Once approved, scan the mess counter QR to track meal balances automatically.
              </p>
            </div>
          </div>
        </div>

        <MessExplorer 
          initialBusinesses={data.approvedMesses || []}
          initialRequests={data.customerRequests || []}
          userName={data.userName}
          userPhone={data.userPhone}
          showWelcomeSms={true}
          isCustomer={true}
        />
      </div>
    );
  }

  const mb = data.mealBreakdown || {
    startingMeals: 0,
    consumedMeals: 0,
    absentMeals: 0,
    remainingMeals: 0,
    operatingDaysElapsed: 0,
    holidaysExcluded: 0,
    attendedDays: 0
  };

  const activeSub = data.subscription;
  const remainingMeals = mb.remainingMeals;
  const totalMeals = mb.startingMeals;
  const usedMeals = mb.consumedMeals;
  const absentMeals = mb.absentMeals;

  const mealPct = totalMeals > 0 ? Math.round((remainingMeals / totalMeals) * 100) : 0;

  // Check for unpaid bills
  const unpaidBills = data.bills.filter(b => b.status !== "PAID");
  const totalDueAmount = unpaidBills.reduce((sum, b) => sum + b.remainingAmount, 0);

  // Check if today is a weekly off or holiday
  const checkTodayHoliday = () => {
    if (!data.holidays || data.holidays.length === 0) return null;
    const today = new Date();
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const currentDayName = days[today.getDay()];
    const todayStr = today.toDateString();

    const specificHoliday = data.holidays.find(
      h => h.date && new Date(h.date).toDateString() === todayStr
    );
    if (specificHoliday) {
      return {
        mealType: specificHoliday.mealType,
        title: specificHoliday.title || "Holiday"
      };
    }

    const weeklyOff = data.holidays.find(
      h => h.dayOfWeek && h.dayOfWeek.toUpperCase() === currentDayName
    );
    if (weeklyOff) {
      return {
        mealType: weeklyOff.mealType,
        title: weeklyOff.title || `${currentDayName} Off`
      };
    }

    return null;
  };

  const todayHoliday = checkTodayHoliday();
  const weeklyOffs = data.holidays?.filter(h => h.dayOfWeek) || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
      <FirstTimeGuideModal defaultOpenIfNew={true} />

      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-blue-700 via-indigo-600 to-indigo-800 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-indigo-100">
              Diner Dashboard
            </span>
            <GuideTriggerButton className="bg-white/10 text-white hover:bg-white/20 border-white/20" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Welcome, {data.userName}</h1>
          <p className="text-xs sm:text-sm text-indigo-100 font-medium">
            Active Diner at <strong>{data.businessName}</strong> (Mess ID: {data.uniqueId})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/customer/scanner">
            <Button className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-2xl text-xs h-11 px-5 shadow-md gap-1.5 cursor-pointer">
              <Scan className="h-4 w-4" /> Open QR Scanner
            </Button>
          </Link>
        </div>
      </div>

      {/* Holiday Notification Banner */}
      {todayHoliday && (
        <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-950 rounded-2xl shadow-sm">
          <Calendar className="h-5 w-5 text-rose-600" />
          <AlertTitle className="font-extrabold text-sm text-rose-900">Mess Holiday Today</AlertTitle>
          <AlertDescription className="text-xs mt-1 font-semibold leading-relaxed">
            The mess is closed today for: <strong className="text-rose-600 underline uppercase">{todayHoliday.mealType === "ALL" ? "All Day" : todayHoliday.mealType}</strong> ({todayHoliday.title}). Today will NOT be counted as absent.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Dine Pass Banner */}
      {data.activeDinePass && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md relative overflow-hidden">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <h3 className="font-extrabold text-emerald-950 text-sm">Active Dine Pass Generated</h3>
              <p className="text-xs text-emerald-800 font-medium">
                Last counter check-in was at {new Date(data.activeDinePass.timestamp).toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit' })}. Pass remains active for another {data.activeDinePass.expiresInMins} mins.
              </p>
            </div>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 h-10 px-5 rounded-2xl shrink-0 shadow-md">
            <Link href="/customer/scanner?showPass=true">
              Show Pass to Counter Staff
            </Link>
          </Button>
        </div>
      )}

      {/* Outstanding Dues Banner */}
      {totalDueAmount > 0 && (
        <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-900 rounded-2xl shadow-sm">
          <AlertCircle className="h-5 w-5 text-rose-600" />
          <AlertTitle className="font-bold text-sm">Outstanding Payment Balance</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            You have {unpaidBills.length} unpaid bill(s) totaling <span className="font-extrabold">₹{totalDueAmount}</span>. Please clear dues with the mess owner.
          </AlertDescription>
        </Alert>
      )}

      {/* ============================================================== */}
      {/* 5. THE 3-PART MEAL COUNT DASHBOARD                            */}
      {/* ============================================================== */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tight">
              Subscription Meal Breakdown
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time tracking of initial, consumed, absent, and remaining thalis.
            </p>
          </div>
          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Cycle Start: {activeSub ? new Date(activeSub.createdAt).toLocaleDateString() : "Active"}
          </span>
        </div>

        {/* 3-Part Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card A: Initial Starting Package Meals */}
          <div className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/30 rounded-3xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-2.5 py-0.5 rounded-full border border-blue-200">
                Part A: Initial Package
              </span>
              <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Utensils className="h-5 w-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black text-indigo-950 block tracking-tight">
                {totalMeals}
              </span>
              <span className="text-xs font-semibold text-muted-foreground block mt-0.5">
                Total Thalis at Start
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground bg-white/80 p-2.5 rounded-xl border border-blue-100 flex items-center justify-between">
              <span>Package rate:</span>
              <span className="font-bold text-indigo-950">₹{activeSub?.mealPrice || 0}/thali</span>
            </div>
          </div>

          {/* Card B: Consumed / Present Meals */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/30 rounded-3xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/60 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Part B: Consumed / Present
              </span>
              <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black text-emerald-600 block tracking-tight">
                {usedMeals}
              </span>
              <span className="text-xs font-semibold text-muted-foreground block mt-0.5">
                Thalis Eaten via QR Scan
              </span>
            </div>
            <div className="text-[10px] text-emerald-800 bg-white/80 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
              <span>Active Attendance:</span>
              <span className="font-bold text-emerald-950">{mb.attendedDays} days</span>
            </div>
          </div>

          {/* Card C: Total Meals Absent */}
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/30 rounded-3xl p-6 border border-amber-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100/60 px-2.5 py-0.5 rounded-full border border-amber-200">
                Part C: Total Absent
              </span>
              <div className="h-10 w-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <CalendarX className="h-5 w-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black text-amber-600 block tracking-tight">
                {absentMeals}
              </span>
              <span className="text-xs font-semibold text-muted-foreground block mt-0.5">
                Operating Days Missed
              </span>
            </div>
            <div className="text-[10px] text-amber-800 bg-white/80 p-2.5 rounded-xl border border-amber-100 flex items-center justify-between">
              <span>Holiday Protected:</span>
              <span className="font-bold text-amber-950">{mb.holidaysExcluded} day(s) spared</span>
            </div>
          </div>

          {/* Card D: Active Remaining Thalis Balance */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all relative overflow-hidden space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20">
                Active Balance
              </span>
              <div className="h-10 w-10 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur-md">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black text-white block tracking-tight">
                {remainingMeals}
              </span>
              <span className="text-xs font-semibold text-indigo-100 block mt-0.5">
                Remaining Thalis Left
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              <Progress value={mealPct} className="h-2.5 bg-white/20" />
              <div className="flex justify-between text-[10px] text-indigo-100 font-semibold">
                <span>{mealPct}% available</span>
                <span>{activeSub?.validityDays ? `${activeSub.validityDays}d limit` : "Active"}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Informational Footer regarding holiday exclusions and owner conversion */}
        <div className="p-4 rounded-2xl bg-slate-50 border text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Holiday Protection:</strong> {mb.holidaysExcluded} day(s) marked as holiday/weekly off were excluded and not counted as absent.
            </span>
          </div>
          <span className="text-indigo-600 font-semibold text-[11px]">
            * Mess owner can convert absent days back to your active meal count upon request.
          </span>
        </div>
      </div>

      {/* Main Grid: Operational Details & Dine History */}
      <div className="grid gap-6 md:grid-cols-5">
        
        {/* Left Column (3 cols): Timings & Plan Breakdown */}
        <div className="md:col-span-3 space-y-6">
          
          {/* Daily Menu Alert */}
          {data.dailyMenu && (
            <Card className="rounded-3xl border-orange-100 bg-orange-50/30 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                  <Utensils className="h-4 w-4" /> Today's Menu Alert
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs">
                <h4 className="font-bold text-foreground text-sm">{data.dailyMenu.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{data.dailyMenu.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Operational Hours */}
          <Card className="rounded-3xl shadow-xs">
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-950">
                <Clock className="h-4 w-4 text-indigo-600" /> Operational Hours & Service Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs divide-y space-y-1 pt-2">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-muted-foreground font-medium">Counter QR Check-In Status:</span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold ${
                  data.businessSettings?.qrScanEnabled ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}>
                  {data.businessSettings?.qrScanEnabled ? "● OPEN FOR SCAN" : "● CLOSED"}
                </span>
              </div>

              {data.businessSettings?.breakfastEnabled && (
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Breakfast Service:</span>
                  <span className="font-bold text-neutral-800">{data.businessSettings?.breakfastStart || "06:00"} - {data.businessSettings?.breakfastEnd || "11:00"}</span>
                </div>
              )}

              {data.businessSettings?.lunchEnabled && (
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Lunch Service:</span>
                  <span className="font-bold text-neutral-800">{data.businessSettings?.lunchStart || "11:00"} - {data.businessSettings?.lunchEnd || "16:00"}</span>
                </div>
              )}

              {data.businessSettings?.dinnerEnabled && (
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Dinner Service:</span>
                  <span className="font-bold text-neutral-800">{data.businessSettings?.dinnerStart || "16:00"} - {data.businessSettings?.dinnerEnd || "23:00"}</span>
                </div>
              )}

              {weeklyOffs.length > 0 && (
                <div className="py-3.5 space-y-2 border-t">
                  <span className="text-muted-foreground font-bold block text-[10px] uppercase tracking-wider">Scheduled Weekly Offs:</span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {weeklyOffs.map((off) => (
                      <div key={off.id} className="flex justify-between items-center bg-rose-50/50 border border-rose-100 rounded-xl px-3 py-1.5 text-xs">
                        <span className="font-extrabold text-rose-950 uppercase text-[10px]">{off.dayOfWeek}</span>
                        <span className="font-bold text-rose-700 bg-white px-2 py-0.5 rounded-full text-[9px] uppercase border border-rose-100">
                          {off.mealType === "ALL" ? "All Day" : off.mealType}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (2 cols): Scan Card & Recent Dine Logs */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Scan Card */}
          <Card className="rounded-3xl shadow-sm border-2 border-indigo-100/70 text-center overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-indigo-950">Counter Meal Scanner</CardTitle>
              <CardDescription className="text-xs">Scan the mess QR code at the food counter</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 space-y-4 bg-indigo-50/30">
              <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-md border-2 border-indigo-100 animate-pulse">
                <Scan className="w-8 h-8" />
              </div>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                Confirm meal attendance and instantly deduct 1 thali from your balance.
              </p>
              <Link href="/customer/scanner" className="w-full max-w-xs">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 shadow-md gap-2 cursor-pointer">
                  <Scan className="h-4 w-4" /> Open Camera Scanner
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Dine History */}
          <Card className="rounded-3xl shadow-xs">
            <CardHeader className="py-4 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-indigo-950">Recent Meal Logs</CardTitle>
                <CardDescription className="text-[11px]">Last 5 recorded check-ins</CardDescription>
              </div>
              <Clock className="h-4 w-4 text-muted-foreground opacity-50" />
            </CardHeader>
            <CardContent className="pt-3">
              {data.logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs border border-dashed rounded-2xl">
                  No meals scanned yet this cycle.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.logs.map((log) => (
                    <div key={log.id} className="flex justify-between items-center border-b pb-2.5 last:border-0 last:pb-0 text-xs">
                      <div>
                        <span className="font-bold text-neutral-900 block text-xs">
                          {log.mealType} Check-In
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        1 Thali Deducted
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3.e EXPLORE OTHER MESSES & ALL MY REQUESTS SECTION            */}
      {/* ============================================================== */}
      <div className="pt-6 border-t space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-xl font-bold text-indigo-950 flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-600" /> Explore Other Messes & My Requests
            </h3>
            <p className="text-xs text-muted-foreground">
              Search messes across Pune, compare profiles, and track all your pending join requests anytime.
            </p>
          </div>
        </div>

        <MessExplorer 
          initialBusinesses={data.approvedMesses || []}
          initialRequests={data.customerRequests || []}
          userName={data.userName}
          userPhone={data.userPhone}
          showWelcomeSms={false}
          isCustomer={true}
        />
      </div>

    </div>
  );
}
