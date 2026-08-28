"use client";

import { useState } from "react";
import { saveHoliday, deleteHoliday } from "@/actions/holidays";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarOff, Plus, Trash2, CalendarDays, Clock, Save, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY"
];

const MEAL_TYPES = [
  { value: "ALL", label: "All Day / All Meals" },
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" }
];

export default function HolidaysClient({ initialHolidays }) {
  const [holidays, setHolidays] = useState(initialHolidays);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [type, setType] = useState("WEEKLY"); // WEEKLY or SPECIFIC
  const [dayOfWeek, setDayOfWeek] = useState("SUNDAY");
  const [date, setDate] = useState("");
  const [mealType, setMealType] = useState("ALL");
  const [title, setTitle] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await saveHoliday({
        type,
        dayOfWeek: type === "WEEKLY" ? dayOfWeek : null,
        date: type === "SPECIFIC" ? date : null,
        mealType,
        title: title || (type === "WEEKLY" ? `${dayOfWeek} Off` : "Holiday")
      });

      if (res.success) {
        toast.success("Holiday rule saved successfully!");
        setHolidays(prev => {
          const filterFn = (item) => {
            if (type === "WEEKLY") {
              return !(item.dayOfWeek === dayOfWeek && item.mealType === mealType);
            } else {
              return !(item.date && new Date(item.date).toDateString() === new Date(date).toDateString() && item.mealType === mealType);
            }
          };
          return [...prev.filter(item => !filterFn(item)), res.holiday];
        });
        
        // Reset form inputs
        setTitle("");
        if (type === "SPECIFIC") setDate("");
      } else {
        toast.error(res.error || "Failed to save holiday rule");
      }
    } catch (err) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this holiday/off rule?")) return;
    setLoading(true);

    try {
      const res = await deleteHoliday(id);
      if (res.success) {
        toast.success("Holiday rule deleted successfully.");
        setHolidays(prev => prev.filter(item => item.id !== id));
      } else {
        toast.error(res.error || "Failed to delete holiday");
      }
    } catch (err) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const weeklyOffs = holidays.filter(h => h.dayOfWeek);
  const specificHolidays = holidays.filter(h => h.date).sort((a,b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CalendarOff className="h-7 w-7 text-indigo-600" /> Holidays & Offs
        </h1>
        <p className="text-muted-foreground">Manage your mess weekly off schedules and specific closed holiday dates.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Form Card */}
        <div className="md:col-span-1 space-y-4">
          <Card className="shadow-md border border-indigo-100">
            <CardHeader className="bg-indigo-50/20 border-b pb-4">
              <CardTitle className="text-md font-bold text-indigo-950 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-indigo-600" /> Add Holiday Rule
              </CardTitle>
              <CardDescription>Specify closed days or slot-specific offs.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-4 space-y-4">
                
                {/* Rule Type Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rule Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      type="button"
                      variant={type === "WEEKLY" ? "default" : "outline"}
                      onClick={() => setType("WEEKLY")}
                      className={`h-9 text-xs rounded-xl font-semibold border-indigo-100 ${type === "WEEKLY" ? "bg-indigo-600 text-white" : ""}`}
                    >
                      Weekly Off
                    </Button>
                    <Button 
                      type="button"
                      variant={type === "SPECIFIC" ? "default" : "outline"}
                      onClick={() => setType("SPECIFIC")}
                      className={`h-9 text-xs rounded-xl font-semibold border-indigo-100 ${type === "SPECIFIC" ? "bg-indigo-600 text-white" : ""}`}
                    >
                      Calendar Date
                    </Button>
                  </div>
                </div>

                {/* Day selector if Weekly Off */}
                {type === "WEEKLY" ? (
                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recurring Off Day</Label>
                    <select
                      id="dayOfWeek"
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-neutral-200 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {DAYS_OF_WEEK.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  /* Date picker if Calendar Holiday */
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Holiday Date</Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="border-neutral-200"
                    />
                  </div>
                )}

                {/* Meal Slot target selection */}
                <div className="space-y-2">
                  <Label htmlFor="mealType" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Meal / Period Slot</Label>
                  <select
                    id="mealType"
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-neutral-200 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {MEAL_TYPES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* Title / Description input */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description (Optional)</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sunday dinner off, Diwali holiday"
                    className="border-neutral-200"
                  />
                </div>

              </CardContent>
              <CardFooter className="bg-neutral-50/50 border-t pt-3 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs gap-1.5 rounded-xl h-9 shadow-md shadow-indigo-100"
                >
                  <Save className="h-4 w-4" /> Save Rule
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right Column: List details */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Info disclaimer */}
          <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100 text-xs text-indigo-950 space-y-1.5 flex gap-3">
            <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-bold text-indigo-900">How Holidays & Offs work:</p>
              <p className="text-muted-foreground text-[11px]">
                Rules set here will display automatically as notifications or alerts on the diner dashboard and the public mess directory map cards. Deductions/scans will still check parameters, but diners will see the closed statuses instantly.
              </p>
            </div>
          </div>

          {/* 1. Weekly offs ledger */}
          <Card className="shadow-md bg-card border border-neutral-100">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" /> Weekly Recurring Offs
              </CardTitle>
              <CardDescription>Weekly recurring closed periods</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {weeklyOffs.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-neutral-100 rounded-xl text-xs text-muted-foreground">
                  No weekly off rules configured. The mess is assumed to be open 7 days a week.
                </div>
              ) : (
                <div className="divide-y space-y-1">
                  {weeklyOffs.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2.5 last:border-0">
                      <div>
                        <span className="font-extrabold text-indigo-950 text-sm block">
                          {item.dayOfWeek}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Scope: <strong className="text-indigo-600">{item.mealType}</strong> {item.title ? `| ${item.title}` : ""}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Specific holidays ledger */}
          <Card className="shadow-md bg-card border border-neutral-100">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-indigo-600" /> Date-Specific Holidays
              </CardTitle>
              <CardDescription>One-off calendar holidays</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {specificHolidays.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-neutral-100 rounded-xl text-xs text-muted-foreground">
                  No upcoming calendar holidays configured.
                </div>
              ) : (
                <div className="divide-y space-y-1">
                  {specificHolidays.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2.5 last:border-0">
                      <div>
                        <span className="font-extrabold text-indigo-950 text-sm block">
                          {new Date(item.date).toLocaleDateString("en-US", { dateStyle: "long" })}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Scope: <strong className="text-indigo-600">{item.mealType}</strong> {item.title ? `| ${item.title}` : ""}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
