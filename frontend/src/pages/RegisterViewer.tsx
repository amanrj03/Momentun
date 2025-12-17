import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Play, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { apiClient } from "@/lib/api";
import { registerViewerSchema, RegisterViewerInput } from "@/lib/validations";

export default function RegisterViewer() {
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegisterViewerInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<RegisterViewerInput>({
    resolver: zodResolver(registerViewerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", full_name: "", country: "" },
  });

  const onSubmit = async (data: RegisterViewerInput) => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.resendOtp({ 
        email: data.email, 
        role: "VIEWER" 
      });
      
      if (response.success) {
        setRegistrationData(data);
        setShowOtpVerification(true);
        toast.success(`✅ OTP sent! We've sent a verification code to ${data.email}`);
      } else {
        toast.error(`❌ Registration failed: ${response.error || "Failed to send verification email"}`);
      }
    } catch (error) {
      toast.error("❌ Registration failed: Something went wrong. Please try again.");
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
        role="VIEWER"
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
        
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
            Start Your
            <span className="gradient-text block">Learning Journey</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Get unlimited access to premium video content from successful entrepreneurs 
            and accelerate your growth.
          </p>

          <div className="flex flex-wrap gap-3">
            {["Unlimited Access", "Save Favorites", "Track Progress"].map((feature) => (
              <div 
                key={feature}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center mb-8 lg:hidden group">
            <img 
              src="/fullLogo.png" 
              alt="Momentum" 
              className="h-8 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              Create Viewer Account
            </h2>
            <p className="text-muted-foreground">
              Browse and watch entrepreneur videos
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl font-semibold shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 group mt-2" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Create Account
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