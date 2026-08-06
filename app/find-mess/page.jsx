import React from 'react'
import Header from '@/components/HeaderComponents/Header'
import FoodBackground from '@/components/FoodBackground'
import MessExplorer from '@/components/HeroComponents/MessExplorer'
import { checkUser } from '@/lib/checkUser'
import { getApprovedBusinesses } from '@/actions/business'

export const dynamic = "force-dynamic";

export default async function FindMessPage() {
    const user = await checkUser();
    const messesRes = await getApprovedBusinesses();
    const approvedMesses = messesRes.success ? messesRes.businesses : [];
    
    return (
        <div className="flex flex-col min-h-screen relative bg-background">
            <Header user={user} />
            <FoodBackground />
            <main className='flex-1 py-8'>
               <MessExplorer initialBusinesses={approvedMesses} />
            </main>
        </div>
    )
}
