export type DedicatedSender = 'appointments' | 'support' | 'billing' | 'noreply';
export declare class NotificationService {
    private sentEmailHashes;
    /**
     * Core private email sender with retry logic & idempotency checks
     */
    private sendEmail;
    /**
     * Non-blocking queue wrapper so API responses return instantly
     */
    private queueEmail;
    /**
     * 1. Booking Confirmation Email (appointments@hhclaser.com)
     */
    sendAppointmentConfirmation(customerId: number, details: {
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
    }): Promise<void>;
    /**
     * 2. Appointment Reminder Email (appointments@hhclaser.com)
     */
    sendAppointmentReminder(customerId: number, details: {
        date: string;
        time: string;
        services: string;
        location?: string;
        confirmationCode: string;
        reminderType?: '7_days' | '24_hours' | '2_hours';
    }): Promise<void>;
    /**
     * 3. Appointment Rescheduled Email (appointments@hhclaser.com)
     */
    sendAppointmentRescheduled(customerId: number, details: {
        treatmentName: string;
        oldDate: string;
        oldTime: string;
        newDate: string;
        newTime: string;
        location?: string;
        confirmationCode: string;
    }): Promise<void>;
    /**
     * 4. Appointment Cancelled Email (support@hhclaser.com)
     */
    sendAppointmentCancelled(customerId: number, details: {
        treatmentName: string;
        date: string;
        time: string;
        reason?: string;
        refundInfo?: string;
    }): Promise<void>;
    /**
     * 5. Payment Receipt Email (billing@hhclaser.com)
     */
    sendPaymentConfirmation(customerId: number, details: {
        amount: number;
        approvalCode: string;
        idempotencyKey: string;
        appointmentId?: number | null;
    }): Promise<void>;
    /**
     * 6. Welcome Email (noreply@hhclaser.com)
     */
    sendWelcomeEmail(user: {
        email: string;
        first_name: string;
    }): Promise<void>;
    /**
     * 7. Password Reset Email (noreply@hhclaser.com)
     */
    sendPasswordReset(user: {
        email: string;
        first_name: string;
    }, resetToken: string): Promise<void>;
    /**
     * 8. Admin Alert Notification (noreply@hhclaser.com to infohhcLaser@gmail.com)
     */
    sendAdminNotification(data: {
        title: string;
        message: string;
        details: {
            label: string;
            value: string;
        }[];
    }): Promise<void>;
    /**
     * 9. Birthday Email (noreply@hhclaser.com)
     */
    sendBirthdayEmail(user: {
        id: number;
        email: string;
        first_name: string;
    }): Promise<void>;
    /**
     * Database Notification Logging
     */
    private logNotification;
}
export declare const notificationService: NotificationService;
//# sourceMappingURL=notification.service.d.ts.map