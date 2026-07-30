import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule],
  template: `
    <div class="pt-24 pb-16 min-h-screen bg-background">
      <div class="max-w-6xl mx-auto px-4">
        
        <!-- Header -->
        <div class="text-center mb-16">
          <span class="section-label">Get in Touch</span>
          <div class="divider-gold"></div>
          <h1 class="mt-4 font-heading text-4xl md:text-5xl text-white">
            Contact <span class="text-gold-500">Us</span>
          </h1>
          <p class="mt-4 max-w-2xl mx-auto text-text-muted font-light leading-relaxed">
            Whether you have questions about our treatments, booking process, or personalized care options, our team is happy to assist you. Expect a response from our team within 24 hours.
          </p>
        </div>

        <!-- Location Details Section -->
        <div class="text-center mb-10">
          <h2 class="font-heading text-3xl md:text-4xl font-extrabold text-white">Location Details</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          
          <!-- Mannings Hill Road Clinic -->
          <div class="border-[1.5px] border-black bg-white p-8">
            <h3 class="font-heading text-2xl font-extrabold text-black mb-8">Mannings Hill Road Clinic</h3>
            
            <div class="space-y-8">
              <div class="flex items-start gap-5">
                <div class="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
                  <mat-icon>location_on</mat-icon>
                </div>
                <div>
                  <div class="font-extrabold text-black mb-1">Address</div>
                  <div class="text-black font-medium leading-relaxed">
                    63 Mannings Hill Rd<br>Kingston<br>Jamaica
                  </div>
                </div>
              </div>

              <div class="flex items-start gap-5">
                <div class="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
                  <mat-icon>phone</mat-icon>
                </div>
                <div>
                  <div class="font-extrabold text-black mb-1">Phone</div>
                  <div class="text-black font-medium leading-relaxed">
                    (876) 319-6241<br>(876) 631-8134
                  </div>
                </div>
              </div>

              <div class="flex items-start gap-5">
                <div class="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
                  <mat-icon>email</mat-icon>
                </div>
                <div>
                  <div class="font-extrabold text-black mb-1">Email</div>
                  <div class="text-black font-medium">
                    infohhcLaser&#64;gmail.com
                  </div>
                </div>
              </div>

              <div class="flex items-start gap-5">
                <div class="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
                  <mat-icon>schedule</mat-icon>
                </div>
                <div>
                  <div class="font-extrabold text-black mb-1">Business Hours</div>
                  <div class="text-black font-medium leading-relaxed">
                    Mon-Fri: 9AM-5PM<br>Sat: By Appointment<br>Sun: Closed
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Constant Spring Road Clinic -->
          <div class="border-[1.5px] border-black bg-white p-8">
            <h3 class="font-heading text-2xl font-extrabold text-black mb-8">Constant Spring Road Clinic</h3>
            
            <div class="space-y-8">
              <div class="flex items-start gap-5">
                <div class="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
                  <mat-icon>location_on</mat-icon>
                </div>
                <div>
                  <div class="font-extrabold text-black mb-1">Address</div>
                  <div class="text-black font-medium leading-relaxed">
                    48 Constant Spring Road<br>Kingston<br>Jamaica
                  </div>
                </div>
              </div>

              <div class="flex items-start gap-5">
                <div class="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
                  <mat-icon>phone</mat-icon>
                </div>
                <div>
                  <div class="font-extrabold text-black mb-1">Phone</div>
                  <div class="text-black font-medium leading-relaxed">
                    (876) 319-6241<br>(876) 631-8134
                  </div>
                </div>
              </div>

              <div class="flex items-start gap-5">
                <div class="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
                  <mat-icon>email</mat-icon>
                </div>
                <div>
                  <div class="font-extrabold text-black mb-1">Email</div>
                  <div class="text-black font-medium">
                    infohhcLaser&#64;gmail.com
                  </div>
                </div>
              </div>

              <div class="flex items-start gap-5">
                <div class="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
                  <mat-icon>schedule</mat-icon>
                </div>
                <div>
                  <div class="font-extrabold text-black mb-1">Business Hours</div>
                  <div class="text-black font-medium leading-relaxed">
                    Mon-Fri: 9AM-5PM<br>Sat: By Appointment<br>Sun: Closed
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-16 mt-16">
          
          <!-- Google Map -->
          <div class="rounded-2xl overflow-hidden border border-white/10 min-h-[400px]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7588.136446625609!2d-76.79566539999999!3d18.0220372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8edb3f0006095985%3A0x22ed8ba295760c21!2sHHC%20LASER!5e0!3m2!1sen!2sjm!4v1785449438222!5m2!1sen!2sjm"
              width="100%"
              height="100%"
              style="border:0; min-height: 420px; display: block;"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="strict-origin-when-cross-origin">
            </iframe>
          </div>

          <!-- Contact Form -->
          <div class="bg-surface border border-white/10 p-8 rounded-2xl">
            <h3 class="font-heading text-2xl text-white mb-2">Send a Message</h3>
            <p class="text-text-muted text-sm mb-8">Fill out the form below and we'll get back to you within 24 hours.</p>
            
            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-5">
              
              <!-- Name -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-white/70 tracking-widest uppercase">Full Name</label>
                <input 
                  formControlName="name"
                  type="text"
                  placeholder="Your full name"
                  class="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all duration-300"
                >
              </div>

              <!-- Email -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-white/70 tracking-widest uppercase">Email Address</label>
                <input 
                  formControlName="email"
                  type="email"
                  placeholder="your@email.com"
                  class="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all duration-300"
                >
              </div>

              <!-- Phone (optional) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-white/70 tracking-widest uppercase">Phone <span class="text-white/30 normal-case tracking-normal">(optional)</span></label>
                <input 
                  formControlName="phone"
                  type="tel"
                  placeholder="(876) 000-0000"
                  class="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all duration-300"
                >
              </div>

              <!-- Message -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-white/70 tracking-widest uppercase">Message</label>
                <textarea 
                  formControlName="message"
                  rows="5"
                  placeholder="How can we help you?"
                  class="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all duration-300 resize-none"
                ></textarea>
              </div>

              @if (submitted) {
                <div class="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <mat-icon class="text-emerald-400 !text-lg">check_circle</mat-icon>
                  <p class="text-emerald-400 text-sm">Message sent! We'll be in touch within 24 hours.</p>
                </div>
              }

              <button 
                type="submit" 
                class="btn-primary w-full py-3.5 text-sm tracking-widest uppercase"
                [disabled]="contactForm.invalid"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>

        <!-- FAQ Section -->
        <div class="mt-32">
          <div class="text-center mb-12">
            <span class="section-label">Common Questions</span>
            <div class="divider-gold"></div>
            <h2 class="mt-4 font-heading text-3xl md:text-4xl text-white">FAQ</h2>
          </div>
          
          <div class="max-w-3xl mx-auto space-y-4">
            @for (faq of faqs; track faq.q) {
              <div class="bg-surface border border-white/10 p-6 rounded-xl">
                <h4 class="font-heading text-lg text-white mb-2">{{ faq.q }}</h4>
                <p class="text-text-muted text-sm leading-relaxed">{{ faq.a }}</p>
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  `
})
export class ContactComponent {
  settingsService = inject(SettingsService);
  contactForm: FormGroup;
  submitted = false;
  
  faqs = [
    { q: 'What is the preparation for Laser Hair Removal?', a: 'Please shave the area 24 hours before your appointment. Do not wax or pluck for 4 weeks prior.' },
    { q: 'Is there any downtime after a chemical peel?', a: 'Depending on the depth of the peel, you may experience mild peeling for 3-5 days. Sun protection is mandatory.' },
    { q: 'How do I cancel or reschedule?', a: 'You can manage your bookings in the customer portal. We require 24 hours notice for cancellations.' }
  ];

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.submitted = true;
      this.contactForm.reset();
      setTimeout(() => { this.submitted = false; }, 6000);
    }
  }
}
