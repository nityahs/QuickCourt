import nodemailer from 'nodemailer';

let transporter;

export function getTransporter() {
  if (transporter) return transporter;
  
  // Use Gmail SMTP for development/testing
  const isGmail = process.env.SMTP_HOST === 'gmail' || !process.env.SMTP_HOST;
  
  if (isGmail) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
      },
    });
  } else {
    // Fallback to custom SMTP configuration
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  const from = process.env.SMTP_FROM || process.env.GMAIL_USER || process.env.SMTP_USER;
  return tx.sendMail({ from, to, subject, text, html });
}

export async function sendOtpEmail({ to, name, otp }) {
  const subject = 'Your QuickCourt verification code';
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#f8f9fa;padding:20px;border-radius:8px;text-align:center;margin-bottom:20px;">
      <h1 style="color:#2563eb;margin:0;font-size:24px;">QuickCourt</h1>
    </div>
    <h2 style="color:#1f2937;margin-bottom:20px;">Verify your email</h2>
    <p style="color:#4b5563;margin-bottom:16px;">Hi ${name || 'there'},</p>
    <p style="color:#4b5563;margin-bottom:20px;">Your verification code is:</p>
    <div style="background:#f3f4f6;padding:20px;border-radius:8px;text-align:center;margin:20px 0;">
      <p style="font-size:32px;letter-spacing:6px;font-weight:700;color:#1f2937;margin:0;">${otp}</p>
    </div>
    <p style="color:#6b7280;font-size:14px;margin-bottom:20px;">This code will expire in 10 minutes. If you didn't request this, you can ignore this email.</p>
    <div style="border-top:1px solid #e5e7eb;padding-top:20px;margin-top:20px;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">— The QuickCourt Team</p>
    </div>
  </div>`;
  const text = `Your QuickCourt verification code is ${otp}. This code will expire in 10 minutes.`;
  try {
    await sendMail({ to, subject, html, text });
    console.log(`OTP email sent successfully to ${to}`);
  } catch (e) {
    console.error('Failed to send OTP email', e);
    // Fail silently for user creation, but log.
  }
}
