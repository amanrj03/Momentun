import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { VideoCard } from "@/components/video/VideoCard";
import { Bookmark } from "lucide-react";
import { useViewer } from "@/contexts/ViewerContext";

const SavedVideos = () => {
  const navigate = useNavigate();
  const { savedVideos } = useViewer();

  return (
    <div className="min-h-screen bg-background">
      <Header title="Saved Videos" />
      
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Bookmark className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Saved Videos</h1>
            <p className="text-muted-foreground">Videos you've saved for later • {savedVideos.length} videos</p>
          </div>
        </motion.div>

        {/* Content */}
        {savedVideos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center py-20 bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
              <Bookmark className="w-12 h-12 text-primary/70" />
            </div>
            <h3 className="text-xl font-display font-semibold text-foreground mb-2">No Saved Videos</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Videos you save will appear here. Save videos to watch them later!
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {savedVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <VideoCard
                  video={video}
                  onClick={() => navigate(`/video/${video.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>


    </div>
  );
};

export default SavedVideos;