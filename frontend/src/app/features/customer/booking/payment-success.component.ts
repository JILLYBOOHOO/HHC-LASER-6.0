import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="min-h-screen py-16 px-4 flex items-center justify-center" style="background: var(--color-cream)">
      <div class="max-w-md w-full bg-white rounded-3xl p-8 border border-charcoal-200 shadow-xl text-center space-y-6">
        
        <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <mat-icon class="!text-4xl">check_circle</mat-icon>
        </div>

        <div>
          <span class="section-label">Payment Confirmed</span>
          <h2 class="text-2xl font-bold text-slate-900 mt-2">Thank You for Your Payment!</h2>
          <p class="text-xs text-slate-500 mt-1">Your treatment session is officially reserved and confirmed.</p>
        </div>

        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs space-y-2.5">
          <div class="flex justify-between border-b border-slate-200/60 pb-2">
            <span class="text-slate-500">Status</span>
            <span class="font-bold text-green-600 uppercase tracking-wider">Confirmed</span>
          </div>
          @if (transactionId()) {
            <div class="flex justify-between border-b border-slate-200/60 pb-2">
              <span class="text-slate-500">Transaction ID</span>
              <span class="font-mono text-slate-700 font-semibold">{{ transactionId() }}</span>
            </div>
          }
          @if (approvalCode()) {
            <div class="flex justify-between border-b border-slate-200/60 pb-2">
              <span class="text-slate-500">Approval Code</span>
              <span class="font-mono text-slate-700 font-semibold">{{ approvalCode() }}</span>
            </div>
          }
          <div class="flex justify-between">
            <span class="text-slate-500">Payment Method</span>
            <span class="font-semibold text-slate-800">Fiserv WebCheckout (Credit Card)</span>
          </div>
        </div>

        <div class="pt-4 flex flex-col sm:flex-row gap-3">
          <a routerLink="/customer/dashboard" class="btn-primary flex-1 text-center py-3">
            Go to My Dashboard
          </a>
          <button (click)="printReceipt()" class="btn-secondary flex-1 py-3">
            Print Receipt
          </button>
        </div>

      </div>
    </div>
  `
})
export class PaymentSuccessComponent implements OnInit {
  transactionId = signal<string | null>(null);
  approvalCode = signal<string | null>(null);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['oid'] || params['transaction_id']) {
        this.transactionId.set(params['oid'] || params['transaction_id']);
      }
      if (params['approval_code']) {
        this.approvalCode.set(params['approval_code']);
      }
    });
  }

  printReceipt() {
    window.print();
  }
}
