import React from "react";
import Header from "@/components/HeaderComponents/Header";
import FoodBackground from "@/components/FoodBackground";
import Footer from "@/components/Footer";
import { checkUser } from "@/lib/checkUser";
import { Mail, Phone, MapPin } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const user = await checkUser();

  return (
    <div className="flex flex-col min-h-screen relative bg-background">
      <Header user={user} />
      <FoodBackground />

      <main className="flex-1 container mx-auto px-4 py-12 sm:px-8 max-w-5xl">
        <div className="text-center space-y-4 mb-16">
          <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-600/10 uppercase tracking-wider">
            Get in touch
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Contact <span className="text-indigo-600">Our Team</span>
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-md sm:text-lg">
            Have questions about integrating your hostel mess or need customer support? We're here to help!
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-5 items-start">
          {/* Info Side (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-indigo-950 text-white p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)]" />
              
              <h3 className="text-xl font-bold relative z-10">Contact Information</h3>
              <p className="text-indigo-200 text-xs relative z-10 leading-relaxed">
                Fill out the form or reach out to us directly through the channels below. We try to respond within 24 hours.
              </p>

              <div className="space-y-4 relative z-10 pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-800/50 flex items-center justify-center">
                    <Phone className="h-4.5 w-4.5 text-indigo-300" />
                  </div>
                  <span className="text-sm font-semibold text-indigo-100">-</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-800/50 flex items-center justify-center">
                    <Mail className="h-4.5 w-4.5 text-indigo-300" />
                  </div>
                  <span className="text-sm font-semibold text-indigo-100">advikssoftwaresolutions@gmail.com</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-800/50 flex items-center justify-center">
                    <MapPin className="h-4.5 w-4.5 text-indigo-300" />
                  </div>
                  <span className="text-sm text-indigo-100 leading-tight">
                    Pandharpur, Maharashtra, India
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side (3 cols) */}
          <div className="md:col-span-3">
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
