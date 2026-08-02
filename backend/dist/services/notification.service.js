"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const email_templates_1 = require("./email.templates");
class NotificationService {
    constructor() {
        this.sentEmailHashes = new Set();
    }
    /**
     * Core private email sender with retry logic & idempotency checks
     */
    async sendEmail(params, retryCount = 0) {
        const { to, subject, html, category = 'noreply', idempotencyKey } = params;
        // 1. Idempotency Check (Prevent duplicate emails for the same event)
        const eventHash = idempotencyKey || `${to}:${subject}`;
        if (this.sentEmailHashes.has(eventHash)) {
            logger_1.logger.info(`[Resend Email] Duplicate email suppressed for key: ${eventHash}`);
            return true;
        }
        try {
            const apiKey = env_1.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
            if (!apiKey) {
                logger_1.logger.warn(`[Resend Email] RESEND_API_KEY not configured. Simulated send to ${to}: "${subject}"`);
                await this.logNotification('email', to, subject, 'simulated');
                this.sentEmailHashes.add(eventHash);
                return true;
            }
            // 2. Sender email calculation based on production domain flag
            let fromEmail = `HHC Laser & Co <${env_1.env.EMAIL_DEV_SENDER}>`; // Default sandbox sender during domain transfer
            if (env_1.env.EMAIL_ENABLE_PRODUCTION_DOMAIN) {
                switch (category) {
                    case 'appointments':
                        fromEmail = `HHC Laser & Co <${env_1.env.EMAIL_FROM_APPOINTMENTS}>`;
                        break;
                    case 'support':
                        fromEmail = `HHC Laser & Co <${env_1.env.EMAIL_FROM_SUPPORT}>`;
                        break;
                    case 'billing':
                        fromEmail = `HHC Laser & Co <${env_1.env.EMAIL_FROM_BILLING}>`;
                        break;
                    case 'noreply':
                    default:
                        fromEmail = `HHC Laser & Co <${env_1.env.EMAIL_FROM_NOREPLY}>`;
                        break;
                }
            }
            // 3. Dispatch via Resend API
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: fromEmail,
                    to: [to],
                    subject: subject,
                    html: html,
                    reply_to: env_1.env.EMAIL_FROM_SUPPORT
                })
            });
            const resData = await response.json();
            if (response.ok) {
                this.sentEmailHashes.add(eventHash);
                await this.logNotification('email', to, subject, 'sent');
                logger_1.logger.info(`[Resend Email] Sent successfully to ${to} (Resend ID: ${resData.id}): "${subject}"`);
                return true;
            }
            else {
                // Retry logic for 5xx errors or network glitches (up to 2 retries)
                if (response.status >= 500 && retryCount < 2) {
                    logger_1.logger.warn(`[Resend Email] Provider status ${response.status}. Retrying attempt ${retryCount + 1}...`);
                    await new Promise(r => setTimeout(r, 1500 * (retryCount + 1)));
                    return this.sendEmail(params, retryCount + 1);
                }
                await this.logNotification('email', to, subject, 'failed');
                logger_1.logger.warn(`[Resend Email] Provider status ${response.status} for ${to}: ${JSON.stringify(resData)}`);
                return false;
            }
        }
        catch (error) {
            if (retryCount < 2) {
                logger_1.logger.warn(`[Resend Email] Network exception. Retrying attempt ${retryCount + 1}...`);
                await new Promise(r => setTimeout(r, 1500 * (retryCount + 1)));
                return this.sendEmail(params, retryCount + 1);
            }
            await this.logNotification('email', to, subject, 'failed');
            logger_1.logger.error(`[Resend Email] Failed to send email to ${to}:`, error);
            return false;
        }
    }
    /**
     * Non-blocking queue wrapper so API responses return instantly
     */
    queueEmail(params) {
        setImmediate(() => {
            this.sendEmail(params).catch(err => {
                logger_1.logger.error('[NotificationQueue] Background dispatch error:', err);
            });
        });
    }
    // ─── PUBLIC EMAIL WORKFLOW METHODS ──────────────────────────────────────────
    /**
     * 1. Booking Confirmation Email (appointments@hhclaser.com)
     */
    async sendAppointmentConfirmation(customerId, details) {
        const user = await (0, database_1.executeQueryOne)('SELECT * FROM users WHERE id = ?', [customerId]);
        if (!user || !user.email)
            return;
        const googleCalStart = details.date.replace(/-/g, '') + 'T120000Z';
        const googleCalEnd = details.date.replace(/-/g, '') + 'T130000Z';
        const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(details.services)}&dates=${googleCalStart}/${googleCalEnd}&details=${encodeURIComponent('Treatment session at HHC Laser & Co')}&location=${encodeURIComponent(details.location || '48 Constant Spring Road, Kingston')}`;
        const html = (0, email_templates_1.getBookingConfirmationTemplate)({
            frontendUrl: env_1.env.FRONTEND_URL,
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
    async sendAppointmentReminder(customerId, details) {
        const user = await (0, database_1.executeQueryOne)('SELECT * FROM users WHERE id = ?', [customerId]);
        if (!user || !user.email)
            return;
        const html = (0, email_templates_1.getAppointmentReminderTemplate)({
            frontendUrl: env_1.env.FRONTEND_URL,
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
    async sendAppointmentRescheduled(customerId, details) {
        const user = await (0, database_1.executeQueryOne)('SELECT * FROM users WHERE id = ?', [customerId]);
        if (!user || !user.email)
            return;
        const html = (0, email_templates_1.getAppointmentRescheduledTemplate)({
            frontendUrl: env_1.env.FRONTEND_URL,
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
    async sendAppointmentCancelled(customerId, details) {
        const user = await (0, database_1.executeQueryOne)('SELECT * FROM users WHERE id = ?', [customerId]);
        if (!user || !user.email)
            return;
        const html = (0, email_templates_1.getCancellationTemplate)({
            frontendUrl: env_1.env.FRONTEND_URL,
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
    async sendPaymentConfirmation(customerId, details) {
        const user = await (0, database_1.executeQueryOne)('SELECT * FROM users WHERE id = ?', [customerId]);
        if (!user || !user.email)
            return;
        const html = (0, email_templates_1.getPaymentReceiptTemplate)({
            frontendUrl: env_1.env.FRONTEND_URL,
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
    async sendWelcomeEmail(user) {
        const html = (0, email_templates_1.getWelcomeEmailTemplate)({
            frontendUrl: env_1.env.FRONTEND_URL,
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
    async sendPasswordReset(user, resetToken) {
        const resetUrl = `${env_1.env.FRONTEND_URL}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;
        const html = (0, email_templates_1.getPasswordResetTemplate)({
            frontendUrl: env_1.env.FRONTEND_URL,
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
    async sendAdminNotification(data) {
        const adminEmail = 'infohhcLaser@gmail.com';
        const html = (0, email_templates_1.getAdminNotificationTemplate)({
            frontendUrl: env_1.env.FRONTEND_URL,
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
    async logNotification(type, recipient, subject, status) {
        try {
            await (0, database_1.executeQuery)(`INSERT INTO notifications_log (type, recipient, subject, status) VALUES (?, ?, ?, ?)`, [type, recipient, subject, status]);
        }
        catch (err) {
            logger_1.logger.error('[Notification] Failed to write entry to notifications_log table:', err);
        }
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map