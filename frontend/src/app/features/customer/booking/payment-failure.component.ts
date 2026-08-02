import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="min-h-screen py-16 px-4 flex items-center justify-center" style="background: var(--color-cream)">
      <div class="max-w-md w-full bg-white rounded-3xl p-8 border border-charcoal-200 shadow-xl text-center space-y-6">
        
        <div class="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <mat-icon class="!text-4xl">error_outline</mat-icon>
        </div>

        <div>
          <span class="section-label text-rose-600">Payment Could Not Be Completed</span>
          <h2 class="text-2xl font-bold text-slate-900 mt-2">Payment Declined or Cancelled</h2>
          <p class="text-xs text-slate-500 mt-1">We were unable to process your payment with Fiserv WebCheckout. No charges were made to your account.</p>
        </div>

        <div class="bg-rose-50/60 p-4 rounded-2xl border border-rose-100 text-left text-xs space-y-2 text-rose-900">
          <div class="font-bold flex items-center gap-1.5">
            <mat-icon class="!text-base text-rose-500">info</mat-icon>
            <span>What should you do next?</span>
          </div>
          <ul class="list-disc list-inside space-y-1 text-slate-600 pl-1">
            <li>Verify card numbers, expiration date, and CVC.</li>
            <li>Ensure sufficient funds or credit limit.</li>
            <li>Contact your bank to authorize online transactions.</li>
          </ul>
        </div>

        <div class="pt-4 flex flex-col sm:flex-row gap-3">
          <a routerLink="/customer/booking" class="btn-primary flex-1 text-center py-3">
            Try Booking Again
          </a>
          <a routerLink="/customer/dashboard" class="btn-secondary flex-1 text-center py-3">
            Return to Dashboard
          </a>
        </div>

      </div>
    </div>
  `
})
export class PaymentFailureComponent {}
