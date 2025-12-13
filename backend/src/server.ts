import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config, validateConfig } from "./config";

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
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
);

// ==========================================
// START SERVER
// ==========================================

const PORT = config.PORT;

app.listen(PORT, () => {
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

export default app;
