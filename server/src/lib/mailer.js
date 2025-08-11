import nodemailer from 'nodemailer';

let transporter;

export function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  return tx.sendMail({ from, to, subject, text, html });
}

export async function sendOtpEmail({ to, name, otp }) {
  const subject = 'Your QuickCourt verification code';
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
    <h2>Verify your email</h2>
    <p>Hi ${name || ''},</p>
    <p>Your verification code is:</p>
    <p style="font-size:32px;letter-spacing:6px;font-weight:700;">${otp}</p>
    <p>This code will expire in 10 minutes. If you didn't request this, you can ignore this email.</p>
    <p style="margin-top:32px;">— The QuickCourt Team</p>
  </div>`;
  const text = `Your QuickCourt verification code is ${otp}`;
  try {
    await sendMail({ to, subject, html, text });
  } catch (e) {
    console.error('Failed to send OTP email', e);
    // Fail silently for user creation, but log.
  }
}
