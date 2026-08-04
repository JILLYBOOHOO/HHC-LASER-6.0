import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface PaymentResult {
  status: 'success' | 'failure' | 'pending';
  oid?: string;
  approvalCode?: string;
  chargetotal?: string;
  currency?: string;
  responseCode?: string;
  txndatetime?: string;
}

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4"
         [style.background]="result().status === 'success' ? '#F0FDF4' : '#FFF1F2'">
      <div class="max-w-md w-full">

        @if (result().status === 'success') {
          <!-- ── SUCCESS ── -->
          <div class="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-br from-green-500 to-emerald-600 px-8 py-10 text-center">
              <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <mat-icon class="!text-5xl text-white">check_circle</mat-icon>
              </div>
              <h1 class="text-2xl font-extrabold text-white mb-1">Payment Approved!</h1>
              <p class="text-green-100 text-sm font-medium">Your HHC Laser treatment is confirmed.</p>
            </div>

            <!-- Details -->
            <div class="px-8 py-6 space-y-4">
              @if (result().oid) {
                <div class="flex justify-between items-center py-3 border-b border-gray-100">
                  <span class="text-sm font-semibold text-gray-500">Order ID (share with bank)</span>
                  <span class="text-xs font-mono text-gray-900 font-bold break-all select-all">{{ result().oid }}</span>
                </div>
              }
              @if (result().approvalCode) {
                <div class="flex justify-between items-center py-3 border-b border-gray-100">
                  <span class="text-sm font-semibold text-gray-500">Approval Code</span>
                  <span class="text-sm font-bold text-gray-900 font-mono tracking-wider">{{ result().approvalCode }}</span>
                </div>
              }
              @if (result().chargetotal) {
                <div class="flex justify-between items-center py-3 border-b border-gray-100">
                  <span class="text-sm font-semibold text-gray-500">Amount Paid</span>
                  <span class="text-base font-extrabold text-green-600">
                    {{ result().currency === '840' ? 'USD' : 'JMD' }} {{ result().chargetotal | number:'1.2-2' }}
                  </span>
                </div>
              }
              @if (result().txndatetime) {
                <div class="flex justify-between items-center py-3">
                  <span class="text-sm font-semibold text-gray-500">Transaction Time</span>
                  <span class="text-xs text-gray-600">{{ result().txndatetime }}</span>
                </div>
              }
            </div>

            <!-- Actions -->
            <div class="px-8 pb-8 flex flex-col gap-3">
              <a routerLink="/customer/bookings"
                 class="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl text-center transition-colors shadow-sm">
                View My Bookings
              </a>
              <a routerLink="/"
                 class="w-full py-2.5 border border-gray-200 text-gray-600 hover:text-gray-900 font-semibold text-sm rounded-xl text-center transition-colors">
                Return to Home
              </a>
            </div>

            <!-- Footer note -->
            <div class="bg-green-50 px-8 py-4 text-center">
              <p class="text-xs text-green-700">
                A confirmation email will be sent shortly. For support call (876) 319-6241.
              </p>
            </div>
          </div>

        } @else if (result().status === 'failure') {
          <!-- ── FAILURE ── -->
          <div class="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-br from-red-500 to-rose-600 px-8 py-10 text-center">
              <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <mat-icon class="!text-5xl text-white">cancel</mat-icon>
              </div>
              <h1 class="text-2xl font-extrabold text-white mb-1">Payment Declined</h1>
              <p class="text-red-100 text-sm font-medium">Your transaction could not be completed.</p>
            </div>

            <!-- Details -->
            <div class="px-8 py-6 space-y-4">
              @if (result().responseCode) {
                <div class="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p class="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">Decline Reason</p>
                  <p class="text-sm font-bold text-red-900">{{ getDeclineMessage(result().responseCode!) }}</p>
                  <p class="text-xs text-red-500 mt-1 font-mono">Code: {{ result().responseCode }}</p>
                </div>
              }
              @if (result().oid) {
                <div class="flex justify-between items-center py-3 border-b border-gray-100">
                  <span class="text-sm font-semibold text-gray-500">Order Reference</span>
                  <span class="text-xs font-mono text-gray-700 break-all">{{ result().oid }}</span>
                </div>
              }
              @if (result().chargetotal) {
                <div class="flex justify-between items-center py-3">
                  <span class="text-sm font-semibold text-gray-500">Attempted Amount</span>
                  <span class="text-base font-extrabold text-gray-600">
                    {{ result().currency === '840' ? 'USD' : 'JMD' }} {{ result().chargetotal | number:'1.2-2' }}
                  </span>
                </div>
              }
            </div>

            <!-- Actions -->
            <div class="px-8 pb-8 flex flex-col gap-3">
              <a routerLink="/customer/book"
                 [queryParams]="{ service: serviceId() }"
                 class="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl text-center transition-colors shadow-sm">
                Try Again
              </a>
              <a href="tel:18763196241"
                 class="w-full py-2.5 border border-gray-200 text-gray-600 hover:text-gray-900 font-semibold text-sm rounded-xl text-center transition-colors flex items-center justify-center gap-2">
                <mat-icon class="!text-base">phone</mat-icon>
                Call (876) 319-6241 for Help
              </a>
              <a routerLink="/"
                 class="w-full py-2.5 text-gray-400 hover:text-gray-600 font-semibold text-sm rounded-xl text-center transition-colors">
                Return to Home
              </a>
            </div>

            <!-- Footer note -->
            <div class="bg-red-50 px-8 py-4 text-center">
              <p class="text-xs text-red-700">
                Your card was not charged. Please check your card details or try a different card.
              </p>
            </div>
          </div>

        } @else {
          <!-- ── LOADING / PENDING ── -->
          <div class="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div class="w-16 h-16 border-4 border-[#D4A359] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 class="text-xl font-bold text-gray-800 mb-2">Verifying Payment...</h2>
            <p class="text-sm text-gray-500">Please wait while we confirm your transaction.</p>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `]
})
export class PaymentResultComponent implements OnInit {
  result = signal<PaymentResult>({ status: 'pending' });
  serviceId = signal<string>('');

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Backend redirects with camelCase; Fiserv may use snake_case
    const params = this.route.snapshot.queryParams;

    const oid = params['oid'] || params['order_id'] || '';
    const approvalCode =
      params['approvalCode'] || params['approval_code'] || '';
    const responseCode =
      params['responseCode'] ||
      params['response_code'] ||
      params['associationResponseCode'] ||
      '';
    const chargetotal = params['chargetotal'] || params['chargeTotal'] || '';
    const currency = params['currency'] || '840';
    const txndatetime = params['txndatetime'] || '';
    const status = params['status'] || '';
    this.serviceId.set(params['service'] || params['serviceId'] || '');

    const url = this.router.url.split('?')[0];
    // Our API already routes approved txs to /payment/success and declines to /failure.
    // Fiserv approval codes start with "Y:" when approved.
    const approvedByCode =
      status.toUpperCase() === 'APPROVED' ||
      approvalCode.toUpperCase().startsWith('Y:') ||
      (!!approvalCode && !approvalCode.toUpperCase().startsWith('N:'));
    const isSuccess =
      url.includes('/payment/success') &&
      (approvedByCode || !approvalCode);

    this.result.set({
      status: isSuccess ? 'success' : 'failure',
      oid,
      approvalCode,
      responseCode,
      chargetotal,
      currency,
      txndatetime,
    });
  }

  getDeclineMessage(code: string): string {
    const upper = code.toUpperCase();
    // Common Fiserv response codes
    if (upper.includes('54') || upper.includes('EXPIREDCARD')) return 'Card Expired';
    if (upper.includes('51') || upper.includes('INSUFFICIENTFUND')) return 'Insufficient Funds';
    if (upper.includes('05') || upper.includes('DONOTHONOROR')) return 'Transaction Not Authorized';
    if (upper.includes('14') || upper.includes('INVALIDCARDNUMBER')) return 'Invalid Card Number';
    if (upper.includes('57') || upper.includes('NOTPERMITTEDCUSTOMER')) return 'Transaction Not Permitted';
    if (upper.includes('61') || upper.includes('EXCEEDS')) return 'Amount Exceeds Card Limit';
    if (upper.includes('N:')) return `Declined: ${code.replace('N:', '')}`;
    return `Declined (${code})`;
  }
}
