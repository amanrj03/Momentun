import { useState } from "react";
import { Video } from "@/lib/types";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Play, 
  Eye, 
  Heart, 
  Clock, 
  Edit, 
  MoreHorizontal,
  Calendar,
  Search,
  Trash2,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface CreatorVideoListProps {
  videos: Video[];
  onVideoUpdate?: () => void;
  totalVideos?: number; // Total number of videos (before filtering)
  isFiltered?: boolean; // Whether the current list is filtered
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

export function CreatorVideoList({ videos, onVideoUpdate, totalVideos = 0, isFiltered = false }: CreatorVideoListProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500 text-white";
      case "PENDING":
        return "bg-yellow-500 text-white";
      case "REJECTED":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleDeleteVideo = async () => {
    if (!videoToDelete) return;

    setIsDeleting(true);
    try {
      const response = await apiClient.deleteVideo(videoToDelete.id);
      
      if (response.success) {
        toast.success("Video deleted successfully");
        // Call the update callback to refresh the video list
        if (onVideoUpdate) {
          onVideoUpdate();
        }
      } else {
        toast.error(response.error || "Failed to delete video");
      }
    } catch (error) {
      console.error("Delete video error:", error);
      toast.error("Failed to delete video");
    } finally {
      setIsDeleting(false);
      setVideoToDelete(null);
    }
  };

  if (videos.length === 0) {
    // If no videos and not filtered, show the "no videos yet" message
    if (!isFiltered && totalVideos === 0) {
      return (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Videos Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start sharing your entrepreneurial journey by uploading your first video!
          </p>
          <Button>
            <Play className="w-4 h-4 mr-2" />
            Upload Your First Video
          </Button>
        </Card>
      );
    }
    
    // If filtered and no results, show filtered empty state
    if (isFiltered && totalVideos > 0) {
      return (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No videos found</h3>
          <p className="text-muted-foreground">
            No videos match your current filter. Try adjusting your search or filter criteria.
          </p>
        </Card>
      );
    }
    
    // Default empty state
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Videos</h3>
        <p className="text-muted-foreground">
          No videos available at the moment.
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {videos.map((video) => (
          <Card key={video.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              {/* Thumbnail */}
              <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 group cursor-pointer">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onClick={() => setSelectedVideo(video)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                
                {/* Play Button Overlay */}
                <div 
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-xs">
                    {formatDuration(video.duration)}
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {video.description || "No description"}
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  <Badge className={`ml-2 ${getStatusColor(video.status)}`}>
                    {video.status}
                  </Badge>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatViews(video.views)} views</span>
                  </div>
                  
                  {video.likes_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{formatViews(video.likes_count)} likes</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedVideo(video)}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Play
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600"
                      onClick={() => setVideoToDelete(video)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Video
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!videoToDelete} onOpenChange={() => setVideoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{videoToDelete?.title}"? This action cannot be undone and will permanently remove the video from both the platform and Cloudinary storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVideo}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Video
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}