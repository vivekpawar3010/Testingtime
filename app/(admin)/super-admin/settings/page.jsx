import React from "react";
import { getBusinessPlans } from "@/actions/super-admin";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminSettingsPage() {
  const res = await getBusinessPlans();
  const plans = res.success ? res.plans : [];

  return <SettingsClient initialPlans={plans} />;
}
