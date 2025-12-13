import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { VideoCard } from "@/components/video/VideoCard";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { Video } from "@/lib/types";
import { Heart, Sparkles } from "lucide-react";
import { useViewer } from "@/contexts/ViewerContext";

const LikedVideos = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { likedVideos } = useViewer();

  return (
    <div className="min-h-screen bg-background">
      <Header title="Liked Videos" />
      
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/5">
            <Heart className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Liked Videos</h1>
            <p className="text-muted-foreground">Videos you've liked • {likedVideos.length} videos</p>
          </div>
        </motion.div>

        {/* Content */}
        {likedVideos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center py-20 bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-xl font-display font-semibold text-foreground mb-2">No Liked Videos</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Videos you like will appear here. Start watching and liking videos to build your collection!
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {likedVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <VideoCard
                  video={video}
                  onClick={() => setSelectedVideo(video)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default LikedVideos;