import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { VideoCard } from "@/components/video/VideoCard";
import { History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useViewer } from "@/contexts/ViewerContext";

const WatchHistory = () => {
  const navigate = useNavigate();
  const { watchHistory, clearWatchHistory } = useViewer();

  return (
    <div className="min-h-screen bg-background">
      <Header title="Watch History" />
      
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5">
              <History className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Watch History</h1>
              <p className="text-muted-foreground">Videos you've watched recently • {watchHistory.length} videos</p>
            </div>
          </div>
          {watchHistory.length > 0 && (
            <Button 
              variant="outline" 
              onClick={clearWatchHistory}
              className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History
            </Button>
          )}
        </motion.div>

        {/* Content */}
        {watchHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center py-20 bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6">
              <History className="w-12 h-12 text-accent/70" />
            </div>
            <h3 className="text-xl font-display font-semibold text-foreground mb-2">No Watch History</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Videos you watch will appear here. Start exploring to build your watch history!
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {watchHistory.map((video, index) => (
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

export default WatchHistory;