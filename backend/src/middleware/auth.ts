import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { config } from "../config";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: "ADMIN" | "CREATOR" | "VIEWER";
      };
    }
  }
}

// JWT Token payload interface
interface TokenPayload {
  id: string;
  email: string;
  role: "ADMIN" | "CREATOR" | "VIEWER";
}

// Verify JWT token middleware
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Get token from HttpOnly cookie
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please log in.",
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: "Invalid or expired token. Please log in again.",
    });
  }
}

// Role-based access control middleware
export function requireRole(
  ...allowedRoles: Array<"ADMIN" | "CREATOR" | "VIEWER">
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }

    next();
  };
}

// Generate JWT token
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload as object, config.JWT_SECRET as string, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

// Set auth cookie
export function setAuthCookie(res: Response, token: string) {
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Clear auth cookie
export function clearAuthCookie(res: Response) {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax",
  });
}
