import os
import re

file_path = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\backend\src\services\booking.service.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add EmailService import
if "import { EmailService }" not in content:
    content = content.replace("import { Service } from '../models/types';", "import { Service, User } from '../models/types';\nimport { EmailService } from './email.service';")
    if "import { Service, User } from" not in content:
        # Just in case the replacement failed
        content = "import { EmailService } from './email.service';\n" + content

# 2. Fix confirmation code generation in createAppointment
content = content.replace(
    "const confirmationCode = crypto.randomBytes(3).toString('hex').toUpperCase();",
    "const confirmationCode = Math.floor(1000 + Math.random() * 9000).toString();"
)

# 3. Trigger email after appointment creation in createAppointment
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

      logger.info(`[Booking] Appointment ${appointmentId} created for customer ${customerId}`);
"""
content = re.sub(
    r"const appointment = await executeQueryOne<Appointment>\(\s*'SELECT \* FROM appointments WHERE id = \?',\s*\[appointmentId\]\s*\);\s*logger\.info.*?;",
    email_logic,
    content,
    flags=re.DOTALL
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("booking.service.ts updated with EmailService and 4-digit code!")
