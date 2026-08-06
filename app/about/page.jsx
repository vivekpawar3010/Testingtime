import React from "react";
import Header from "@/components/HeaderComponents/Header";
import FoodBackground from "@/components/FoodBackground";
import { checkUser } from "@/lib/checkUser";
import { Award, ShieldCheck, HeartHandshake, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const user = await checkUser();

  return (
    <div className="flex flex-col min-h-screen relative bg-background">
      <Header user={user} />
      <FoodBackground />

      <main className="flex-1 container mx-auto px-4 py-12 sm:px-8 max-w-5xl">
        <div className="text-center space-y-4 mb-16">
          <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-600/10 uppercase tracking-wider">
            Our Story
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            About <span className="text-indigo-600">MessApp</span>
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-md sm:text-lg">
            Empowering PG hostels, private messes, and corporate food providers with state-of-the-art check-in verification, payment logs, and dynamic menus.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2 mb-16">
          <div className="bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-neutral-100 shadow-lg hover:shadow-xl transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-indigo-950">Mission Driven</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We aim to reduce food wastage in hostels and messes globally. By predicting meal counts and streamlining check-in verifications, we help kitchens operate efficiently.
            </p>
          </div>

          <div className="bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-neutral-100 shadow-lg hover:shadow-xl transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-indigo-950">Reliable & Verified</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              With our static QR check-in locks, duplicate logins are blocked automatically, providing owners with auditable logs and diners with high-security transaction transparency.
            </p>
          </div>

          <div className="bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-neutral-100 shadow-lg hover:shadow-xl transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-indigo-950">Customer Centric</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We provide easy renewals, UPI auto-generated invoice QR codes, and beautiful menu schedules, so dining remains a delightful, stress-free part of a student's day.
            </p>
          </div>

          <div className="bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-neutral-100 shadow-lg hover:shadow-xl transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-indigo-950">Community First</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Serving thousands of students, professionals, and chefs, MessApp establishes an interface built on trust, transparency, and ease of access.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.2),transparent)]" />
          <div className="relative z-10 grid gap-8 sm:grid-cols-3 text-center">
            <div className="space-y-1">
              <p className="text-4xl sm:text-5xl font-extrabold text-indigo-300">150+</p>
              <p className="text-xs uppercase tracking-widest text-indigo-200/80 font-bold">Partner Messes</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl sm:text-5xl font-extrabold text-indigo-300">25,000+</p>
              <p className="text-xs uppercase tracking-widest text-indigo-200/80 font-bold">Happy Diners</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl sm:text-5xl font-extrabold text-indigo-300">1 Million+</p>
              <p className="text-xs uppercase tracking-widest text-indigo-200/80 font-bold">Meals Verified</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
