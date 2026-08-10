import React from 'react'
import Link from 'next/link'
import { checkUser } from '@/lib/checkUser'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Users, UserPlus, Settings, ClipboardList, Mail } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'

export default async function SuperAdminLayout({ children }) {
  const user = await checkUser();
  
  if (!user || user.role !== 'SUPER_ADMIN') {
    redirect('/'); 
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r flex flex-col hidden md:flex">
        <div className="p-6 border-b flex items-center justify-between h-16">
          <h2 className="text-xl font-bold tracking-tight text-primary">Super Admin</h2>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/super-admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link href="/super-admin/requests" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted">
            <UserPlus className="h-5 w-5" />
            Business Requests
          </Link>
          <Link href="/super-admin/messes" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted">
            <ClipboardList className="h-5 w-5" />
            All Messes
          </Link>
          <Link href="/super-admin/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted">
            <Settings className="h-5 w-5" />
            Subscription Plans
          </Link>
          <Link href="/super-admin/users" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted">
            <Users className="h-5 w-5" />
            All Users
          </Link>
          <Link href="/super-admin/messages" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted">
            <Mail className="h-5 w-5" />
            Contact Messages
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b bg-background flex flex-shrink-0 items-center px-8 justify-between">
            <h1 className="font-semibold text-lg md:hidden">Admin Panel</h1>
            <div className="hidden md:block"></div>
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                  {user.name || user.email}
                </span>
                <UserButton afterSignOutUrl="/" />
            </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
            {children}
        </div>
      </main>
    </div>
  )
}
