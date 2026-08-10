import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background/80 backdrop-blur-md relative z-10">
      <div className="container mx-auto px-4 py-12 sm:px-8 max-w-6xl">
        <div className="grid gap-8 md:grid-cols-4">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-linear-to-br from-blue-600 to-indigo-600 text-white font-bold shadow-sm transition-transform group-hover:scale-105">
                M
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
                MessApp
              </span>
            </Link>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              Premium hostel mess management platform enabling dining halls to automate QR check-ins, record billing, and publish schedules easily.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium pt-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>Secure Check-in Systems</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 font-heading">
              Platform Links
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground font-medium">
              <li>
                <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/find-mess" className="hover:text-indigo-600 transition-colors">Find Mess</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-indigo-600 transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-600 transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link href="/how-to-use" className="hover:text-indigo-600 transition-colors">How to Use</Link>
              </li>
            </ul>
          </div>

          {/* Contacts info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 font-heading">
              Support Desk
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-600 shrink-0" />
                <span className="break-all">advikssoftwaresolutions@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>Pandharpur, Maharashtra, India</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom copyright block */}
        <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="font-semibold">
            © {new Date().getFullYear()} MessApp. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> by 
            <span className="font-bold text-indigo-950">Adviks Software Solutions</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
