import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config, validateConfig } from "./config";
import "./lib/dbHealthCheck"; // Initialize database health check

// Import routes
import authRoutes from "./routes/auth";
import videoRoutes from "./routes/videos";
import profileRoutes from "./routes/profile";

import analyticsRoutes from "./routes/analytics";
import interactionsRoutes from "./routes/interactions";
import creatorsRoutes from "./routes/creators";
import adminRoutes from "./routes/admin";

// Validate configuration
validateConfig();

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

// CORS configuration
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true, // Allow cookies
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

// Request logging (development)
if (config.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
  });
}

// ==========================================
// ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api/analytics", analyticsRoutes);
app.use("/api/interactions", interactionsRoutes);
app.use("/api/creators", creatorsRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", async (req, res) => {
  const { checkDatabaseConnection } = await import("./lib/dbHealthCheck");
  const dbConnected = await checkDatabaseConnection();
  
  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    message: dbConnected ? "Server is running" : "Server is running but database is unavailable",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    database: dbConnected ? "connected" : "disconnected",
  });
});

// ==========================================
// ERROR HANDLING
// ==========================================

import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ==========================================
// PROCESS ERROR HANDLERS
// ==========================================

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  console.error("💥 UNCAUGHT EXCEPTION! Shutting down gracefully...");
  console.error(error.name, error.message);
  console.error(error.stack);
  
  // Give time for logging before exit
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  console.error("💥 UNHANDLED REJECTION! Server will continue running...");
  console.error("Reason:", reason);
  console.error("Promise:", promise);
  // Don't exit - just log the error
});

// Handle SIGTERM
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

// Handle SIGINT (Ctrl+C)
process.on("SIGINT", () => {
  console.log("👋 SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

// ==========================================
// START SERVER
// ==========================================

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Online Video Directory - Backend API     ║
╠════════════════════════════════════════════╣
║   Server running on port ${PORT}              ║
║   Environment: ${config.NODE_ENV.padEnd(19)}       ║
║   Frontend URL: ${config.FRONTEND_URL.substring(0, 20).padEnd(19)}  ║
╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("Closing server gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("Forcing server shutdown...");
    process.exit(1);
  }, 10000);
};

export default app;
