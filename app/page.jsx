import React from 'react'
import Hero from '@/components/HeroComponents/Hero'
import Header from '@/components/HeaderComponents/Header'
import { checkUser } from '@/lib/checkUser'
import { db } from '@/lib/prisma'
import { Store, Users } from 'lucide-react'
import Footer from '@/components/Footer'

export const dynamic = "force-dynamic";

const HomePage = async () => {
    let user = null;
    let approvedMessesCount = 0;
    let customerCount = 0;

    try {
        user = await checkUser();
    } catch (e) {
        console.error("Home page checkUser error:", e);
    }

    try {
        approvedMessesCount = await db.business.count({
            where: { status: "APPROVED" }
        });
    } catch (e) {
        console.error("Home page business.count error:", e);
    }

    try {
        customerCount = await db.user.count({
            where: { role: "CUSTOMER" }
        });
    } catch (e) {
        console.error("Home page user.count error:", e);
    }
    
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

               {/* Search Optimization (SEO / GEO) Copy Section */}
               <section className="py-20 bg-white border-t border-indigo-50 relative overflow-hidden font-sans">
                 <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
                   <div className="grid gap-12 md:grid-cols-2 items-center">
                     
                     <div className="space-y-6 text-left">
                       <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-600/20 uppercase tracking-wider">
                         Find or Manage Messes
                       </span>
                       <h2 className="text-3xl sm:text-4xl font-extrabold text-indigo-950 tracking-tight leading-tight">
                         The Ultimate Mess Locator & Dining ERP Solution
                       </h2>
                       <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                         Are you a student searching for home-cooked food? Or a mess owner looking to digitize your operations? MessFind bridges the gap with state-of-the-art tools.
                       </p>
                       
                       <div className="space-y-4">
                         <div className="flex gap-4">
                           <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 mt-1 font-bold text-xs">✓</div>
                           <div>
                             <h4 className="font-extrabold text-indigo-950 text-sm">Good Mess Finder for Customers</h4>
                             <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                               Instantly locate the best dining mess options near your hostel or PG. Review active menus and plans before joining.
                             </p>
                           </div>
                         </div>
                         
                         <div className="flex gap-4">
                           <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 mt-1 font-bold text-xs">✓</div>
                           <div>
                             <h4 className="font-extrabold text-indigo-950 text-sm">Overall Management for Mess Owners</h4>
                             <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                               A full-featured console to track diner subscriptions, register new customers, auto-generate invoices, and log thali meals via QR scanning.
                             </p>
                           </div>
                         </div>

                         <div className="flex gap-4">
                           <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 mt-1 font-bold text-xs">✓</div>
                           <div>
                             <h4 className="font-extrabold text-indigo-950 text-sm">Easy Location & Budget Filters</h4>
                             <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                               Find a mess that fits your pocket. Filter by budget plans, daily thali prices, and local area addresses seamlessly.
                             </p>
                           </div>
                         </div>
                       </div>
                     </div>

                     <div className="bg-slate-50 border rounded-3xl p-8 space-y-6 text-left shadow-sm">
                       <h3 className="font-extrabold text-indigo-950 text-lg">Frequently Asked Questions</h3>
                       
                       <div className="space-y-4 divide-y">
                         <div className="space-y-1 pt-3 first:pt-0">
                           <h4 className="font-bold text-sm text-indigo-900">How do I find a good daily food mess near me?</h4>
                           <p className="text-xs text-muted-foreground leading-relaxed">
                             Our public directory tool indexes verified hostel and PG messes. You can filter dining services based on budget, distance, active menu preferences, and ratings.
                           </p>
                         </div>

                         <div className="space-y-1 pt-3">
                           <h4 className="font-bold text-sm text-indigo-900">How does the QR check-in meal scanner work?</h4>
                           <p className="text-xs text-muted-foreground leading-relaxed">
                             Once subscribed, customers generate a secure dine pass. Owners scan this pass at the counter to automatically deduct a meal and maintain transparent digital logs.
                           </p>
                         </div>

                         <div className="space-y-1 pt-3">
                           <h4 className="font-bold text-sm text-indigo-900">Can mess coordinators schedule holidays or weekly offs?</h4>
                           <p className="text-xs text-muted-foreground leading-relaxed">
                             Yes. Mess coordinators can configure weekly offs (e.g., Sunday night closed) or specific calendar holidays. Alerts replicate instantly to client cards and diner dashboards.
                           </p>
                         </div>
                       </div>
                     </div>

                   </div>
                 </div>
               </section>
            </main>
            <Footer />
        </div>
    )
}

export default HomePage
