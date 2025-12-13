import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error: any, success: any) => {
  if (error) {
    console.error("Email transporter configuration error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"Momentum" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export function generateOtpEmailTemplate(otp: string, role: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification - Momentum</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #f97316; }
        .otp-box { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f97316; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Momentum</div>
          <h1>Email Verification</h1>
        </div>
        
        <p>Hello!</p>
        
        <p>Thank you for registering as a <strong>${role.toLowerCase()}</strong> on Momentum. To complete your registration, please verify your email address using the OTP code below:</p>
        
        <div class="otp-box">
          <p>Your verification code is:</p>
          <div class="otp-code">${otp}</div>
          <p><small>This code will expire in 5 minutes</small></p>
        </div>
        
        <p>Enter this code on the verification page to activate your account and start your journey with Momentum.</p>
        
        <div class="warning">
          <strong>Security Notice:</strong> If you didn't request this verification code, please ignore this email. Do not share this code with anyone.
        </div>
        
        <div class="footer">
          <p>Best regards,<br>The Momentum Team</p>
          <p><small>This is an automated email. Please do not reply to this message.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendOtpEmail(email: string, otp: string, role: string): Promise<boolean> {
  const subject = "Verify Your Email - Momentum";
  const html = generateOtpEmailTemplate(otp, role);
  const text = `Your Momentum verification code is: ${otp}. This code will expire in 5 minutes.`;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}