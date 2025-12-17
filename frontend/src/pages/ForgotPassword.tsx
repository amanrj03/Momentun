import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Loader2, Mail, KeyRound, ArrowLeft, Eye, EyeOff, Play, ArrowRight, Shield } from "lucide-react";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmailInput = z.infer<typeof emailSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
type Step = "email" | "otp" | "password";

export default function ForgotPassword() {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  const emailForm = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async (data: EmailInput) => {
    setIsLoading(true);

    try {
      const response = await apiClient.sendForgotPasswordOtp({ email: data.email });

      if (response.success) {
        setEmail(data.email);
        setCurrentStep("otp");
        setTimeLeft(300);
        toast.success(`✅ OTP sent! We've sent a verification code to ${data.email}`);
      } else {
        toast.error(`❌ Failed to send OTP: ${response.error || "Please check your email and try again."}`);
      }
    } catch (error) {
      toast.error("❌ Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`forgot-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`forgot-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    const nextIndex = Math.min(pastedData.length, 5);
    const nextInput = document.getElementById(`forgot-otp-${nextIndex}`);
    nextInput?.focus();
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      toast.error("❌ Invalid OTP: Please enter all 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.verifyForgotPasswordOtp({
        email,
        otp: otpCode,
      });

      if (response.success) {
        setCurrentStep("password");
        toast.success("✅ OTP verified! Now you can set a new password.");
      } else {
        toast.error(`❌ Verification failed: ${response.error || "Invalid OTP. Please try again."}`);
        setOtp(["", "", "", "", "", ""]);
        const firstInput = document.getElementById("forgot-otp-0");
        firstInput?.focus();
      }
    } catch (error) {
      toast.error("❌ Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordInput) => {
    setIsLoading(true);

    try {
      const response = await apiClient.resetPassword({
        email,
        newPassword: data.newPassword,
        otp: otp.join(""),
      });

      if (response.success) {
        toast.success("✅ Password reset successful! You can now sign in with your new password.");
        navigate("/login");
      } else {
        toast.error(`❌ Password reset failed: ${response.error || "Please try again."}`);
      }
    } catch (error) {
      toast.error("❌ Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);

    try {
      const response = await apiClient.sendForgotPasswordOtp({ email });

      if (response.success) {
        toast.success("✅ OTP sent! A new OTP has been sent to your email.");
        setTimeLeft(300);
        setOtp(["", "", "", "", "", ""]);
        const firstInput = document.getElementById("forgot-otp-0");
        firstInput?.focus();
      } else {
        toast.error(`❌ Failed to resend OTP: ${response.error || "Please try again later."}`);
      }
    } catch (error) {
      toast.error("❌ Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    if (currentStep === "otp") {
      setCurrentStep("email");
      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(0);
    } else if (currentStep === "password") {
      setCurrentStep("otp");
      passwordForm.reset();
    }
  };

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
            Secure Account
            <span className="gradient-text block">Recovery</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Don't worry, it happens to the best of us. We'll help you get back 
            to your learning journey in no time.
          </p>

          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Secure Process</span>
            </div>
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

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              {["email", "otp", "password"].map((step, index) => (
                <React.Fragment key={step}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    currentStep === step 
                      ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" 
                      : index < ["email", "otp", "password"].indexOf(currentStep)
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                  }`}>
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div className={`flex-1 h-0.5 transition-all duration-300 ${
                      index < ["email", "otp", "password"].indexOf(currentStep)
                        ? "bg-primary"
                        : "bg-border"
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              {currentStep === "email" && <Mail className="w-8 h-8 text-primary" />}
              {currentStep === "otp" && <Mail className="w-8 h-8 text-primary" />}
              {currentStep === "password" && <KeyRound className="w-8 h-8 text-primary" />}
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-2">
              {currentStep === "email" && "Reset Password"}
              {currentStep === "otp" && "Verify Your Email"}
              {currentStep === "password" && "Set New Password"}
            </h2>
            <p className="text-muted-foreground text-center">
              {currentStep === "email" && "Enter your email to receive a verification code"}
              {currentStep === "otp" && `We've sent a 6-digit code to ${email}`}
              {currentStep === "password" && "Create a strong new password"}
            </p>
          </div>

          {/* Step 1: Email Input */}
          {currentStep === "email" && (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-5">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Email Address</FormLabel>
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
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl font-semibold shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 group" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === "otp" && (
            <div className="space-y-5">
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`forgot-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-semibold bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary rounded-xl transition-all duration-300"
                    autoComplete="off"
                  />
                ))}
              </div>

              {timeLeft > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  Code expires in <span className="text-primary font-medium">{formatTime(timeLeft)}</span>
                </p>
              )}

              <Button
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.join("").length !== 6}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl font-semibold shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 group"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Verify Code
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={handleResendOtp}
                  disabled={isResending || timeLeft > 0}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Didn't receive the code? Resend
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: New Password */}
          {currentStep === "password" && (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handleResetPassword)} className="space-y-5">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary transition-all duration-300 pr-12"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary transition-all duration-300 pr-12"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl font-semibold shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 group" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}

          {/* Navigation */}
          <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between text-sm">
            {currentStep !== "email" ? (
              <Button 
                variant="ghost" 
                onClick={handleBack} 
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}
            
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}