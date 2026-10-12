import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("[CRITICAL ERROR] DATABASE_URL is missing in environment variables. Please add DATABASE_URL in Vercel project settings.");
        return new PrismaClient();
    }
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({ adapter });
}

export const db = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = db;
}
