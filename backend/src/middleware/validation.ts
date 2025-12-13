import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

// Validation middleware factory
export function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against schema
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format validation errors
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors,
        });
      }

      // Unknown error
      console.error("Validation error:", error);
      return res.status(500).json({
        success: false,
        error: "An unexpected error occurred during validation",
      });
    }
  };
}

// Query params validation middleware
export function validateQuery(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          error: "Invalid query parameters",
          details: errors,
        });
      }

      console.error("Query validation error:", error);
      return res.status(500).json({
        success: false,
        error: "An unexpected error occurred",
      });
    }
  };
}

// URL params validation middleware
export function validateParams(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          error: "Invalid URL parameters",
          details: errors,
        });
      }

      console.error("Params validation error:", error);
      return res.status(500).json({
        success: false,
        error: "An unexpected error occurred",
      });
    }
  };
}
