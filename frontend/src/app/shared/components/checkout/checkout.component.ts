import { Component, Inject, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <button mat-raised-button class="!bg-black !text-white !font-bold !py-2 !px-6 hover:!bg-gold-500 transition-colors" (click)="processCheckout()" [disabled]="loading">
      {{ loading ? 'Processing...' : buttonText }}
    </button>
  `
})
export class CheckoutComponent {
  @Input() orderTotal: string = '13.00';
  @Input() buttonText: string = 'Pay Now';
  loading = false;

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) {}

  processCheckout() {
    this.loading = true;
    this.http.post(`${environment.apiUrl}/payments/generate-hash`, { chargeTotal: this.orderTotal }).subscribe({
      next: (data: any) => {
        const form = this.document.createElement('form');
        form.method = 'POST';
        form.action = data.gatewayUrl || 'https://www2.ipg-online.com/connect/gateway/processing';

        const fields: Record<string, string> = data.formFields || {
          chargetotal: this.orderTotal,
          checkoutoption: 'combinedpage',
          currency: data.currency,
          hash_algorithm: 'HMACSHA256',
          hashExtended: data.hashExtended,
          storename: data.storeId,
          timezone: data.timezone,
          txndatetime: data.txnDateTime,
          txntype: 'sale',
        };

        Object.entries(fields).forEach(([name, value]) => {
          const input = this.document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = String(value ?? '');
          form.appendChild(input);
        });

        this.document.body.appendChild(form);
        form.submit();
      },
      error: (err) => {
        console.error('Error generating hash:', err);
        this.loading = false;
        alert(err?.error?.error || 'Payment initialization failed. Please try again.');
      }
    });
  }
}
