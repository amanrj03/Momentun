import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Database error handler
export const handleDatabaseError = (error: any): AppError => {
  // Prisma connection errors
  if (error.code === "P1001") {
    return new AppError(
      "Unable to connect to database. Please check your internet connection and try again.",
      503
    );
  }

  if (error.code === "P1002") {
    return new AppError(
      "Database connection timeout. Please try again later.",
      503
    );
  }

  if (error.code === "P1008") {
    return new AppError(
      "Database operation timeout. Please try again.",
      503
    );
  }

  // Prisma unique constraint violation
  if (error.code === "P2002") {
    const field = error.meta?.target?.[0] || "field";
    return new AppError(`This ${field} is already in use.`, 409);
  }

  // Prisma record not found
  if (error.code === "P2025") {
    return new AppError("The requested resource was not found.", 404);
  }

  // Prisma foreign key constraint
  if (error.code === "P2003") {
    return new AppError("Invalid reference to related data.", 400);
  }

  // Generic Prisma error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return new AppError(
      "A database error occurred. Please try again later.",
      500
    );
  }

  // Prisma validation error
  if (error instanceof Prisma.PrismaClientValidationError) {
    return new AppError("Invalid data provided.", 400);
  }

  // Prisma initialization error
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError(
      "Database service is temporarily unavailable. Please try again later.",
      503
    );
  }

  return new AppError("An unexpected error occurred.", 500);
};

// Global error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  // Log error for debugging
  console.error("Error occurred:", {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle database errors
  if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientValidationError ||
    err instanceof Prisma.PrismaClientInitializationError ||
    (err as any).code?.startsWith("P")
  ) {
    error = handleDatabaseError(err);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid authentication token.", 401);
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError("Your session has expired. Please login again.", 401);
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    error = new AppError("Invalid data provided.", 400);
  }

  // Handle multer errors (file upload)
  if (err.name === "MulterError") {
    error = new AppError("File upload error. Please try again.", 400);
  }

  // Get status code and message
  const statusCode = (error as AppError).statusCode || 500;
  const message =
    (error as AppError).isOperational || statusCode < 500
      ? error.message
      : "An unexpected error occurred. Please try again later.";

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err,
    }),
  });
};

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError(
    `Cannot ${req.method} ${req.path} - Endpoint not found`,
    404
  );
  next(error);
};
