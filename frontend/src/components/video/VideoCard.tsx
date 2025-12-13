import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Clock, Eye, Heart } from "lucide-react";
import { Video } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VideoCardProps {
  video: Video;
  onClick?: () => void;
  showStatus?: boolean;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatViews(views: number | undefined | null): string {
  if (!views || views === 0) {
    return "0";
  }
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

export function VideoCard({ video, onClick, showStatus = false }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 border-border bg-card"
        onClick={onClick}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={video.thumbnail_url || "/placeholder.svg"}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play Button */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: isHovered ? 1 : 0.8, 
              opacity: isHovered ? 1 : 0 
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/30">
              <Play className="w-7 h-7 text-primary-foreground fill-current ml-1" />
            </div>
          </motion.div>

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(video.duration)}
          </div>

          {/* Status Badge */}
          {showStatus && (
            <div className="absolute top-2 left-2">
              <Badge
                variant={
                  video.status === "APPROVED"
                    ? "default"
                    : video.status === "PENDING"
                    ? "secondary"
                    : "destructive"
                }
                className={
                  video.status === "APPROVED"
                    ? "bg-green-500 text-white"
                    : video.status === "PENDING"
                    ? "bg-yellow-500 text-white"
                    : ""
                }
              >
                {video.status}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex gap-3">
            {/* Avatar */}
            <img
              src={(video.uploader as any)?.creatorProfile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent((video.uploader as any)?.creatorProfile?.channel_name || (video.uploader as any)?.creatorProfile?.full_name || 'Creator')}&background=f97316&color=fff`}
              alt={(video.uploader as any)?.creatorProfile?.channel_name || (video.uploader as any)?.creatorProfile?.full_name || 'Creator'}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
            />
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {video.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {(video.uploader as any)?.creatorProfile?.channel_name || (video.uploader as any)?.creatorProfile?.full_name || 'Creator'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{formatViews(video.views)} views</span>
              </div>
              {video.likes_count !== undefined && (
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>{formatViews(video.likes_count)}</span>
                </div>
              )}
            </div>
            <div className="text-xs">
              {new Date(video.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}