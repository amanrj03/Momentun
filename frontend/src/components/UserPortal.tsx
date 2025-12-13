import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VideoCard } from "@/components/video/VideoCard";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { SearchBar } from "@/components/video/SearchBar";
import { Header } from "@/components/layout/Header";
import { Video } from "@/lib/types";
import { apiClient } from "@/lib/api";
import { TrendingUp, Loader2, Video as VideoIcon } from "lucide-react";

const categories = ["All", "Technology", "Healthcare", "Finance", "Education", "E-commerce", "SaaS", "AI/ML", "Blockchain", "Other"];

export function UserPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalVideos, setTotalVideos] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchVideos = useCallback(async (page: number = 1, reset: boolean = false) => {
    console.log(`🎬 Fetching videos - Page: ${page}, Reset: ${reset}`);
    
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const response = await apiClient.getVideos({ 
        status: "APPROVED", 
        page, 
        limit: 8 
      });
      
      console.log(`📡 API Response:`, response);
      
      if (response.success && response.data) {
        const data = response.data as any;
        const newVideos = data.videos || [];
        const pagination = data.pagination || {};
        
        console.log(`📊 Pagination info:`, {
          newVideosCount: newVideos.length,
          currentPage: page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          hasMore: page < (pagination.totalPages || 1)
        });
        
        setVideos(prev => {
          const updated = reset ? newVideos : [...prev, ...newVideos];
          console.log(`📹 Videos updated: ${prev.length} -> ${updated.length}`);
          return updated;
        });
        setTotalVideos(pagination.total || 0);
        setHasMore(page < (pagination.totalPages || 1));
        setCurrentPage(page);
      } else {
        setError(response.error || "Failed to fetch videos");
      }
    } catch (err) {
      setError("Failed to load videos");
      console.error("Videos fetch error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    console.log('🎯 Initial load - fetching first page');
    fetchVideos(1, true);
  }, [fetchVideos]);

  // Load more videos when scrolling
  const loadMoreVideos = useCallback(() => {
    console.log(`🔄 Load more triggered:`, {
      loadingMore,
      hasMore,
      searchQuery,
      selectedCategory,
      currentPage
    });
    
    if (!loadingMore && hasMore && !searchQuery && selectedCategory === "All") {
      console.log(`✅ Loading page ${currentPage + 1}`);
      fetchVideos(currentPage + 1, false);
    } else {
      console.log(`❌ Load more blocked`);
    }
  }, [loadingMore, hasMore, searchQuery, selectedCategory, currentPage, fetchVideos]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Don't set up observer if conditions aren't met
    if (!hasMore || searchQuery || selectedCategory !== "All") {
      return;
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        console.log('🔍 Intersection detected:', entries[0].isIntersecting, 'Loading:', loadingMore);
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          console.log('🚀 Triggering load more from intersection');
          loadMoreVideos();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Trigger earlier
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, searchQuery, selectedCategory, loadMoreVideos]);

  // Separate effect to observe the element when it's available
  useEffect(() => {
    const currentLoadMoreRef = loadMoreRef.current;
    
    if (currentLoadMoreRef && observerRef.current && hasMore && !searchQuery && selectedCategory === "All") {
      console.log('👀 Starting to observe loadMoreRef element');
      observerRef.current.observe(currentLoadMoreRef);
      
      return () => {
        if (observerRef.current && currentLoadMoreRef) {
          observerRef.current.unobserve(currentLoadMoreRef);
        }
      };
    }
  }, [hasMore, searchQuery, selectedCategory, videos.length]); // Re-run when videos change

  // Fallback scroll listener in case intersection observer fails
  useEffect(() => {
    if (!hasMore || searchQuery || selectedCategory !== "All") {
      return;
    }

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Trigger when user is within 200px of bottom
      if (scrollTop + windowHeight >= documentHeight - 200) {
        if (!loadingMore && hasMore) {
          console.log('📜 Scroll fallback triggered');
          loadMoreVideos();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, searchQuery, selectedCategory, loadingMore, loadMoreVideos]);

  // Reset to first page when search changes
  useEffect(() => {
    if (searchQuery || selectedCategory !== "All") {
      // For search/filter, we'll use client-side filtering of loaded videos
      // In a real app, you might want to implement server-side search
      return;
    }
  }, [searchQuery, selectedCategory]);

  const filteredVideos = useMemo(() => {
    if (!searchQuery && selectedCategory === "All") {
      return videos; // Return all loaded videos for infinite scroll
    }
    
    return videos.filter((video) => {
      const matchesSearch =
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ((video.uploader as any)?.creatorProfile?.channel_name || (video.uploader as any)?.creatorProfile?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (video.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "All";

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, videos]);

  const trendingVideos = videos.slice(0, 4);

  if (loading && videos.length === 0) {
    return (
      <div className="min-h-screen">
        <Header title="Discover" />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <VideoIcon className="w-8 h-8 text-primary" />
            </div>
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-muted-foreground">Loading videos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header title="Discover" />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <VideoIcon className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-destructive font-medium mb-2">Error loading videos</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Discover" />

      {/* Search Section */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4">
        <SearchBar
          onSearch={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      <main className="p-6 space-y-10">
        {/* Trending Section - Only show if no search/filter and we have videos */}
        {!searchQuery && selectedCategory === "All" && trendingVideos.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Trending Now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VideoCard
                    video={video}
                    onClick={() => setSelectedVideo(video)}
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* All Videos */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/10 flex items-center justify-center">
                <VideoIcon className="w-5 h-5 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                {searchQuery || selectedCategory !== "All"
                  ? `Results (${filteredVideos.length})`
                  : "Browse All"}
              </h2>
            </div>
            {!searchQuery && selectedCategory === "All" && totalVideos > 0 && (
              <div className="text-sm text-muted-foreground">
                Showing {videos.length} of {totalVideos} videos
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <VideoCard
                    video={video}
                    onClick={() => setSelectedVideo(video)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Infinite Scroll Loading Trigger */}
          {!searchQuery && selectedCategory === "All" && hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-8 min-h-[100px] w-full">
              {loadingMore ? (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading more videos...</span>
                </div>
              ) : (
                <div className="h-4 w-full opacity-0">
                  {/* Invisible trigger area */}
                </div>
              )}
            </div>
          )}

          {/* No More Videos Message */}
          {!searchQuery && selectedCategory === "All" && !hasMore && videos.length > 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                You've reached the end! All {totalVideos} videos loaded.
              </p>
            </div>
          )}

          {/* No Videos Found */}
          {filteredVideos.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-6">
                <VideoIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                No videos found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {videos.length === 0 
                  ? "No approved videos available yet. Check back soon!" 
                  : "Try adjusting your search or filters to find what you're looking for."
                }
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}