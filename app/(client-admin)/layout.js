import React from 'react'
import Header from '@/components/HeaderComponents/Header'
import { checkUser } from '@/lib/checkUser'
import { redirect } from 'next/navigation'
import { db } from '@/lib/prisma'
import { Lock, ShieldAlert } from 'lucide-react'

const ClientAdminLayout = async ({ children }) => {
    const user = await checkUser();

    if (!user) {
        redirect('/');
    }

    if (user.role !== 'CLIENT_ADMIN') {
        redirect(user.role === 'SUPER_ADMIN' ? '/super-admin' : '/customer/dashboard');
    }

    if (!user.ownedBusiness) {
        redirect('/business-profile');
    } else if (user.ownedBusiness.status === 'PENDING') {
        redirect('/pending-approval');
    } else if (user.ownedBusiness.isActive === false) {
        redirect('/deactivated');
    }

    // Check platform subscription active status
    const activeSub = await db.businessSubscription.findFirst({
        where: {
            businessId: user.ownedBusiness.id,
            status: "ACTIVE"
        },
        include: { plan: true }
    });

    let isExpired = false;
    let daysRemaining = 0;

    if (activeSub) {
        const now = new Date();
        const end = new Date(activeSub.endDate);
        const diffTime = end - now;
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysRemaining < 0) {
            isExpired = true;
        }
    } else {
        isExpired = true;
    }

    if (isExpired) {
        return (
            <div className="flex flex-col min-h-screen bg-muted/20">
                <Header user={user} />
                <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
                    <div className="mx-auto max-w-md text-center space-y-6 bg-white p-8 rounded-3xl border border-red-200 shadow-2xl">
                        <div className="flex justify-center">
                            <div className="rounded-full bg-red-100 p-4 animate-bounce">
                                <Lock className="h-12 w-12 text-red-600" />
                            </div>
                        </div>
                        
                        <h1 className="text-2xl font-bold tracking-tight text-red-950">
                            Dashboard Blocked: Plan Expired
                        </h1>
                        
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your platform subscription has expired. Access to your mess settings, check-in scanner console, menu planner, customer registry, and invoicing features has been temporarily blocked.
                        </p>
                        
                        <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100 text-left space-y-2 text-xs">
                            <p className="font-bold text-red-950">How to restore access:</p>
                            <ul className="list-disc pl-4 text-red-900 space-y-1">
                                <li>Contact the Super Admin immediately for renewal.</li>
                                <li>Email: <strong>support@messapp.com</strong> / <strong>billing@messapp.com</strong></li>
                                <li>Once a contract extension is assigned, your dashboard access will resume automatically.</li>
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const showCountdownBanner = activeSub && daysRemaining <= 10 && daysRemaining >= 0;

    return (
        <div className="flex flex-col min-h-screen bg-muted/20">
            <Header user={user} />
            {showCountdownBanner && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-md animate-pulse">
                    <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                    <span>
                        Platform Subscription Countdown: Your plan will expire in {daysRemaining} days. Please contact the Super Admin immediately for renewal.
                    </span>
                </div>
            )}
            <main className='flex-1'>{children}</main>
        </div>
    )
}

export default ClientAdminLayout