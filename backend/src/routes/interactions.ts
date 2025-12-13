import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateToken, requireRole } from "../middleware/auth";

const router = Router();

// ==========================================
// LIKE VIDEO
// ==========================================
router.post(
  "/videos/:videoId/like",
  authenticateToken,
  requireRole("VIEWER"),
  async (req, res) => {
    try {
      const { videoId } = req.params;
      const userId = req.user!.id;

      // Check if video exists and is approved
      const video = await prisma.video.findFirst({
        where: { 
          id: videoId,
          status: "APPROVED"
        }
      });

      if (!video) {
        return res.status(404).json({
          success: false,
          error: "Video not found or not approved",
        });
      }

      // Check if already liked
      const existingLike = await prisma.videoLike.findUnique({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
      });

      if (existingLike) {
        // Unlike - remove like and decrement count
        await prisma.$transaction([
          prisma.videoLike.delete({
            where: { id: existingLike.id },
          }),
          prisma.video.update({
            where: { id: videoId },
            data: { likes_count: { decrement: 1 } },
          }),
        ]);

        return res.json({
          success: true,
          data: { liked: false, message: "Video unliked" },
        });
      } else {
        // Like - add like and increment count
        await prisma.$transaction([
          prisma.videoLike.create({
            data: { userId, videoId },
          }),
          prisma.video.update({
            where: { id: videoId },
            data: { likes_count: { increment: 1 } },
          }),
        ]);

        return res.json({
          success: true,
          data: { liked: true, message: "Video liked" },
        });
      }
    } catch (error) {
      console.error("Like video error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to like/unlike video",
      });
    }
  }
);

// ==========================================
// SAVE VIDEO
// ==========================================
router.post(
  "/videos/:videoId/save",
  authenticateToken,
  requireRole("VIEWER"),
  async (req, res) => {
    try {
      const { videoId } = req.params;
      const userId = req.user!.id;

      // Check if video exists and is approved
      const video = await prisma.video.findFirst({
        where: { 
          id: videoId,
          status: "APPROVED"
        }
      });

      if (!video) {
        return res.status(404).json({
          success: false,
          error: "Video not found or not approved",
        });
      }

      // Check if already saved
      const existingSave = await prisma.videoSave.findUnique({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
      });

      if (existingSave) {
        // Unsave
        await prisma.videoSave.delete({
          where: { id: existingSave.id },
        });

        return res.json({
          success: true,
          data: { saved: false, message: "Video removed from saved" },
        });
      } else {
        // Save
        await prisma.videoSave.create({
          data: { userId, videoId },
        });

        return res.json({
          success: true,
          data: { saved: true, message: "Video saved" },
        });
      }
    } catch (error) {
      console.error("Save video error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to save/unsave video",
      });
    }
  }
);

// ==========================================
// ADD TO WATCH HISTORY
// ==========================================
router.post(
  "/videos/:videoId/watch",
  authenticateToken,
  requireRole("VIEWER"),
  async (req, res) => {
    try {
      const { videoId } = req.params;
      const userId = req.user!.id;
      const { progress = 0, completed = false } = req.body;

      // Check if video exists and is approved
      const video = await prisma.video.findFirst({
        where: { 
          id: videoId,
          status: "APPROVED"
        }
      });

      if (!video) {
        return res.status(404).json({
          success: false,
          error: "Video not found or not approved",
        });
      }

      // Upsert watch history (update if exists, create if not)
      await prisma.watchHistory.upsert({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
        update: {
          watchedAt: new Date(),
          progress,
          completed,
        },
        create: {
          userId,
          videoId,
          progress,
          completed,
        },
      });

      // Increment view count only if this is the first time watching
      const isFirstWatch = await prisma.watchHistory.count({
        where: { userId, videoId },
      }) === 1;

      if (isFirstWatch) {
        await prisma.video.update({
          where: { id: videoId },
          data: { views: { increment: 1 } },
        });
      }

      return res.json({
        success: true,
        data: { message: "Watch history updated" },
      });
    } catch (error) {
      console.error("Watch history error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update watch history",
      });
    }
  }
);

// ==========================================
// GET USER'S LIKED VIDEOS
// ==========================================
router.get(
  "/liked-videos",
  authenticateToken,
  requireRole("VIEWER"),
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const likedVideos = await prisma.videoLike.findMany({
        where: { userId },
        include: {
          video: {
            include: {
              uploader: {
                include: {
                  creatorProfile: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });

      const total = await prisma.videoLike.count({
        where: { userId },
      });

      return res.json({
        success: true,
        data: {
          videos: likedVideos.map(like => like.video),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get liked videos error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch liked videos",
      });
    }
  }
);

// ==========================================
// GET USER'S SAVED VIDEOS
// ==========================================
router.get(
  "/saved-videos",
  authenticateToken,
  requireRole("VIEWER"),
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const savedVideos = await prisma.videoSave.findMany({
        where: { userId },
        include: {
          video: {
            include: {
              uploader: {
                include: {
                  creatorProfile: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });

      const total = await prisma.videoSave.count({
        where: { userId },
      });

      return res.json({
        success: true,
        data: {
          videos: savedVideos.map(save => save.video),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get saved videos error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch saved videos",
      });
    }
  }
);

// ==========================================
// GET USER'S WATCH HISTORY
// ==========================================
router.get(
  "/watch-history",
  authenticateToken,
  requireRole("VIEWER"),
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const watchHistory = await prisma.watchHistory.findMany({
        where: { userId },
        include: {
          video: {
            include: {
              uploader: {
                include: {
                  creatorProfile: true,
                },
              },
            },
          },
        },
        orderBy: { watchedAt: "desc" },
        skip,
        take: limit,
      });

      const total = await prisma.watchHistory.count({
        where: { userId },
      });

      return res.json({
        success: true,
        data: {
          videos: watchHistory.map(history => ({
            ...history.video,
            watchedAt: history.watchedAt,
            progress: history.progress,
            completed: history.completed,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get watch history error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch watch history",
      });
    }
  }
);

// ==========================================
// CLEAR WATCH HISTORY
// ==========================================
router.delete(
  "/watch-history",
  authenticateToken,
  requireRole("VIEWER"),
  async (req, res) => {
    try {
      const userId = req.user!.id;

      await prisma.watchHistory.deleteMany({
        where: { userId },
      });

      return res.json({
        success: true,
        data: { message: "Watch history cleared" },
      });
    } catch (error) {
      console.error("Clear watch history error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to clear watch history",
      });
    }
  }
);

// ==========================================
// GET VIDEO INTERACTION STATUS
// ==========================================
router.get(
  "/videos/:videoId/status",
  authenticateToken,
  requireRole("VIEWER"),
  async (req, res) => {
    try {
      const { videoId } = req.params;
      const userId = req.user!.id;

      const [liked, saved] = await Promise.all([
        prisma.videoLike.findUnique({
          where: {
            userId_videoId: { userId, videoId },
          },
        }),
        prisma.videoSave.findUnique({
          where: {
            userId_videoId: { userId, videoId },
          },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          liked: !!liked,
          saved: !!saved,
        },
      });
    } catch (error) {
      console.error("Get video status error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to get video status",
      });
    }
  }
);

export default router;