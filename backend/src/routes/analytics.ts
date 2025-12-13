import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateToken, requireRole } from "../middleware/auth";

const router = Router();

// ==========================================
// GET CREATOR ANALYTICS
// ==========================================
router.get(
  "/creator",
  authenticateToken,
  requireRole("CREATOR"),
  async (req, res) => {
    try {
      const userId = req.user!.id;

      // Get creator's videos with stats
      const videos = await prisma.video.findMany({
        where: { uploaderId: userId },

        orderBy: { createdAt: "desc" },
      });

      // Calculate total stats
      const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
      const totalLikes = videos.reduce((sum, video) => sum + video.likes_count, 0);
      const totalVideos = videos.length;
      const publishedVideos = videos.filter(v => v.status === "APPROVED").length;
      const pendingVideos = videos.filter(v => v.status === "PENDING").length;
      const rejectedVideos = videos.filter(v => v.status === "REJECTED").length;

      // Calculate this month's views
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const lastMonth = new Date(thisMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const thisMonthVideos = videos.filter(v => new Date(v.createdAt) >= thisMonth);
      const lastMonthVideos = videos.filter(v => 
        new Date(v.createdAt) >= lastMonth && new Date(v.createdAt) < thisMonth
      );

      const viewsThisMonth = thisMonthVideos.reduce((sum, video) => sum + video.views, 0);
      const viewsLastMonth = lastMonthVideos.reduce((sum, video) => sum + video.views, 0);
      const likesThisMonth = thisMonthVideos.reduce((sum, video) => sum + video.likes_count, 0);
      const likesLastMonth = lastMonthVideos.reduce((sum, video) => sum + video.likes_count, 0);

      // Find top performing video
      const topVideo = videos.length > 0 
        ? videos.reduce((max, video) => video.views > max.views ? video : max)
        : null;

      // Generate views and likes by day for the last 7 days
      const chartData = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = days[date.getDay()];
        
        // For demo purposes, generate some sample data based on actual stats
        // In a real app, you'd track daily view/like counts in the database
        const dayViews = Math.floor((totalViews / 30) * (0.5 + Math.random()));
        const dayLikes = Math.floor((totalLikes / 30) * (0.5 + Math.random()));
        
        chartData.push({
          date: dayName,
          views: dayViews,
          likes: dayLikes,
        });
      }

      // Get top 5 videos by views
      const topVideos = [...videos]
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map(video => ({
          id: video.id,
          title: video.title,
          views: video.views,
          likes_count: video.likes_count,
          status: video.status,
          createdAt: video.createdAt,
        }));

      // Get top 5 videos by likes
      const topLikedVideos = [...videos]
        .sort((a, b) => b.likes_count - a.likes_count)
        .slice(0, 5)
        .map(video => ({
          id: video.id,
          title: video.title,
          views: video.views,
          likes_count: video.likes_count,
          status: video.status,
          createdAt: video.createdAt,
        }));

      return res.json({
        success: true,
        data: {
          totalViews,
          totalLikes,
          totalVideos,
          publishedVideos,
          pendingVideos,
          rejectedVideos,
          viewsThisMonth,
          viewsLastMonth,
          likesThisMonth,
          likesLastMonth,
          topVideo,
          chartData,
          topVideos,
          topLikedVideos,
          videos: videos.map(video => ({
            id: video.id,
            title: video.title,
            views: video.views,
            likes_count: video.likes_count,
            status: video.status,
            createdAt: video.createdAt,

          })),
        },
      });
    } catch (error) {
      console.error("Get creator analytics error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch analytics",
      });
    }
  }
);

// ==========================================
// GET ADMIN ANALYTICS
// ==========================================
router.get(
  "/admin",
  authenticateToken,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      // Get all platform stats
      const [
        totalUsers,
        totalVideos,
        totalViews,
        pendingVideos,
        approvedVideos,
        rejectedVideos,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.video.count(),
        prisma.video.aggregate({ _sum: { views: true } }),
        prisma.video.count({ where: { status: "PENDING" } }),
        prisma.video.count({ where: { status: "APPROVED" } }),
        prisma.video.count({ where: { status: "REJECTED" } }),
      ]);

      // Get user growth by role
      const usersByRole = await prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      });

      // Get recent videos for admin review
      const recentVideos = await prisma.video.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          uploader: { include: { creatorProfile: true } },
        },
      });

      return res.json({
        success: true,
        data: {
          totalUsers,
          totalVideos,
          totalViews: totalViews._sum.views || 0,
          pendingVideos,
          approvedVideos,
          rejectedVideos,
          usersByRole,
          recentVideos,
        },
      });
    } catch (error) {
      console.error("Get admin analytics error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch admin analytics",
      });
    }
  }
);

// ==========================================
// GET VIEWER ANALYTICS
// ==========================================
router.get(
  "/viewer",
  authenticateToken,
  requireRole("VIEWER"),
  async (req, res) => {
    try {
      const userId = req.user!.id;

      // Get viewer profile
      const viewerProfile = await prisma.viewerProfile.findUnique({
        where: { userId },
      });

      // Get popular videos (top viewed approved videos)
      const popularVideos = await prisma.video.findMany({
        where: { status: "APPROVED" },
        take: 10,
        orderBy: { views: "desc" },
        include: {
          uploader: { include: { creatorProfile: true } },
        },
      });

      // Get recent approved videos
      const recentVideos = await prisma.video.findMany({
        where: { status: "APPROVED" },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          uploader: { include: { creatorProfile: true } },
        },
      });

      return res.json({
        success: true,
        data: {
          watchedVideos: viewerProfile?.watched_videos || 0,
          popularVideos,
          recentVideos,
        },
      });
    } catch (error) {
      console.error("Get viewer analytics error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch viewer analytics",
      });
    }
  }
);

export default router;