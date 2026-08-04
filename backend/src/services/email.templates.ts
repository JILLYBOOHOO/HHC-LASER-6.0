/**
 * HHC Laser & Co - Luxury Email Templates
 * Black, White, and Brushed Gold Aesthetic.
 */

export interface BaseEmailData {
  frontendUrl: string;
}

export interface BookingConfirmationData extends BaseEmailData {
  customerName: string;
  confirmationCode: string;
  bookingId: number;
  treatmentName: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  amountPaidJmd: number;
  paymentRef: string;
  prepNotes?: string;
  cancellationPolicy?: string;
  googleCalendarUrl?: string;
}

export interface AppointmentReminderData extends BaseEmailData {
  customerName: string;
  treatmentName: string;
  date: string;
  time: string;
  location: string;
  confirmationCode: string;
  prepNotes?: string;
  reminderType?: '7_days' | '24_hours' | '2_hours';
}

export interface RescheduledData extends BaseEmailData {
  customerName: string;
  treatmentName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  location: string;
  confirmationCode: string;
}

export interface CancellationData extends BaseEmailData {
  customerName: string;
  treatmentName: string;
  date: string;
  time: string;
  reason?: string;
  refundInfo?: string;
}

export interface PaymentReceiptData extends BaseEmailData {
  customerName: string;
  amountJmd: number;
  approvalCode: string;
  referenceKey: string;
  transactionDate: string;
  description: string;
}

export interface WelcomeEmailData extends BaseEmailData {
  customerName: string;
}

export interface PasswordResetData extends BaseEmailData {
  customerName: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export interface EmailVerificationData extends BaseEmailData {
  customerName: string;
  verifyUrl: string;
}

export interface AdminNotificationData extends BaseEmailData {
  title: string;
  message: string;
  details: { label: string; value: string }[];
}

/**
 * Shared HTML Email Layout Wrapper - Luxury MedSpa Design
 */
function wrapEmailLayout(content: string, title: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #FAFAF8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; background-color: #FAFAF8; padding: 40px 16px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E8E8E8; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { padding: 40px 32px 24px; text-align: center; }
        .logo-text { font-family: 'Georgia', serif; font-size: 28px; color: #111111; letter-spacing: 2px; font-weight: 700; text-transform: uppercase; margin: 0; }
        .tagline { color: #555555; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 400; }
        .gold-divider { width: 60px; height: 2px; background-color: #C8A96A; margin: 24px auto 0; }
        .body { padding: 0 40px 40px; color: #555555; }
        .h1 { font-family: 'Georgia', serif; font-size: 26px; color: #111111; margin: 32px 0 16px 0; font-weight: 400; text-align: center; }
        .lead { font-size: 15px; color: #555555; line-height: 1.6; margin: 0 0 32px 0; text-align: center; }
        .card-box { background-color: #FFFFFF; border: 1px solid #E8E8E8; border-top: 3px solid #C8A96A; border-radius: 6px; padding: 24px; margin: 24px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
        .card-header { font-size: 14px; font-weight: 600; color: #111111; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; text-align: center; }
        .table-details { width: 100%; border-collapse: collapse; }
        .table-details td { padding: 12px 0; border-bottom: 1px solid #E8E8E8; font-size: 14px; }
        .table-details tr:last-child td { border-bottom: none; }
        .label { color: #555555; font-size: 13px; width: 40%; }
        .value { color: #111111; font-weight: 500; text-align: right; }
        .value-gold { color: #C8A96A; font-weight: 600; text-align: right; }
        .btn-gold { display: inline-block; background-color: #C8A96A; color: #111111 !important; text-decoration: none; padding: 16px 36px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; text-align: center; margin: 16px 0; transition: background-color 0.3s; }
        .btn-gold:hover { background-color: #B58A3C; }
        .btn-outline { display: inline-block; border: 1px solid #C8A96A; background-color: #FFFFFF; color: #111111 !important; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; text-align: center; margin: 8px 0; }
        .btn-danger { display: inline-block; border: 1px solid #111111; background-color: #FFFFFF; color: #111111 !important; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; text-align: center; margin: 8px 0; }
        .footer { background-color: #FFFFFF; padding: 32px; text-align: center; border-top: 1px solid #C8A96A; font-size: 12px; color: #555555; line-height: 1.8; }
        .code-box { background: #FAFAF8; border: 1px solid #E8E8E8; border-radius: 6px; padding: 24px; text-align: center; margin: 24px 0; }
        .code-title { color: #555555; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 8px; }
        .code-val { font-size: 28px; font-weight: 400; color: #111111; letter-spacing: 3px; font-family: 'Georgia', serif; }
        .notice-box { background: #FAFAF8; padding: 16px; border-radius: 4px; font-size: 13px; color: #555555; margin: 20px 0; line-height: 1.6; border: 1px solid #E8E8E8; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
        .badge-confirmed { background-color: #FFFFFF; border: 1px solid #C8A96A; color: #111111; }
        .badge-cancelled { background-color: #FFFFFF; border: 1px solid #111111; color: #A62E2E; }
        .badge-checkedin { background-color: #FFFFFF; border: 1px solid #1D8F5A; color: #1D8F5A; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1 class="logo-text">HHC LASER & CO</h1>
            <div class="tagline">Luxury Medical Spa & Wellness</div>
            <div class="gold-divider"></div>
          </div>
          <div class="body">
            ${content}
          </div>
          <div class="footer">
            <p style="margin: 0 0 12px 0; font-weight: 600; color: #111111; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Need Assistance?</p>
            <p style="margin: 0 0 6px 0;">&#128222; (876) 319-6241</p>
            <p style="margin: 0 0 16px 0;">&#9993; support@hhclaser.com</p>
            <p style="margin: 0 0 24px 0;">48 Constant Spring Road &nbsp;&bull;&nbsp; Kingston, Jamaica</p>
            <p style="margin: 0; font-size: 10px; color: #999999;">© ${new Date().getFullYear()} HHC Laser & Co. MedSpa. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// 1. Booking Confirmation Email
export function getBookingConfirmationTemplate(data: BookingConfirmationData): string {
  const content = `
    <h2 class="h1">Your Appointment is Confirmed</h2>
    <p class="lead">Good day, ${data.customerName}. Your treatment session has been successfully booked. We look forward to providing you with an exceptional experience.</p>

    <div class="card-box">
      <div class="card-header">Appointment Details</div>
      <table class="table-details">
        <tr><td class="label">&#128100; Client</td><td class="value">${data.customerName}</td></tr>
        <tr><td class="label">&#10024; Treatment</td><td class="value">${data.treatmentName}</td></tr>
        <tr><td class="label">&#128197; Date</td><td class="value">${data.date}</td></tr>
        <tr><td class="label">&#128336; Time</td><td class="value">${data.time} (${data.duration})</td></tr>
        <tr><td class="label">&#128205; Location</td><td class="value">${data.location}</td></tr>
        <tr><td class="label">&#128179; Amount Paid</td><td class="value-gold">JMD $${data.amountPaidJmd.toLocaleString()}</td></tr>
        <tr><td class="label">Status</td><td class="value"><span class="badge badge-confirmed">Confirmed</span></td></tr>
      </table>
    </div>

    <div class="code-box">
      <div class="code-title">Confirmation Code</div>
      <div class="code-val">${data.confirmationCode}</div>
    </div>

    <div class="notice-box">
      <strong>Preparation Instructions:</strong><br>
      ${data.prepNotes || 'Please shave the treatment area 24 hours prior. Avoid direct sun exposure and tanning for at least 48 hours before your session.'}
    </div>

    <div class="notice-box">
      <strong>Rescheduling & Cancellation Policy:</strong><br>
      ${data.cancellationPolicy || 'You can manage, reschedule, or cancel your appointment at least 24 hours in advance through your customer portal.'}
    </div>

    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${data.frontendUrl}/customer/dashboard" class="btn-gold">View Appointment</a>
    </div>

    ${data.googleCalendarUrl ? `
      <div style="text-align: center; margin-bottom: 16px;">
        <a href="${data.googleCalendarUrl}" target="_blank" class="btn-outline">Add to Calendar</a>
      </div>
    ` : ''}
  `;
  return wrapEmailLayout(content, 'Your Appointment Has Been Confirmed');
}

// 2. Appointment Reminder Email
export function getAppointmentReminderTemplate(data: AppointmentReminderData): string {
  const reminderText = data.reminderType === '24_hours' ? 'Tomorrow' : data.reminderType === '2_hours' ? 'In 2 Hours' : 'Upcoming';
  const content = `
    <h2 class="h1">Reminder: Your Appointment is ${reminderText}</h2>
    <p class="lead">Good day, ${data.customerName}. This is a friendly reminder for your upcoming treatment at HHC Laser.</p>

    <div class="card-box">
      <div class="card-header">Appointment Details</div>
      <table class="table-details">
        <tr><td class="label">&#10024; Treatment</td><td class="value">${data.treatmentName}</td></tr>
        <tr><td class="label">&#128197; Date</td><td class="value">${data.date}</td></tr>
        <tr><td class="label">&#128336; Time</td><td class="value">${data.time}</td></tr>
        <tr><td class="label">&#128205; Location</td><td class="value">${data.location}</td></tr>
        <tr><td class="label">Status</td><td class="value"><span class="badge badge-confirmed">Confirmed</span></td></tr>
      </table>
    </div>

    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${data.frontendUrl}/customer/dashboard" class="btn-gold">Manage Booking</a>
    </div>
  `;
  return wrapEmailLayout(content, 'Reminder: Your Appointment is ' + reminderText);
}

// 3. Rescheduled Confirmation Email
export function getAppointmentRescheduledTemplate(data: RescheduledData): string {
  const content = `
    <h2 class="h1">Appointment Successfully Rescheduled</h2>
    <p class="lead">Good day, ${data.customerName}. Your appointment has been updated to your new requested time.</p>

    <div class="card-box">
      <div class="card-header">New Appointment Details</div>
      <table class="table-details">
        <tr><td class="label">&#10024; Treatment</td><td class="value">${data.treatmentName}</td></tr>
        <tr><td class="label">&#128197; Date</td><td class="value">${data.newDate}</td></tr>
        <tr><td class="label">&#128336; Time</td><td class="value">${data.newTime}</td></tr>
        <tr><td class="label">&#128205; Location</td><td class="value">${data.location}</td></tr>
        <tr><td class="label">Previous Date</td><td class="value">${data.oldDate} at ${data.oldTime}</td></tr>
      </table>
    </div>

    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${data.frontendUrl}/customer/dashboard" class="btn-gold">View Appointment</a>
    </div>
  `;
  return wrapEmailLayout(content, 'Your Appointment Has Been Successfully Rescheduled');
}

// 4. Cancellation Email
export function getCancellationTemplate(data: CancellationData): string {
  const content = `
    <h2 class="h1">Appointment Cancellation Confirmation</h2>
    <p class="lead">Good day, ${data.customerName}. We confirm that your appointment has been cancelled as requested.</p>

    <div class="card-box">
      <div class="card-header">Cancelled Appointment</div>
      <table class="table-details">
        <tr><td class="label">&#10024; Treatment</td><td class="value">${data.treatmentName}</td></tr>
        <tr><td class="label">&#128197; Date</td><td class="value">${data.date}</td></tr>
        <tr><td class="label">&#128336; Time</td><td class="value">${data.time}</td></tr>
        <tr><td class="label">Status</td><td class="value"><span class="badge badge-cancelled">Cancelled</span></td></tr>
        ${data.reason ? `<tr><td class="label">Reason</td><td class="value">${data.reason}</td></tr>` : ''}
      </table>
    </div>

    ${data.refundInfo ? `
      <div class="notice-box">
        <strong>Refund Information:</strong><br>
        ${data.refundInfo}
      </div>
    ` : ''}

    <p style="text-align: center; color: #555555; font-size: 14px; margin-top: 32px;">We hope to welcome you back to HHC Laser soon.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${data.frontendUrl}/booking" class="btn-outline">Book a New Session</a>
    </div>
  `;
  return wrapEmailLayout(content, 'Appointment Cancellation Confirmation');
}

// 5. Payment Receipt Email
export function getPaymentReceiptTemplate(data: PaymentReceiptData): string {
  const content = `
    <h2 class="h1">Payment Confirmation & Receipt</h2>
    <p class="lead">Good day, ${data.customerName}. Thank you for your payment. Below are your receipt details.</p>

    <div class="card-box">
      <div class="card-header">Transaction Details</div>
      <table class="table-details">
        <tr><td class="label">Description</td><td class="value">${data.description}</td></tr>
        <tr><td class="label">Amount</td><td class="value-gold">JMD $${data.amountJmd.toLocaleString()}</td></tr>
        <tr><td class="label">Date</td><td class="value">${data.transactionDate}</td></tr>
        <tr><td class="label">Approval Code</td><td class="value">${data.approvalCode}</td></tr>
        <tr><td class="label">Reference</td><td class="value">${data.referenceKey}</td></tr>
      </table>
    </div>

    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${data.frontendUrl}/customer/dashboard" class="btn-gold">View Dashboard</a>
    </div>
  `;
  return wrapEmailLayout(content, 'Payment Confirmation & Receipt');
}

// 6. Welcome Email
export function getWelcomeEmailTemplate(data: WelcomeEmailData): string {
  const content = `
    <h2 class="h1">Welcome to HHC Laser</h2>
    <p class="lead">Good day, ${data.customerName}. We are thrilled to welcome you to the HHC Laser & Co. family—Jamaica's premier medical aesthetics clinic.</p>

    <p style="text-align: center; font-size: 14px; color: #555555; line-height: 1.6;">
      At HHC Laser, we pride ourselves on delivering luxurious, professional, and exclusive experiences. From state-of-the-art laser treatments to bespoke skin therapies, our goal is to help you look and feel your absolute best.
    </p>

    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${data.frontendUrl}/booking" class="btn-gold">Book Your First Treatment</a>
    </div>
  `;
  return wrapEmailLayout(content, 'Welcome to HHC Laser & Co. MedSpa');
}

// 7. Password Reset Email
export function getPasswordResetTemplate(data: PasswordResetData): string {
  const content = `
    <h2 class="h1">Reset Your Password</h2>
    <p class="lead">Good day, ${data.customerName}. We received a request to reset the password for your HHC Laser account.</p>

    <div class="notice-box" style="text-align: center;">
      This password reset link is only valid for the next <strong>${data.expiresInMinutes} minutes</strong>.
    </div>

    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${data.resetUrl}" class="btn-gold">Reset Password</a>
    </div>

    <p style="text-align: center; font-size: 12px; color: #999999; margin-top: 24px;">
      If you did not request this, please ignore this email. Your password will remain unchanged.
    </p>
  `;
  return wrapEmailLayout(content, 'Reset Your Password');
}

// 8. Email Verification Email
export function getEmailVerificationTemplate(data: EmailVerificationData): string {
  const content = `
    <h2 class="h1">Verify Your Email Address</h2>
    <p class="lead">Good day, ${data.customerName}. Please confirm your email address to complete your HHC Laser account setup.</p>

    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${data.verifyUrl}" class="btn-gold">Verify Email</a>
    </div>
  `;
  return wrapEmailLayout(content, 'Verify Your Email Address');
}

// 9. Admin Notification Email
export function getAdminNotificationTemplate(data: AdminNotificationData): string {
  const detailsHtml = data.details.map(d => `
    <tr><td class="label">${d.label}</td><td class="value">${d.value}</td></tr>
  `).join('');

  const content = `
    <h2 class="h1">${data.title}</h2>
    <p class="lead">${data.message}</p>

    ${data.details.length > 0 ? `
      <div class="card-box">
        <div class="card-header">Notification Details</div>
        <table class="table-details">
          ${detailsHtml}
        </table>
      </div>
    ` : ''}

    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${data.frontendUrl}/admin" class="btn-outline">Open Admin Dashboard</a>
    </div>
  `;
  return wrapEmailLayout(content, data.title);
}
