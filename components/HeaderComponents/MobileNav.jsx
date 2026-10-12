"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SignInButton } from '@clerk/nextjs';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { GuideTriggerButton } from '@/components/FirstTimeGuideModal';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Find Mess', href: '/find-mess' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'How to use', href: '/how-to-use' },
];

const MobileNav = ({ isLoggedIn, showFindMess = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const items = showFindMess ? navItems : navItems.filter(item => item.label !== "Find Mess");

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground hover:bg-indigo-50 hover:text-indigo-600 rounded-xl"
            aria-label="Toggle Menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        }
      />
      <SheetContent side="right" className="w-[80%] max-w-sm flex flex-col p-6 rounded-l-3xl border-l bg-white/95 backdrop-blur-md">
        <SheetHeader className="border-b pb-4 text-left">
          <SheetTitle className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
            MessApp
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="flex flex-col space-y-2">
            {items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 text-lg font-medium rounded-xl transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 px-4 flex flex-col gap-3 sm:hidden">
            <GuideTriggerButton className="w-full justify-center" />
            {!isLoggedIn ? (
              <SignInButton mode="modal">
                <Button className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" size="lg">
                  Sign In
                </Button>
              </SignInButton>
            ) : (
              <Link href="/login-redirect" onClick={() => setIsOpen(false)}>
                <Button className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" size="lg">
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
