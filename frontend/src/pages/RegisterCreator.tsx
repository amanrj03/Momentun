import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Play, ArrowRight, Sparkles, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { apiClient } from "@/lib/api";
import { registerCreatorSchema, RegisterCreatorInput } from "@/lib/validations";

export default function RegisterCreator() {
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegisterCreatorInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<RegisterCreatorInput>({
    resolver: zodResolver(registerCreatorSchema),
    defaultValues: { 
      email: "", 
      password: "", 
      confirmPassword: "", 
      full_name: "", 
      channel_name: "", 
      bio: "", 
      website_url: "", 
      country: "" 
    },
  });

  const onSubmit = async (data: RegisterCreatorInput) => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.resendOtp({ 
        email: data.email, 
        role: "CREATOR" 
      });
      
      if (response.success) {
        setRegistrationData(data);
        setShowOtpVerification(true);
        toast({ 
          title: "OTP sent!", 
          description: `We've sent a verification code to ${data.email}` 
        });
      } else {
        toast({ 
          title: "Registration failed", 
          description: response.error || "Failed to send verification email", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Registration failed", 
        description: "Something went wrong. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromOtp = () => {
    setShowOtpVerification(false);
    setRegistrationData(null);
  };

  if (showOtpVerification && registrationData) {
    return (
      <OTPVerification
        email={registrationData.email}
        role="CREATOR"
        registrationData={registrationData}
        onBack={handleBackFromOtp}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
        
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="relative z-10 flex flex-col justify-center p-12 max-w-xl mx-auto">
          <Link to="/" className="flex items-center mb-12 group">
            <img 
              src="/fullLogo.png" 
              alt="Momentum" 
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Share Your
            <span className="gradient-text-accent block">Entrepreneurial Journey</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Join our community of successful founders sharing their stories, 
            insights, and lessons with the next generation of entrepreneurs.
          </p>

          <div className="flex flex-wrap gap-3">
            {["Upload Videos", "Build Audience", "Inspire Others"].map((feature) => (
              <div 
                key={feature}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm"
              >
                <Video className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          <Link to="/" className="flex items-center mb-8 lg:hidden group">
            <img 
              src="/fullLogo.png" 
              alt="Momentum" 
              className="h-8 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              Create Creator Account
            </h2>
            <p className="text-muted-foreground">
              Upload videos and share your entrepreneurial story
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="full_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Full Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Smith" 
                        className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary transition-all duration-300"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="channel_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Channel Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="My Channel" 
                        className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary transition-all duration-300"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Email *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="you@example.com" 
                      className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary transition-all duration-300"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about yourself and your entrepreneurial journey..." 
                      className="bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary transition-all duration-300 min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="country" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Country</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="United States" 
                      className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary transition-all duration-300"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary transition-all duration-300 pr-12"
                        {...field} 
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Confirm Password *</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary transition-all duration-300"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground rounded-xl font-semibold shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 group mt-2" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Create Creator Account
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </Form>
          
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}