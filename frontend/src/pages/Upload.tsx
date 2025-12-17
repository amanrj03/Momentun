import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { uploadToCloudinary, formatFileSize } from "@/lib/cloudinary";
import { UploadProgress } from "@/lib/types";
import { apiClient } from "@/lib/api";
import { 
  Upload as UploadIcon, 
  Video as VideoIcon, 
  Image, 
  FileText, 
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  CloudUpload
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const uploadFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must be less than 200 characters"),
  description: z.string().max(5000, "Description must be less than 5000 characters").optional().or(z.literal("")),
});

type UploadFormData = z.infer<typeof uploadFormSchema>;

const Upload = () => {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoProgress, setVideoProgress] = useState<UploadProgress | null>(null);
  const [thumbnailProgress, setThumbnailProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = "Upload in progress. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUploading]);

  const handleNavigation = useCallback((path: string) => {
    if (isUploading) {
      setPendingNavigation(path);
      setShowLeaveWarning(true);
    } else {
      navigate(path);
    }
  }, [isUploading, navigate]);

  const handleConfirmLeave = () => {
    setShowLeaveWarning(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast.error("❌ Invalid File: Please select a valid video file");
        return;
      }
      if (file.size > 500 * 1024 * 1024) {
        toast.error("❌ File Too Large: Video file size must be less than 500MB");
        return;
      }
      setVideoFile(file);
      setVideoProgress(null);
      toast.success("✅ Video file selected successfully");
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("❌ Invalid File: Please select a valid image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("❌ File Too Large: Thumbnail file size must be less than 10MB");
        return;
      }
      setThumbnailFile(file);
      setThumbnailProgress(null);
      toast.success("✅ Thumbnail selected successfully");
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoProgress(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailProgress(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleSubmit = async (data: UploadFormData) => {
    if (!videoFile) {
      toast.error("Please select a video file");
      return;
    }

    setIsUploading(true);
    
    // Show warning toast
    toast.warning("⚠️ Upload in progress! Please don't leave this page until the upload is complete.", {
      duration: 5000,
    });

    try {
      const videoResult = await uploadToCloudinary(videoFile, "video", setVideoProgress);

      let thumbnailResult = null;
      if (thumbnailFile) {
        thumbnailResult = await uploadToCloudinary(thumbnailFile, "image", setThumbnailProgress);
      }

      const videoData = {
        title: data.title,
        description: data.description || "",
        video_url: videoResult.secure_url,
        thumbnail_url: thumbnailResult?.secure_url || "",
        cloudinary_id: videoResult.public_id,
        duration: videoResult.duration,
      };

      const saveResponse = await apiClient.createVideo(videoData);
      
      if (saveResponse.success) {
        toast.success("✅ Video uploaded successfully! It's now pending review.");
        navigate("/dashboard");
      } else {
        throw new Error(saveResponse.error || "Failed to save video");
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload video. Please try again.";
      toast.error(`❌ Upload Failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid = form.formState.isValid && videoFile !== null;

  return (
    <>
      <Header title="Upload Video" />

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 p-8 my-8"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10">
              <CloudUpload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">Upload New Video</h2>
              <p className="text-muted-foreground text-sm">Share your content with the world</p>
            </div>
          </div>

          {/* Upload Warning */}
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center gap-3"
            >
              <div className="p-2 rounded-xl bg-yellow-500/20">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="font-medium text-yellow-600 dark:text-yellow-500">Upload in progress</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">Please don't leave this page until the upload is complete.</p>
              </div>
            </motion.div>
          )}

          {/* Video Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
              <VideoIcon className="w-4 h-4 text-primary" />
              Video File <span className="text-destructive">*</span>
            </label>
            
            {!videoFile ? (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="border-2 border-dashed border-border/50 rounded-2xl p-10 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                onClick={() => videoInputRef.current?.click()}
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mx-auto mb-4">
                  <UploadIcon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">
                  Upload your video
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Click to select or drag and drop your video file here
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: MP4, WebM, MOV (Max 500MB)
                </p>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoSelect}
                />
              </motion.div>
            ) : (
              <div className="border border-border/50 rounded-2xl p-5 bg-secondary/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                      <VideoIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm truncate max-w-[300px]">{videoFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(videoFile.size)}</p>
                    </div>
                  </div>
                  {!isUploading && (
                    <Button variant="ghost" size="icon" onClick={removeVideo} className="rounded-xl hover:bg-destructive/10 hover:text-destructive">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {videoProgress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uploading video...</span>
                      <span className="font-medium text-primary">{videoProgress.percentage}%</span>
                    </div>
                    <Progress value={videoProgress.percentage} className="h-2" />
                    {videoProgress.percentage === 100 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-sm text-success"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Upload complete!</span>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Thumbnail Upload Area */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
              <Image className="w-4 h-4 text-accent" />
              Thumbnail <span className="text-muted-foreground text-xs">(Optional)</span>
            </label>
            
            {!thumbnailFile ? (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="border-2 border-dashed border-border/50 rounded-2xl p-8 text-center hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer"
                onClick={() => thumbnailInputRef.current?.click()}
              >
                <div className="w-14 h-14 rounded-xl bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                  <Image className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload a thumbnail
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or WebP (Max 10MB)
                </p>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailSelect}
                />
              </motion.div>
            ) : (
              <div className="border border-border/50 rounded-2xl p-5 bg-secondary/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden">
                      <img 
                        src={URL.createObjectURL(thumbnailFile)} 
                        alt="Thumbnail preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm truncate max-w-[300px]">{thumbnailFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(thumbnailFile.size)}</p>
                    </div>
                  </div>
                  {!isUploading && (
                    <Button variant="ghost" size="icon" onClick={removeThumbnail} className="rounded-xl hover:bg-destructive/10 hover:text-destructive">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {thumbnailProgress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uploading thumbnail...</span>
                      <span className="font-medium text-accent">{thumbnailProgress.percentage}%</span>
                    </div>
                    <Progress value={thumbnailProgress.percentage} className="h-2" />
                    {thumbnailProgress.percentage === 100 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-sm text-success"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Upload complete!</span>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Title <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter video title"
                        className="bg-secondary/50 border-border/50 focus:border-primary rounded-xl h-12"
                        disabled={isUploading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent" />
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your video..."
                        className="bg-secondary/50 border-border/50 focus:border-primary min-h-[120px] resize-none rounded-xl"
                        disabled={isUploading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-muted-foreground text-xs">Maximum 5000 characters</FormDescription>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleNavigation("/content")}
                  disabled={isUploading}
                  className="rounded-xl px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl px-6"
                  disabled={!isFormValid || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="w-4 h-4 mr-2" />
                      Upload Video
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>

      {/* Leave Warning Dialog */}
      <AlertDialog open={showLeaveWarning} onOpenChange={setShowLeaveWarning}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave page?</AlertDialogTitle>
            <AlertDialogDescription>
              Your upload is still in progress. Leaving now will cancel the upload and you'll lose your progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Stay</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLeave} className="rounded-xl bg-destructive hover:bg-destructive/90">
              Leave anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Upload;