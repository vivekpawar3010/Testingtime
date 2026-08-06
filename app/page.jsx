import React from 'react'
import Hero from '@/components/HeroComponents/Hero'
import Header from '@/components/HeaderComponents/Header'
import MessExplorer from '@/components/HeroComponents/MessExplorer'
import { checkUser } from '@/lib/checkUser'
import { getApprovedBusinesses } from '@/actions/business'

const HomePage = async () => {
    const user = await checkUser();
    const messesRes = await getApprovedBusinesses();
    const approvedMesses = messesRes.success ? messesRes.businesses : [];
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header user={user} />
            <main className='flex-1'>
               <Hero userRole={user?.role} />
               <MessExplorer initialBusinesses={approvedMesses} />
            </main>
        </div>
    )
}

export default HomePage
