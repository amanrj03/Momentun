import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { userProfileSchema, creatorProfileSchema, adminProfileSchema, type UserProfile, type CreatorProfile, type AdminProfile } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "sonner";
import { User, Globe, FileText, Linkedin, Youtube, Globe2, Loader2, Save, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

interface ProfileSettingsProps {
  defaultValues?: Partial<UserProfile | CreatorProfile | AdminProfile>;
}

export const ProfileSettings = ({ defaultValues }: ProfileSettingsProps) => {
  const { user, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isCreator = user?.role === "CREATOR";
  const isAdmin = user?.role === "ADMIN";
  
  // Choose the appropriate schema based on user role
  const getSchema = () => {
    if (isCreator) return creatorProfileSchema;
    if (isAdmin) return adminProfileSchema;
    return userProfileSchema;
  };
  
  const form = useForm<UserProfile | CreatorProfile | AdminProfile>({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      full_name: "",
      avatar_url: "",
      ...(isCreator && {
        channel_name: "",
        bio: "",
        country: "",
        linkedin_url: "",
        youtube_url: "",
        website_url: "",
      }),
      ...(isAdmin && {
        employee_id: "",
        department: "",
        phone_number: "",
      }),
      ...(!isCreator && !isAdmin && {
        bio: "",
        country: "",
      }),
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Update form when user profile changes (e.g., after avatar upload)
  const currentProfile = user?.profile as any;
  const currentAvatarUrl = currentProfile?.avatar_url || "";
  
  // Update avatar_url in form when it changes in the user context
  React.useEffect(() => {
    if (currentAvatarUrl && currentAvatarUrl !== form.getValues("avatar_url")) {
      form.setValue("avatar_url", currentAvatarUrl);
    }
  }, [currentAvatarUrl, form]);

  const handleSubmit = async (data: UserProfile | CreatorProfile | AdminProfile) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Ensure we include the current avatar_url to prevent overwriting
      const currentProfile = user.profile as any;
      const profileData = {
        ...data,
        avatar_url: currentProfile?.avatar_url || data.avatar_url || "",
      };

      const response = await apiClient.updateProfile(profileData);
      
      if (response.success && response.data) {
        updateUser(response.data);
        toast.success("Profile updated successfully!");
      } else {
        toast.error("❌ Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("❌ Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = form.formState.isValid;
  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10">
          <User className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-display font-semibold text-lg">Edit Profile</h3>
      </div>
      
      {/* Avatar Upload Instructions */}
      <div className="bg-secondary/30 backdrop-blur-sm rounded-xl p-4 mb-6 border border-border/50">
        <h4 className="font-medium text-sm mb-2">Profile Picture</h4>
        <p className="text-xs text-muted-foreground mb-1">
          Click the camera icon on your avatar above to upload a new photo
        </p>
        <p className="text-xs text-muted-foreground">
          Supported formats: JPG, PNG, GIF (max 5MB)
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Hidden Avatar URL Field */}
          <FormField
            control={form.control}
            name="avatar_url"
            render={({ field }) => (
              <input type="hidden" {...field} />
            )}
          />
          
          {/* Full Name */}
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Full Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your full name (letters only)"
                    className="bg-secondary/50 border-border/50 focus:border-primary rounded-xl h-11"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Only letters and spaces allowed. No numbers or special characters.
                </FormDescription>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          {/* Country - Only show for viewers and creators */}
          {!isAdmin && (
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-accent" />
                    Country
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your country"
                      className="bg-secondary/50 border-border/50 focus:border-primary rounded-xl h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />
          )}

          {/* Bio - Only show for creators and admins */}
          {user?.role !== "VIEWER" && (
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Bio
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself..."
                      className="bg-secondary/50 border-border/50 focus:border-primary min-h-[100px] resize-none rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Maximum 500 characters
                  </FormDescription>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />
          )}

          {/* Admin-specific fields */}
          {isAdmin && (
            <div className="space-y-6 pt-4 border-t border-border/50">
              <h4 className="font-medium text-sm text-muted-foreground">Admin Information</h4>
              
              {/* Employee ID */}
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Employee ID
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your employee ID"
                        className="bg-secondary/50 border-border/50 focus:border-primary rounded-xl h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Your unique employee identifier (optional)
                    </FormDescription>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              {/* Department */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-accent" />
                      Department
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your department"
                        className="bg-secondary/50 border-border/50 focus:border-primary rounded-xl h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Your work department (optional)
                    </FormDescription>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your phone number"
                        className="bg-secondary/50 border-border/50 focus:border-primary rounded-xl h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Your contact phone number (optional)
                    </FormDescription>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Creator-specific fields */}
          {isCreator && (
            <div className="space-y-6 pt-4 border-t border-border/50">
              <h4 className="font-medium text-sm text-muted-foreground">Creator Information</h4>
              
              {/* Channel Name */}
              <FormField
                control={form.control}
                name="channel_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-accent" />
                      Channel Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your channel name"
                        className="bg-secondary/50 border-border/50 focus:border-primary rounded-xl h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Your unique channel name (letters, numbers, hyphens, underscores)
                    </FormDescription>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <h4 className="font-medium text-sm text-muted-foreground pt-2">Social Links</h4>
              
              {/* LinkedIn URL */}
              <FormField
                control={form.control}
                name="linkedin_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-[#0077B5]" />
                      LinkedIn Profile
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="bg-secondary/50 border-border/50 focus:border-primary rounded-xl h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Your LinkedIn profile URL (optional)
                    </FormDescription>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              {/* YouTube URL */}
              <FormField
                control={form.control}
                name="youtube_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-[#FF0000]" />
                      YouTube Channel
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://youtube.com/@yourchannel"
                        className="bg-secondary/50 border-border/50 focus:border-primary rounded-xl h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Your YouTube channel URL (optional)
                    </FormDescription>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              {/* Website URL */}
              <FormField
                control={form.control}
                name="website_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-accent" />
                      Website
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://yourwebsite.com"
                        className="bg-secondary/50 border-border/50 focus:border-primary rounded-xl h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Your personal or business website (optional)
                    </FormDescription>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => form.reset()}
              className="rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl"
              disabled={isSubmitting || hasErrors || !isFormValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};

export default ProfileSettings;