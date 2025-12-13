import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Video } from "@/lib/types";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface ViewerContextType {
  likedVideos: Video[];
  savedVideos: Video[];
  watchHistory: Video[];
  isVideoLiked: (videoId: string) => boolean;
  isVideoSaved: (videoId: string) => boolean;
  toggleLike: (video: Video) => Promise<void>;
  toggleSave: (video: Video) => Promise<void>;
  addToWatchHistory: (video: Video) => Promise<void>;
  clearWatchHistory: () => Promise<void>;
  loadVideoStatus: (videoId: string) => Promise<void>;
}

const ViewerContext = createContext<ViewerContextType | undefined>(undefined);

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [likedVideos, setLikedVideos] = useState<Video[]>([]);
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);
  const [watchHistory, setWatchHistory] = useState<Video[]>([]);
  const [videoStatuses, setVideoStatuses] = useState<Record<string, { liked: boolean; saved: boolean }>>({});
  const { user } = useAuth();

  // Load data from API when user is available and is a viewer
  useEffect(() => {
    if (user?.role === "VIEWER") {
      loadUserData();
    } else {
      // Clear data if not a viewer
      setLikedVideos([]);
      setSavedVideos([]);
      setWatchHistory([]);
      setVideoStatuses({});
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const [likedResponse, savedResponse, historyResponse] = await Promise.all([
        apiClient.getLikedVideos(1, 100), // Load first 100
        apiClient.getSavedVideos(1, 100),
        apiClient.getWatchHistory(1, 100),
      ]);

      if (likedResponse.success && likedResponse.data) {
        const data = likedResponse.data as any;
        setLikedVideos(data.videos || []);
      }

      if (savedResponse.success && savedResponse.data) {
        const data = savedResponse.data as any;
        setSavedVideos(data.videos || []);
      }

      if (historyResponse.success && historyResponse.data) {
        const data = historyResponse.data as any;
        setWatchHistory(data.videos || []);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const isVideoLiked = (videoId: string): boolean => {
    return videoStatuses[videoId]?.liked || likedVideos.some(video => video.id === videoId);
  };

  const isVideoSaved = (videoId: string): boolean => {
    return videoStatuses[videoId]?.saved || savedVideos.some(video => video.id === videoId);
  };

  const loadVideoStatus = async (videoId: string) => {
    if (user?.role !== "VIEWER") return;
    
    try {
      const response = await apiClient.getVideoInteractionStatus(videoId);
      if (response.success && response.data) {
        const data = response.data as { liked: boolean; saved: boolean };
        setVideoStatuses(prev => ({
          ...prev,
          [videoId]: { liked: data.liked, saved: data.saved },
        }));
      }
    } catch (error) {
      console.error("Error loading video status:", error);
    }
  };

  const toggleLike = async (video: Video) => {
    if (user?.role !== "VIEWER") return;

    try {
      const response = await apiClient.likeVideo(video.id);
      if (response.success && response.data) {
        const data = response.data as { liked: boolean };
        const { liked } = data;
        
        // Update local state
        setVideoStatuses(prev => ({
          ...prev,
          [video.id]: { 
            liked, 
            saved: prev[video.id]?.saved || false 
          },
        }));

        // Update liked videos list
        setLikedVideos(prev => {
          if (liked) {
            return [video, ...prev.filter(v => v.id !== video.id)];
          } else {
            return prev.filter(v => v.id !== video.id);
          }
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const toggleSave = async (video: Video) => {
    if (user?.role !== "VIEWER") return;

    try {
      const response = await apiClient.saveVideo(video.id);
      if (response.success && response.data) {
        const data = response.data as { saved: boolean };
        const { saved } = data;
        
        // Update local state
        setVideoStatuses(prev => ({
          ...prev,
          [video.id]: { 
            saved, 
            liked: prev[video.id]?.liked || false 
          },
        }));

        // Update saved videos list
        setSavedVideos(prev => {
          if (saved) {
            return [video, ...prev.filter(v => v.id !== video.id)];
          } else {
            return prev.filter(v => v.id !== video.id);
          }
        });
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const addToWatchHistory = async (video: Video) => {
    if (user?.role !== "VIEWER") return;

    try {
      await apiClient.addToWatchHistory(video.id);
      
      // Update local state
      setWatchHistory(prev => {
        const filtered = prev.filter(v => v.id !== video.id);
        return [video, ...filtered];
      });
    } catch (error) {
      console.error("Error adding to watch history:", error);
    }
  };

  const clearWatchHistory = async () => {
    if (user?.role !== "VIEWER") return;

    try {
      const response = await apiClient.clearWatchHistory();
      if (response.success) {
        setWatchHistory([]);
      }
    } catch (error) {
      console.error("Error clearing watch history:", error);
    }
  };

  return (
    <ViewerContext.Provider
      value={{
        likedVideos,
        savedVideos,
        watchHistory,
        isVideoLiked,
        isVideoSaved,
        toggleLike,
        toggleSave,
        addToWatchHistory,
        clearWatchHistory,
        loadVideoStatus,
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
}

export function useViewer() {
  const context = useContext(ViewerContext);
  if (context === undefined) {
    throw new Error("useViewer must be used within a ViewerProvider");
  }
  return context;
}