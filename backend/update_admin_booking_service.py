import os
import re

file_path = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\backend\src\services\booking.service.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Try to find the end of createAdminAppointment
email_logic = """
      const appointment = await executeQueryOne<Appointment>(
        'SELECT * FROM appointments WHERE id = ?',
        [appointmentId]
      );

      // --- Send Email Confirmation via Resend ---
      try {
        const user = await executeQueryOne<any>('SELECT first_name, email FROM users WHERE id = ?', [customerId]);
        if (user && user.email) {
          const serviceNames = services.map(s => s.name || s.title || `Service ID: ${s.id}`);
          // Send asynchronously
          EmailService.sendBookingConfirmation(
            user.email,
            user.first_name || 'Valued Customer',
            {
              date: dto.scheduled_date,
              time: dto.start_time,
              serviceNames,
              totalPrice: totalAmountJmd
            },
            confirmationCode
          ).catch(err => logger.error('Async email error:', err));
        }
      } catch (e) {
        logger.error('Failed to send confirmation email', e);
      }
      // ------------------------------------------

      logger.info(`[Booking] Admin Appointment ${appointmentId} created for customer ${customerId}`);
"""

# Find the executeQueryOne for the appointment in createAdminAppointment and replace
# Actually, let's just search for the specific pattern in createAdminAppointment
content = re.sub(
    r"const appointment = await executeQueryOne<Appointment>\(\s*'SELECT \* FROM appointments WHERE id = \?',\s*\[appointmentId\]\s*\);\s*logger\.info\(`\[Booking\] Admin Appointment \$\{appointmentId\} created for customer \$\{customerId\}`\);",
    email_logic,
    content,
    flags=re.DOTALL
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("booking.service.ts updated for admin bookings with EmailService!")
