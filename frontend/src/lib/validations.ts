import { z } from "zod";

// Strict name validation - alphabets and spaces only
const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .regex(
    /^[a-zA-Z\s]+$/,
    "Names cannot contain numbers or special characters"
  );

// Email validation
const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .max(255, "Email must be less than 255 characters");

// Password validation
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

// URL validation
const urlSchema = z
  .string()
  .url("Please enter a valid URL")
  .optional()
  .or(z.literal(""));

// Login Schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});



// Viewer Registration Schema
export const registerViewerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  full_name: nameSchema,
  country: z.string().max(100, "Country must be less than 100 characters").optional().or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Creator Registration Schema
export const registerCreatorSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  full_name: nameSchema,
  channel_name: z.string()
    .min(2, "Channel name must be at least 2 characters")
    .max(100, "Channel name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Channel name can only contain letters, numbers, spaces, hyphens, and underscores"),
  bio: z.string().max(1000, "Bio must be less than 1000 characters").optional().or(z.literal("")),
  website_url: urlSchema,
  country: z.string().max(100, "Country must be less than 100 characters").optional().or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});



// User Registration Schema (generic)
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User Login Schema
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// User Profile Schema
export const userProfileSchema = z.object({
  full_name: nameSchema,
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .max(100, "Country must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  avatar_url: urlSchema,
});

// Creator Profile Schema (extends user profile with additional fields)
export const creatorProfileSchema = z.object({
  full_name: nameSchema,
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .max(100, "Country must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  avatar_url: urlSchema,
  linkedin_url: z
    .string()
    .url("Please enter a valid LinkedIn URL")
    .regex(
      /^https?:\/\/(www\.)?linkedin\.com\/.+/,
      "Please enter a valid LinkedIn profile URL"
    )
    .optional()
    .or(z.literal("")),
  youtube_url: z
    .string()
    .url("Please enter a valid YouTube URL")
    .regex(
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
      "Please enter a valid YouTube channel URL"
    )
    .optional()
    .or(z.literal("")),
  website_url: urlSchema,
});



// Video Schema
export const videoSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .or(z.literal("")),
  video_url: z.string().url("Please enter a valid video URL"),
  thumbnail_url: urlSchema,

});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterViewerInput = z.infer<typeof registerViewerSchema>;
export type RegisterCreatorInput = z.infer<typeof registerCreatorSchema>;

export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type CreatorProfile = z.infer<typeof creatorProfileSchema>;

export type Video = z.infer<typeof videoSchema>;
