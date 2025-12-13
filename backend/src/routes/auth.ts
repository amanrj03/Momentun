import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { validate } from "../middleware/validation";
import {
  generateToken,
  setAuthCookie,
  clearAuthCookie,
  authenticateToken,
} from "../middleware/auth";
import {
  loginSchema,
  registerViewerSchema,
  registerCreatorSchema,

} from "../lib/validations";
import { generateOTP, storeOTP, verifyOTP, hasValidOTP } from "../lib/otp";
import { sendOtpEmail } from "../lib/email";

const router = Router();
router.post("/resend-otp", async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        error: "Email and role are required",
      });
    }

    if (!["VIEWER", "CREATOR"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Invalid role. Only VIEWER and CREATOR require OTP verification",
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "An account with this email already exists",
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(email, otp, role);

    // Send OTP email
    const emailSent = await sendOtpEmail(email, otp, role);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: "Failed to send verification email. Please try again.",
      });
    }

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send OTP",
    });
  }
});

// ==========================================
// VERIFY OTP AND CREATE ACCOUNT
// ==========================================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, role, registrationData } = req.body;

    if (!email || !otp || !role || !registrationData) {
      return res.status(400).json({
        success: false,
        error: "Email, OTP, role, and registration data are required",
      });
    }

    // Verify OTP
    const otpResult = verifyOTP(email, otp);
    if (!otpResult.valid) {
      return res.status(400).json({
        success: false,
        error: otpResult.error,
      });
    }

    // Check if email already exists (double-check)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "An account with this email already exists",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(registrationData.password, 12);

    let user;

    if (role === "VIEWER") {
      // Create viewer account
      user = await prisma.user.create({
        data: {
          email,
          password_hash,
          role: "VIEWER",
          viewerProfile: {
            create: {
              full_name: registrationData.full_name,
              country: registrationData.country,
            },
          },
        },
        include: { viewerProfile: true },
      });
    } else if (role === "CREATOR") {
      // Create creator account
      user = await prisma.user.create({
        data: {
          email,
          password_hash,
          role: "CREATOR",
          creatorProfile: {
            create: {
              full_name: registrationData.full_name,
              channel_name: registrationData.channel_name,
              bio: registrationData.bio,
              website_url: registrationData.website_url,
              country: registrationData.country,
            },
          },
        },
        include: { creatorProfile: true },
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid role",
      });
    }

    // Generate token and set cookie
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, token);

    // Determine which profile to return
    let profile = null;
    if (user.role === "VIEWER") profile = (user as any).viewerProfile;
    else if (user.role === "CREATOR") profile = (user as any).creatorProfile;

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile,
        },
      },
      message: "Account created and verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to verify OTP and create account",
    });
  }
});

// ==========================================
// LOGIN (Common for all user types)
// ==========================================
router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        adminProfile: true,
        creatorProfile: true,
        viewerProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Set HttpOnly cookie
    setAuthCookie(res, token);

    // Determine which profile to return
    let profile = null;
    if (user.role === "ADMIN") profile = user.adminProfile;
    else if (user.role === "CREATOR") profile = user.creatorProfile;
    else if (user.role === "VIEWER") profile = user.viewerProfile;

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile,
        },
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes("Can't reach database server")) {
      return res.status(503).json({
        success: false,
        error: "Database is currently unavailable. Please try again in a few moments.",
        details: "The database may be sleeping and needs to be activated."
      });
    }
    
    return res.status(500).json({
      success: false,
      error: "An error occurred during login",
    });
  }
});

// ==========================================
// REGISTER VIEWER
// ==========================================
router.post("/register/viewer", validate(registerViewerSchema), async (req, res) => {
  try {
    const { email, password, full_name, display_name, country } = req.body;

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "An account with this email already exists",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user with viewer profile
    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        role: "VIEWER",
        viewerProfile: {
          create: {
            full_name,
            display_name,
            country,
          },
        },
      },
      include: { viewerProfile: true },
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.viewerProfile,
        },
      },
      message: "Viewer account created successfully",
    });
  } catch (error) {
    console.error("Register viewer error:", error);
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes("Can't reach database server")) {
      return res.status(503).json({
        success: false,
        error: "Database is currently unavailable. Please try again in a few moments.",
        details: "The database may be sleeping and needs to be activated."
      });
    }
    
    return res.status(500).json({
      success: false,
      error: "An error occurred during registration",
    });
  }
});

// ==========================================
// REGISTER CREATOR
// ==========================================
router.post("/register/creator", validate(registerCreatorSchema), async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      channel_name,
      bio,
      linkedin_url,
      youtube_url,
      website_url,
      country,
    } = req.body;

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "An account with this email already exists",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user with creator profile
    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        role: "CREATOR",
        creatorProfile: {
          create: {
            full_name,
            channel_name,
            bio,
            linkedin_url,
            youtube_url,
            website_url,
            country,
          },
        },
      },
      include: { creatorProfile: true },
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.creatorProfile,
        },
      },
      message: "Creator account created successfully",
    });
  } catch (error) {
    console.error("Register creator error:", error);
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes("Can't reach database server")) {
      return res.status(503).json({
        success: false,
        error: "Database is currently unavailable. Please try again in a few moments.",
        details: "The database may be sleeping and needs to be activated."
      });
    }
    
    return res.status(500).json({
      success: false,
      error: "An error occurred during registration",
    });
  }
});



// ==========================================
// LOGOUT (Common for all user types)
// ==========================================
router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// ==========================================
// SEND PASSWORD CHANGE OTP
// ==========================================
router.post("/send-password-otp", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Generate and store OTP for password change
    const otp = generateOTP();
    storeOTP(user.email, otp, user.role as "VIEWER" | "CREATOR", { type: "password_change" });

    // Send OTP email
    const emailSent = await sendOtpEmail(user.email, otp, "Password Change");
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: "Failed to send verification email. Please try again.",
      });
    }

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send password OTP error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send OTP",
    });
  }
});

// ==========================================
// CHANGE PASSWORD WITH OTP
// ==========================================
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, otp } = req.body;

    if (!currentPassword || !newPassword || !otp) {
      return res.status(400).json({
        success: false,
        error: "Current password, new password, and OTP are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    // Verify OTP
    const otpResult = verifyOTP(user.email, otp);
    if (!otpResult.valid) {
      return res.status(400).json({
        success: false,
        error: otpResult.error,
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: newPasswordHash },
    });

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to change password",
    });
  }
});

// ==========================================
// FORGOT PASSWORD - SEND OTP
// ==========================================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No account found with this email address",
      });
    }

    // Generate and store OTP for password reset
    const otp = generateOTP();
    storeOTP(email, otp, user.role as "VIEWER" | "CREATOR", { type: "forgot_password" });

    // Send OTP email
    const emailSent = await sendOtpEmail(email, otp, "Password Reset");
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: "Failed to send verification email. Please try again.",
      });
    }

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send OTP",
    });
  }
});

// ==========================================
// VERIFY FORGOT PASSWORD OTP
// ==========================================
router.post("/verify-forgot-password", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: "Email and OTP are required",
      });
    }

    // Verify OTP
    const otpResult = verifyOTP(email, otp);
    if (!otpResult.valid) {
      return res.status(400).json({
        success: false,
        error: otpResult.error,
      });
    }

    // Store verified OTP for password reset (don't delete yet)
    storeOTP(email, otp, otpResult.data!.role, { 
      type: "forgot_password_verified",
      verified: true 
    });

    return res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify forgot password OTP error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to verify OTP",
    });
  }
});

// ==========================================
// RESET PASSWORD
// ==========================================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    if (!email || !newPassword || !otp) {
      return res.status(400).json({
        success: false,
        error: "Email, new password, and OTP are required",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Verify OTP one more time
    const otpResult = verifyOTP(email, otp);
    if (!otpResult.valid) {
      return res.status(400).json({
        success: false,
        error: otpResult.error,
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: newPasswordHash },
    });

    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to reset password",
    });
  }
});

// ==========================================
// GET CURRENT USER
// ==========================================
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        adminProfile: true,
        creatorProfile: true,
        viewerProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    let profile = null;
    if (user.role === "ADMIN") profile = user.adminProfile;
    else if (user.role === "CREATOR") profile = user.creatorProfile;
    else if (user.role === "VIEWER") profile = user.viewerProfile;

    return res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred",
    });
  }
});

// ==========================================
// UPDATE PROFILE
// ==========================================
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { full_name, bio, country, avatar_url, linkedin_url, youtube_url, website_url } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        adminProfile: true,
        creatorProfile: true,
        viewerProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Update the appropriate profile based on user role
    let updatedProfile = null;
    const updateData: any = {};
    
    if (full_name) updateData.full_name = full_name;
    if (country !== undefined) updateData.country = country || null;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url || null;
    
    // Only update bio for creators and admins (not viewers)
    if (user.role !== "VIEWER" && bio !== undefined) {
      updateData.bio = bio || null;
    }
    
    // Creator-specific fields
    if (user.role === "CREATOR") {
      if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url || null;
      if (youtube_url !== undefined) updateData.youtube_url = youtube_url || null;
      if (website_url !== undefined) updateData.website_url = website_url || null;
    }

    if (user.role === "ADMIN" && user.adminProfile) {
      updatedProfile = await prisma.adminProfile.update({
        where: { userId: userId },
        data: updateData,
      });
    } else if (user.role === "CREATOR" && user.creatorProfile) {
      updatedProfile = await prisma.creatorProfile.update({
        where: { userId: userId },
        data: updateData,
      });
    } else if (user.role === "VIEWER" && user.viewerProfile) {
      updatedProfile = await prisma.viewerProfile.update({
        where: { userId: userId },
        data: updateData,
      });
    }

    if (!updatedProfile) {
      return res.status(400).json({
        success: false,
        error: "Failed to update profile",
      });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: updatedProfile,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while updating profile",
    });
  }
});

export default router;
