"use client";

import { useState } from "react";
import { saveMenuEntry, toggleGlobalMenu, deleteMenuEntry } from "@/actions/menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Utensils, Save, Eye, EyeOff, CalendarDays, Coffee, Sunrise, Sunset, Trash2, Sparkles } from "lucide-react";
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

export default function MenuClient({ initialMenuItems }) {
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("weekly");

  // Determine if menu is globally enabled (if any item status is ACTIVE, or default to true)
  const isMenuEnabled = menuItems.length === 0 || menuItems.some(item => item.status === "ACTIVE");

  const [selectedDay, setSelectedDay] = useState("MONDAY");
  const [lunchTitle, setLunchTitle] = useState("");
  const [lunchDescription, setLunchDescription] = useState("");
  const [dinnerTitle, setDinnerTitle] = useState("");
  const [dinnerDescription, setDinnerDescription] = useState("");

  // Daily Menu Form States
  const [dailyTitle, setDailyTitle] = useState("");
  const [dailyDescription, setDailyDescription] = useState("");

  // Festival Menu Form States
  const [festivalDate, setFestivalDate] = useState("");
  const [festivalTitle, setFestivalTitle] = useState("");
  const [festivalDescription, setFestivalDescription] = useState("");

  // Find existing menu item for currently selected day
  const activeDailyEntry = menuItems.find(item => item.type === "DAILY");

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    const lunchEntry = menuItems.find(item => item.type === "WEEKLY" && item.day === day && item.mealType === "LUNCH");
    const dinnerEntry = menuItems.find(item => item.type === "WEEKLY" && item.day === day && item.mealType === "DINNER");
    
    if (lunchEntry) {
      setLunchTitle(lunchEntry.title);
      setLunchDescription(lunchEntry.description || "");
    } else {
      setLunchTitle("");
      setLunchDescription("");
    }

    if (dinnerEntry) {
      setDinnerTitle(dinnerEntry.title);
      setDinnerDescription(dinnerEntry.description || "");
    } else {
      setDinnerTitle("");
      setDinnerDescription("");
    }
  };

  const handleSaveWeekly = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Save Lunch
      const lunchRes = await saveMenuEntry({
        type: "WEEKLY",
        day: selectedDay,
        mealType: "LUNCH",
        title: lunchTitle,
        description: lunchDescription
      });

      // Save Dinner
      const dinnerRes = await saveMenuEntry({
        type: "WEEKLY",
        day: selectedDay,
        mealType: "DINNER",
        title: dinnerTitle,
        description: dinnerDescription
      });

      if (lunchRes.success && dinnerRes.success) {
        toast.success(`Saved lunch and dinner menu for ${selectedDay}!`);
        setMenuItems(prev => {
          const filtered = prev.filter(item => !(item.type === "WEEKLY" && item.day === selectedDay));
          return [...filtered, lunchRes.menu, dinnerRes.menu];
        });
      } else {
        toast.error("Failed to save menu");
      }
    } catch (err) {
      toast.error(err.message || "Error saving menu");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDaily = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await saveMenuEntry({
        type: "DAILY",
        day: null,
        title: dailyTitle,
        description: dailyDescription
      });

      if (res.success) {
        toast.success("Saved today's daily menu!");
        setMenuItems(prev => {
          const filtered = prev.filter(item => item.type !== "DAILY");
          return [...filtered, res.menu];
        });
      } else {
        toast.error(res.error || "Failed to save menu");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFestival = async (e) => {
    e.preventDefault();
    if (!festivalDate) {
      toast.error("Please select a date.");
      return;
    }
    setLoading(true);
    try {
      const res = await saveMenuEntry({
        type: "FESTIVAL",
        date: festivalDate,
        title: festivalTitle,
        description: festivalDescription
      });

      if (res.success) {
        toast.success(`Saved festival/special menu for ${festivalDate}!`);
        setMenuItems(prev => {
          const dateStr = new Date(festivalDate).toDateString();
          const filtered = prev.filter(item => !(item.type === "FESTIVAL" && new Date(item.date).toDateString() === dateStr));
          return [...filtered, res.menu];
        });
        setFestivalTitle("");
        setFestivalDescription("");
        setFestivalDate("");
      } else {
        toast.error(res.error || "Failed to save festival menu");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenuEntry = async (menuId) => {
    if (!confirm("Are you sure you want to delete this menu entry?")) return;
    setLoading(true);
    try {
      const res = await deleteMenuEntry(menuId);
      if (res.success) {
        toast.success("Menu entry deleted successfully.");
        setMenuItems(prev => prev.filter(item => item.id !== menuId));
      } else {
        toast.error(res.error || "Failed to delete entry");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMenu = async (checked) => {
    setLoading(true);
    const newStatus = checked ? "ACTIVE" : "INACTIVE";
    try {
      const res = await toggleGlobalMenu(newStatus);
      if (res.success) {
        toast.success(checked ? "Menu Planner is now visible to customers." : "Menu Planner is now hidden.");
        setMenuItems(prev => prev.map(item => ({ ...item, status: newStatus })));
      } else {
        toast.error(res.error || "Failed to toggle menu visibility");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill daily form from existing daily entry
  useState(() => {
    if (activeDailyEntry) {
      setDailyTitle(activeDailyEntry.title);
      setDailyDescription(activeDailyEntry.description || "");
    }
    // Load Monday initially
    const monLunch = initialMenuItems.find(item => item.type === "WEEKLY" && item.day === "MONDAY" && item.mealType === "LUNCH");
    const monDinner = initialMenuItems.find(item => item.type === "WEEKLY" && item.day === "MONDAY" && item.mealType === "DINNER");
    if (monLunch) {
      setLunchTitle(monLunch.title);
      setLunchDescription(monLunch.description || "");
    }
    if (monDinner) {
      setDinnerTitle(monDinner.title);
      setDinnerDescription(monDinner.description || "");
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Planner</h1>
          <p className="text-muted-foreground">Publish weekly schedules or post today's specials for diners.</p>
        </div>

        {/* Global Visible Switch Toggle */}
        <div className="flex items-center gap-2 rounded-lg border bg-card p-3 shadow-sm">
          {isMenuEnabled ? <Eye className="h-5 w-5 text-indigo-600" /> : <EyeOff className="h-5 w-5 text-muted-foreground" />}
          <div className="space-y-0.5">
            <Label htmlFor="menu-toggle" className="text-sm font-semibold">Publish Menu</Label>
            <p className="text-[10px] text-muted-foreground">Visible to customers</p>
          </div>
          <Switch 
            id="menu-toggle" 
            checked={isMenuEnabled} 
            onCheckedChange={handleToggleMenu}
            disabled={loading}
            className="ml-2"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card border p-1.5 rounded-lg flex-wrap h-auto gap-1">
          <TabsTrigger value="weekly" className="rounded-md text-sm font-bold md:text-base px-5 py-2.5">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="daily" className="rounded-md text-sm font-bold md:text-base px-5 py-2.5">Today's Special Menu</TabsTrigger>
          <TabsTrigger value="festival" className="rounded-md text-sm font-bold md:text-base px-5 py-2.5 relative flex items-center gap-1.5">
            Festival & Special Dates
            {menuItems.filter(item => item.type === "FESTIVAL").length > 0 && (
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-extrabold text-white animate-pulse">
                {menuItems.filter(item => item.type === "FESTIVAL").length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* WEEKLY MENU PLANNER */}
        <TabsContent value="weekly" className="grid gap-6 md:grid-cols-3">
          {/* Day selection and editor */}
          <Card className="col-span-1 shadow-md h-fit">
            <CardHeader className="pb-3">
              <CardTitle>Select Day & Plan</CardTitle>
              <CardDescription>Update items day-by-day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Day of the Week</Label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedDay === day;
                    const hasData = menuItems.some(item => item.type === "WEEKLY" && item.day === day && item.title);
                    return (
                      <Button
                        key={day}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`text-xs capitalize font-medium rounded-full py-1 h-8 ${isSelected ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""} ${hasData && !isSelected ? "border-indigo-200 text-indigo-700 bg-indigo-50/30" : ""}`}
                        onClick={() => handleSelectDay(day)}
                      >
                        {day.toLowerCase()}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSaveWeekly} className="space-y-4 pt-3 border-t">
                {/* Lunch Fields */}
                <div className="space-y-3 p-3 bg-amber-50/20 border border-amber-100 rounded-xl">
                  <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[9px] font-bold text-amber-800 uppercase tracking-wider">Lunch Menu</span>
                  <div className="space-y-2">
                    <Label htmlFor="lunch-title" className="text-xs font-bold text-neutral-600">Lunch Dish Title</Label>
                    <Input 
                      id="lunch-title" 
                      required 
                      value={lunchTitle} 
                      onChange={(e) => setLunchTitle(e.target.value)} 
                      placeholder="E.g. Veg Thali / Rice Plate" 
                      className="h-9 border-neutral-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lunch-desc" className="text-xs font-bold text-neutral-600">Lunch Details</Label>
                    <textarea
                      id="lunch-desc"
                      required
                      rows={3}
                      value={lunchDescription}
                      onChange={(e) => setLunchDescription(e.target.value)}
                      placeholder="E.g. Rice, Chapati, Dal, Veg Mix, Pickle"
                      className="flex min-h-[60px] w-full rounded-md border border-neutral-200 bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                {/* Dinner Fields */}
                <div className="space-y-3 p-3 bg-indigo-50/20 border border-indigo-100 rounded-xl">
                  <span className="inline-block rounded-full bg-indigo-100 px-2.5 py-0.5 text-[9px] font-bold text-indigo-800 uppercase tracking-wider">Dinner Menu</span>
                  <div className="space-y-2">
                    <Label htmlFor="dinner-title" className="text-xs font-bold text-neutral-600">Dinner Dish Title</Label>
                    <Input 
                      id="dinner-title" 
                      required 
                      value={dinnerTitle} 
                      onChange={(e) => setDinnerTitle(e.target.value)} 
                      placeholder="E.g. Aloo Paratha / Roti Sabji" 
                      className="h-9 border-neutral-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dinner-desc" className="text-xs font-bold text-neutral-600">Dinner Details</Label>
                    <textarea
                      id="dinner-desc"
                      required
                      rows={3}
                      value={dinnerDescription}
                      onChange={(e) => setDinnerDescription(e.target.value)}
                      placeholder="E.g. 3 Parathas, Curd, Pickle, Butter"
                      className="flex min-h-[60px] w-full rounded-md border border-neutral-200 bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-100 rounded-xl" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" /> Save {selectedDay.toLowerCase()} Plans
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Weekly Schedule Preview Grid */}
          <Card className="col-span-2 shadow-md">
            <CardHeader>
              <CardTitle>Schedule Preview</CardTitle>
              <CardDescription>What your customers see in their app</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {DAYS_OF_WEEK.map((day) => {
                  const lunchEntry = menuItems.find(item => item.type === "WEEKLY" && item.day === day && item.mealType === "LUNCH");
                  const dinnerEntry = menuItems.find(item => item.type === "WEEKLY" && item.day === day && item.mealType === "DINNER");
                  const hasData = lunchEntry || dinnerEntry;

                  return (
                    <div key={day} className={`rounded-xl border p-4 transition-all ${hasData ? "bg-card shadow-sm border-indigo-100 hover:shadow" : "bg-muted/30 border-dashed border-2 flex flex-col justify-center items-center py-6"}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans">
                          {day}
                        </span>
                        {hasData && (
                          <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                        )}
                      </div>
                      
                      {hasData ? (
                        <div className="space-y-3 text-left">
                          {lunchEntry && (
                            <div className="space-y-1 border-b pb-2 last:border-b-0 last:pb-0">
                              <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 uppercase tracking-wider">Lunch</span>
                              <h4 className="font-bold text-xs text-foreground mt-1">{lunchEntry.title}</h4>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{lunchEntry.description || "No details."}</p>
                            </div>
                          )}
                          {dinnerEntry && (
                            <div className="space-y-1">
                              <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700 uppercase tracking-wider">Dinner</span>
                              <h4 className="font-bold text-xs text-foreground mt-1">{dinnerEntry.title}</h4>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{dinnerEntry.description || "No details."}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <span className="text-[11px] font-semibold text-muted-foreground">No menu set</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DAILY SPECIAL MENU */}
        <TabsContent value="daily">
          <Card className="shadow-md max-w-xl">
            <CardHeader>
              <CardTitle>Daily Special Menu Planner</CardTitle>
              <CardDescription>Broadcast today's menu directly. Overrides weekly schedules when displayed as daily alert.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveDaily}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="daily-title">Today's Special Title</Label>
                  <Input 
                    id="daily-title" 
                    required 
                    value={dailyTitle} 
                    onChange={(e) => setDailyTitle(e.target.value)} 
                    placeholder="E.g. Sunday Special Feast!" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily-desc">Special Menu Details</Label>
                  <textarea
                    id="daily-desc"
                    required
                    rows={5}
                    value={dailyDescription}
                    onChange={(e) => setDailyDescription(e.target.value)}
                    placeholder="E.g. Chicken Biryani / Veg Pulao, Raita, Salad, Papad, Ice Cream"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                {activeDailyEntry && (
                  <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-xs text-orange-800">
                    <span className="font-bold">Active Broadcast:</span> {activeDailyEntry.title} ({activeDailyEntry.description})
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end pt-4 border-t gap-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" /> Broadcast Today's Menu
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* FESTIVAL / SPECIAL DATE PLANNER */}
        <TabsContent value="festival" className="grid gap-6 md:grid-cols-3">
          {/* Festival Form Card */}
          <Card className="col-span-1 shadow-md h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" /> Add Festival Menu
              </CardTitle>
              <CardDescription>Publish special menu for a calendar date</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveFestival} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fest-date">Select Festival Date</Label>
                  <Input 
                    id="fest-date" 
                    type="date" 
                    required 
                    value={festivalDate} 
                    onChange={(e) => setFestivalDate(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fest-title">Festival/Special Title</Label>
                  <Input 
                    id="fest-title" 
                    required 
                    value={festivalTitle} 
                    onChange={(e) => setFestivalTitle(e.target.value)} 
                    placeholder="E.g. Diwali Festival Feast" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fest-desc">Special Menu Details</Label>
                  <textarea
                    id="fest-desc"
                    required
                    rows={4}
                    value={festivalDescription}
                    onChange={(e) => setFestivalDescription(e.target.value)}
                    placeholder="E.g. Shrikhand, Puri, Chole Masala, Pulav, Katachi Amti, Kaju Katli"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" /> Save Date Special
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Festival Calendar List */}
          <Card className="col-span-2 shadow-md">
            <CardHeader>
              <CardTitle>Scheduled Festivals & Specials</CardTitle>
              <CardDescription>Special menus visible on their scheduled dates</CardDescription>
            </CardHeader>
            <CardContent>
              {menuItems.filter(item => item.type === "FESTIVAL").length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                  <CalendarDays className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No festival or special date menus scheduled yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {menuItems
                    .filter(item => item.type === "FESTIVAL")
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((item) => (
                      <div key={item.id} className="flex justify-between items-start rounded-xl border p-4 bg-amber-50/20 border-amber-100 hover:shadow-sm transition-all duration-200">
                        <div className="space-y-1.5 flex-1 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                              {new Date(item.date).toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", dateStyle: "medium" })}
                            </span>
                            <span className="text-[10px] font-semibold text-neutral-500 uppercase">
                              {new Date(item.date).toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", weekday: "long" })}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-amber-950">{item.title}</h4>
                          <p className="text-xs text-neutral-700 leading-relaxed">{item.description}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-neutral-400 hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                          onClick={() => handleDeleteMenuEntry(item.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
