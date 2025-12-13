import { Video, VideoStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Eye, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface VideoTableProps {
  videos: Video[];
  onEdit?: (video: Video) => void;
  onDelete?: (video: Video) => void;
  onView?: (video: Video) => void;
}

const statusConfig: Record<VideoStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  APPROVED: { label: "Approved", variant: "default" },
  PENDING: { label: "Pending", variant: "secondary" },
  REJECTED: { label: "Rejected", variant: "destructive" },
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const VideoTable = ({ videos, onEdit, onDelete, onView }: VideoTableProps) => {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-[400px]">Video</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video, index) => (
            <TableRow
              key={video.id}
              className={cn(
                "border-border cursor-pointer transition-colors",
                "hover:bg-accent/50",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell>
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No thumbnail
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 bg-background/90 text-foreground text-[10px] px-1 rounded">
                      {formatDuration(video.duration)}
                    </span>
                  </div>
                  {/* Title & Creator */}
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate max-w-[250px]">
                      {video.title}
                    </p>
                    {(video.uploader as any)?.creatorProfile && (
                      <p className="text-sm text-muted-foreground truncate">
                        by {(video.uploader as any)?.creatorProfile?.channel_name || (video.uploader as any)?.creatorProfile?.full_name || 'Creator'}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={statusConfig[video.status].variant}>
                  {statusConfig[video.status].label}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {video.views?.toLocaleString() || 0}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(video.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView?.(video)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(video)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in new tab
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete?.(video)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VideoTable;
