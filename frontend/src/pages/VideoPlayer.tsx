import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { VideoPlayer as VideoPlayerComponent } from "@/components/video/VideoPlayer";
import { AdminVideoPlayer } from "@/components/video/AdminVideoPlayer";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { Video } from "@/lib/types";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const VideoPlayerPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getVideo(videoId!);
      
      if (response.success && response.data) {
        setVideo(response.data as Video);
      } else {
        toast.error("❌ Video not found");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching video:", error);
      toast.error("❌ Failed to load video");
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Video" />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Video Not Found" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Video not found</h2>
            <p className="text-muted-foreground mb-4">
              The video you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Use AdminVideoPlayer for admin users, regular VideoPlayer for others
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-background">
      <Header title={video.title} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleClose}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Video Player */}
        <div className="max-w-6xl mx-auto">
          {isAdmin ? (
            <AdminVideoPlayer video={video} onClose={handleClose} />
          ) : (
            <VideoPlayerComponent video={video} onClose={handleClose} />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;