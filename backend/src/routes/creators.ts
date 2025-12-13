import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateToken } from "../middleware/auth";

const router = Router();
router.get("/:creatorId/profile", authenticateToken, async (req, res) => {
  try {
    const { creatorId } = req.params;
    const creator = await prisma.user.findUnique({
      where: { 
        id: creatorId,
        role: "CREATOR"
      },
      include: {
        creatorProfile: true,
        videos: {
          where: {
            status: "APPROVED"
          },
          select: {
            id: true,
            views: true
          }
        }
      },
    });

    if (!creator) {
      return res.status(404).json({
        success: false,
        error: "Creator not found",
      });
    }

    const totalViews = creator.videos.reduce((sum: number, video: any) => sum + (video.views || 0), 0);
    const totalVideos = creator.videos.length;

    // Format response
    const response = {
      id: creator.id,
      email: creator.email,
      role: creator.role,
      profile: creator.creatorProfile,
      createdAt: creator.createdAt,
      totalViews,
      totalVideos,
    };

    return res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Get creator profile error:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching creator profile",
    });
  }
});

// ==========================================
// GET CREATOR VIDEOS
// ==========================================
router.get("/:creatorId/videos", authenticateToken, async (req, res) => {
  try {
    const { creatorId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Verify creator exists
    const creator = await prisma.user.findUnique({
      where: { 
        id: creatorId,
        role: "CREATOR"
      },
    });

    if (!creator) {
      return res.status(404).json({
        success: false,
        error: "Creator not found",
      });
    }

    // Get creator's approved videos with pagination
    const videos = await prisma.video.findMany({
      where: {
        uploaderId: creatorId,
        status: "APPROVED",
      },
      include: {
        uploader: {
          include: {
            creatorProfile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.video.count({
      where: {
        uploaderId: creatorId,
        status: "APPROVED",
      },
    });

    // Format videos response
    const formattedVideos = videos.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url,
      duration: video.duration,
      likes_count: video.likes_count || 0,
      views: video.views || 0,
      status: video.status,
      createdAt: video.createdAt,
      uploader: {
        id: video.uploader.id,
        profile: {
          full_name: video.uploader.creatorProfile?.full_name || "Unknown Creator",
          channel_name: video.uploader.creatorProfile?.channel_name,
          avatar_url: video.uploader.creatorProfile?.avatar_url,
        },
      },
    }));

    return res.json({
      success: true,
      data: {
        videos: formattedVideos,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get creator videos error:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching creator videos",
    });
  }
});

export default router;