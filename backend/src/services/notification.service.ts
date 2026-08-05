import { executeQuery, executeQueryOne } from '../config/database';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { User } from '../models/types';
import * as nodemailer from 'nodemailer';
import {
  getBookingConfirmationTemplate,
  getAppointmentReminderTemplate,
  getAppointmentRescheduledTemplate,
  getCancellationTemplate,
  getPaymentReceiptTemplate,
  getWelcomeEmailTemplate,
  getPasswordResetTemplate,
  getEmailVerificationTemplate,
  getAdminNotificationTemplate,
  BookingConfirmationData,
  AppointmentReminderData,
  RescheduledData,
  CancellationData,
  PaymentReceiptData,
  WelcomeEmailData,
  PasswordResetData,
  EmailVerificationData,
  AdminNotificationData
} from './email.templates';

export type DedicatedSender = 'appointments' | 'support' | 'billing' | 'noreply';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  category?: DedicatedSender;
  idempotencyKey?: string;
}

export class NotificationService {
  private sentEmailHashes = new Set<string>();

  /**
   * Core private email sender with retry logic & idempotency checks
   */
  private async sendEmail(params: SendEmailParams, retryCount = 0): Promise<boolean> {
    const { to, subject, html, category = 'noreply', idempotencyKey } = params;

    // 1. Idempotency Check (Prevent duplicate emails for the same event)
    const eventHash = idempotencyKey || `${to}:${subject}`;
    if (this.sentEmailHashes.has(eventHash)) {
      logger.info(`[Email] Duplicate email suppressed for key: ${eventHash}`);
      return true;
    }

    try {
      const smtpUser = env.SMTP_USER || process.env.SMTP_USER;
      const smtpPass = env.SMTP_PASS || process.env.SMTP_PASS;

      if (!smtpUser || !smtpPass) {
        logger.warn(`[Email] SMTP_USER or SMTP_PASS not configured. Simulated send to ${to}: "${subject}"`);
        await this.logNotification('email', to, subject, 'simulated');
        this.sentEmailHashes.add(eventHash);
        return true;
      }

      // 2. Sender email calculation based on production domain flag
      let fromEmail = `HHC Laser & Co <${smtpUser}>`;
      if (env.EMAIL_ENABLE_PRODUCTION_DOMAIN) {
        switch (category) {
          case 'appointments':
            fromEmail = `HHC Laser & Co <${env.EMAIL_FROM_APPOINTMENTS || smtpUser}>`;
            break;
          case 'support':
            fromEmail = `HHC Laser & Co <${env.EMAIL_FROM_SUPPORT || smtpUser}>`;
            break;
          case 'billing':
            fromEmail = `HHC Laser & Co <${env.EMAIL_FROM_BILLING || smtpUser}>`;
            break;
          case 'noreply':
          default:
            fromEmail = `HHC Laser & Co <${env.EMAIL_FROM_NOREPLY || smtpUser}>`;
            break;
        }
      }

      // 3. Dispatch via Nodemailer (Gmail SMTP)
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const info = await transporter.sendMail({
        from: fromEmail,
        to: to,
        subject: subject,
        html: html,
        replyTo: env.EMAIL_FROM_SUPPORT || smtpUser
      });

      this.sentEmailHashes.add(eventHash);
      await this.logNotification('email', to, subject, 'sent');
      logger.info(`[Email] Sent successfully to ${to} (ID: ${info.messageId}): "${subject}"`);
      return true;

    } catch (error) {
      if (retryCount < 2) {
        logger.warn(`[Email] Exception occurred. Retrying attempt ${retryCount + 1}...`);
        await new Promise(r => setTimeout(r, 1500 * (retryCount + 1)));
        return this.sendEmail(params, retryCount + 1);
      }
      await this.logNotification('email', to, subject, 'failed');
      logger.error(`[Email] Failed to send email to ${to}:`, error);
      return false;
    }
  }

  /**
   * Non-blocking queue wrapper so API responses return instantly
   */
  private queueEmail(params: SendEmailParams): void {
    setImmediate(() => {
      this.sendEmail(params).catch(err => {
        logger.error('[NotificationQueue] Background dispatch error:', err);
      });
    });
  }

  // ─── PUBLIC EMAIL WORKFLOW METHODS ──────────────────────────────────────────

  /**
   * 1. Booking Confirmation Email (appointments@hhclaser.com)
   */
  async sendAppointmentConfirmation(customerId: number, details: {
    date: string;
    time: string;
    duration?: string;
    services: string;
    location?: string;
    employeeName?: string;
    totalAmount: number;
    appointmentId: number;
    confirmationCode: string;
    paymentRef?: string;
  }): Promise<void> {
    const user = await executeQueryOne<User>('SELECT * FROM users WHERE id = ?', [customerId]);
    if (!user || !user.email) return;

    const googleCalStart = details.date.replace(/-/g, '') + 'T120000Z';
    const googleCalEnd = details.date.replace(/-/g, '') + 'T130000Z';
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(details.services)}&dates=${googleCalStart}/${googleCalEnd}&details=${encodeURIComponent('Treatment session at HHC Laser & Co')}&location=${encodeURIComponent(details.location || '48 Constant Spring Road, Kingston')}`;

    const html = getBookingConfirmationTemplate({
      frontendUrl: env.FRONTEND_URL,
      customerName: `${user.first_name} ${user.last_name}`.trim(),
      confirmationCode: details.confirmationCode,
      bookingId: details.appointmentId,
      treatmentName: details.services,
      date: details.date,
      time: details.time,
      duration: details.duration || '60 min',
      location: details.location || '48 Constant Spring Road, Kingston, Jamaica',
      amountPaidJmd: details.totalAmount,
      paymentRef: details.paymentRef || `FISERV-${details.confirmationCode}`,
      googleCalendarUrl: googleCalUrl
    });

    this.queueEmail({
      to: user.email,
      subject: `Booking Confirmed #${details.confirmationCode} — HHC Laser & Co`,
      html,
      category: 'appointments',
      idempotencyKey: `booking_confirm:${details.appointmentId}`
    });

    // Notify Admin of new booking
    this.sendAdminNotification({
      title: 'New Booking Created',
      message: `A new booking has been confirmed for ${user.first_name} ${user.last_name}.`,
      details: [
        { label: 'Booking Code', value: details.confirmationCode },
        { label: 'Customer', value: `${user.first_name} ${user.last_name} (${user.email})` },
        { label: 'Treatment', value: details.services },
        { label: 'Date & Time', value: `${details.date} at ${details.time}` },
        { label: 'Amount Paid', value: `JMD $${details.totalAmount.toLocaleString()}` }
      ]
    });
  }

  /**
   * 2. Appointment Reminder Email (appointments@hhclaser.com)
   */
  async sendAppointmentReminder(customerId: number, details: {
    date: string;
    time: string;
    services: string;
    location?: string;
    confirmationCode: string;
    reminderType?: '7_days' | '24_hours' | '2_hours';
  }): Promise<void> {
    const user = await executeQueryOne<User>('SELECT * FROM users WHERE id = ?', [customerId]);
    if (!user || !user.email) return;

    const html = getAppointmentReminderTemplate({
      frontendUrl: env.FRONTEND_URL,
      customerName: user.first_name,
      treatmentName: details.services,
      date: details.date,
      time: details.time,
      location: details.location || '48 Constant Spring Road, Kingston, Jamaica',
      confirmationCode: details.confirmationCode,
      reminderType: details.reminderType || '24_hours'
    });

    this.queueEmail({
      to: user.email,
      subject: `Reminder: Appointment tomorrow at ${details.time} — HHC Laser & Co`,
      html,
      category: 'appointments',
      idempotencyKey: `reminder:${details.confirmationCode}:${details.reminderType || '24h'}`
    });
  }

  /**
   * 3. Appointment Rescheduled Email (appointments@hhclaser.com)
   */
  async sendAppointmentRescheduled(customerId: number, details: {
    treatmentName: string;
    oldDate: string;
    oldTime: string;
    newDate: string;
    newTime: string;
    location?: string;
    confirmationCode: string;
  }): Promise<void> {
    const user = await executeQueryOne<User>('SELECT * FROM users WHERE id = ?', [customerId]);
    if (!user || !user.email) return;

    const html = getAppointmentRescheduledTemplate({
      frontendUrl: env.FRONTEND_URL,
      customerName: user.first_name,
      treatmentName: details.treatmentName,
      oldDate: details.oldDate,
      oldTime: details.oldTime,
      newDate: details.newDate,
      newTime: details.newTime,
      location: details.location || '48 Constant Spring Road, Kingston, Jamaica',
      confirmationCode: details.confirmationCode
    });

    this.queueEmail({
      to: user.email,
      subject: `Appointment Rescheduled — HHC Laser & Co`,
      html,
      category: 'appointments'
    });
  }

  /**
   * 4. Appointment Cancelled Email (support@hhclaser.com)
   */
  async sendAppointmentCancelled(customerId: number, details: {
    treatmentName: string;
    date: string;
    time: string;
    reason?: string;
    refundInfo?: string;
  }): Promise<void> {
    const user = await executeQueryOne<User>('SELECT * FROM users WHERE id = ?', [customerId]);
    if (!user || !user.email) return;

    const html = getCancellationTemplate({
      frontendUrl: env.FRONTEND_URL,
      customerName: user.first_name,
      treatmentName: details.treatmentName,
      date: details.date,
      time: details.time,
      reason: details.reason,
      refundInfo: details.refundInfo
    });

    this.queueEmail({
      to: user.email,
      subject: `Appointment Cancellation Notice — HHC Laser & Co`,
      html,
      category: 'support'
    });

    // Notify Admin of cancellation
    this.sendAdminNotification({
      title: 'Booking Cancelled',
      message: `Appointment for ${user.first_name} ${user.last_name} has been cancelled.`,
      details: [
        { label: 'Customer', value: `${user.first_name} ${user.last_name}` },
        { label: 'Treatment', value: details.treatmentName },
        { label: 'Date', value: details.date },
        { label: 'Reason', value: details.reason || 'None specified' }
      ]
    });
  }

  /**
   * 5. Payment Receipt Email (billing@hhclaser.com)
   */
  async sendPaymentConfirmation(customerId: number, details: {
    amount: number;
    approvalCode: string;
    idempotencyKey: string;
    appointmentId?: number | null;
  }): Promise<void> {
    const user = await executeQueryOne<User>('SELECT * FROM users WHERE id = ?', [customerId]);
    if (!user || !user.email) return;

    const html = getPaymentReceiptTemplate({
      frontendUrl: env.FRONTEND_URL,
      customerName: `${user.first_name} ${user.last_name}`.trim(),
      amountJmd: details.amount,
      approvalCode: details.approvalCode,
      referenceKey: details.idempotencyKey,
      transactionDate: new Date().toLocaleDateString('en-US', { dateStyle: 'medium' }),
      description: 'Fiserv MedSpa Service Deposit'
    });

    this.queueEmail({
      to: user.email,
      subject: `Payment Receipt JMD $${details.amount.toLocaleString()} — HHC Laser & Co`,
      html,
      category: 'billing',
      idempotencyKey: `payment_receipt:${details.idempotencyKey}`
    });

    // Notify Admin of payment
    this.sendAdminNotification({
      title: 'Payment Received',
      message: `A payment of JMD $${details.amount.toLocaleString()} was processed.`,
      details: [
        { label: 'Customer', value: `${user.first_name} ${user.last_name}` },
        { label: 'Amount', value: `JMD $${details.amount.toLocaleString()}` },
        { label: 'Approval Code', value: details.approvalCode },
        { label: 'Ref', value: details.idempotencyKey }
      ]
    });
  }

  /**
   * 6. Welcome Email (noreply@hhclaser.com)
   */
  async sendWelcomeEmail(user: { email: string; first_name: string }): Promise<void> {
    const html = getWelcomeEmailTemplate({
      frontendUrl: env.FRONTEND_URL,
      customerName: user.first_name
    });

    this.queueEmail({
      to: user.email,
      subject: `Welcome to HHC Laser & Co ✨`,
      html,
      category: 'noreply'
    });

    // Notify Admin of new registration
    this.sendAdminNotification({
      title: 'New Customer Registered',
      message: `${user.first_name} registered a new account on HHC Laser & Co.`,
      details: [
        { label: 'Name', value: user.first_name },
        { label: 'Email', value: user.email }
      ]
    });
  }

  /**
   * 7. Password Reset Email (noreply@hhclaser.com)
   */
  async sendPasswordReset(user: { email: string; first_name: string }, resetToken: string): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;
    const html = getPasswordResetTemplate({
      frontendUrl: env.FRONTEND_URL,
      customerName: user.first_name,
      resetUrl,
      expiresInMinutes: 15
    });

    this.queueEmail({
      to: user.email,
      subject: `Password Reset Request — HHC Laser & Co`,
      html,
      category: 'noreply'
    });
  }

  /**
   * 8. Admin Alert Notification (noreply@hhclaser.com to infohhcLaser@gmail.com)
   */
  async sendAdminNotification(data: {
    title: string;
    message: string;
    details: { label: string; value: string }[];
  }): Promise<void> {
    const adminEmail = 'infohhcLaser@gmail.com';
    const html = getAdminNotificationTemplate({
      frontendUrl: env.FRONTEND_URL,
      title: data.title,
      message: data.message,
      details: data.details
    });

    this.queueEmail({
      to: adminEmail,
      subject: `[Admin Alert] ${data.title}`,
      html,
      category: 'noreply'
    });
  }

  /**
   * Database Notification Logging
   */
  private async logNotification(type: string, recipient: string, subject: string, status: string): Promise<void> {
    try {
      await executeQuery(
        `INSERT INTO notifications_log (type, recipient, subject, status) VALUES (?, ?, ?, ?)`,
        [type, recipient, subject, status]
      );
    } catch (err) {
      // Ignore log table missing errors gracefully
    }
  }
}

export const notificationService = new NotificationService();
