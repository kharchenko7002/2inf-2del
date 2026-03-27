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

export type AlertType = 'temp_high' | 'temp_low' | 'humidity_high' | 'humidity_low';

const alertSubjects: Record<AlertType, string> = {
  temp_high: 'Temperature Alert – Value Too High',
  temp_low: 'Temperature Alert – Value Too Low',
  humidity_high: 'Humidity Alert – Value Too High',
  humidity_low: 'Humidity Alert – Value Too Low',
};

function buildAlertBody(type: AlertType, value: number, timestamp: string): { text: string; html: string } {
  const formattedValue =
    type === 'temp_high' || type === 'temp_low'
      ? `${value.toFixed(1)}°C`
      : `${value.toFixed(1)}%`;

  const messages: Record<AlertType, string> = {
    temp_high: `Temperature exceeded the safe upper threshold of 25°C. Current value: ${formattedValue} recorded at ${timestamp}.`,
    temp_low: `Temperature dropped below the safe lower threshold of 20°C. Current value: ${formattedValue} recorded at ${timestamp}.`,
    humidity_high: `Humidity exceeded the safe upper threshold of 60%. Current value: ${formattedValue} recorded at ${timestamp}.`,
    humidity_low: `Humidity dropped below the safe lower threshold of 30%. Current value: ${formattedValue} recorded at ${timestamp}.`,
  };

  const body = messages[type];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d32f2f;">${alertSubjects[type]}</h2>
      <p style="color: #333; font-size: 16px;">${body}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This is an automated alert from the Temperature Monitoring System.
      </p>
    </div>
  `;

  return { text: body, html };
}

export async function sendAlertEmail(
  type: AlertType,
  value: number,
  timestamp: string,
  sensorName: string
): Promise<void> {
  const alertEmail = process.env.ALERT_EMAIL;
  if (!alertEmail) {
    console.warn('ALERT_EMAIL not set – skipping alert for', sensorName, type);
    return;
  }

  const subject = alertSubjects[type];
  const { text, html } = buildAlertBody(type, value, timestamp);

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@example.com',
      to: alertEmail,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Failed to send alert email:', error);
  }
}
