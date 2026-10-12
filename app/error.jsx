"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalErrorPage({ error, reset }) {
  useEffect(() => {
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border shadow-xl text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-sm animate-pulse">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-indigo-950 tracking-tight">
            Something Went Wrong
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            The server encountered an issue loading this page. This usually happens if environment variables or database connection are initializing.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 bg-slate-50 border rounded-2xl text-[11px] text-muted-foreground font-mono text-left overflow-x-auto max-h-24">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            onClick={() => reset()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs gap-1.5 h-11 px-6 shadow-md"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              className="w-full rounded-2xl font-bold text-xs gap-1.5 h-11 px-6 border-slate-200"
            >
              <Home className="h-4 w-4" /> Home Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
