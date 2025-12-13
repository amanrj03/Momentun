import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { 
  Loader2, 
  Sparkles, 
  Mail, 
  User, 
  MapPin, 
  Linkedin, 
  Youtube, 
  Globe, 
  Video, 
  Eye,
  Building,
  IdCard,
  Play,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ProfileContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <div>Please login to view your profile</div>;
  }

  const profile = user.profile as any;
  const initials = profile?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
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
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-32 h-32 ring-4 ring-primary/20 shadow-2xl">
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-4xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center md:text-left space-y-3 flex-1">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">My Profile</span>
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                {profile?.full_name || "User"}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 justify-center md:justify-start">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
              <Badge 
                className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm"
              >
                {user.role}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-secondary/30">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <span className="capitalize">{user.role.toLowerCase()} Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 p-4 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Full Name</span>
                  </div>
                  <p className="font-semibold text-foreground">{profile?.full_name || "Not set"}</p>
                </div>

                <div className="space-y-2 p-4 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Email</span>
                  </div>
                  <p className="font-semibold text-foreground">{user.email}</p>
                </div>
              </div>

              {/* Creator-specific fields */}
              {user.role === "CREATOR" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 p-4 bg-secondary/30 rounded-xl">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Play className="w-4 h-4" />
                        <span className="text-sm">Channel Name</span>
                      </div>
                      <p className="font-semibold text-foreground">{profile?.channel_name || "Not set"}</p>
                    </div>

                    <div className="space-y-2 p-4 bg-secondary/30 rounded-xl">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">Country</span>
                      </div>
                      <p className="font-semibold text-foreground">{profile?.country || "Not set"}</p>
                    </div>
                  </div>

                  <div className="space-y-2 p-4 bg-secondary/30 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-sm">Bio</span>
                    </div>
                    <p className="text-foreground">{profile?.bio || "Not set"}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 p-4 bg-secondary/30 rounded-xl">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Linkedin className="w-4 h-4" />
                        <span className="text-sm">LinkedIn</span>
                      </div>
                      {profile?.linkedin_url ? (
                        <a 
                          href={profile.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline truncate block"
                        >
                          View Profile
                        </a>
                      ) : (
                        <p className="text-muted-foreground text-sm">Not set</p>
                      )}
                    </div>

                    <div className="space-y-2 p-4 bg-secondary/30 rounded-xl">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Youtube className="w-4 h-4" />
                        <span className="text-sm">YouTube</span>
                      </div>
                      {profile?.youtube_url ? (
                        <a 
                          href={profile.youtube_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline truncate block"
                        >
                          View Channel
                        </a>
                      ) : (
                        <p className="text-muted-foreground text-sm">Not set</p>
                      )}
                    </div>

                    <div className="space-y-2 p-4 bg-secondary/30 rounded-xl">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="w-4 h-4" />
                        <span className="text-sm">Website</span>
                      </div>
                      {profile?.website_url ? (
                        <a 
                          href={profile.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline truncate block"
                        >
                          Visit Site
                        </a>
                      ) : (
                        <p className="text-muted-foreground text-sm">Not set</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 text-center">
                      <Video className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-3xl font-display font-bold text-foreground">{profile?.total_videos || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Videos</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl border border-accent/20 text-center">
                      <Eye className="w-8 h-8 text-accent mx-auto mb-2" />
                      <p className="text-3xl font-display font-bold text-foreground">{profile?.total_views || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                    </div>
                  </div>
                </>
              )}

              {/* Admin-specific fields */}
              {user.role === "ADMIN" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 p-4 bg-secondary/30 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IdCard className="w-4 h-4" />
                      <span className="text-sm">Employee ID</span>
                    </div>
                    <p className="font-semibold text-foreground">{profile?.employee_id || "Not set"}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-secondary/30 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="w-4 h-4" />
                      <span className="text-sm">Department</span>
                    </div>
                    <p className="font-semibold text-foreground">{profile?.department || "Not set"}</p>
                  </div>
                </div>
              )}

              {/* Viewer-specific fields */}
              {user.role === "VIEWER" && (
                <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 text-center max-w-sm mx-auto">
                  <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-display font-bold text-foreground">{profile?.watched_videos || 0}</p>
                  <p className="text-sm text-muted-foreground">Watched Videos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default function Profile() {
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
    return <ProfileContent />;
  }

  return (
    <DashboardLayout>
      <ProfileContent />
    </DashboardLayout>
  );
}