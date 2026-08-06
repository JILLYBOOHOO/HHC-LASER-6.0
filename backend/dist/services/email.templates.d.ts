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
    details: {
        label: string;
        value: string;
    }[];
}
export interface BirthdayEmailData extends BaseEmailData {
    customerName: string;
}
export declare function getBookingConfirmationTemplate(data: BookingConfirmationData): string;
export declare function getAppointmentReminderTemplate(data: AppointmentReminderData): string;
export declare function getAppointmentRescheduledTemplate(data: RescheduledData): string;
export declare function getCancellationTemplate(data: CancellationData): string;
export declare function getPaymentReceiptTemplate(data: PaymentReceiptData): string;
export declare function getWelcomeEmailTemplate(data: WelcomeEmailData): string;
export declare function getPasswordResetTemplate(data: PasswordResetData): string;
export declare function getEmailVerificationTemplate(data: EmailVerificationData): string;
export declare function getAdminNotificationTemplate(data: AdminNotificationData): string;
export declare function getBirthdayEmailTemplate(data: BirthdayEmailData): string;
//# sourceMappingURL=email.templates.d.ts.map