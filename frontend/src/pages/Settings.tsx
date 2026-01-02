import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Pencil, Loader2, User, Shield, Camera, Sparkles, ArrowLeft } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

const SettingsContent = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return null;
  }

  const profile = user.profile as any;
  const initials = profile?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid File: Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File Too Large: Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadToCloudinary(file, "image", (progress) => {
        console.log(`Upload progress: ${progress.percentage}%`);
      });

      const response = await apiClient.updateProfile({
        avatar_url: result.secure_url,
      });

      if (response.success && response.data) {
        updateUser(response.data);
        toast.success("Avatar updated successfully!");
      } else {
        toast.error("Failed to update avatar");
      }
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast.error("Failed to upload avatar. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Settings" />

      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Back Button for Admin */}
        {user.role === "ADMIN" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </motion.div>
        )}
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 rounded-3xl border border-primary/20 p-8"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              <Avatar className="w-28 h-28 ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all shadow-2xl">
                <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-3xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 border-4 border-background"
                onClick={handleAvatarClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </Button>
            </div>
            <div className="text-center sm:text-left space-y-2">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Account Settings</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-foreground">
                {profile?.full_name || "User"}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge 
                className="mt-2 bg-primary/10 text-primary border-primary/20 px-3 py-1"
              >
                {user.role}
              </Badge>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </motion.div>

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-secondary/50 backdrop-blur-sm p-1.5 rounded-2xl border border-border/50 w-fit">
              <TabsTrigger 
                value="profile"
                className="rounded-xl px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className="rounded-xl px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
              >
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <ProfileSettings
                defaultValues={{
                  full_name: profile?.full_name || "",
                  avatar_url: profile?.avatar_url || "",
                  ...(user.role === "CREATOR" && {
                    channel_name: profile?.channel_name || "",
                    bio: profile?.bio || "",
                    country: profile?.country || "",
                    linkedin_url: profile?.linkedin_url || "",
                    youtube_url: profile?.youtube_url || "",
                    website_url: profile?.website_url || "",
                  }),
                  ...(user.role === "ADMIN" && {
                    employee_id: profile?.employee_id || "",
                    department: profile?.department || "",
                    phone_number: profile?.phone_number || "",
                  }),
                  ...(user.role === "VIEWER" && {
                    bio: profile?.bio || "",
                    country: profile?.country || "",
                  }),
                }}
              />
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <SecuritySettings />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

const Settings = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role === "ADMIN") {
    return <SettingsContent />;
  }

  return (
    <DashboardLayout>
      <SettingsContent />
    </DashboardLayout>
  );
};

export default Settings;