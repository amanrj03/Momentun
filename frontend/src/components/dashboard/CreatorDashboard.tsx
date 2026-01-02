import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CreatorVideoList } from "@/components/dashboard/CreatorVideoList";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Video as VideoType } from "@/lib/types";
import { 
  Eye, 
  Video, 
  Heart, 
  Clock, 
  Upload,
  Calendar,
  Target,
  Loader2,
  Sparkles,
  Rocket,
  Zap,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CreatorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any[]>([]);
  const [creatorVideos, setCreatorVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const statsResponse = await apiClient.getDashboardStats("CREATOR");
      if (statsResponse.success && statsResponse.data) {
        const data = statsResponse.data as any;
        setStats([
          {
            title: "Total Views",
            value: data.totalViews || 0,
            change: data.viewGrowth || 0,
            icon: Eye,
          },
          {
            title: "Your Videos",
            value: data.totalVideos || 0,
            change: data.videoGrowth || 0,
            icon: Video,
          },
          {
            title: "Total Likes",
            value: data.totalLikes || 0,
            change: data.likesGrowth || 0,
            icon: Heart,
          },
          {
            title: "Pending Review",
            value: data.pendingVideos || 0,
            icon: Clock,
          },
        ]);
      }

      const videosResponse = await apiClient.getUserVideos();
      if (videosResponse.success && videosResponse.data) {
        const data = videosResponse.data as any;
        const videosArray = data.videos || data;
        setCreatorVideos(Array.isArray(videosArray) ? videosArray : []);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("❌ Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const profile = user?.profile as any;
  const creatorName = profile?.full_name?.split(' ')[0] || 'Creator';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Creator Dashboard" />
        <LoadingScreen message="Loading your dashboard..." fullScreen={false} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Creator Dashboard" />
      
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 rounded-3xl border border-primary/20 p-8"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Welcome back</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Hello, {creatorName}! 
              </h2>
              <p className="text-muted-foreground max-w-lg text-lg">
                Ready to share your entrepreneurial journey? Your content inspires others to build amazing things.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/upload')}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-xl shadow-primary/25 px-6 py-6 text-lg rounded-2xl group"
            >
              <Upload className="w-5 h-5 mr-2 group-hover:-translate-y-0.5 transition-transform" />
              Upload Video
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid - Merged into single box with dividers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y-2 md:divide-y-0 md:divide-x-2 lg:divide-x-2 divide-border/50">
            {stats.map((stat, index) => (
              <div key={stat.title} className="relative">
                <StatsCard {...stat} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Your Videos */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-2 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                Your Videos
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/content')}
                className="rounded-xl border-border/50 hover:border-primary/50"
              >
                View All
              </Button>
            </div>
            <CreatorVideoList 
              videos={creatorVideos} 
              onVideoUpdate={loadDashboardData}
              totalVideos={creatorVideos.length}
              isFiltered={false}
            />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Content Calendar */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/10">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                Content Calendar
              </h3>
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">No content scheduled yet</p>
                <Button variant="outline" size="sm" className="w-full rounded-xl">
                  Plan Your Content
                </Button>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                Performance Insights
              </h3>
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Upload videos to see insights</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-warning/10">
                  <Zap className="w-5 h-5 text-warning" />
                </div>
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl hover:bg-primary/5 hover:border-primary/30"
                  onClick={() => navigate('/upload')}
                >
                  <Upload className="w-4 h-4 mr-3 text-primary" />
                  Upload New Video
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl hover:bg-accent/5 hover:border-accent/30"
                  onClick={() => navigate('/analytics')}
                >
                  <TrendingUp className="w-4 h-4 mr-3 text-accent" />
                  View Analytics
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl hover:bg-warning/5 hover:border-warning/30"
                >
                  <Calendar className="w-4 h-4 mr-3 text-warning" />
                  Schedule Content
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default CreatorDashboard;