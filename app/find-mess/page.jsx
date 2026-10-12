import React from 'react'
import Header from '@/components/HeaderComponents/Header'
import FoodBackground from '@/components/FoodBackground'
import Footer from '@/components/Footer'
import MessExplorer from '@/components/HeroComponents/MessExplorer'
import { checkUser } from '@/lib/checkUser'
import { getApprovedBusinesses } from '@/actions/business'
import { getCustomerJoinRequests } from '@/actions/user'

export const dynamic = "force-dynamic";

export default async function FindMessPage() {
    const user = await checkUser();
    const messesRes = await getApprovedBusinesses();
    const approvedMesses = messesRes.success ? messesRes.businesses : [];
    
    let customerRequests = [];
    if (user?.role === "CUSTOMER") {
        const reqRes = await getCustomerJoinRequests();
        if (reqRes.success) customerRequests = reqRes.requests;
    }
    
    return (
        <div className="flex flex-col min-h-screen relative bg-background">
            <Header user={user} />
            <FoodBackground />
            <main className='flex-1 py-8 px-4 sm:px-6'>
               <MessExplorer 
                  initialBusinesses={approvedMesses} 
                  initialRequests={customerRequests}
                  userName={user?.name || ""}
                  userPhone={user?.phone || ""}
                  isCustomer={user?.role === "CUSTOMER"}
               />
            </main>
            <Footer />
        </div>
    )
}
