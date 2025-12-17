import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { Eye, EyeOff, Loader2, Shield, Mail, Lock, KeyRound } from "lucide-react";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export function SecuritySettings() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [passwordData, setPasswordData] = useState<ChangePasswordInput | null>(null);
  
  const { user } = useAuth();

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
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

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsLoading(true);
    setPasswordData(data);

    try {
      const response = await apiClient.sendPasswordChangeOtp();
      
      if (response.success) {
        setShowOtpVerification(true);
        setTimeLeft(300);
        toast.success(`✅ OTP sent! We've sent a verification code to ${user?.email}`);
      } else {
        toast.error(`❌ Failed to send OTP: ${response.error || "Please try again later."}`);
      }
    } catch (error) {
      toast.error("❌ Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      toast.error("❌ Invalid OTP: Please enter all 6 digits");
      return;
    }

    if (!passwordData) return;

    setIsVerifyingOtp(true);

    try {
      const response = await apiClient.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        otp: otpCode,
      });

      if (response.success) {
        toast.success("✅ Password changed successfully! Your password has been updated.");
        
        form.reset();
        setShowOtpVerification(false);
        setOtp(["", "", "", "", "", ""]);
        setPasswordData(null);
      } else {
        toast.error(`❌ Password change failed: ${response.error || "Invalid OTP or current password."}`);
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (error) {
      toast.error("❌ Something went wrong. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);

    try {
      const response = await apiClient.sendPasswordChangeOtp();

      if (response.success) {
        toast.success("✅ OTP sent! A new OTP has been sent to your email.");
        setTimeLeft(300);
        setOtp(["", "", "", "", "", ""]);
      } else {
        toast.error(`❌ Failed to resend OTP: ${response.error || "Please try again later."}`);
      }
    } catch (error) {
      toast.error("❌ Something went wrong. Please try again.");
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleCancelOtp = () => {
    setShowOtpVerification(false);
    setOtp(["", "", "", "", "", ""]);
    setPasswordData(null);
    setTimeLeft(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Password Change */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-secondary/30">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {!showOtpVerification ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        Current Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Enter current password"
                            className="bg-secondary/50 border-border/50 focus:border-primary rounded-xl h-11 pr-12"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-primary" />
                        New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            className="bg-secondary/50 border-border/50 focus:border-primary rounded-xl h-11 pr-12"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg"
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
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-accent" />
                        Confirm New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            className="bg-secondary/50 border-border/50 focus:border-primary rounded-xl h-11 pr-12"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg"
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
                  disabled={isLoading}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </form>
            </Form>
          ) : (
            /* OTP Verification Section */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 text-primary">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="font-semibold">Verify Your Identity</h3>
              </div>
              
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit verification code to <strong className="text-foreground">{user?.email}</strong>
              </p>

              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold bg-secondary/50 border-border/50 focus:border-primary rounded-xl"
                    autoComplete="off"
                  />
                ))}
              </div>

              {timeLeft > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  Code expires in <span className="font-medium text-primary">{formatTime(timeLeft)}</span>
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp || otp.join("").length !== 6}
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl"
                >
                  {isVerifyingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Change Password
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelOtp}
                  disabled={isVerifyingOtp}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={handleResendOtp}
                  disabled={isResendingOtp || timeLeft > 0}
                  className="text-sm"
                >
                  {isResendingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Resend Code
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}