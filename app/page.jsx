import React from 'react'
import Hero from '@/components/HeroComponents/Hero'
import Header from '@/components/HeaderComponents/Header'
import { checkUser } from '@/lib/checkUser'
import { db } from '@/lib/prisma'
import { Store, Users } from 'lucide-react'

export const dynamic = "force-dynamic";

const HomePage = async () => {
    const user = await checkUser();
    
    // Fetch dynamic joins counts directly from database
    const approvedMessesCount = await db.business.count({
        where: { status: "APPROVED" }
    });
    
    const customerCount = await db.user.count({
        where: { role: "CUSTOMER" }
    });
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header user={user} />
            <main className='flex-1'>
               <Hero userRole={user?.role} />
               
               {/* Stats Section */}
               <section className="py-20 bg-slate-50/50 border-t relative overflow-hidden">
                 <div className="container mx-auto px-4 sm:px-8 max-w-4xl text-center space-y-12">
                   <div className="space-y-4">
                     <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-600/10 uppercase tracking-wider">
                       Our Community
                     </span>
                     <h2 className="text-3xl sm:text-4xl font-extrabold text-indigo-950 tracking-tight">
                       Real-Time Platform Growth
                     </h2>
                     <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                       Connecting local mess operations with diners all across the region.
                     </p>
                   </div>

                   <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
                     {/* Mess Joins Card */}
                     <div className="bg-white border rounded-3xl p-8 flex items-center gap-6 shadow-md hover:shadow-xl transition-all duration-300">
                       <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                         <Store className="h-8 w-8" />
                       </div>
                       <div className="text-left space-y-1">
                         <span className="text-3xl font-black text-indigo-950 block tracking-tight">
                           {approvedMessesCount}
                         </span>
                         <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                           Mess Partners
                         </span>
                       </div>
                     </div>

                     {/* Customer Joins Card */}
                     <div className="bg-white border rounded-3xl p-8 flex items-center gap-6 shadow-md hover:shadow-xl transition-all duration-300">
                       <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                         <Users className="h-8 w-8" />
                       </div>
                       <div className="text-left space-y-1">
                         <span className="text-3xl font-black text-emerald-950 block tracking-tight">
                           {customerCount}
                         </span>
                         <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                           Active Diners
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>
               </section>
            </main>
        </div>
    )
}

export default HomePage
