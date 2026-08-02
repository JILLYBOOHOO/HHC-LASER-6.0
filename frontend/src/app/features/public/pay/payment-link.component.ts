import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { FiservPaymentService, FiservPaymentResponse } from '../../../services/fiserv-payment.service';


@Component({
  selector: 'app-payment-link',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-neutral-900">
          Complete Your Payment
        </h2>
        <p class="mt-2 text-center text-sm text-neutral-600">
          Secure payment via Fiserv
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          
          <div *ngIf="loading()">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p class="text-neutral-600">Loading your secure payment session...</p>
          </div>

          <div *ngIf="error()" class="bg-red-50 p-4 rounded-md">
            <h3 class="text-sm font-medium text-red-800">{{ error() }}</h3>
          </div>

          <div *ngIf="paymentSession()">
            <p class="text-neutral-700 mb-6">You are being redirected to the secure payment gateway.</p>
            
            <form ngNoForm [action]="paymentSession()?.payment_url" method="POST" id="fiserv-form">
              <input type="hidden" name="storename" [value]="paymentSession()?.storename">
              <input type="hidden" name="timezone" [value]="paymentSession()?.timezone">
              <input type="hidden" name="chargetotal" [value]="paymentSession()?.chargetotal">
              <input type="hidden" name="currency" [value]="paymentSession()?.currency">
              <input type="hidden" name="txndatetime" [value]="paymentSession()?.txndatetime">
              <input type="hidden" name="hash_algorithm" [value]="paymentSession()?.hash_algorithm">
              <input type="hidden" name="hash" [value]="paymentSession()?.hash">
              
              <input type="hidden" name="oid" [value]="paymentSession()?.oid">
              <input type="hidden" name="responseSuccessURL" [value]="paymentSession()?.responseSuccessURL">
              <input type="hidden" name="responseFailURL" [value]="paymentSession()?.responseFailURL">
              <input type="hidden" name="transactionNotificationURL" [value]="paymentSession()?.transactionNotificationURL">
              
              <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                Proceed to Secure Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentLinkComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  paymentSession = signal<any>(null);

  constructor(
    private route: ActivatedRoute,
    private fiservPaymentService: FiservPaymentService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const appointmentId = params.get('orderId');
      if (appointmentId) {
        this.fetchPaymentSession(appointmentId);
      } else {
        this.loading.set(false);
        this.error.set('Invalid payment link. Missing order identifier.');
      }
    });
  }

  fetchPaymentSession(appointmentId: string) {
    // Use the new Fiserv service to get the payment payload
    this.fiservPaymentService.createPayment({ amount: 1000 }) // replace with actual amount logic
      .subscribe({
        next: (payload: FiservPaymentResponse) => {
          this.loading.set(false);
          this.paymentSession.set({
            payment_url: payload.gatewayUrl,
            ...payload.params,
          });
          // auto‑submit the hidden form
          setTimeout(() => {
            const form = document.getElementById('fiserv-form') as HTMLFormElement;
            if (form) form.submit();
          }, 500);
        },
        error: (err: any) => {
          this.loading.set(false);
          // Friendly user‑facing message – no technical details
          this.error.set(
            "We're unable to connect to our booking system at the moment. Please try again in a few minutes or contact HHC Laser & Co MedSpa to schedule your appointment."
          );
        },
      });
  }
}
