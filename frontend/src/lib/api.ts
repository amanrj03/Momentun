import { User } from "@/lib/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Specific response types for auth endpoints
interface AuthResponse {
  user: User;
}

interface HealthResponse {
  message: string;
  timestamp: string;
  environment: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies for authentication
      ...options,
    };

    try {
      console.log(`Making API request to: ${url}`);
      console.log(`Request config:`, config);
      const response = await fetch(url, config);
      const data = await response.json();
      
      console.log(`API response status: ${response.status}`, data);
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error occurred",
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async registerViewer(data: {
    email: string;
    password: string;
    confirmPassword: string;
    full_name: string;
    display_name?: string;
    country?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    // Keep confirmPassword for backend validation, but clean up empty strings for optional fields
    const cleanData = {
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      full_name: data.full_name,
      ...(data.display_name && data.display_name !== "" && { display_name: data.display_name }),
      ...(data.country && data.country !== "" && { country: data.country }),
    };
    console.log("Sending viewer registration data:", cleanData);
    return this.request<AuthResponse>("/auth/register/viewer", {
      method: "POST",
      body: JSON.stringify(cleanData),
    });
  }

  async registerCreator(data: {
    email: string;
    password: string;
    confirmPassword: string;
    full_name: string;
    channel_name?: string;
    bio?: string;
    linkedin_url?: string;
    youtube_url?: string;
    website_url?: string;
    country?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    // Keep confirmPassword for backend validation, but clean up empty strings for optional fields
    const cleanData = {
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      full_name: data.full_name,
      ...(data.channel_name && data.channel_name !== "" && { channel_name: data.channel_name }),
      ...(data.bio && data.bio !== "" && { bio: data.bio }),
      ...(data.linkedin_url && data.linkedin_url !== "" && { linkedin_url: data.linkedin_url }),
      ...(data.youtube_url && data.youtube_url !== "" && { youtube_url: data.youtube_url }),
      ...(data.website_url && data.website_url !== "" && { website_url: data.website_url }),
      ...(data.country && data.country !== "" && { country: data.country }),
    };
    console.log("Sending creator registration data:", cleanData);
    return this.request<AuthResponse>("/auth/register/creator", {
      method: "POST",
      body: JSON.stringify(cleanData),
    });
  }



  async logout(): Promise<ApiResponse> {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/me");
  }

  async updateProfile(data: {
    full_name?: string;
    bio?: string;
    country?: string;
    avatar_url?: string;
    linkedin_url?: string;
    youtube_url?: string;
    website_url?: string;
  }): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // OTP verification methods
  async verifyOtp(data: {
    email: string;
    otp: string;
    role: "VIEWER" | "CREATOR";
    registrationData: any;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async resendOtp(data: {
    email: string;
    role: "VIEWER" | "CREATOR";
  }): Promise<ApiResponse> {
    return this.request("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Password change methods
  async sendPasswordChangeOtp(): Promise<ApiResponse> {
    return this.request("/auth/send-password-otp", {
      method: "POST",
    });
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    otp: string;
  }): Promise<ApiResponse> {
    return this.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Forgot password methods
  async sendForgotPasswordOtp(data: {
    email: string;
  }): Promise<ApiResponse> {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyForgotPasswordOtp(data: {
    email: string;
    otp: string;
  }): Promise<ApiResponse> {
    return this.request("/auth/verify-forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: {
    email: string;
    newPassword: string;
    otp: string;
  }): Promise<ApiResponse> {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Health check endpoint
  async healthCheck(): Promise<ApiResponse<HealthResponse>> {
    return this.request<HealthResponse>("/health");
  }

  // Test endpoint to check backend connectivity
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        credentials: "include",
      });
      return response.ok;
    } catch (error) {
      console.error("Backend connection test failed:", error);
      return false;
    }
  }

  // Video endpoints
  async getVideos(params?: { status?: string; limit?: number; page?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    
    const query = queryParams.toString();
    // Use public endpoint for approved videos (no authentication required)
    return this.request(`/videos/public${query ? `?${query}` : ""}`);
  }

  async getUploadSignature(type: "video" | "image") {
    return this.request(`/videos/upload-signature?type=${type}`);
  }

  async createVideo(videoData: {
    title: string;
    description?: string;
    video_url: string;
    thumbnail_url?: string;
    cloudinary_id?: string;
    duration?: number;

  }) {
    return this.request("/videos", {
      method: "POST",
      body: JSON.stringify(videoData),
    });
  }

  async getUserVideos(userId?: string) {
    return this.request("/videos/my-videos");
  }

  async updateVideoStatus(videoId: string, status: string) {
    return this.request(`/videos/${videoId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async deleteVideo(videoId: string) {
    return this.request(`/videos/${videoId}`, {
      method: "DELETE",
    });
  }

  async getVideo(videoId: string) {
    return this.request(`/videos/${videoId}`);
  }

  // Analytics endpoints
  async getAnalytics(type: "admin" | "creator" | "viewer") {
    return this.request(`/analytics/${type}`);
  }

  async getDashboardStats(role: string) {
    if (role === "ADMIN") {
      return this.request("/analytics/admin");
    } else if (role === "CREATOR") {
      return this.request("/analytics/creator");
    } else {
      // For viewers, return basic stats or empty data
      return Promise.resolve({ 
        success: true, 
        data: {
          videosWatched: 0,
          watchTime: "0h",
          favorites: 0,
          bookmarks: 0,
          watchGrowth: 0,
          timeGrowth: 0,
          favoriteGrowth: 0
        }
      });
    }
  }



  // User management endpoints (Admin only)
  async getUsers(params?: { role?: string; limit?: number; page?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append("role", params.role);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    
    const query = queryParams.toString();
    return this.request(`/admin/users${query ? `?${query}` : ""}`);
  }

  async getPendingVideos() {
    return this.request("/videos/admin/all?status=PENDING");
  }

  async getAllVideos() {
    return this.request("/videos/admin/all?limit=100");
  }

  async getRecentActivities() {
    // This endpoint doesn't exist yet, return empty for now
    return Promise.resolve({ success: true, data: [] });
  }

  // Video Interaction endpoints
  async likeVideo(videoId: string) {
    return this.request(`/interactions/videos/${videoId}/like`, {
      method: "POST",
    });
  }

  async saveVideo(videoId: string) {
    return this.request(`/interactions/videos/${videoId}/save`, {
      method: "POST",
    });
  }

  async addToWatchHistory(videoId: string, progress = 0, completed = false) {
    return this.request(`/interactions/videos/${videoId}/watch`, {
      method: "POST",
      body: JSON.stringify({ progress, completed }),
    });
  }

  async getVideoInteractionStatus(videoId: string) {
    return this.request(`/interactions/videos/${videoId}/status`);
  }

  async getLikedVideos(page = 1, limit = 20) {
    return this.request(`/interactions/liked-videos?page=${page}&limit=${limit}`);
  }

  async getSavedVideos(page = 1, limit = 20) {
    return this.request(`/interactions/saved-videos?page=${page}&limit=${limit}`);
  }

  async getWatchHistory(page = 1, limit = 20) {
    return this.request(`/interactions/watch-history?page=${page}&limit=${limit}`);
  }

  async clearWatchHistory() {
    return this.request("/interactions/watch-history", {
      method: "DELETE",
    });
  }

  // Creator Profile endpoints
  async getCreatorProfile(creatorId: string) {
    return this.request(`/creators/${creatorId}/profile`);
  }

  async getCreatorVideos(creatorId: string, page = 1, limit = 20) {
    return this.request(`/creators/${creatorId}/videos?page=${page}&limit=${limit}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);