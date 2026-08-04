export interface AppointmentInvoiceData {
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
  line_items: Array<{
    name: string;
    quantity: number;
    unit_price_jmd: number;
    duration_minutes: number | null;
    line_total_jmd: number;
  }>;
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

function money(n: number | null | undefined): string {
  return `JMD $${Number(n || 0).toLocaleString('en-JM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date?: string | null): string {
  if (!date) return '—';
  const raw = String(date).slice(0, 10);
  const [y, m, d] = raw.split('-').map(Number);
  if (!y || !m || !d) return raw;
  return new Date(y, m - 1, d).toLocaleDateString('en-JM', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(time?: string | null): string {
  if (!time) return '—';
  const [hStr, mStr] = String(time).split(':');
  let h = Number(hStr);
  const m = (mStr || '00').slice(0, 2);
  if (Number.isNaN(h)) return String(time);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function paymentLabel(status: string, method?: string | null): string {
  const methodMap: Record<string, string> = {
    cash: 'Cash',
    card_in_store: 'Card (in store)',
    bank_transfer: 'Bank transfer',
    other: 'Other',
  };
  if (method && methodMap[method]) return methodMap[method];
  const statusMap: Record<string, string> = {
    pay_at_appointment: 'Pay at appointment',
    paid_in_store: 'Paid in store',
    paid_online: 'Paid online',
    pending_payment: 'Pending payment',
    complimentary: 'Complimentary',
  };
  return statusMap[status] || status.replace(/_/g, ' ');
}

function isPaid(status: string): boolean {
  return ['paid_in_store', 'paid_online', 'paid_by_phone', 'complimentary'].includes(status);
}

export function buildInvoiceHtml(invoice: AppointmentInvoiceData): string {
  const customerName = `${invoice.customer.first_name} ${invoice.customer.last_name}`.trim();
  const paid = isPaid(invoice.payment.status);
  const lines = invoice.line_items
    .map(
      (item) => `
      <tr>
        <td>
          <div class="item-name">${escapeHtml(item.name)}</div>
          ${item.duration_minutes ? `<div class="muted">${item.duration_minutes} min</div>` : ''}
        </td>
        <td class="num">${item.quantity}</td>
        <td class="num">${money(item.unit_price_jmd)}</td>
        <td class="num">${money(item.line_total_jmd)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(invoice.invoice_number)} — HHC Laser</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Georgia, 'Times New Roman', serif; color: #1e293b; margin: 0; padding: 32px; background: #fff; }
    .header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #b8924f; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; }
    .brand span { display: block; font-size: 11px; letter-spacing: 0.2em; color: #b8924f; text-transform: uppercase; margin-top: 4px; font-family: Arial, sans-serif; }
    .meta { text-align: right; font-family: Arial, sans-serif; font-size: 12px; color: #64748b; line-height: 1.6; }
    .meta strong { color: #0f172a; font-size: 14px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; font-family: Arial, sans-serif; font-size: 13px; }
    .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; font-weight: 700; margin-bottom: 6px; }
    .value { font-weight: 600; color: #0f172a; }
    .muted { color: #64748b; font-size: 12px; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 13px; margin-bottom: 20px; }
    th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; border-bottom: 1px solid #e2e8f0; padding: 10px 8px; }
    th.num, td.num { text-align: right; }
    td { padding: 12px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    .item-name { font-weight: 600; color: #0f172a; }
    .totals { width: 280px; margin-left: auto; font-family: Arial, sans-serif; font-size: 13px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; color: #475569; }
    .totals-row.grand { border-top: 2px solid #0f172a; margin-top: 8px; padding-top: 12px; font-size: 16px; font-weight: 800; color: #0f172a; }
    .badge { display: inline-block; margin-top: 12px; padding: 6px 12px; border-radius: 999px; font-family: Arial, sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; }
    .badge.paid { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .badge.due { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; color: #94a3b8; text-align: center; }
    @media print {
      body { padding: 12px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">HHC Laser<span>Invoice</span></div>
    <div class="meta">
      <strong>${escapeHtml(invoice.invoice_number)}</strong><br>
      Issued ${new Date(invoice.issued_at).toLocaleString('en-JM')}<br>
      ${escapeHtml(invoice.clinic.phone)} · ${escapeHtml(invoice.clinic.email)}
    </div>
  </div>

  <div class="grid">
    <div>
      <div class="label">Bill To</div>
      <div class="value">${escapeHtml(customerName)}</div>
      <div class="muted">${escapeHtml(invoice.customer.phone || '—')}</div>
      <div class="muted">${escapeHtml(invoice.customer.email || '')}</div>
    </div>
    <div>
      <div class="label">Appointment</div>
      <div class="value">${formatDate(invoice.appointment.scheduled_date)} · ${formatTime(invoice.appointment.start_time)}</div>
      <div class="muted">${escapeHtml(invoice.location.name)}${invoice.location.address ? ' · ' + escapeHtml(invoice.location.address) : ''}</div>
      <div class="muted">Confirmation #${escapeHtml(invoice.appointment.confirmation_code || String(invoice.appointment.id))}</div>
      ${invoice.employee_name ? `<div class="muted">Specialist: ${escapeHtml(invoice.employee_name)}</div>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Service</th>
        <th class="num">Qty</th>
        <th class="num">Price</th>
        <th class="num">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${lines || '<tr><td colspan="4">No line items</td></tr>'}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>${money(invoice.subtotal_jmd)}</span></div>
    <div class="totals-row grand"><span>${paid ? 'Amount Paid' : 'Amount Due'}</span><span>${money(invoice.total_jmd)}</span></div>
    <div class="badge ${paid ? 'paid' : 'due'}">${escapeHtml(paymentLabel(invoice.payment.status, invoice.payment.method))}</div>
  </div>

  <div class="footer">
    Thank you for choosing HHC Laser · Kingston, Jamaica<br>
    This invoice was generated for in-clinic booking and payment.
  </div>

  <script>
    window.onload = function () { window.focus(); window.print(); };
  </script>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function printAppointmentInvoice(invoice: AppointmentInvoiceData): void {
  const html = buildInvoiceHtml(invoice);
  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1000');
  if (!win) {
    alert('Please allow pop-ups to print the invoice.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
