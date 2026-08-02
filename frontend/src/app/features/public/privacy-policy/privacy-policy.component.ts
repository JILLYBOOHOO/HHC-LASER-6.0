import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-32 px-6 bg-white min-h-screen">
      <div class="max-w-3xl mx-auto">

        <h1 class="font-heading text-4xl md:text-5xl text-neutral-900 mb-4">Privacy Policy</h1>
        <div class="h-1 w-16 bg-gold mb-10 rounded-full"></div>

        <div class="space-y-10 text-neutral-700 text-base leading-relaxed">

          <div>
            <h2 class="text-xl font-semibold text-neutral-900 mb-3">Information Collection and Use</h2>
            <p>
              At HHC Laser, we are committed to protecting your privacy and personal information. We collect information to provide better services to our clients and ensure the highest quality of care.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-semibold text-neutral-900 mb-3">Information We Collect</h2>
            <p class="mb-4">We may collect the following types of information:</p>
            <ul class="list-disc list-inside space-y-2 pl-2">
              <li><strong>Personal Information:</strong> Name, email address, phone number, date of birth</li>
              <li><strong>Medical Information:</strong> Health conditions, treatment history, medical photos (with consent)</li>
              <li><strong>Contact Information:</strong> Address, emergency contact details</li>
              <li><strong>Payment Information:</strong> Billing information for processing payments</li>
            </ul>
          </div>

          <div>
            <h2 class="text-xl font-semibold text-neutral-900 mb-3">How We Use Your Information</h2>
            <ul class="list-disc list-inside space-y-2 pl-2">
              <li>To provide and improve our laser treatment services</li>
              <li>To schedule appointments and send appointment reminders</li>
              <li>To process payments and billing</li>
              <li>To communicate with you about your treatments</li>
              <li>To comply with legal and regulatory requirements</li>
            </ul>
          </div>

          <div>
            <h2 class="text-xl font-semibold text-neutral-900 mb-3">Information Sharing</h2>
            <p class="mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share information only:
            </p>
            <ul class="list-disc list-inside space-y-2 pl-2">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>With healthcare providers directly involved in your care</li>
            </ul>
          </div>

          <div>
            <h2 class="text-xl font-semibold text-neutral-900 mb-3">Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-semibold text-neutral-900 mb-3">Contact Information</h2>
            <p class="mb-4">For privacy-related questions or concerns, please contact us at:</p>
            <ul class="space-y-3 pl-2">
              <li class="flex items-center gap-2">
                <span class="font-semibold text-neutral-900">Email:</span>
                <a href="mailto:infohhcLaser@gmail.com" class="text-gold-700 hover:text-gold-900 underline transition-colors">infohhcLaser&#64;gmail.com</a>
              </li>
              <li class="flex items-center gap-2">
                <span class="font-semibold text-neutral-900">Phone:</span>
                <a href="tel:+18763196241" class="text-gold-700 hover:text-gold-900 underline transition-colors">(876) 319-6241</a>
              </li>
              <li class="flex items-center gap-2">
                <span class="font-semibold text-neutral-900">Address:</span>
                <span>Visit our clinic for in-person consultations</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  `,
})
export class PrivacyPolicyComponent {
  constructor(private seo: SeoService) {
    this.seo.updatePage({
      title: 'Privacy Policy — HHC Laser & Co.',
      description: 'Privacy policy for HHC Laser & Co. medical spa. Learn how we collect, use, and protect your personal and medical information.',
      canonicalPath: '/privacy',
    });
  }
}
