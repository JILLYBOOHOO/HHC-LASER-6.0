"use strict";
/**
 * HHC Laser & Co - Luxury Email Templates
 * Fully responsive, branded HTML templates matching the MedSpa design palette.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingConfirmationTemplate = getBookingConfirmationTemplate;
exports.getAppointmentReminderTemplate = getAppointmentReminderTemplate;
exports.getAppointmentRescheduledTemplate = getAppointmentRescheduledTemplate;
exports.getCancellationTemplate = getCancellationTemplate;
exports.getPaymentReceiptTemplate = getPaymentReceiptTemplate;
exports.getWelcomeEmailTemplate = getWelcomeEmailTemplate;
exports.getPasswordResetTemplate = getPasswordResetTemplate;
exports.getEmailVerificationTemplate = getEmailVerificationTemplate;
exports.getAdminNotificationTemplate = getAdminNotificationTemplate;
/**
 * Shared HTML Email Layout Wrapper
 */
function wrapEmailLayout(content, title) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #0f1110; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; background-color: #0f1110; padding: 40px 16px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #171a19; border: 1px solid #2a322e; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #141716 0%, #1e2421 100%); padding: 36px 32px; text-align: center; border-bottom: 2px solid #c9a96e; }
        .logo-text { font-family: 'Georgia', serif; font-size: 26px; color: #c9a96e; letter-spacing: 3px; font-weight: 700; text-transform: uppercase; margin: 0; }
        .tagline { color: #8a9992; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600; }
        .body { padding: 36px 32px; color: #d1dad6; }
        .h1 { font-family: 'Georgia', serif; font-size: 24px; color: #ffffff; margin: 0 0 12px 0; font-weight: 400; }
        .lead { font-size: 15px; color: #a4b3ac; line-height: 1.6; margin: 0 0 24px 0; }
        .card-box { background-color: #1c211e; border: 1px solid #2c3631; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .table-details { width: 100%; border-collapse: collapse; }
        .table-details td { padding: 10px 0; border-bottom: 1px solid #27302b; font-size: 14px; }
        .table-details tr:last-child td { border-bottom: none; }
        .label { color: #8a9992; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; font-weight: 700; width: 40%; }
        .value { color: #ffffff; font-weight: 600; text-align: right; }
        .value-gold { color: #c9a96e; font-weight: 700; text-align: right; font-size: 16px; }
        .btn-gold { display: inline-block; background: linear-gradient(135deg, #c9a96e 0%, #b39154 100%); color: #000000 !important; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; box-shadow: 0 6px 20px rgba(201,169,110,0.25); text-align: center; }
        .btn-outline { display: inline-block; border: 1.5px solid #c9a96e; color: #c9a96e !important; text-decoration: none; padding: 12px 28px; border-radius: 50px; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; text-align: center; }
        .footer { background-color: #111312; padding: 28px 32px; text-align: center; border-top: 1px solid #222926; font-size: 12px; color: #697871; line-height: 1.6; }
        .code-box { background: #141716; border: 2px dashed #c9a96e; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .code-title { color: #8a9992; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 6px; }
        .code-val { font-size: 30px; font-weight: 900; color: #ffffff; letter-spacing: 4px; font-family: monospace; }
        .notice-box { background: rgba(201, 169, 110, 0.08); border-left: 3px solid #c9a96e; padding: 16px; border-radius: 6px; font-size: 13px; color: #c4d1cb; margin: 20px 0; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1 class="logo-text">HHC LASER & CO</h1>
            <div class="tagline">Jamaica's Premier Medical Aesthetics & Laser Clinic</div>
          </div>
          <div class="body">
            ${content}
          </div>
          <div class="footer">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #8a9992;">HHC LASER & CO — 48 Constant Spring Road, Kingston, Jamaica</p>
            <p style="margin: 0 0 12px 0;">Phone: (876) 319-6241 &nbsp;|&nbsp; Support: support@hhclaser.com</p>
            <p style="margin: 0;">© ${new Date().getFullYear()} HHC Laser & Co. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
// 1. Booking Confirmation Email
function getBookingConfirmationTemplate(data) {
    const content = `
    <h2 class="h1">Appointment Confirmed ✓</h2>
    <p class="lead">Dear ${data.customerName}, thank you for choosing HHC Laser & Co. Your treatment session has been successfully booked and paid.</p>

    <div class="code-box">
      <div class="code-title">Booking Confirmation Code</div>
      <div class="code-val">${data.confirmationCode}</div>
    </div>

    <div class="card-box">
      <table class="table-details">
        <tr><td class="label">Booking ID</td><td class="value">#${data.bookingId}</td></tr>
        <tr><td class="label">Treatment</td><td class="value">${data.treatmentName}</td></tr>
        <tr><td class="label">Date</td><td class="value">${data.date}</td></tr>
        <tr><td class="label">Time</td><td class="value">${data.time} (${data.duration})</td></tr>
        <tr><td class="label">Location</td><td class="value">${data.location}</td></tr>
        <tr><td class="label">Amount Paid</td><td class="value-gold">JMD $${data.amountPaidJmd.toLocaleString()}</td></tr>
        <tr><td class="label">Payment Ref</td><td class="value">${data.paymentRef}</td></tr>
      </table>
    </div>

    <div class="notice-box">
      <strong>Preparation Instructions:</strong><br>
      ${data.prepNotes || 'Please shave the treatment area 24 hours prior. Avoid direct sun exposure and tanning for at least 48 hours before your session.'}
    </div>

    <div class="notice-box" style="border-left-color: #8a9992; background: rgba(255,255,255,0.03);">
      <strong>Rescheduling & Cancellation Policy:</strong><br>
      ${data.cancellationPolicy || 'You can manage, reschedule, or cancel your appointment at least 24 hours in advance through your customer portal.'}
    </div>

    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${data.frontendUrl}/customer/dashboard" class="btn-gold">Manage Booking</a>
    </div>

    ${data.googleCalendarUrl ? `
      <div style="text-align: center; margin-bottom: 16px;">
        <a href="${data.googleCalendarUrl}" target="_blank" class="btn-outline">+ Add to Google Calendar</a>
      </div>
    ` : ''}
  `;
    return wrapEmailLayout(content, 'Booking Confirmation — HHC Laser & Co');
}
// 2. Appointment Reminder Email
function getAppointmentReminderTemplate(data) {
    const reminderText = data.reminderType === '24_hours' ? 'tomorrow' : data.reminderType === '2_hours' ? 'in 2 hours' : 'upcoming';
    const content = `
    <h2 class="h1">Appointment Reminder 🔔</h2>
    <p class="lead">Dear ${data.customerName}, this is a friendly reminder that your appointment is scheduled for ${reminderText}.</p>

    <div class="code-box">
      <div class="code-title">Confirmation Code</div>
      <div class="code-val">${data.confirmationCode}</div>
    </div>

    <div class="card-box">
      <table class="table-details">
        <tr><td class="label">Treatment</td><td class="value">${data.treatmentName}</td></tr>
        <tr><td class="label">Date</td><td class="value">${data.date}</td></tr>
        <tr><td class="label">Time</td><td class="value">${data.time}</td></tr>
        <tr><td class="label">Location</td><td class="value">${data.location}</td></tr>
      </table>
    </div>

    <div class="notice-box">
      <strong>Important Reminder:</strong><br>
      ${data.prepNotes || 'Please arrive 10 minutes prior to your scheduled time. Bring a valid ID and your confirmation code.'}
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.frontendUrl}/customer/dashboard" class="btn-gold">Manage Booking</a>
    </div>
  `;
    return wrapEmailLayout(content, `Reminder: Appointment ${reminderText} — HHC Laser & Co`);
}
// 3. Appointment Rescheduled Email
function getAppointmentRescheduledTemplate(data) {
    const content = `
    <h2 class="h1">Appointment Rescheduled 📅</h2>
    <p class="lead">Dear ${data.customerName}, your appointment has been updated to your requested date and time.</p>

    <div class="card-box">
      <table class="table-details">
        <tr><td class="label">Treatment</td><td class="value">${data.treatmentName}</td></tr>
        <tr><td class="label">Previous Date</td><td class="value" style="text-decoration: line-through; color: #8a9992;">${data.oldDate} at ${data.oldTime}</td></tr>
        <tr><td class="label">New Date</td><td class="value-gold">${data.newDate}</td></tr>
        <tr><td class="label">New Time</td><td class="value-gold">${data.newTime}</td></tr>
        <tr><td class="label">Location</td><td class="value">${data.location}</td></tr>
        <tr><td class="label">Code</td><td class="value">${data.confirmationCode}</td></tr>
      </table>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.frontendUrl}/customer/dashboard" class="btn-gold">View Updated Schedule</a>
    </div>
  `;
    return wrapEmailLayout(content, 'Appointment Rescheduled — HHC Laser & Co');
}
// 4. Appointment Cancelled Email
function getCancellationTemplate(data) {
    const content = `
    <h2 class="h1" style="color: #f87171;">Appointment Cancelled</h2>
    <p class="lead">Dear ${data.customerName}, your appointment for <strong>${data.treatmentName}</strong> on <strong>${data.date} at ${data.time}</strong> has been cancelled.</p>

    ${data.reason ? `
      <div class="notice-box">
        <strong>Cancellation Reason:</strong> ${data.reason}
      </div>
    ` : ''}

    ${data.refundInfo ? `
      <div class="card-box">
        <div style="color: #8a9992; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px;">Refund Information</div>
        <div style="color: #ffffff; font-size: 14px; font-weight: 600;">${data.refundInfo}</div>
      </div>
    ` : ''}

    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.frontendUrl}/booking" class="btn-gold">Book A New Appointment</a>
    </div>
  `;
    return wrapEmailLayout(content, 'Appointment Cancelled — HHC Laser & Co');
}
// 5. Payment Receipt Email
function getPaymentReceiptTemplate(data) {
    const content = `
    <h2 class="h1">Payment Receipt 🧾</h2>
    <p class="lead">Dear ${data.customerName}, thank you for your payment. Here is your official transaction receipt.</p>

    <div class="card-box">
      <table class="table-details">
        <tr><td class="label">Description</td><td class="value">${data.description}</td></tr>
        <tr><td class="label">Amount Paid</td><td class="value-gold">JMD $${data.amountJmd.toLocaleString()}</td></tr>
        <tr><td class="label">Approval Code</td><td class="value">${data.approvalCode}</td></tr>
        <tr><td class="label">Reference</td><td class="value">${data.referenceKey}</td></tr>
        <tr><td class="label">Date</td><td class="value">${data.transactionDate}</td></tr>
      </table>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.frontendUrl}/customer/dashboard" class="btn-outline">View Account History</a>
    </div>
  `;
    return wrapEmailLayout(content, `Payment Receipt — JMD $${data.amountJmd.toLocaleString()}`);
}
// 6. Welcome Email
function getWelcomeEmailTemplate(data) {
    const content = `
    <h2 class="h1">Welcome to HHC Laser & Co ✨</h2>
    <p class="lead">Dear ${data.customerName}, welcome to Jamaica's premier medical aesthetics and laser clinic. We are thrilled to guide you on your personal beauty and skin wellness journey.</p>

    <div class="card-box" style="text-align: center;">
      <h3 style="color: #c9a96e; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">Our Specialized Treatments</h3>
      <p style="color: #a4b3ac; font-size: 13px; margin: 0 0 16px 0; line-height: 1.6;">From medical-grade Laser Hair Removal to Heat Shock Detox, Fractional Skin Resurfacing, and HydraFacials.</p>
      <a href="${data.frontendUrl}/services" style="color: #c9a96e; text-decoration: underline; font-weight: 700; font-size: 13px;">Explore All Services →</a>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.frontendUrl}/booking" class="btn-gold">Book Your First Treatment</a>
    </div>
  `;
    return wrapEmailLayout(content, 'Welcome to HHC Laser & Co');
}
// 7. Password Reset Email
function getPasswordResetTemplate(data) {
    const content = `
    <h2 class="h1">Reset Your Password 🔒</h2>
    <p class="lead">Dear ${data.customerName}, we received a request to reset the password for your HHC Laser & Co account. Click the button below to choose a new password.</p>

    <div style="text-align: center; margin: 36px 0;">
      <a href="${data.resetUrl}" class="btn-gold">Reset Password</a>
    </div>

    <div class="notice-box">
      This single-use password reset link will expire in <strong>${data.expiresInMinutes} minutes</strong>. If you did not request a password reset, please ignore this email or contact support.
    </div>
  `;
    return wrapEmailLayout(content, 'Reset Your Password — HHC Laser & Co');
}
// 8. Email Verification Template
function getEmailVerificationTemplate(data) {
    const content = `
    <h2 class="h1">Verify Email Address ✉️</h2>
    <p class="lead">Dear ${data.customerName}, please verify your email address to complete your registration with HHC Laser & Co.</p>

    <div style="text-align: center; margin: 36px 0;">
      <a href="${data.verifyUrl}" class="btn-gold">Verify Email Address</a>
    </div>
  `;
    return wrapEmailLayout(content, 'Verify Your Email — HHC Laser & Co');
}
// 9. Admin Notification Email
function getAdminNotificationTemplate(data) {
    const detailsHtml = data.details.map(d => `
    <tr><td class="label">${d.label}</td><td class="value">${d.value}</td></tr>
  `).join('');
    const content = `
    <h2 class="h1" style="color: #c9a96e;">${data.title}</h2>
    <p class="lead">${data.message}</p>

    <div class="card-box">
      <table class="table-details">
        ${detailsHtml}
      </table>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.frontendUrl}/admin" class="btn-gold">Open Admin Terminal</a>
    </div>
  `;
    return wrapEmailLayout(content, `Admin Alert: ${data.title}`);
}
//# sourceMappingURL=email.templates.js.map