export interface InvoiceLineItem {
    name: string;
    quantity: number;
    unit_price_jmd: number;
    duration_minutes: number | null;
    line_total_jmd: number;
}
export interface AppointmentInvoice {
    invoice_number: string;
    issued_at: string;
    appointment: {
        id: number;
        confirmation_code: string | null;
        scheduled_date: string;
        start_time: string;
        end_time: string | null;
        status: string;
        payment_status: string;
        booking_source: string | null;
        notes: string | null;
        total_amount_jmd: number;
    };
    customer: {
        id: number;
        first_name: string;
        last_name: string;
        email: string | null;
        phone: string | null;
    };
    location: {
        id: number | null;
        name: string;
        address: string | null;
    };
    employee_name: string | null;
    line_items: InvoiceLineItem[];
    subtotal_jmd: number;
    total_jmd: number;
    payment: {
        status: string;
        method: string | null;
        amount_jmd: number | null;
        paid_at: string | null;
        transaction_id: number | null;
    };
    clinic: {
        name: string;
        phone: string;
        email: string;
    };
}
export declare class InvoiceService {
    getAppointmentInvoice(appointmentId: number): Promise<AppointmentInvoice>;
}
export declare const invoiceService: InvoiceService;
//# sourceMappingURL=invoice.service.d.ts.map