import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { VideoCard } from "@/components/video/VideoCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Eye, 
  Video as VideoIcon, 
  Calendar,
  ExternalLink,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { Video, VideoStatus } from "@/lib/types";

interface CreatorData {
  id: string;
  email: string;
  role: string;
  profile: {
    full_name: string;
    bio?: string;
    country?: string;
    avatar_url?: string;
    channel_name?: string;
    linkedin_url?: string;
    youtube_url?: string;
    website_url?: string;
  };
  createdAt: string;
  totalViews: number;
  totalVideos: number;
}

const CreatorProfile = () => {
  const { creatorId } = useParams<{ creatorId: string }>();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);

  useEffect(() => {
    if (creatorId) {
      fetchCreatorData();
      fetchCreatorVideos();
    }
  }, [creatorId]);

  const fetchCreatorData = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCreatorProfile(creatorId!);
      
      if (response.success && response.data) {
        setCreator(response.data as CreatorData);
      } else {
        toast.error("Failed to load creator profile");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching creator data:", error);
      toast.error("Failed to load creator profile");
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCreatorVideos = async () => {
    try {
      setVideosLoading(true);
      const response = await apiClient.getCreatorVideos(creatorId!);
      
      if (response.success && response.data) {
        const data = response.data as { videos: Video[] };
        setVideos(data.videos || []);
      } else {
        console.error("Failed to load creator videos");
      }
    } catch (error) {
      console.error("Error fetching creator videos:", error);
    } finally {
      setVideosLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Creator Profile" />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen">
        <Header title="Creator Profile" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Creator not found</h2>
            <p className="text-muted-foreground mb-4">
              The creator profile you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Go Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const profile = creator.profile;
  const initials = profile.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "C";

  return (
    <div className="min-h-screen bg-background">
      <Header title="Creator Profile" />

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Creator Header */}
        <div className="bg-card rounded-xl border border-border p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Badge variant="secondary" className="mb-2">
                Creator
              </Badge>
            </div>

            {/* Creator Details */}
            <div className="flex-1">
              <div className="mb-4">
                <h1 className="font-display font-bold text-3xl mb-2">
                  {profile.channel_name || profile.full_name}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {profile.full_name}
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <VideoIcon className="w-5 h-5 text-primary" />
                  <span className="font-semibold">{creator.totalVideos}</span>
                  <span className="text-muted-foreground">Videos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  <span className="font-semibold">{formatViews(creator.totalViews)}</span>
                  <span className="text-muted-foreground">Total Views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">
                    Joined {formatDate(creator.createdAt)}
                  </span>
                </div>
                {profile.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">{profile.country}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {(profile.linkedin_url || profile.youtube_url || profile.website_url) && (
                <div className="flex flex-wrap gap-3">
                  {profile.linkedin_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(profile.linkedin_url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                  )}
                  {profile.youtube_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(profile.youtube_url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      YouTube
                    </Button>
                  )}
                  {profile.website_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(profile.website_url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Website
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="videos" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-display font-semibold text-xl mb-6">
                All Videos ({creator.totalVideos})
              </h2>
              
              {videosLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {videos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onClick={() => navigate(`/video/${video.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <VideoIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No videos yet</h3>
                  <p className="text-muted-foreground">
                    This creator hasn't uploaded any videos yet.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-display font-semibold text-xl mb-6">About</h2>
              
              <div className="space-y-6">
                {/* Bio */}
                {profile.bio && (
                  <div>
                    <h3 className="font-semibold mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Details */}
                <div>
                  <h3 className="font-semibold mb-3">Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Full Name</span>
                        <p className="font-medium">{profile.full_name}</p>
                      </div>
                      {profile.channel_name && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Channel Name</span>
                          <p className="font-medium">{profile.channel_name}</p>
                        </div>
                      )}
                      {profile.country && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Location</span>
                          <p className="font-medium">{profile.country}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Joined</span>
                        <p className="font-medium">{formatDate(creator.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Total Videos</span>
                        <p className="font-medium">{creator.totalVideos}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Total Views</span>
                        <p className="font-medium">{formatViews(creator.totalViews)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Links */}
                {(profile.linkedin_url || profile.youtube_url || profile.website_url) && (
                  <div>
                    <h3 className="font-semibold mb-3">Links</h3>
                    <div className="space-y-2">
                      {profile.linkedin_url && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-20">LinkedIn:</span>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-primary"
                            onClick={() => window.open(profile.linkedin_url, "_blank")}
                          >
                            {profile.linkedin_url}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      )}
                      {profile.youtube_url && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-20">YouTube:</span>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-primary"
                            onClick={() => window.open(profile.youtube_url, "_blank")}
                          >
                            {profile.youtube_url}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      )}
                      {profile.website_url && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-20">Website:</span>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-primary"
                            onClick={() => window.open(profile.website_url, "_blank")}
                          >
                            {profile.website_url}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorProfile;