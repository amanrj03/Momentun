import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Heart, Bookmark, Eye, Clock, User } from "lucide-react";
import { Video } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useViewer } from "@/contexts/ViewerContext";
import { useToast } from "@/hooks/use-toast";

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isVideoLiked, isVideoSaved, toggleLike, toggleSave, addToWatchHistory, loadVideoStatus } = useViewer();
  const { toast } = useToast();

  const isLiked = isVideoLiked(video.id);
  const isSaved = isVideoSaved(video.id);

  const handleCreatorClick = () => {
    if ((video.uploader as any)?.id) {
      navigate(`/creator/${(video.uploader as any).id}`);
    }
  };

  useEffect(() => {
    if (user?.role === "VIEWER") {
      loadVideoStatus(video.id);
    }
  }, [video.id, user, loadVideoStatus]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const updateTime = () => {
      setCurrentTime(videoElement.currentTime);
      setProgress((videoElement.currentTime / videoElement.duration) * 100);
    };

    const updateDuration = () => {
      setDuration(videoElement.duration);
    };

    const handlePlay = () => {
      if (user?.role === "VIEWER") {
        addToWatchHistory(video);
      }
    };

    videoElement.addEventListener('timeupdate', updateTime);
    videoElement.addEventListener('loadedmetadata', updateDuration);
    videoElement.addEventListener('play', handlePlay);

    return () => {
      videoElement.removeEventListener('timeupdate', updateTime);
      videoElement.removeEventListener('loadedmetadata', updateDuration);
      videoElement.removeEventListener('play', handlePlay);
    };
  }, [video, user, addToWatchHistory]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    videoElement.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const skipForward = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    videoElement.currentTime = Math.min(videoElement.currentTime + 10, duration);
  };

  const skipBackward = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    videoElement.currentTime = Math.max(videoElement.currentTime - 10, 0);
  };

  const toggleFullscreen = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoElement.requestFullscreen();
    }
  };

  const handleLike = async () => {
    await toggleLike(video);
    toast({
      title: isLiked ? "Removed from liked videos" : "Added to liked videos",
      description: isLiked ? "Video removed from your liked videos" : "Video added to your liked videos",
    });
  };

  const handleSave = async () => {
    await toggleSave(video);
    toast({
      title: isSaved ? "Removed from saved videos" : "Added to saved videos",
      description: isSaved ? "Video removed from your saved videos" : "Video added to your saved videos",
    });
  };

  const creatorProfile = (video.uploader as any)?.creatorProfile || (video.uploader as any)?.profile;
  const creatorName = creatorProfile?.channel_name || creatorProfile?.full_name || 'Creator';
  const creatorAvatar = creatorProfile?.avatar_url;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl"
        onMouseMove={handleMouseMove}
      >
        {/* Close Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 lg:right-[440px] z-50 text-white/80 hover:text-white hover:bg-white/10 rounded-full w-12 h-12"
          >
            <X className="w-6 h-6" />
          </Button>
        </motion.div>

        <div className="h-full flex flex-col lg:flex-row">
          {/* Video Section */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", damping: 20 }}
                className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
              >
                {/* Video Element */}
                <video
                  ref={videoRef}
                  src={video.video_url}
                  poster={video.thumbnail_url}
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onClick={togglePlay}
                />

                {/* Play Overlay */}
                <AnimatePresence>
                  {!isPlaying && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30"
                      onClick={togglePlay}
                    >
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/50"
                      >
                        <Play className="w-12 h-12 text-primary-foreground fill-current ml-1" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Controls */}
                <AnimatePresence>
                  {showControls && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6"
                    >
                      {/* Progress Bar */}
                      <div 
                        className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group"
                        onClick={handleProgressClick}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full relative transition-all"
                          style={{ width: `${progress}%` }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity scale-0 group-hover:scale-100" />
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={togglePlay}
                            className="text-white hover:bg-white/10 rounded-full"
                          >
                            {isPlaying ? (
                              <Pause className="w-6 h-6" />
                            ) : (
                              <Play className="w-6 h-6 fill-current" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={skipBackward}
                            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full"
                          >
                            <SkipBack className="w-5 h-5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={skipForward}
                            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full"
                          >
                            <SkipForward className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMute}
                            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full"
                          >
                            {isMuted ? (
                              <VolumeX className="w-5 h-5" />
                            ) : (
                              <Volume2 className="w-5 h-5" />
                            )}
                          </Button>
                          <span className="text-sm text-white/80 ml-3 font-medium">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={toggleFullscreen}
                          className="text-white/80 hover:text-white hover:bg-white/10 rounded-full"
                        >
                          <Maximize className="w-5 h-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {/* Info Sidebar */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full lg:w-[420px] bg-card/95 backdrop-blur-xl border-l border-border/50 p-6 overflow-y-auto"
          >
            <div className="space-y-6">
              {/* Title & Actions */}
              <div>
                {/* Show approved status only for non-viewers (admin/creator) */}
                {user?.role !== "VIEWER" && (
                  <div className="mb-4">
                    <Badge 
                      className={
                        video.status === 'APPROVED' ? 'bg-success/20 text-success border-success/30' :
                        video.status === 'PENDING' ? 'bg-warning/20 text-warning border-warning/30' :
                        'bg-destructive/20 text-destructive border-destructive/30'
                      }
                    >
                      {video.status}
                    </Badge>
                  </div>
                )}
                <h1 className="text-2xl font-display font-bold text-foreground leading-tight mb-4">
                  {video.title}
                </h1>
                {/* Like and Save buttons - Only for viewers, positioned below title */}
                {user?.role === "VIEWER" && (
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className={`rounded-full ${isLiked ? 'text-red-500 hover:text-red-600 bg-red-500/10' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="ml-2">Like</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSave}
                      className={`rounded-full ${isSaved ? 'text-primary hover:text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                      <span className="ml-2">Save</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Creator Info */}
              <div 
                className="flex items-center gap-4 p-4 bg-secondary/30 backdrop-blur-sm rounded-2xl cursor-pointer hover:bg-secondary/50 transition-all border border-border/50 group"
                onClick={handleCreatorClick}
              >
                <Avatar className="w-14 h-14 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                  <AvatarImage src={creatorAvatar} alt={creatorName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-lg">
                    {creatorName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {creatorName}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" />
                    View creator profile
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">About this video</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {video.description || 'No description available.'}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-secondary/30 backdrop-blur-sm rounded-2xl text-center border border-border/50">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Eye className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {video.views?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
                <div className="p-4 bg-secondary/30 backdrop-blur-sm rounded-2xl text-center border border-border/50">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Heart className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {(video as any).likes_count?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Likes</div>
                </div>
                <div className="p-4 bg-secondary/30 backdrop-blur-sm rounded-2xl text-center border border-border/50">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-4 h-4 text-accent" />
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {video.duration ? Math.floor(video.duration / 60) : 0}m
                  </div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                </div>
              </div>

              {/* Upload Date */}
              <div className="p-4 bg-secondary/30 backdrop-blur-sm rounded-2xl border border-border/50">
                <h4 className="font-semibold text-foreground mb-2">Published</h4>
                <p className="text-muted-foreground">
                  {new Date(video.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}