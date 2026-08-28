"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import AnimatedThali from './AnimatedThali';

const Hero = ({ userRole }) => {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32 sm:pt-32 sm:pb-40">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-100 via-background to-background"></div>

      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-indigo-400 to-blue-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          
          {/* Left Column: Content */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center lg:justify-start"
            >
              <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-600/20">
                New: Modern Dashboard for Admins <span aria-hidden="true">&rarr;</span>
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground leading-tight"
            >
              Manage your <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">Mess Operations</span> seamlessly
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto lg:mx-0 text-lg leading-relaxed text-muted-foreground"
            >
              The all-in-one platform to track meals, manage bills, and streamline communication for your hostel or PG mess. Experience a modern approach to dining management.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full sm:w-auto pt-2"
            >
              <Link 
                href="/login-redirect"
                className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 h-14 text-base w-full sm:w-auto shadow-lg hover:shadow-xl transition-all bg-indigo-600 hover:bg-indigo-700 text-white")}
              >
                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="pt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-8 text-sm text-muted-foreground font-medium w-full"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Animated Thali */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full"
            >
              <AnimatedThali />
            </motion.div>
          </div>

        </div>
      </div>

      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-blue-400 to-indigo-600 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </section>
  );
};

export default Hero;
