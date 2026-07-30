import nodemailer from 'nodemailer';
import { executeQuery, executeQueryOne } from '../config/database';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { User } from '../models/types';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'email-smtp.us-east-1.amazonaws.com',
      port: 587,
      secure: false,
      auth: {
        user: env.AWS_ACCESS_KEY_ID,
        pass: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `HHC LASER Jamaica <${env.SES_FROM_EMAIL}>`,
        replyTo: env.SES_REPLY_TO,
        ...options,
      });

      await this.logNotification('email', options.to, options.subject, 'sent');
      logger.info(`[Email] Sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      await this.logNotification('email', options.to, options.subject, 'failed');
      logger.error(`[Email] Failed to send to ${options.to}:`, error);
    }
  }

  async sendAppointmentConfirmation(customerId: number, appointmentDetails: {
    date: string;
    time: string;
    services: string;
    location: string;
    employeeName: string;
    totalAmount: number;
    appointmentId: number;
    confirmationCode: string;
  }): Promise<void> {
    const user = await executeQueryOne<User>('SELECT * FROM users WHERE id = ?', [customerId]);
    if (!user) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#f8f5f0;font-family:'Georgia',serif;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#1a1a1a 0%,#2c2c2c 100%);padding:40px 32px;text-align:center;">
            <h1 style="color:#c9a96e;font-size:28px;margin:0;letter-spacing:2px;font-weight:400;">HHC LASER</h1>
            <p style="color:#f8f5f0;margin:8px 0 0;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Jamaica's Premier MedSpa</p>
          </div>
          <div style="padding:40px 32px;">
            <h2 style="color:#1a1a1a;font-size:22px;font-weight:400;margin:0 0 8px;">Appointment Confirmed ✓</h2>
            <p style="color:#666;font-size:15px;line-height:1.6;">Dear ${user.first_name}, your appointment has been confirmed. We look forward to seeing you.</p>
            <div style="background:#f8f5f0;border-radius:8px;padding:24px;margin:24px 0;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#888;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Date</td><td style="padding:8px 0;color:#1a1a1a;font-size:15px;font-weight:600;">${appointmentDetails.date}</td></tr>
                <tr><td style="padding:8px 0;color:#888;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Time</td><td style="padding:8px 0;color:#1a1a1a;font-size:15px;font-weight:600;">${appointmentDetails.time}</td></tr>
                <tr><td style="padding:8px 0;color:#888;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Services</td><td style="padding:8px 0;color:#1a1a1a;font-size:15px;">${appointmentDetails.services}</td></tr>
                <tr><td style="padding:8px 0;color:#888;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Specialist</td><td style="padding:8px 0;color:#1a1a1a;font-size:15px;">${appointmentDetails.employeeName}</td></tr>
                <tr><td style="padding:8px 0;color:#888;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Location</td><td style="padding:8px 0;color:#1a1a1a;font-size:15px;">${appointmentDetails.location}</td></tr>
                <tr><td style="padding:8px 0;color:#888;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Total</td><td style="padding:8px 0;color:#c9a96e;font-size:18px;font-weight:700;">JMD $${appointmentDetails.totalAmount.toLocaleString()}</td></tr>
              </table>
            </div>
            
            <div style="background:#fff; border: 2px dashed #c9a96e; padding: 24px; text-align: center; margin-bottom: 24px; border-radius: 8px;">
              <p style="color:#888; font-size:12px; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px;">Your Confirmation Code</p>
              <div style="font-size:32px; font-weight:700; color:#1a1a1a; letter-spacing:4px;">${appointmentDetails.confirmationCode}</div>
              <p style="color:#666; font-size:13px; margin:8px 0 0;">Please present this code when you arrive for your booking.</p>
            </div>

            <div style="text-align:center;margin:32px 0;">
              <a href="${env.FRONTEND_URL}/customer/bookings/${appointmentDetails.appointmentId}" style="background:#c9a96e;color:#1a1a1a;text-decoration:none;padding:14px 32px;border-radius:4px;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">View Appointment</a>
            </div>
          </div>
          <div style="background:#1a1a1a;padding:24px 32px;text-align:center;">
            <p style="color:#888;font-size:12px;margin:0;">© ${new Date().getFullYear()} HHC LASER Jamaica. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: user.email,
      subject: `Appointment Confirmed — ${appointmentDetails.date} at ${appointmentDetails.time}`,
      html,
    });
  }

  async sendPaymentConfirmation(customerId: number, details: {
    amount: number;
    approvalCode: string;
    idempotencyKey: string;
    appointmentId: number | null;
  }): Promise<void> {
    const user = await executeQueryOne<User>('SELECT * FROM users WHERE id = ?', [customerId]);
    if (!user) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f8f5f0;font-family:'Georgia',serif;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#1a1a1a,#2c2c2c);padding:40px 32px;text-align:center;">
            <h1 style="color:#c9a96e;font-size:28px;margin:0;">HHC LASER</h1>
          </div>
          <div style="padding:40px 32px;text-align:center;">
            <div style="width:64px;height:64px;background:#22c55e;border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
              <span style="color:white;font-size:32px;">✓</span>
            </div>
            <h2 style="color:#1a1a1a;font-size:24px;">Payment Successful</h2>
            <p style="color:#666;font-size:15px;">Dear ${user.first_name}, your payment of <strong style="color:#c9a96e;">JMD $${details.amount.toLocaleString()}</strong> has been received.</p>
            <p style="color:#888;font-size:13px;">Approval Code: <strong>${details.approvalCode}</strong></p>
            <p style="color:#888;font-size:13px;">Reference: <code>${details.idempotencyKey}</code></p>
          </div>
          <div style="background:#1a1a1a;padding:24px;text-align:center;">
            <p style="color:#888;font-size:12px;margin:0;">© ${new Date().getFullYear()} HHC LASER Jamaica</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: user.email,
      subject: `Payment Confirmed — JMD $${details.amount.toLocaleString()}`,
      html,
    });
  }

  async sendAppointmentReminder(customerId: number, appointmentDetails: {
    date: string;
    time: string;
    services: string;
    location: string;
    appointmentId: number;
  }): Promise<void> {
    const user = await executeQueryOne<User>('SELECT * FROM users WHERE id = ?', [customerId]);
    if (!user) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f8f5f0;font-family:'Georgia',serif;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#1a1a1a,#2c2c2c);padding:40px 32px;text-align:center;">
            <h1 style="color:#c9a96e;font-size:28px;margin:0;">HHC LASER</h1>
          </div>
          <div style="padding:40px 32px;">
            <h2 style="color:#1a1a1a;text-align:center;">Appointment Reminder 🔔</h2>
            <p style="color:#666;font-size:15px;text-align:center;">Dear ${user.first_name}, this is a friendly reminder about your upcoming appointment.</p>
            <div style="background:#f8f5f0;border-radius:8px;padding:24px;margin:24px 0;">
              <p><strong>Date:</strong> ${appointmentDetails.date}</p>
              <p><strong>Time:</strong> ${appointmentDetails.time}</p>
              <p><strong>Services:</strong> ${appointmentDetails.services}</p>
              <p><strong>Location:</strong> ${appointmentDetails.location}</p>
            </div>
            <p style="color:#888;font-size:13px;text-align:center;">Please arrive 10 minutes early. If you need to reschedule, contact us at least 24 hours in advance.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: user.email,
      subject: `Reminder: Your appointment is tomorrow at ${appointmentDetails.time}`,
      html,
    });
  }

  private async logNotification(type: string, recipient: string, subject: string, status: string): Promise<void> {
    try {
      await executeQuery(
        `INSERT INTO notifications_log (type, recipient, subject, status) VALUES (?, ?, ?, ?)`,
        [type, recipient, subject, status]
      );
    } catch (err) {
      logger.error('[Notification] Failed to log notification:', err);
    }
  }
}

export const notificationService = new NotificationService();
