import { z } from "zod";

// ==========================================
// SHARED VALIDATION RULES
// ==========================================

// Name validation: ONLY alphabets and spaces allowed
// Numbers and special characters are STRICTLY forbidden
const nameValidation = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .regex(
    /^[A-Za-z\s]+$/,
    "Names cannot contain numbers or special characters. Only letters and spaces are allowed."
  );

const emailValidation = z
  .string()
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters");

const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const urlValidation = z
  .string()
  .url("Invalid URL format")
  .optional()
  .or(z.literal(""));

// ==========================================
// AUTH SCHEMAS
// ==========================================

export const loginSchema = z.object({
  email: emailValidation,
  password: z.string().min(1, "Password is required"),
});

export const registerViewerSchema = z
  .object({
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: z.string(),
    full_name: nameValidation,
    country: z.string().max(100).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerCreatorSchema = z
  .object({
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: z.string(),
    full_name: nameValidation,
    channel_name: z.string()
      .min(2, "Channel name must be at least 2 characters")
      .max(100, "Channel name must be less than 100 characters")
      .regex(/^[a-zA-Z0-9\s\-_]+$/, "Channel name can only contain letters, numbers, spaces, hyphens, and underscores"),
    bio: z.string().max(500).optional(),
    website_url: urlValidation,
    country: z.string().max(100).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });



// ==========================================
// PROFILE UPDATE SCHEMAS
// ==========================================

export const updateViewerProfileSchema = z.object({
  full_name: nameValidation,
  display_name: z.string().max(50).optional(),
  country: z.string().max(100).optional(),
  interests: z.array(z.string()).max(10).optional(),
  avatar_url: urlValidation,
});

export const updateCreatorProfileSchema = z.object({
  full_name: nameValidation,
  channel_name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  linkedin_url: urlValidation,
  youtube_url: urlValidation,
  website_url: urlValidation,
  country: z.string().max(100).optional(),
  avatar_url: urlValidation,
});

export const updateAdminProfileSchema = z.object({
  full_name: nameValidation,
  employee_id: z.string().max(50).optional(),
  department: z.string().max(100).optional(),
  phone_number: z.string().max(20).optional(),
  avatar_url: urlValidation,
});

// ==========================================
// VIDEO SCHEMAS
// ==========================================

export const createVideoSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z.string().max(5000).optional(),
  video_url: z.string().url("Invalid video URL"),
  thumbnail_url: urlValidation,

  cloudinary_id: z.string().optional(),
  duration: z.number().positive().optional(),
});

export const updateVideoStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});



// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterViewerInput = z.infer<typeof registerViewerSchema>;
export type RegisterCreatorInput = z.infer<typeof registerCreatorSchema>;

export type UpdateViewerProfileInput = z.infer<typeof updateViewerProfileSchema>;
export type UpdateCreatorProfileInput = z.infer<typeof updateCreatorProfileSchema>;
export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>;
export type CreateVideoInput = z.infer<typeof createVideoSchema>;
export type UpdateVideoStatusInput = z.infer<typeof updateVideoStatusSchema>;

