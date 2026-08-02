import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-refund-policy',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-background pt-4 pb-20 overflow-hidden">
      <!-- Hero Section -->
      <section class="container-luxury px-6 mb-16 animate-fade-in-up">
        <div class="max-w-4xl mx-auto text-center">
          <span class="section-label">Legal</span>
          <h1 class="mt-4 font-heading text-4xl md:text-5xl text-black leading-tight mb-8 drop-shadow-lg">
            Refund Policy
          </h1>
          <div class="divider-gold mx-auto"></div>
        </div>
      </section>

      <!-- Content -->
      <section class="container-luxury px-6 max-w-4xl mx-auto space-y-12 animate-fade-in-up" style="animation-delay: 0.2s;">
        
        <!-- Eligibility and Conditions -->
        <div class="glass p-10 rounded-3xl border border-gold/10 shadow-gold-lg group">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
              <mat-icon class="text-gold">event_available</mat-icon>
            </div>
            <h2 class="font-heading text-2xl md:text-3xl text-black m-0">Eligibility and Conditions</h2>
          </div>
          
          <h3 class="text-gold text-lg font-semibold tracking-wide uppercase mb-4">Cancellation and Rescheduling</h3>
          <ul class="space-y-4 text-text-muted font-light leading-relaxed mb-8">
            <li><strong class="text-black font-medium">Timeframe:</strong> 24-hour cancellation or rescheduling policy applies to all appointments.</li>
            <li><strong class="text-black font-medium">Payment Terms:</strong> All payments are considered final once services are completed.</li>
            <li><strong class="text-black font-medium">No Show Policy:</strong> No refunds will be provided for clients who fail to attend their scheduled appointment without proper 24-hour notice.</li>
            <li><strong class="text-black font-medium">Refund Processing:</strong> When a refund is approved, it will be processed within 7 business days of approval.</li>
          </ul>

          <div class="h-px w-full bg-black/5 my-8"></div>

          <div class="flex items-center gap-4 mb-6">
            <div class="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
              <mat-icon class="text-gold">inventory_2</mat-icon>
            </div>
            <h3 class="text-gold text-lg font-semibold tracking-wide uppercase m-0">Product Items Condition</h3>
          </div>
          <p class="text-black mb-4">For any retail products purchased:</p>
          <ul class="space-y-4 text-text-muted font-light leading-relaxed mb-8">
            <li><strong class="text-black font-medium">Condition Requirements:</strong> Items must be unused, unopened, and in their original packaging to be eligible for a refund or exchange.</li>
            <li><strong class="text-black font-medium">Return Timeframe:</strong> Products must be returned within 30 days of purchase.</li>
            <li><strong class="text-black font-medium">Proof of Purchase:</strong> A valid receipt or order confirmation is always required for all refund requests.</li>
          </ul>

          <div class="h-px w-full bg-black/5 my-8"></div>

          <div class="flex items-center gap-4 mb-6">
            <div class="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
              <mat-icon class="text-gold">card_giftcard</mat-icon>
            </div>
            <h3 class="text-gold text-lg font-semibold tracking-wide uppercase m-0">Gift Cards and Vouchers</h3>
          </div>
          <ul class="space-y-4 text-text-muted font-light leading-relaxed">
            <li><strong class="text-black font-medium">Processing Location:</strong> Gift cards and vouchers can only be processed and refunded at our office location.</li>
            <li><strong class="text-black font-medium">Terms:</strong> Gift cards and vouchers are subject to the same 24-hour cancellation policy when used for services.</li>
            <li><strong class="text-black font-medium">Expiration:</strong> Please check your gift card or voucher for expiration dates.</li>
          </ul>
        </div>

        <!-- Refund Process -->
        <div class="glass p-10 rounded-3xl border border-gold/10 shadow-gold-lg group">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
              <mat-icon class="text-gold">currency_exchange</mat-icon>
            </div>
            <h2 class="font-heading text-2xl md:text-3xl text-black m-0">Refund Process</h2>
          </div>
          <p class="text-black mb-4">To request a refund:</p>
          <ul class="space-y-4 text-text-muted font-light leading-relaxed mb-8 list-none">
            <li class="flex items-start gap-3"><mat-icon class="text-gold/60 text-sm mt-1">arrow_right</mat-icon><span><strong class="text-black font-medium">Contact Us:</strong> Call or email us within the specified timeframe</span></li>
            <li class="flex items-start gap-3"><mat-icon class="text-gold/60 text-sm mt-1">arrow_right</mat-icon><span><strong class="text-black font-medium">Provide Documentation:</strong> Present your receipt or order confirmation</span></li>
            <li class="flex items-start gap-3"><mat-icon class="text-gold/60 text-sm mt-1">arrow_right</mat-icon><span><strong class="text-black font-medium">Return Products:</strong> Bring unused products in original packaging (if applicable)</span></li>
            <li class="flex items-start gap-3"><mat-icon class="text-gold/60 text-sm mt-1">arrow_right</mat-icon><span><strong class="text-black font-medium">Processing:</strong> Approved refunds will be processed within 7 business days</span></li>
          </ul>

          <div class="h-px w-full bg-black/5 my-8"></div>

          <div class="flex items-center gap-4 mb-6">
            <div class="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
              <mat-icon class="text-gold">block</mat-icon>
            </div>
            <h3 class="text-gold text-lg font-semibold tracking-wide uppercase m-0">Exceptions</h3>
          </div>
          <p class="text-black mb-4">Refunds may not be available for:</p>
          <ul class="space-y-3 text-text-muted font-light leading-relaxed list-disc list-inside marker:text-gold/50">
            <li>Services already rendered</li>
            <li>No-show appointments</li>
            <li>Cancellations made less than 24 hours in advance</li>
            <li>Opened or used products</li>
            <li>Gift cards purchased more than one year ago</li>
          </ul>
        </div>

        <!-- Contact Information & Dispute Resolution -->
        <div class="glass p-10 rounded-3xl border border-gold/10 shadow-gold-lg group">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
              <mat-icon class="text-gold">contact_support</mat-icon>
            </div>
            <h2 class="font-heading text-2xl md:text-3xl text-black m-0">Contact Information</h2>
          </div>
          <p class="text-black mb-6">For refund requests or questions about this policy:</p>
          <div class="space-y-4 text-text-muted font-light leading-relaxed mb-10">
            <div class="flex items-center gap-3"><mat-icon class="text-gold text-sm">email</mat-icon> <span><strong class="text-black font-medium">Email:</strong> {{ "{import.meta.env.VITE_CONTACT_EMAIL || 'infohhcLaser@gmail.com'}" }}</span></div>
            <div class="flex items-center gap-3"><mat-icon class="text-gold text-sm">phone</mat-icon> <span><strong class="text-black font-medium">Phone:</strong> (876) 319-6241</span></div>
            <div class="flex items-center gap-3"><mat-icon class="text-gold text-sm">business</mat-icon> <span><strong class="text-black font-medium">Office:</strong> Visit us in person during business hours</span></div>
            <div class="flex items-center gap-3"><mat-icon class="text-gold text-sm">location_on</mat-icon> <span><strong class="text-black font-medium">Address:</strong> [Your Clinic Address]</span></div>
          </div>

          <div class="h-px w-full bg-black/5 my-8"></div>

          <div class="flex items-center gap-4 mb-6">
            <div class="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
              <mat-icon class="text-gold">gavel</mat-icon>
            </div>
            <h3 class="text-gold text-lg font-semibold tracking-wide uppercase m-0">Dispute Resolution</h3>
          </div>
          <p class="text-text-muted font-light leading-relaxed">
            If you have concerns about a refund decision, please contact our management team for review. We strive to resolve all issues fairly and promptly.
          </p>
        </div>

      </section>
    </div>
  `,
  styles: [`
    .animate-fade-in-up {
      animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
      transform: translateY(30px);
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class RefundPolicyComponent implements OnInit {
  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
