import { Component, signal, OnInit, inject } from '@angular/core';
import { SeoService } from '../../../core/services/seo.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { saveContactMessage } from '../../../core/services/contact-messages';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, ReactiveFormsModule],
  template: `
    <div class="pt-6 pb-16 min-h-screen" style="background: #FFFFFF;">
      <div class="max-w-6xl mx-auto px-4">

        <!-- ── Toast Notification ─────────────────────────────── -->
        @if (toast()) {
          <div class="fixed top-6 right-6 z-50 flex items-start gap-4 px-6 py-4 rounded-2xl shadow-2xl border border-black/10 animate-fade-up"
               style="background: #1a1a1a; min-width: 300px; max-width: 420px;">
            <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                 [style.background]="toast()!.type === 'success' ? '#16a34a' : '#dc2626'">
              <mat-icon style="color: #fff; font-size: 20px;">{{ toast()!.type === 'success' ? 'check_circle' : 'error' }}</mat-icon>
            </div>
            <div class="flex-1">
              <div class="font-bold text-sm" style="color: #ffffff;">{{ toast()!.title }}</div>
              <div class="text-xs mt-0.5" style="color: #aaaaaa;">{{ toast()!.message }}</div>
            </div>
            <button (click)="toast.set(null)" style="color: #666; font-size: 20px; line-height: 1;">&times;</button>
          </div>
        }

        <!-- Header -->
        <div class="text-center mb-16">
          <span class="section-label" style="color: var(--gold);">GET IN TOUCH</span>
          <div class="divider-gold mx-auto"></div>
          <h1 class="mt-4 font-heading text-4xl md:text-5xl text-black">
            Contact <span style="color: var(--gold);">Us</span>
          </h1>
          <p class="mt-4 max-w-2xl mx-auto leading-relaxed text-neutral-600">
            Whether you have questions about our treatments, booking process, or personalized care
            options, our team is happy to assist you. Expect a response from our team within 24 hours.
          </p>
        </div>

        <!-- Location Details Section -->
        <div class="text-center mb-10">
          <h2 class="font-heading text-3xl md:text-4xl font-extrabold text-black">Location Details</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">

          <!-- Mannings Hill Road Clinic -->
          <div class="border border-black/20 p-8 rounded-xl" style="background: #1a1a1a;">
            <h3 class="font-heading text-2xl font-extrabold mb-8" style="color: #ffffff;">Mannings Hill Road Clinic</h3>
            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-lg" style="background: var(--gold);">
                  <mat-icon style="color: #000; font-size: 20px;">location_on</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-sm mb-0.5" style="color: var(--gold);">Address</div>
                  <div class="text-sm leading-relaxed" style="color: #cccccc;">63 Mannings Hill Rd<br>Kingston, Jamaica</div>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-lg" style="background: var(--gold);">
                  <mat-icon style="color: #000; font-size: 20px;">phone</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-sm mb-0.5" style="color: var(--gold);">Phone</div>
                  <div class="text-sm leading-relaxed" style="color: #cccccc;">(876) 319-6241<br>(876) 631-8134</div>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-lg" style="background: var(--gold);">
                  <mat-icon style="color: #000; font-size: 20px;">email</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-sm mb-0.5" style="color: var(--gold);">Email</div>
                  <div class="text-sm" style="color: #cccccc;">infohhcLaser&#64;gmail.com</div>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-lg" style="background: var(--gold);">
                  <mat-icon style="color: #000; font-size: 20px;">schedule</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-sm mb-0.5" style="color: var(--gold);">Business Hours</div>
                  <div class="text-sm leading-relaxed" style="color: #cccccc;">Mon–Fri: 9AM–5PM<br>Sat: By Appointment<br>Sun: Closed</div>
                <div class="flex gap-4 mt-4">
                  <a href="https://wa.me/8763196241" target="_blank"
                     class="flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500 text-white text-sm font-medium hover:bg-gold-600 transition">
                    <mat-icon class="!text-sm">whatsapp</mat-icon>
                    WhatsApp
                  </a>
                  <a href="tel:+18763196241"
                     class="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium border border-black/10 hover:bg-neutral-100 transition">
                    <mat-icon class="!text-sm">phone</mat-icon>
                    Call Us
                  </a>
                </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Constant Spring Road Clinic -->
          <div class="border border-black/20 p-8 rounded-xl" style="background: #1a1a1a;">
            <h3 class="font-heading text-2xl font-extrabold mb-8" style="color: #ffffff;">Constant Spring Road Clinic</h3>
            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-lg" style="background: var(--gold);">
                  <mat-icon style="color: #000; font-size: 20px;">location_on</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-sm mb-0.5" style="color: var(--gold);">Address</div>
                  <div class="text-sm leading-relaxed" style="color: #cccccc;">48 Constant Spring Road<br>Kingston, Jamaica</div>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-lg" style="background: var(--gold);">
                  <mat-icon style="color: #000; font-size: 20px;">phone</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-sm mb-0.5" style="color: var(--gold);">Phone</div>
                  <div class="text-sm leading-relaxed" style="color: #cccccc;">(876) 319-6241<br>(876) 631-8134</div>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-lg" style="background: var(--gold);">
                  <mat-icon style="color: #000; font-size: 20px;">email</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-sm mb-0.5" style="color: var(--gold);">Email</div>
                  <div class="text-sm" style="color: #cccccc;">infohhcLaser&#64;gmail.com</div>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-lg" style="background: var(--gold);">
                  <mat-icon style="color: #000; font-size: 20px;">schedule</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-sm mb-0.5" style="color: var(--gold);">Business Hours</div>
                  <div class="text-sm leading-relaxed" style="color: #cccccc;">Mon–Fri: 9AM–5PM<br>Sat: By Appointment<br>Sun: Closed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Map + Contact Form -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">

          <!-- Google Maps Embed -->
          <div class="rounded-2xl overflow-hidden border border-black/10 shadow-xl" style="min-height: 450px;">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3794.0682233128045!2d-76.79566539999999!3d18.0220372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8edb3f0006095985%3A0x22ed8ba295760c21!2sHHC%20LASER!5e0!3m2!1sen!2sjm!4v1785511905468!5m2!1sen!2sjm"
              width="100%" height="450"
              style="border:0; display:block;"
              allowfullscreen loading="lazy"
              referrerpolicy="strict-origin-when-cross-origin"
              title="HHC LASER - Kingston, Jamaica">
            </iframe>
          </div>

          <!-- Contact Form -->
          <div class="p-8 rounded-2xl border border-black/20" style="background: #1a1a1a;">
            <h3 class="font-heading text-2xl mb-6" style="color: #ffffff;">Send a Message</h3>
            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-5">

              <div>
                <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color: var(--gold);">Full Name *</label>
                <input type="text" formControlName="name" placeholder="e.g. Jane Smith"
                  class="w-full px-4 py-3 rounded-lg text-sm font-medium focus:outline-none transition-all"
                  style="background: #FFFFFF; border: 1px solid rgba(0,0,0,0.15); color: #ffffff;"
                  onfocus="this.style.borderColor='#D6B36A'" onblur="this.style.borderColor='rgba(0,0,0,0.15)'">
                @if (contactForm.get('name')?.invalid && contactForm.get('name')?.touched) {
                  <p class="text-xs mt-1" style="color: #f87171;">Name is required.</p>
                }
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color: var(--gold);">Email Address *</label>
                <input type="email" formControlName="email" placeholder="you@example.com"
                  class="w-full px-4 py-3 rounded-lg text-sm font-medium focus:outline-none transition-all"
                  style="background: #FFFFFF; border: 1px solid rgba(0,0,0,0.15); color: #ffffff;"
                  onfocus="this.style.borderColor='#D6B36A'" onblur="this.style.borderColor='rgba(0,0,0,0.15)'">
                @if (contactForm.get('email')?.invalid && contactForm.get('email')?.touched) {
                  <p class="text-xs mt-1" style="color: #f87171;">A valid email is required.</p>
                }
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color: var(--gold);">Message *</label>
                <textarea formControlName="message" rows="6" placeholder="How can we help you?"
                  class="w-full px-4 py-3 rounded-lg text-sm font-medium focus:outline-none transition-all resize-none"
                  style="background: #FFFFFF; border: 1px solid rgba(0,0,0,0.15); color: #ffffff;"
                  onfocus="this.style.borderColor='#D6B36A'" onblur="this.style.borderColor='rgba(0,0,0,0.15)'"></textarea>
                @if (contactForm.get('message')?.invalid && contactForm.get('message')?.touched) {
                  <p class="text-xs mt-1" style="color: #f87171;">Message is required.</p>
                }
              </div>

              <button type="submit" [disabled]="contactForm.invalid || submitting()"
                class="w-full py-3.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                style="background: var(--gold); color: #000000;">
                {{ submitting() ? 'Sending...' : 'Send Message' }}
              </button>
            </form>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="mt-32">
          <div class="text-center mb-12">
            <span class="section-label" style="color: var(--gold);">Common Questions</span>
            <div class="divider-gold mx-auto"></div>
            <h2 class="mt-4 font-heading text-3xl md:text-4xl text-black">FAQ</h2>
          </div>
          <div class="max-w-3xl mx-auto space-y-4">
            @for (faq of faqs; track faq.q) {
              <div class="p-6 rounded-xl border border-black/10" style="background: #1a1a1a;">
                <h4 class="font-heading text-lg mb-2" style="color: #ffffff;">{{ faq.q }}</h4>
                <p class="text-sm" style="color: #aaaaaa;">{{ faq.a }}</p>
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  `
})
export class ContactComponent implements OnInit {
  private seo = inject(SeoService);
  contactForm: FormGroup;
  submitting = signal(false);
  toast = signal<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  faqs = [
    { q: 'Do you offer free consultations?', a: 'Yes, we offer complimentary consultations to discuss your goals and recommend the best treatment plan for you. During this consultation, our certified professionals will assess your needs and explain the available options.' },
    { q: 'Are your treatments safe?', a: 'Absolutely. We use only FDA-approved equipment and follow strict safety protocols. All our practitioners are certified professionals with extensive training in aesthetic treatments. Your safety is our top priority.' },
    { q: 'How long do results last?', a: "Results vary depending on the treatment and individual factors. During your consultation, we'll discuss expected results and duration for your specific treatment. Many treatments provide long-lasting results with proper maintenance." },
    { q: 'Do you accept insurance?', a: 'Most aesthetic treatments are considered elective and not covered by insurance. However, we offer flexible payment plans and financing options to make treatments more accessible. Please ask about our current payment options during your consultation.' },
    { q: 'How long does each treatment session take?', a: "Treatment duration varies depending on the specific procedure and the area being treated. Most sessions range from 30 minutes to 2 hours. We'll provide you with an accurate time estimate during your consultation." },
    { q: 'What should I expect during my first visit?', a: "Your first visit will include a comprehensive consultation where we discuss your goals, medical history, and expectations. We'll examine the treatment area and explain the recommended procedures, timeline, and costs. There's no pressure to decide immediately." },
    { q: 'Is there any downtime after treatments?', a: "Downtime varies by treatment. Many of our procedures are minimally invasive with little to no downtime, allowing you to resume normal activities immediately. For more intensive treatments, we'll provide detailed aftercare instructions." },
    { q: 'How many sessions will I need?', a: "The number of sessions depends on your individual goals, the treatment type, and your skin's response. During your consultation, we'll create a personalized treatment plan that outlines the recommended number of sessions for optimal results." },
    { q: 'What makes HHC Laser different from other clinics?', a: 'HHC Laser combines advanced technology with personalized care. Our certified professionals stay current with the latest techniques, we use FDA-approved equipment, and we focus on creating natural-looking results that enhance your confidence.' },
    { q: 'Can I combine multiple treatments?', a: 'Yes, many treatments can be safely combined to maximize results. We often create comprehensive treatment plans that address multiple concerns. Our professionals will advise you on the best combination approach during your consultation.' }
  ];

  ngOnInit(): void {
    this.seo.updatePage({
      title: 'Contact HHC Laser Jamaica | Book a Med Spa Consultation Kingston',
      description: 'Contact HHC Laser & Co. in Kingston Jamaica. Book a consultation for laser hair removal, Botox, dermal fillers, and holistic wellness at our Mannings Hill or Constant Spring Road clinics.',
      canonicalPath: '/contact',
      keywords: 'Contact HHC Laser Jamaica, Med Spa Kingston Jamaica Contact, Book Laser Hair Removal Jamaica',
    });
  }

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.contactForm.invalid) return;
    this.submitting.set(true);

    // Save to localStorage so admin dashboard can read it
    const { name, email, message } = this.contactForm.value;
    saveContactMessage({ name, email, message });

    // Simulate brief async delay
    setTimeout(() => {
      this.submitting.set(false);
      this.contactForm.reset();
      this.showToast('success', 'Message Sent!', 'Thank you! Our team will respond within 24 hours.');
    }, 800);
  }

  private showToast(type: 'success' | 'error', title: string, message: string) {
    this.toast.set({ type, title, message });
    setTimeout(() => this.toast.set(null), 5000);
  }
}
