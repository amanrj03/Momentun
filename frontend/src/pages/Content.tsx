import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { CreatorVideoList } from "@/components/dashboard/CreatorVideoList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Video, VideoStatus } from "@/lib/types";
import { Search, Upload, Filter, Loader2, Video as VideoIcon, Sparkles, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Content = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<VideoStatus | "ALL">("ALL");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getUserVideos();
      if (response.success && response.data) {
        const data = response.data as any;
        const videosArray = data.videos || data;
        setVideos(Array.isArray(videosArray) ? videosArray : []);
      } else {
        setError(response.error || "Failed to load videos");
      }
    } catch (err) {
      setError("Failed to load videos");
      console.error("Error loading videos:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (video.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || video.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="My Videos" />
        <div className="flex items-center justify-center h-96">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent animate-spin" style={{ animationDuration: '2s' }}>
                <div className="absolute inset-1 rounded-full bg-background" />
              </div>
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
            </div>
            <p className="text-muted-foreground">Loading your videos...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="My Videos" />
        <div className="flex items-center justify-center h-96">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8 bg-card/50 backdrop-blur-sm rounded-2xl border border-destructive/20"
          >
            <VideoIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Videos</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadVideos} className="rounded-xl">
              Try Again
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const approvedCount = videos.filter(v => v.status === "APPROVED").length;
  const pendingCount = videos.filter(v => v.status === "PENDING").length;
  const rejectedCount = videos.filter(v => v.status === "REJECTED").length;

  return (
    <div className="min-h-screen bg-background">
      <Header title="My Videos" />

      <div className="p-6 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10">
              <Film className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">My Videos</h1>
              <p className="text-muted-foreground">
                Manage and track the performance of your uploaded videos
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/upload")}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-xl shadow-primary/25 px-6 rounded-xl"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload New Video
          </Button>
        </motion.div>

        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-secondary/50 border-border/50 focus:border-primary rounded-xl h-11"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as VideoStatus | "ALL")}
          >
            <SelectTrigger className="w-[180px] bg-secondary/50 border-border/50 rounded-xl h-11">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Results Count */}
        {videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-secondary/30 backdrop-blur-sm rounded-2xl border border-border/50"
          >
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredVideos.length}</span> of <span className="font-semibold text-foreground">{videos.length}</span> videos
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-success/10 text-success border-success/30 px-3 py-1">
                <div className="w-2 h-2 rounded-full bg-success mr-2" />
                Approved: {approvedCount}
              </Badge>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 px-3 py-1">
                <div className="w-2 h-2 rounded-full bg-warning mr-2" />
                Pending: {pendingCount}
              </Badge>
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 px-3 py-1">
                <div className="w-2 h-2 rounded-full bg-destructive mr-2" />
                Rejected: {rejectedCount}
              </Badge>
            </div>
          </motion.div>
        )}

        {/* Video List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CreatorVideoList 
            videos={filteredVideos} 
            onVideoUpdate={loadVideos}
            totalVideos={videos.length}
            isFiltered={searchQuery !== "" || statusFilter !== "ALL"}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Content;