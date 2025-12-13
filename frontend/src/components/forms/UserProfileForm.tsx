import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userProfileSchema, type UserProfile } from "@/lib/validations";
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
import { User, Globe, FileText, Image } from "lucide-react";

interface UserProfileFormProps {
  onSubmit?: (data: UserProfile) => void;
  defaultValues?: Partial<UserProfile>;
  isLoading?: boolean;
}

export const UserProfileForm = ({
  onSubmit,
  defaultValues,
  isLoading,
}: UserProfileFormProps) => {
  const form = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      full_name: "",
      bio: "",
      country: "",
      avatar_url: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const handleSubmit = (data: UserProfile) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      toast.success("Profile updated successfully!");
      console.log("Form submitted:", data);
    }
  };

  const isFormValid = form.formState.isValid;
  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Full Name */}
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your full name (letters only)"
                  className="bg-secondary border-border focus:border-primary"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Only letters and spaces allowed. No numbers or special characters.
              </FormDescription>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        {/* Country */}
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Country
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Your country"
                  className="bg-secondary border-border focus:border-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        {/* Bio */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Bio
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself..."
                  className="bg-secondary border-border focus:border-primary min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Maximum 500 characters
              </FormDescription>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        {/* Avatar URL */}
        <FormField
          control={form.control}
          name="avatar_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Avatar URL
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  className="bg-secondary border-border focus:border-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button
            type="submit"
            className="gradient-primary"
            disabled={isLoading || hasErrors || !isFormValid}
          >
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserProfileForm;
