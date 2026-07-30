import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-background pt-32 pb-24 overflow-hidden">
      <!-- Hero Section -->
      <section class="container-luxury px-6 mb-16 animate-fade-in-up">
        <div class="max-w-4xl mx-auto text-center">
          <span class="section-label">Legal</span>
          <h1 class="mt-4 font-heading text-4xl md:text-5xl text-white leading-tight mb-8 drop-shadow-lg">
            Terms of Service
          </h1>
          <div class="divider-gold mx-auto"></div>
        </div>
      </section>

      <!-- Content -->
      <section class="container-luxury px-6 max-w-4xl mx-auto space-y-12 animate-fade-in-up" style="animation-delay: 0.2s;">
        
        <!-- Eligibility and Conditions / Appointment Policy -->
        <div class="glass p-10 rounded-3xl border border-gold/10 shadow-gold-lg group">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
              <mat-icon class="text-gold">calendar_month</mat-icon>
            </div>
            <h2 class="font-heading text-2xl md:text-3xl text-white m-0">Eligibility and Conditions</h2>
          </div>
          
          <h3 class="text-gold text-lg font-semibold tracking-wide uppercase mb-4">Appointment Policy</h3>
          <ul class="space-y-4 text-text-muted font-light leading-relaxed">
            <li><strong class="text-white font-medium">Timeframe:</strong> 24-hour cancellation or rescheduling policy is strictly enforced.</li>
            <li><strong class="text-white font-medium">Payment Terms:</strong> All payments are final once services are rendered.</li>
            <li><strong class="text-white font-medium">No Show Policy:</strong> No refunds will be provided for clients who fail to attend their scheduled appointment without proper notice.</li>
            <li><strong class="text-white font-medium">Refund Processing:</strong> When applicable, refunds are processed within 7 business days of approval.</li>
          </ul>
        </div>

        <!-- Service Agreement -->
        <div class="glass p-10 rounded-3xl border border-gold/10 shadow-gold-lg group">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
              <mat-icon class="text-gold">handshake</mat-icon>
            </div>
            <h2 class="font-heading text-2xl md:text-3xl text-white m-0">Service Agreement</h2>
          </div>
          <p class="text-white mb-4">By booking an appointment with HHC Laser, you agree to:</p>
          <ul class="space-y-3 text-text-muted font-light leading-relaxed list-disc list-inside marker:text-gold/50">
            <li>Arrive on time for your scheduled appointment</li>
            <li>Provide accurate medical and contact information</li>
            <li>Follow all pre and post-treatment instructions</li>
            <li>Pay for services as agreed upon</li>
          </ul>
        </div>

        <!-- Medical Considerations -->
        <div class="glass p-10 rounded-3xl border border-gold/10 shadow-gold-lg group">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
              <mat-icon class="text-gold">medical_services</mat-icon>
            </div>
            <h2 class="font-heading text-2xl md:text-3xl text-white m-0">Medical Considerations</h2>
          </div>
          <ul class="space-y-3 text-text-muted font-light leading-relaxed list-disc list-inside marker:text-gold/50">
            <li>All treatments require a consultation to determine suitability</li>
            <li>Clients must disclose all relevant medical history</li>
            <li>Follow-up appointments may be required</li>
            <li>Results may vary based on individual circumstances</li>
          </ul>
        </div>

        <!-- Liability -->
        <div class="glass p-10 rounded-3xl border border-gold/10 shadow-gold-lg group">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
              <mat-icon class="text-gold">gpp_maybe</mat-icon>
            </div>
            <h2 class="font-heading text-2xl md:text-3xl text-white m-0">Liability</h2>
          </div>
          <p class="text-white mb-4">HHC Laser provides professional laser treatment services with certified equipment and trained staff. Clients acknowledge that:</p>
          <ul class="space-y-3 text-text-muted font-light leading-relaxed list-disc list-inside marker:text-gold/50">
            <li>Individual results may vary</li>
            <li>All treatments carry some level of risk</li>
            <li>Proper aftercare is essential for optimal results</li>
          </ul>
        </div>

        <!-- Contact Information -->
        <div class="glass p-10 rounded-3xl border border-gold/10 shadow-gold-lg group">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
              <mat-icon class="text-gold">support_agent</mat-icon>
            </div>
            <h2 class="font-heading text-2xl md:text-3xl text-white m-0">Contact Information</h2>
          </div>
          <p class="text-white mb-6">For questions about our terms of service:</p>
          <div class="space-y-4 text-text-muted font-light leading-relaxed">
            <div class="flex items-center gap-3"><mat-icon class="text-gold text-sm">email</mat-icon> <span><strong class="text-white font-medium">Email:</strong> {{ "{import.meta.env.VITE_CONTACT_EMAIL || 'infohhcLaser@gmail.com'}" }}</span></div>
            <div class="flex items-center gap-3"><mat-icon class="text-gold text-sm">phone</mat-icon> <span><strong class="text-white font-medium">Phone:</strong> <a href="tel:(876) 319-6241" class="hover:text-gold transition-colors duration-300">[(876) 319-6241](tel:(876) 319-6241)</a></span></div>
            <div class="flex items-center gap-3"><mat-icon class="text-gold text-sm">schedule</mat-icon> <span><strong class="text-white font-medium">Office Hours:</strong> Contact us during business hours</span></div>
          </div>
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
export class TermsOfServiceComponent implements OnInit {
  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
