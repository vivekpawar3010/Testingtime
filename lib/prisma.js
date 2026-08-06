import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
    const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
    return new PrismaClient({ adapter });
}

// Force re-instantiate client after prisma generate schema update
if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = undefined;
}

export const db = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = db;
}
