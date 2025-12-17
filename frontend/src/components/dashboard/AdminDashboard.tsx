import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AdminVideoPlayer } from "@/components/video/AdminVideoPlayer";
import { apiClient } from "@/lib/api";
import { Video as VideoType } from "@/lib/types";
import { 
  Users, 
  Video, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Loader2,
  Calendar,
  Play,
  Search,
  LayoutGrid,
  UserCheck,
  Film,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminDashboard = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [pendingVideos, setPendingVideos] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [viewers, setViewers] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [updatingVideoId, setUpdatingVideoId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'creators' | 'viewers' | 'videos'>('dashboard');
  
  const [creatorSearchQuery, setCreatorSearchQuery] = useState("");
  const [viewerSearchQuery, setViewerSearchQuery] = useState("");
  const [videoSearchQuery, setVideoSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const analyticsResponse = await apiClient.getAnalytics("admin");
      if (analyticsResponse.success && analyticsResponse.data) {
        const data = analyticsResponse.data as any;
        setStats([
          {
            title: "Total Users",
            value: data.totalUsers || 0,
            change: data.userGrowth || 0,
            icon: Users,
          },
          {
            title: "Total Videos",
            value: data.totalVideos || 0,
            change: data.videoGrowth || 0,
            icon: Video,
          },
          {
            title: "Pending Reviews",
            value: data.pendingVideos || 0,
            icon: Clock,
          },
          {
            title: "Platform Views",
            value: data.totalViews || 0,
            change: data.viewGrowth || 0,
            icon: TrendingUp,
          },
        ]);
      }

      const pendingResponse = await apiClient.getPendingVideos();
      if (pendingResponse.success && pendingResponse.data) {
        const data = pendingResponse.data as any;
        const videosArray = data.videos || data;
        setPendingVideos(Array.isArray(videosArray) ? videosArray : []);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("❌ Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCreators = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getUsers({ role: "CREATOR" });
      if (response.success && response.data) {
        const data = response.data as any;
        setCreators(data.users || []);
      }
    } catch (error) {
      console.error("Failed to load creators:", error);
      toast.error("❌ Failed to load creators");
    } finally {
      setIsLoading(false);
    }
  };

  const loadViewers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getUsers({ role: "VIEWER" });
      if (response.success && response.data) {
        const data = response.data as any;
        setViewers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to load viewers:", error);
      toast.error("❌ Failed to load viewers");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllVideos = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getAllVideos();
      if (response.success && response.data) {
        const data = response.data as any;
        setAllVideos(data.videos || []);
      }
    } catch (error) {
      console.error("Failed to load all videos:", error);
      toast.error("❌ Failed to load videos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewChange = (view: 'dashboard' | 'creators' | 'viewers' | 'videos') => {
    setCurrentView(view);
    setCreatorSearchQuery("");
    setViewerSearchQuery("");
    setVideoSearchQuery("");
    
    if (view === 'creators') {
      loadCreators();
    } else if (view === 'viewers') {
      loadViewers();
    } else if (view === 'videos') {
      loadAllVideos();
    } else {
      loadDashboardData();
    }
  };

  const handleCreatorClick = (creatorId: string) => {
    navigate(`/creator/${creatorId}`);
  };

  const formatViews = (views: number | undefined | null): string => {
    if (!views || views === 0) return "0";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const handleVideoAction = async (videoId: string, action: "APPROVED" | "REJECTED") => {
    try {
      setUpdatingVideoId(videoId);
      const response = await apiClient.updateVideoStatus(videoId, action);
      if (response.success) {
        toast.success(`✅ Video ${action.toLowerCase()} successfully`);
        
        if (currentView === 'videos') {
          setAllVideos(prevVideos => 
            prevVideos.map(video => 
              video.id === videoId 
                ? { ...video, status: action }
                : video
            )
          );
        } else {
          setPendingVideos(prevVideos => 
            prevVideos.filter(video => video.id !== videoId)
          );
          
          setStats(prevStats => 
            prevStats.map(stat => 
              stat.title === "Pending Reviews" 
                ? { ...stat, value: Math.max(0, stat.value - 1) }
                : stat
            )
          );
        }
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast.error(`❌ Failed to ${action.toLowerCase()} video`);
    } finally {
      setUpdatingVideoId(null);
    }
  };

  const filteredCreators = creators.filter((creator) => {
    const query = creatorSearchQuery.toLowerCase();
    return (
      creator.profile?.full_name?.toLowerCase().includes(query) ||
      creator.profile?.channel_name?.toLowerCase().includes(query) ||
      creator.email?.toLowerCase().includes(query)
    );
  });

  const filteredViewers = viewers.filter((viewer) => {
    const query = viewerSearchQuery.toLowerCase();
    return (
      viewer.profile?.full_name?.toLowerCase().includes(query) ||
      viewer.email?.toLowerCase().includes(query)
    );
  });

  const filteredVideos = allVideos.filter((video) => {
    const query = videoSearchQuery.toLowerCase();
    return (
      video.title?.toLowerCase().includes(query) ||
      video.uploader?.creatorProfile?.full_name?.toLowerCase().includes(query) ||
      video.uploader?.profile?.full_name?.toLowerCase().includes(query)
    );
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'creators', label: 'Creators', icon: UserCheck },
    { id: 'viewers', label: 'Viewers', icon: Users },
    { id: 'videos', label: 'Videos', icon: Film },
  ];

  if (isLoading && currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Admin Dashboard" />
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
            <p className="text-muted-foreground">Loading dashboard...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Admin Dashboard" />
      
      <div className="p-6 space-y-8">
        {/* Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 p-1.5 bg-secondary/50 backdrop-blur-sm rounded-2xl border border-border/50 w-fit"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                onClick={() => handleViewChange(item.id as any)}
                className={`relative rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25' 
                    : 'hover:bg-secondary'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-64"
            >
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </motion.div>
          ) : (
            <>
              {/* Dashboard View */}
              {currentView === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <StatsCard {...stat} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Pending Reviews */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden"
                  >
                    <div className="p-6 border-b border-border/50 bg-gradient-to-r from-warning/5 to-transparent">
                      <h2 className="font-display font-semibold text-xl flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-warning/10">
                          <Clock className="w-5 h-5 text-warning" />
                        </div>
                        Pending Video Reviews
                        {pendingVideos.length > 0 && (
                          <Badge className="bg-warning/20 text-warning border-warning/30">
                            {pendingVideos.length} pending
                          </Badge>
                        )}
                      </h2>
                    </div>
                    
                    {pendingVideos.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-10 h-10 text-success" />
                        </div>
                        <h3 className="font-display font-semibold text-lg text-foreground mb-2">All Caught Up!</h3>
                        <p className="text-muted-foreground">No pending videos to review. Great work!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                        {pendingVideos.map((video, index) => (
                          <motion.div
                            key={video.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-secondary/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                          >
                            {/* Video Thumbnail */}
                            <div className="relative aspect-video bg-muted overflow-hidden">
                              {video.thumbnail_url ? (
                                <img
                                  src={video.thumbnail_url}
                                  alt={video.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/10">
                                  <Video className="w-12 h-12 text-primary/50" />
                                </div>
                              )}
                              
                              {/* Play Button Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <Button
                                  size="lg"
                                  onClick={() => setSelectedVideo(video)}
                                  className="w-14 h-14 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-2xl shadow-primary/40 scale-90 group-hover:scale-100 transition-transform"
                                >
                                  <Play className="w-6 h-6 ml-0.5" />
                                </Button>
                              </div>

                              <Badge className="absolute top-3 left-3 bg-warning/90 text-warning-foreground">
                                Pending
                              </Badge>
                            </div>

                            {/* Video Info */}
                            <div className="p-5">
                              <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                {video.title}
                              </h3>
                              <div className="flex items-center gap-2 mb-4">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={video.uploader?.profile?.avatar_url} />
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {video.uploader?.profile?.full_name?.[0] || 'C'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  {video.uploader?.profile?.full_name || "Unknown"}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(video.createdAt).toLocaleDateString()}
                              </p>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1 bg-success hover:bg-success/90 text-success-foreground shadow-lg shadow-success/25"
                                  onClick={() => handleVideoAction(video.id, "APPROVED")}
                                  disabled={updatingVideoId === video.id}
                                >
                                  {updatingVideoId === video.id ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                  )}
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="flex-1 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => handleVideoAction(video.id, "REJECTED")}
                                  disabled={updatingVideoId === video.id}
                                >
                                  {updatingVideoId === video.id ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4 mr-1" />
                                  )}
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {/* Creators Management View */}
              {currentView === 'creators' && (
                <motion.div
                  key="creators"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden"
                >
                  <div className="p-6 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display font-semibold text-xl flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <UserCheck className="w-5 h-5 text-primary" />
                        </div>
                        Manage Creators
                      </h2>
                      <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search creators..."
                          value={creatorSearchQuery}
                          onChange={(e) => setCreatorSearchQuery(e.target.value)}
                          className="pl-10 bg-secondary/50 border-border/50 focus:border-primary rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="font-semibold">Creator</TableHead>
                          <TableHead className="font-semibold">Channel</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold text-center">Videos</TableHead>
                          <TableHead className="font-semibold text-center">Views</TableHead>
                          <TableHead className="font-semibold text-center">Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCreators.map((creator, index) => (
                          <motion.tr
                            key={creator.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
                            onClick={() => handleCreatorClick(creator.id)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                                  <AvatarImage src={creator.profile?.avatar_url} />
                                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                                    {creator.profile?.full_name?.[0] || 'C'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{creator.profile?.full_name || 'Unknown'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                {creator.profile?.channel_name || 'No channel'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{creator.email}</TableCell>
                            <TableCell className="text-center font-semibold">{creator.profile?.total_videos || 0}</TableCell>
                            <TableCell className="text-center font-semibold">{formatViews(creator.profile?.total_views)}</TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {new Date(creator.createdAt).toLocaleDateString()}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {filteredCreators.length === 0 && (
                    <div className="p-12 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No creators found</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Viewers Management View */}
              {currentView === 'viewers' && (
                <motion.div
                  key="viewers"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden"
                >
                  <div className="p-6 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display font-semibold text-xl flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-accent/10">
                          <Users className="w-5 h-5 text-accent" />
                        </div>
                        Manage Viewers
                      </h2>
                      <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search viewers..."
                          value={viewerSearchQuery}
                          onChange={(e) => setViewerSearchQuery(e.target.value)}
                          className="pl-10 bg-secondary/50 border-border/50 focus:border-primary rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="font-semibold">Viewer</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold text-center">Country</TableHead>
                          <TableHead className="font-semibold text-center">Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredViewers.map((viewer, index) => (
                          <motion.tr
                            key={viewer.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="border-border/50 hover:bg-secondary/30 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10 ring-2 ring-accent/20">
                                  <AvatarImage src={viewer.profile?.avatar_url} />
                                  <AvatarFallback className="bg-gradient-to-br from-accent to-primary text-accent-foreground">
                                    {viewer.profile?.full_name?.[0] || 'V'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{viewer.profile?.full_name || 'Unknown'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{viewer.email}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="border-border/50">
                                {viewer.profile?.country || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {new Date(viewer.createdAt).toLocaleDateString()}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {filteredViewers.length === 0 && (
                    <div className="p-12 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No viewers found</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* All Videos View */}
              {currentView === 'videos' && (
                <motion.div
                  key="videos"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden"
                >
                  <div className="p-6 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display font-semibold text-xl flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <Film className="w-5 h-5 text-primary" />
                        </div>
                        All Videos
                      </h2>
                      <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search videos..."
                          value={videoSearchQuery}
                          onChange={(e) => setVideoSearchQuery(e.target.value)}
                          className="pl-10 bg-secondary/50 border-border/50 focus:border-primary rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="font-semibold">Video</TableHead>
                          <TableHead className="font-semibold">Creator</TableHead>
                          <TableHead className="font-semibold text-center">Status</TableHead>
                          <TableHead className="font-semibold text-center">Views</TableHead>
                          <TableHead className="font-semibold text-center">Uploaded</TableHead>
                          <TableHead className="font-semibold text-center">Play</TableHead>
                          <TableHead className="font-semibold text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredVideos.map((video, index) => (
                          <motion.tr
                            key={video.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="border-border/50 hover:bg-secondary/30 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                                  {video.thumbnail_url ? (
                                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                      <Video className="w-4 h-4 text-primary/50" />
                                    </div>
                                  )}
                                  {/* Play button overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play className="w-4 h-4 text-white fill-current" />
                                  </div>
                                </div>
                                <span className="font-medium line-clamp-1 max-w-[200px]">{video.title}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {video.uploader?.creatorProfile?.full_name || video.uploader?.profile?.full_name || 'Unknown'}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                className={
                                  video.status === 'APPROVED' ? 'bg-success/20 text-success border-success/30' :
                                  video.status === 'PENDING' ? 'bg-warning/20 text-warning border-warning/30' :
                                  'bg-destructive/20 text-destructive border-destructive/30'
                                }
                              >
                                {video.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-semibold">{formatViews(video.views)}</TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {new Date(video.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
                                onClick={() => setSelectedVideo(video)}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              {video.status === 'PENDING' && (
                                <div className="flex justify-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-success hover:bg-success/10"
                                    onClick={() => handleVideoAction(video.id, "APPROVED")}
                                    disabled={updatingVideoId === video.id}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleVideoAction(video.id, "REJECTED")}
                                    disabled={updatingVideoId === video.id}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {filteredVideos.length === 0 && (
                    <div className="p-12 text-center">
                      <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No videos found</p>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <AdminVideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;