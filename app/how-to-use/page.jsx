import React from "react";
import Header from "@/components/HeaderComponents/Header";
import FoodBackground from "@/components/FoodBackground";
import Footer from "@/components/Footer";
import { checkUser } from "@/lib/checkUser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, QrCode, ClipboardList, Wallet, Sparkles, LogIn, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HowToUsePage() {
  const user = await checkUser();

  return (
    <div className="flex flex-col min-h-screen relative bg-background">
      <Header user={user} />
      <FoodBackground />

      <main className="flex-1 container mx-auto px-4 py-12 sm:px-8 max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-600/10 uppercase tracking-wider">
            Getting Started
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            How to use <span className="text-indigo-600">MessApp</span>
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-md sm:text-lg">
            Choose your role below to learn how to set up your mess profile or register as a diner.
          </p>
        </div>

        <Tabs defaultValue="diners" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-card border p-1 rounded-xl">
            <TabsTrigger value="diners" className="rounded-lg text-sm font-bold py-2.5">For Diners / Customers</TabsTrigger>
            <TabsTrigger value="owners" className="rounded-lg text-sm font-bold py-2.5">For Mess Owners</TabsTrigger>
          </TabsList>

          {/* Diners / Customers Instructions */}
          <TabsContent value="diners" className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="shadow-lg border-neutral-100 bg-card/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-md font-bold text-indigo-950 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-xs text-indigo-600 font-extrabold">1</span>
                    Register / Join a Mess
                  </CardTitle>
                  <CardDescription>Get linked to your mess hall.</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed">
                  Log in, navigate to the Home screen, and browse approved messes. Click <strong>"Join Mess"</strong>, fill out your profile form, choose your preferred thali subscription plan, and submit the request.
                </CardContent>
              </Card>

              <Card className="shadow-lg border-neutral-100 bg-card/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-md font-bold text-indigo-950 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-xs text-indigo-600 font-extrabold">2</span>
                    Wait for Approval
                  </CardTitle>
                  <CardDescription>Owner validation buffer.</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed">
                  The mess owner will receive your registration request and assign you your subscription. Once approved, your account becomes active, granting you a thalis coupon balance.
                </CardContent>
              </Card>

              <Card className="shadow-lg border-neutral-100 bg-card/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-md font-bold text-indigo-950 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-xs text-indigo-600 font-extrabold">3</span>
                    Scan QR to Dine
                  </CardTitle>
                  <CardDescription>Instant checkout verification.</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed">
                  At the dining hall, open the <strong>"Scan QR"</strong> camera page on your phone, scan the static QR code on the wall, or click the instant manual check-in button to generate your green verification token pass.
                </CardContent>
              </Card>

              <Card className="shadow-lg border-neutral-100 bg-card/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-md font-bold text-indigo-950 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-xs text-indigo-600 font-extrabold">4</span>
                    Present Verification Pass
                  </CardTitle>
                  <CardDescription>30-minute staff check window.</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed">
                  Show the pulsing green verification pass on your screen to the mess managers. The pass is valid for 30 minutes, allowing you to walk in, collect your food, and track your remaining thalis balance.
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mess Owners Instructions */}
          <TabsContent value="owners" className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="shadow-lg border-neutral-100 bg-card/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-md font-bold text-indigo-950 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-xs text-indigo-600 font-extrabold">1</span>
                    Define Timing Windows
                  </CardTitle>
                  <CardDescription>Configure breakfast, lunch, dinner.</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed">
                  Go to <strong>Settings</strong>, toggle checkbox controls to enable meal slots, set timing hours, and upload your custom business brand logo. Provide a UPI ID to support dynamic invoice QR codes.
                </CardContent>
              </Card>

              <Card className="shadow-lg border-neutral-100 bg-card/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-md font-bold text-indigo-950 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-xs text-indigo-600 font-extrabold">2</span>
                    Add Subscription Packages
                  </CardTitle>
                  <CardDescription>Templates for easy assignment.</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed">
                  Define your dining packages (e.g. Monthly 56 Thalis). Use our bidirectional price-per-meal calculators to automatically autocomplete plans. Approvals assign these templates instantly.
                </CardContent>
              </Card>

              <Card className="shadow-lg border-neutral-100 bg-card/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-md font-bold text-indigo-950 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-xs text-indigo-600 font-extrabold">3</span>
                    Print check-in QR Code
                  </CardTitle>
                  <CardDescription>Stick it to the mess entrance.</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed">
                  Navigate to your live check-in **Scanner Console**, click **"Print QR Code"** to print out a pre-formatted brand sheet, and stick it to the entrance so diners can scan immediately.
                </CardContent>
              </Card>

              <Card className="shadow-lg border-neutral-100 bg-card/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-md font-bold text-indigo-950 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-xs text-indigo-600 font-extrabold">4</span>
                    Track Live Check-In Logs
                  </CardTitle>
                  <CardDescription>Verify transactions & prevent repeats.</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed">
                  Monitor live entries from your console. With integrated timezone alignment (IST) and duplicate locks, diners can only check-in once every 3 hours per meal period.
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
