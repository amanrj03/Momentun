import { Video } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Play } from "lucide-react";

interface RecentVideosProps {
  videos: Video[];
  className?: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "APPROVED":
      return { variant: "default" as const, label: "Approved" };
    case "PENDING":
      return { variant: "secondary" as const, label: "Pending" };
    case "REJECTED":
      return { variant: "destructive" as const, label: "Rejected" };
    default:
      return { variant: "secondary" as const, label: status };
  }
};

export const RecentVideos = ({ videos, className }: RecentVideosProps) => {
  return (
    <div className={cn("bg-card rounded-xl border border-border p-5", className)}>
      <h3 className="font-display font-semibold text-lg mb-4">Recent Uploads</h3>
      <div className="space-y-3">
        {videos.slice(0, 5).map((video) => {
          const statusBadge = getStatusBadge(video.status);
          return (
            <div
              key={video.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
            >
              {/* Thumbnail */}
              <div className="relative w-20 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Play className="w-4 h-4" />
                  </div>
                )}
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-5 h-5 text-foreground" />
                </div>
              </div>
              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{video.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(video.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              {/* Status */}
              <Badge
                variant={statusBadge.variant}
                className="flex-shrink-0"
              >
                {statusBadge.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentVideos;
