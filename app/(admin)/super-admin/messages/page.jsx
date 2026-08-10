import React from "react";
import { getContactMessages } from "@/actions/super-admin";
import MessagesClient from "./MessagesClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminMessagesPage({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params?.page) || 1;

  const messagesRes = await getContactMessages(page);
  const initialData = messagesRes.success 
    ? messagesRes 
    : { messages: [], pagination: { page: 1, limit: 10, totalPages: 1, totalMessages: 0 } };

  return <MessagesClient initialData={initialData} />;
}
