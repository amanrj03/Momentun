import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, TrendingUp, Video, Heart, Loader2, Sparkles, BarChart3, LineChart } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const analyticsType = user.role.toLowerCase() as "admin" | "creator" | "viewer";
        const response = await apiClient.getAnalytics(analyticsType);
        
        if (response.success) {
          setAnalytics(response.data);
        } else {
          setError(response.error || "Failed to fetch analytics");
        }
      } catch (err) {
        setError("Failed to load analytics data");
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Analytics" />
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
            <p className="text-muted-foreground">Loading analytics...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Analytics" />
        <div className="flex items-center justify-center h-96">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8 bg-card/50 backdrop-blur-sm rounded-2xl border border-destructive/20"
          >
            <p className="text-destructive font-medium mb-2">Error loading analytics</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Analytics" />
        <div className="flex items-center justify-center h-96">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No analytics data available</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const viewsGrowth = analytics.viewsLastMonth > 0 
    ? ((analytics.viewsThisMonth - analytics.viewsLastMonth) / analytics.viewsLastMonth * 100)
    : 0;

  const likesGrowth = analytics.likesLastMonth > 0 
    ? ((analytics.likesThisMonth - analytics.likesLastMonth) / analytics.likesLastMonth * 100)
    : 0;

  const stats = [
    {
      title: "Total Views",
      value: analytics.totalViews || 0,
      change: viewsGrowth,
      icon: Eye,
    },
    {
      title: "Total Likes",
      value: analytics.totalLikes || 0,
      change: likesGrowth,
      icon: Heart,
    },
    {
      title: "This Month Views",
      value: analytics.viewsThisMonth || 0,
      change: viewsGrowth,
      icon: TrendingUp,
    },
    {
      title: "Published Videos",
      value: analytics.publishedVideos || 0,
      icon: Video,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Analytics" />

      <div className="p-6 space-y-8">
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Views and Likes Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/10">
                <LineChart className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">Views & Likes This Week</h3>
            </div>
            <div className="h-[300px]">
              {analytics.chartData && analytics.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.chartData}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorViews)"
                    />
                    <Area
                      type="monotone"
                      dataKey="likes"
                      stroke="hsl(0, 84%, 60%)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorLikes)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <LineChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No analytics data available</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Videos by Views */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-accent/10">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg">Top Videos by Views</h3>
            </div>
            <div className="h-[300px]">
              {analytics.topVideos && analytics.topVideos.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.topVideos.map((v: any) => ({
                      name: v.title.slice(0, 20) + "...",
                      views: v.views,
                    }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar
                      dataKey="views"
                      fill="hsl(var(--primary))"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No video data available</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Top Liked Videos Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-red-500/10">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-display font-semibold text-lg">Most Liked Videos</h3>
          </div>
          <div className="h-[300px]">
            {analytics.topLikedVideos && analytics.topLikedVideos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.topLikedVideos.map((v: any) => ({
                    name: v.title.slice(0, 20) + "...",
                    likes: v.likes_count,
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar
                    dataKey="likes"
                    fill="hsl(0, 84%, 60%)"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No likes data available</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Video Details */}
        {analytics.topVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-warning/10">
                <TrendingUp className="w-5 h-5 text-warning" />
              </div>
              <h3 className="font-display font-semibold text-lg">Best Performing Video</h3>
            </div>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-full md:w-56 h-32 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                {analytics.topVideo.thumbnail_url && (
                  <img
                    src={analytics.topVideo.thumbnail_url}
                    alt={analytics.topVideo.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <h4 className="font-display font-semibold text-xl">
                  {analytics.topVideo.title}
                </h4>
                <p className="text-muted-foreground line-clamp-2">
                  {analytics.topVideo.description}
                </p>
                <div className="flex flex-wrap gap-6 pt-2">
                  <div>
                    <p className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {analytics.topVideo.views?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-muted-foreground">
                      {analytics.topVideo.status}
                    </p>
                    <p className="text-sm text-muted-foreground">Status</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Analytics;