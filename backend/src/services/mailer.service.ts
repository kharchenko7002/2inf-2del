import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<void> {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Verification</h2>
      <p style="color: #666; font-size: 16px;">
        Thank you for registering! Please verify your email by entering the code below:
      </p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <p style="font-size: 14px; color: #999; margin: 0 0 10px 0;">Your verification code:</p>
        <p style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 5px; margin: 0;">
          ${code}
        </p>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        This code will expire in <strong>10 minutes</strong>.
      </p>
      
      <p style="color: #666; font-size: 14px;">
        If you didn't request this verification code, please ignore this email.
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This is an automated message, please do not reply.
      </p>
    </div>
  `;

  const textContent = `
Email Verification

Thank you for registering! Please verify your email by entering the code below:

Your verification code: ${code}

This code will expire in 10 minutes.

If you didn't request this verification code, please ignore this email.
  `.trim();

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@example.com',
      to: email,
      subject: 'Email Verification Code',
      text: textContent,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<void> {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset</h2>
      <p style="color: #666; font-size: 16px;">
        You requested a password reset. Click the button below to set a new password:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}"
           style="background-color: #2563eb; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold;">
          Reset Password
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        Or copy and paste this link into your browser:
      </p>
      <p style="color: #2563eb; font-size: 14px; word-break: break-all;">${resetLink}</p>

      <p style="color: #666; font-size: 14px;">
        This link will expire in <strong>1 hour</strong>.
      </p>

      <p style="color: #666; font-size: 14px;">
        If you did not request a password reset, please ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This is an automated message, please do not reply.
      </p>
    </div>
  `;

  const textContent = `
Password Reset

You requested a password reset. Use the link below to set a new password:

${resetLink}

This link will expire in 1 hour.

If you did not request a password reset, please ignore this email.
  `.trim();

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@example.com',
      to: email,
      subject: 'Password Reset',
      text: textContent,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}
