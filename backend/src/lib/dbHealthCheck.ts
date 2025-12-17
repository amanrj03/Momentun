import prisma from "./prisma";

let isDbConnected = false;
let lastCheckTime = 0;
const CHECK_INTERVAL = 30000; // 30 seconds

export async function checkDatabaseConnection(): Promise<boolean> {
  const now = Date.now();
  
  // Return cached result if checked recently
  if (now - lastCheckTime < CHECK_INTERVAL) {
    return isDbConnected;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    isDbConnected = true;
    lastCheckTime = now;
    return true;
  } catch (error) {
    console.error("Database connection check failed:", error);
    isDbConnected = false;
    lastCheckTime = now;
    return false;
  }
}

export function isDatabaseConnected(): boolean {
  return isDbConnected;
}

// Initialize connection check
checkDatabaseConnection().then((connected) => {
  if (connected) {
    console.log("✅ Database connection established");
  } else {
    console.error("❌ Database connection failed - Server will continue but database operations may fail");
  }
});

// Periodic health check
setInterval(() => {
  checkDatabaseConnection();
}, CHECK_INTERVAL);
