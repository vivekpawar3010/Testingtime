"use client";

import React, { useState } from "react";
import { Search, MapPin, Phone, ArrowRight, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MessExplorer({ initialBusinesses }) {
  const [searchQuery, setSearchQuery] = useState("");

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
            {filteredMesses.map((biz) => (
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

                {/* Action button */}
                <div className="pt-6 mt-auto">
                  <Link href={`/customer/register?messId=${biz.uniqueId}`} className="block w-full">
                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs gap-1.5 rounded-2xl h-10 shadow-sm transition-all"
                    >
                      Join Mess <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
