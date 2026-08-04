import { Resend } from 'resend';
import { logger } from '../utils/logger';

// Try to initialize Resend with API key from env (defaulting to a placeholder for now)
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_placeholder';
const resend = new Resend(RESEND_API_KEY);

export class EmailService {
  /**
   * Sends a booking confirmation email with a 4-digit code and summary.
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
    const serviceList = appointmentDetails.serviceNames.map(s => `<li>${s}</li>`).join('');
    
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
          <h1 style="color: #b8924f; margin: 0;">HHC LASER</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; margin-top: 0;">Booking Confirmation</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for booking with HHC LASER! Your appointment has been successfully scheduled.</p>
          
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Your Confirmation Code</p>
            <div style="font-size: 32px; font-weight: bold; color: #b8924f; letter-spacing: 4px;">
              ${confirmationCode}
            </div>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #6b7280;">Please save this code or show it at the front desk when you arrive.</p>
          </div>

          <h3 style="color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Appointment Summary</h3>
          <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4b5563; width: 120px;">Date & Time:</td>
              <td style="padding: 8px 0;">${appointmentDetails.date} at ${appointmentDetails.time}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4b5563;" valign="top">Services:</td>
              <td style="padding: 8px 0;">
                <ul style="margin: 0; padding-left: 20px;">
                  ${serviceList}
                </ul>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Total Cost:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #111827;">JMD $${appointmentDetails.totalPrice.toLocaleString()}</td>
            </tr>
          </table>

          <p style="font-size: 14px; line-height: 1.5; color: #4b5563;">
            If you need to cancel or reschedule, please do so at least 24 hours in advance to avoid cancellation fees.
          </p>
        </div>
        
        <div style="background-color: #111827; color: #9ca3af; text-align: center; padding: 20px; font-size: 12px;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} HHC LASER MedSpa. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">Kingston, Jamaica</p>
        </div>
      </div>
    `;

    try {
      if (RESEND_API_KEY === 're_placeholder') {
        logger.warn('Skipping email send: RESEND_API_KEY not configured. Would have sent:', confirmationCode);
        return;
      }

      const { data, error } = await resend.emails.send({
        from: 'HHC LASER <bookings@hhclaser.com>',
        to: [toEmail],
        subject: 'Your Booking Confirmation - HHC LASER',
        html: htmlTemplate,
      });

      if (error) {
        logger.error('Failed to send confirmation email', error);
      } else {
        logger.info(`Confirmation email sent to ${toEmail}. Message ID: ${data?.id}`);
      }
    } catch (e) {
      logger.error('Error sending confirmation email via Resend', e);
    }
  }
}
