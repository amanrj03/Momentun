// Role types
export type Role = "ADMIN" | "CREATOR" | "VIEWER";

// Video status types - Updated to match backend
export type VideoStatus = "PENDING" | "APPROVED" | "REJECTED";

// Base User interface
export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  profile?: AdminProfile | CreatorProfile | ViewerProfile;
}

// Admin Profile
export interface AdminProfile {
  id: string;
  userId: string;
  full_name: string;
  employee_id?: string;
  department?: string;
  phone_number?: string;
  avatar_url?: string;
  createdAt: string;
  updatedAt: string;
}

// Creator Profile
export interface CreatorProfile {
  id: string;
  userId: string;
  full_name: string;
  channel_name?: string;
  bio?: string;
  linkedin_url?: string;
  youtube_url?: string;
  website_url?: string;
  country?: string;
  avatar_url?: string;
  total_videos: number;
  total_views: number;
  createdAt: string;
  updatedAt: string;
}

// Viewer Profile
export interface ViewerProfile {
  id: string;
  userId: string;
  full_name: string;
  display_name?: string;
  country?: string;
  interests?: string[];
  avatar_url?: string;
  watched_videos: number;
  createdAt: string;
  updatedAt: string;
}



// Video interface
export interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  status: VideoStatus;
  views?: number;
  likes_count?: number;
  duration?: number;
  cloudinary_id?: string;
  createdAt: string;
  updatedAt: string;
  uploaderId: string;
  uploader?: User;

}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Cloudinary upload types
export interface CloudinaryUploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
