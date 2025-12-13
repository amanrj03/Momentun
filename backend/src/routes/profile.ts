import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateToken, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  updateViewerProfileSchema,
  updateCreatorProfileSchema,
  updateAdminProfileSchema,
} from "../lib/validations";

const router = Router();

// ==========================================
// UPDATE VIEWER PROFILE
// ==========================================
router.put(
  "/viewer",
  authenticateToken,
  requireRole("VIEWER"),
  validate(updateViewerProfileSchema),
  async (req, res) => {
    try {
      const { full_name, display_name, country, interests, avatar_url } = req.body;

      const profile = await prisma.viewerProfile.update({
        where: { userId: req.user!.id },
        data: {
          full_name,
          display_name,
          country,
          interests,
          avatar_url,
        },
      });

      return res.json({
        success: true,
        data: profile,
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Update viewer profile error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update profile",
      });
    }
  }
);

// ==========================================
// UPDATE CREATOR PROFILE
// ==========================================
router.put(
  "/creator",
  authenticateToken,
  requireRole("CREATOR"),
  validate(updateCreatorProfileSchema),
  async (req, res) => {
    try {
      const {
        full_name,
        channel_name,
        bio,
        linkedin_url,
        youtube_url,
        website_url,
        country,
        avatar_url,
      } = req.body;

      const profile = await prisma.creatorProfile.update({
        where: { userId: req.user!.id },
        data: {
          full_name,
          channel_name,
          bio,
          linkedin_url,
          youtube_url,
          website_url,
          country,
          avatar_url,
        },
      });

      return res.json({
        success: true,
        data: profile,
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Update creator profile error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update profile",
      });
    }
  }
);

// ==========================================
// UPDATE ADMIN PROFILE
// ==========================================
router.put(
  "/admin",
  authenticateToken,
  requireRole("ADMIN"),
  validate(updateAdminProfileSchema),
  async (req, res) => {
    try {
      const { full_name, employee_id, department, phone_number, avatar_url } =
        req.body;

      const profile = await prisma.adminProfile.update({
        where: { userId: req.user!.id },
        data: {
          full_name,
          employee_id,
          department,
          phone_number,
          avatar_url,
        },
      });

      return res.json({
        success: true,
        data: profile,
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Update admin profile error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update profile",
      });
    }
  }
);

// ==========================================
// GET CREATOR PROFILE (Admin can view any)
// ==========================================
router.get(
  "/creator/:id",
  authenticateToken,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          creatorProfile: true,
          videos: {
            orderBy: { createdAt: "desc" },

          },
        },
      });

      if (!user || user.role !== "CREATOR") {
        return res.status(404).json({
          success: false,
          error: "Creator not found",
        });
      }

      // Calculate analytics
      const totalViews = user.videos.reduce((sum, v) => sum + v.views, 0);
      const approvedVideos = user.videos.filter(
        (v) => v.status === "APPROVED"
      ).length;
      const pendingVideos = user.videos.filter(
        (v) => v.status === "PENDING"
      ).length;
      const rejectedVideos = user.videos.filter(
        (v) => v.status === "REJECTED"
      ).length;

      return res.json({
        success: true,
        data: {
          profile: user.creatorProfile,
          videos: user.videos,
          analytics: {
            totalVideos: user.videos.length,
            totalViews,
            approvedVideos,
            pendingVideos,
            rejectedVideos,
          },
        },
      });
    } catch (error) {
      console.error("Get creator profile error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch creator profile",
      });
    }
  }
);

// ==========================================
// GET ALL CREATORS (Admin only)
// ==========================================
router.get(
  "/creators",
  authenticateToken,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const creators = await prisma.user.findMany({
        where: { role: "CREATOR" },
        include: {
          creatorProfile: true,
          _count: { select: { videos: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({
        success: true,
        data: creators.map((c) => ({
          id: c.id,
          email: c.email,
          profile: c.creatorProfile,
          videoCount: c._count.videos,
          createdAt: c.createdAt,
        })),
      });
    } catch (error) {
      console.error("Get all creators error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch creators",
      });
    }
  }
);

export default router;
