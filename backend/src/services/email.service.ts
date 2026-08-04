import * as nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { notificationService } from './notification.service';

export class EmailService {
  /**
   * Sends a booking confirmation email with a 4-digit code and summary using Nodemailer Gmail SMTP.
   */
  static async sendBookingConfirmation(
    toEmail: string,
    firstName: string,
    appointmentDetails: {
      date: string;
      time: string;
      serviceNames: string[];
      totalPrice: number;
    },
    confirmationCode: string
  ) {
    const smtpUser = process.env.SMTP_USER || 'kake.101buchanan@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'yyntwhfpgtkntzhy';

    const serviceList = appointmentDetails.serviceNames.map(s => `<li style="margin-bottom: 4px;">${s}</li>`).join('');
    
    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827; background-color: #ffffff;">
        <div style="background-color: #111827; padding: 25px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #b8924f; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">HHC LASER & CO</h1>
          <p style="color: #9ca3af; margin: 4px 0 0 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">Medical Spa & Wellness</p>
        </div>
        
        <div style="padding: 35px 30px; background-color: #fafafa; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Booking Confirmation</h2>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">Hi <strong>${firstName}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">Thank you for booking with HHC Laser & Co! Your appointment has been successfully scheduled.</p>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb; margin: 25px 0; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Your Confirmation Code</p>
            <div style="font-size: 32px; font-weight: 900; color: #b8924f; letter-spacing: 6px;">
              ${confirmationCode}
            </div>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280;">Please show this code at the front desk when you arrive.</p>
          </div>

          <h3 style="color: #111827; border-bottom: 2px solid #b8924f; padding-bottom: 8px; font-size: 15px; text-transform: uppercase; letter-spacing: 1px;">Appointment Details</h3>
          <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #6b7280; width: 130px; border-bottom: 1px solid #f3f4f6;">Date & Time:</td>
              <td style="padding: 10px 0; font-weight: bold; color: #111827; border-bottom: 1px solid #f3f4f6;">${appointmentDetails.date} at ${appointmentDetails.time}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #6b7280;" valign="top">Services:</td>
              <td style="padding: 10px 0; color: #111827;">
                <ul style="margin: 0; padding-left: 20px; color: #111827; font-weight: 600;">
                  ${serviceList}
                </ul>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #6b7280; border-top: 1px solid #f3f4f6;">Total Cost:</td>
              <td style="padding: 10px 0; font-weight: 900; color: #b8924f; font-size: 16px; border-top: 1px solid #f3f4f6;">JMD $${appointmentDetails.totalPrice.toLocaleString()}</td>
            </tr>
          </table>

          <p style="font-size: 13px; line-height: 1.5; color: #6b7280; background-color: #f3f4f6; padding: 12px 15px; border-radius: 8px;">
            💡 <strong>Note:</strong> If you need to cancel or reschedule, please do so at least 24 hours in advance.
          </p>
        </div>
        
        <div style="background-color: #111827; color: #9ca3af; text-align: center; padding: 20px; font-size: 12px; border-radius: 0 0 12px 12px; margin-top: 10px;">
          <p style="margin: 0; font-weight: bold; color: #ffffff;">HHC Laser & Co MedSpa</p>
          <p style="margin: 4px 0 0 0;">48 Constant Spring Road, Kingston, Jamaica</p>
          <p style="margin: 8px 0 0 0; color: #6b7280;">&copy; ${new Date().getFullYear()} HHC Laser & Co. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const info = await transporter.sendMail({
        from: `HHC Laser & Co <${smtpUser}>`,
        to: toEmail,
        subject: `Your Booking Confirmation #${confirmationCode} — HHC Laser & Co`,
        html: htmlTemplate,
      });

      logger.info(`[EmailService] Confirmation email sent to ${toEmail}. Message ID: ${info.messageId}`);
    } catch (e) {
      logger.error('[EmailService] Error sending confirmation email via Nodemailer', e);
    }
  }
}
