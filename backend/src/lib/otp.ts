import crypto from "crypto";

// In-memory OTP storage (in production, use Redis or database)
interface OTPData {
  otp: string;
  email: string;
  role: "VIEWER" | "CREATOR";
  registrationData: any;
  expiresAt: Date;
  attempts: number;
}

const otpStore = new Map<string, OTPData>();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [key, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function storeOTP(
  email: string,
  otp: string,
  role: "VIEWER" | "CREATOR",
  registrationData?: any
): void {
  const key = email.toLowerCase();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  otpStore.set(key, {
    otp,
    email,
    role,
    registrationData,
    expiresAt,
    attempts: 0,
  });

  console.log(`OTP stored for ${email}: ${otp} (expires at ${expiresAt})`);
}

export function verifyOTP(email: string, otp: string): {
  valid: boolean;
  data?: OTPData;
  error?: string;
} {
  const key = email.toLowerCase();
  const storedData = otpStore.get(key);

  if (!storedData) {
    return { valid: false, error: "No OTP found for this email" };
  }

  if (storedData.expiresAt < new Date()) {
    otpStore.delete(key);
    return { valid: false, error: "OTP has expired" };
  }

  // Increment attempts
  storedData.attempts++;

  // Check for too many attempts
  if (storedData.attempts > 3) {
    otpStore.delete(key);
    return { valid: false, error: "Too many failed attempts. Please request a new OTP" };
  }

  if (storedData.otp !== otp) {
    return { valid: false, error: "Invalid OTP" };
  }

  // OTP is valid, remove it from store
  otpStore.delete(key);
  return { valid: true, data: storedData };
}

export function hasValidOTP(email: string): boolean {
  const key = email.toLowerCase();
  const storedData = otpStore.get(key);
  
  if (!storedData) return false;
  if (storedData.expiresAt < new Date()) {
    otpStore.delete(key);
    return false;
  }
  
  return true;
}

export function getOTPData(email: string): OTPData | null {
  const key = email.toLowerCase();
  return otpStore.get(key) || null;
}