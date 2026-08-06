import React from "react";
import { getMessesConsole, getBusinessPlans } from "@/actions/super-admin";
import MessesClient from "./MessesClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminMessesPage() {
  // Fetch first page of messes and list of available platform business plans
  const [messesRes, plansRes] = await Promise.all([
    getMessesConsole({ page: 1, limit: 10 }),
    getBusinessPlans()
  ]);

  const initialData = messesRes.success ? messesRes : { messes: [], pagination: { page: 1, limit: 10, totalPages: 1, totalMesses: 0 } };
  const plans = plansRes.success ? plansRes.plans : [];

  return <MessesClient initialData={initialData} plans={plans} />;
}
