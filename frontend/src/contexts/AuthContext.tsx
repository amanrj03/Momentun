import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Role } from "@/lib/types";
import { apiClient } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (role: Role, data: any) => Promise<{ success: boolean; error?: string }>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session with backend
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // First check if backend is reachable
      const healthResponse = await apiClient.healthCheck();
      if (!healthResponse.success) {
        console.error("Backend is not reachable:", healthResponse.error);
        return;
      }
      
      // Then check auth status
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || "Login failed" };
      }
    } catch (error) {
      return { success: false, error: "Login failed. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (role: Role, data: any) => {
    setIsLoading(true);
    
    try {
      let response;
      
      // Call the appropriate registration endpoint based on role
      switch (role) {
        case "VIEWER":
          response = await apiClient.registerViewer(data);
          break;
        case "CREATOR":
          response = await apiClient.registerCreator(data);
          break;

        default:
          return { success: false, error: "Invalid role specified" };
      }

      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || "Registration failed" };
      }
    } catch (error) {
      return { success: false, error: "Registration failed. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
