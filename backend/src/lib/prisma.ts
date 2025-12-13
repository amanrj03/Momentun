import { PrismaClient } from "@prisma/client";

// Create a single PrismaClient instance for the application
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export default prisma;
