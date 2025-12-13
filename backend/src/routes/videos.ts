import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateToken, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { createVideoSchema, updateVideoStatusSchema } from "../lib/validations";
import { generateUploadSignature, deleteFromCloudinary } from "../lib/cloudinary";

const router = Router();

// ==========================================
// GET CLOUDINARY UPLOAD SIGNATURE
// ==========================================
router.get(
  "/upload-signature",
  authenticateToken,
  async (req, res) => {
    try {
      const requestType = req.query.type as string;
      
      // For video uploads, require CREATOR role
      if (requestType === "video" && req.user?.role !== "CREATOR") {
        return res.status(403).json({
          success: false,
          error: "Only creators can upload videos",
        });
      }
      
      // Determine folder based on type
      let folder = "videos";
      if (requestType === "thumbnail") {
        folder = "thumbnails";
      } else if (requestType === "image") {
        folder = "avatars";
      }
      
      const signature = generateUploadSignature(folder);

      return res.json({
        success: true,
        data: signature,
      });
    } catch (error) {
      console.error("Error generating upload signature:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to generate upload signature",
      });
    }
  }
);

// ==========================================
// CREATE VIDEO (Creator only)
// ==========================================
router.post(
  "/",
  authenticateToken,
  requireRole("CREATOR"),
  validate(createVideoSchema),
  async (req, res) => {
    try {
      const {
        title,
        description,
        video_url,
        thumbnail_url,
        cloudinary_id,
        duration,
      } = req.body;

      const video = await prisma.video.create({
        data: {
          title,
          description,
          video_url,
          thumbnail_url,
          cloudinary_id,
          duration,
          uploaderId: req.user!.id,
          status: "PENDING", // All new videos start as pending
        },
        include: {
          uploader: {
            include: { creatorProfile: true },
          },
        },
      });

      // Update creator's total videos count
      await prisma.creatorProfile.update({
        where: { userId: req.user!.id },
        data: { total_videos: { increment: 1 } },
      });

      return res.status(201).json({
        success: true,
        data: video,
        message: "Video uploaded successfully. It will be reviewed by an admin.",
      });
    } catch (error) {
      console.error("Create video error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create video",
      });
    }
  }
);

// ==========================================
// GET ALL VIDEOS (Public - only approved)
// ==========================================
router.get("/public", async (req, res) => {
  try {
    const { page = "1", limit = "10", search } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = { status: "APPROVED" };
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }


    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          uploader: { include: { creatorProfile: true } },
        },
      }),
      prisma.video.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        videos,
        pagination: {
          page: parseInt(page as string),
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (error) {
    console.error("Get public videos error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch videos",
    });
  }
});

// ==========================================
// GET MY VIDEOS (Creator only)
// ==========================================
router.get(
  "/my-videos",
  authenticateToken,
  requireRole("CREATOR"),
  async (req, res) => {
    try {
      const { status, page = "1", limit = "10" } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const take = parseInt(limit as string);

      const where: any = { uploaderId: req.user!.id };
      if (status) where.status = status;

      const [videos, total] = await Promise.all([
        prisma.video.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },

        }),
        prisma.video.count({ where }),
      ]);

      return res.json({
        success: true,
        data: {
          videos,
          pagination: {
            page: parseInt(page as string),
            limit: take,
            total,
            totalPages: Math.ceil(total / take),
          },
        },
      });
    } catch (error) {
      console.error("Get my videos error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch videos",
      });
    }
  }
);

// ==========================================
// GET ALL VIDEOS FOR ADMIN REVIEW
// ==========================================
router.get(
  "/admin/all",
  authenticateToken,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { status, creatorId, page = "1", limit = "10" } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const take = parseInt(limit as string);

      const where: any = {};
      if (status) where.status = status;
      if (creatorId) where.uploaderId = creatorId;

      const [videos, total] = await Promise.all([
        prisma.video.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: {
            uploader: { include: { creatorProfile: true } },
          },
        }),
        prisma.video.count({ where }),
      ]);

      return res.json({
        success: true,
        data: {
          videos,
          pagination: {
            page: parseInt(page as string),
            limit: take,
            total,
            totalPages: Math.ceil(total / take),
          },
        },
      });
    } catch (error) {
      console.error("Admin get videos error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch videos",
      });
    }
  }
);

// ==========================================
// UPDATE VIDEO STATUS (Admin only)
// ==========================================
router.patch(
  "/:id/status",
  authenticateToken,
  requireRole("ADMIN"),
  validate(updateVideoStatusSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const video = await prisma.video.update({
        where: { id },
        data: { status },
        include: {
          uploader: { include: { creatorProfile: true } },
        },
      });

      return res.json({
        success: true,
        data: video,
        message: `Video status updated to ${status}`,
      });
    } catch (error) {
      console.error("Update video status error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update video status",
      });
    }
  }
);

// ==========================================
// DELETE VIDEO (Creator or Admin)
// ==========================================
router.delete(
  "/:id",
  authenticateToken,
  requireRole("CREATOR", "ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Get video to check ownership and get cloudinary_id
      const video = await prisma.video.findUnique({ where: { id } });

      if (!video) {
        return res.status(404).json({
          success: false,
          error: "Video not found",
        });
      }

      // Check if user is owner or admin
      if (req.user!.role !== "ADMIN" && video.uploaderId !== req.user!.id) {
        return res.status(403).json({
          success: false,
          error: "You can only delete your own videos",
        });
      }

      // Delete from Cloudinary if we have the ID
      if (video.cloudinary_id) {
        await deleteFromCloudinary(video.cloudinary_id, "video");
      }

      // Delete from database
      await prisma.video.delete({ where: { id } });

      // Update creator's total videos count
      await prisma.creatorProfile.update({
        where: { userId: video.uploaderId },
        data: { total_videos: { decrement: 1 } },
      });

      return res.json({
        success: true,
        message: "Video deleted successfully",
      });
    } catch (error) {
      console.error("Delete video error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete video",
      });
    }
  }
);

// ==========================================
// INCREMENT VIDEO VIEWS
// ==========================================
router.post("/:id/view", async (req, res) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Also update creator's total views
    await prisma.creatorProfile.update({
      where: { userId: video.uploaderId },
      data: { total_views: { increment: 1 } },
    });

    return res.json({
      success: true,
      data: { views: video.views },
    });
  } catch (error) {
    console.error("Increment views error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update views",
    });
  }
});

export default router;
