export declare class EmailService {
    /**
     * Sends a booking confirmation email with a 4-digit code and summary using Nodemailer Gmail SMTP.
     */
    static sendBookingConfirmation(toEmail: string, firstName: string, appointmentDetails: {
        date: string;
        time: string;
        serviceNames: string[];
        totalPrice: number;
    }, confirmationCode: string): Promise<void>;
}
//# sourceMappingURL=email.service.d.ts.map