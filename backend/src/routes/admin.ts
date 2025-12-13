import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateToken, requireRole } from "../middleware/auth";

const router = Router();

// ==========================================
// GET ALL USERS (Admin only)
// ==========================================
router.get("/users", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const { role, page = "1", limit = "50" } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          adminProfile: true,
          creatorProfile: true,
          viewerProfile: true,
          videos: {
            select: {
              id: true,
              views: true,
              likes_count: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Format users with profile data and statistics
    const formattedUsers = users.map((user) => {
      let profile = null;
      if (user.role === "ADMIN") profile = user.adminProfile;
      else if (user.role === "CREATOR") profile = user.creatorProfile;
      else if (user.role === "VIEWER") profile = user.viewerProfile;

      // Calculate total views and likes for creators
      const totalViews = user.videos.reduce((sum, video) => sum + (video.views || 0), 0);
      const totalLikes = user.videos.reduce((sum, video) => sum + (video.likes_count || 0), 0);

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        profile,
        totalViews: user.role === "CREATOR" ? totalViews : undefined,
        totalLikes: user.role === "CREATOR" ? totalLikes : undefined,
        totalVideos: user.role === "CREATOR" ? user.videos.length : undefined,
      };
    });

    return res.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          page: parseInt(page as string),
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching users",
    });
  }
});

export default router;