import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, MatIconModule],
  template: `
    <footer class="bg-white border-t border-black/10">
      <div class="container-luxury px-6 pt-4 pb-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 pb-16 border-b border-black/10">

          <!-- Brand -->
          <div class="lg:col-span-1 space-y-6">
            <div>
              <div class="font-heading text-3xl tracking-wide text-black">{{ settingsService.settings().business_name }}</div>
              <div class="text-neutral-800 text-xs tracking-[0.25em] uppercase font-semibold mt-1">{{ settingsService.settings().tagline }}</div>
            </div>
            <p class="text-neutral-600 text-base font-light leading-relaxed max-w-xs">
              Luxury aesthetic treatments for every skin tone. Reimagined at the intersection of clinical precision and sanctuary-level indulgence.
            </p>
            <div class="flex gap-4 mt-6">
              @for (social of socials; track social.label) {
                <a [href]="social.href" target="_blank" rel="noopener"
                   class="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center
                          hover:border-neutral-900 hover:text-neutral-900 text-neutral-500 transition-all duration-300"
                   [attr.aria-label]="social.label">
                  <mat-icon class="!text-sm">{{ social.icon }}</mat-icon>
                </a>
              }
            </div>
          </div>

          <!-- Treatments -->
          <div>
            <h6 class="text-black mb-6 tracking-[0.2em] uppercase text-xs font-semibold">Treatments</h6>
            <ul class="space-y-4">
              @for (link of treatmentLinks; track link.path) {
                <li>
                  <a [routerLink]="link.path"
                     class="text-neutral-600 text-base hover:text-neutral-900 transition-colors duration-300 font-light">
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Company -->
          <div>
            <h6 class="text-black mb-6 tracking-[0.2em] uppercase text-xs font-semibold">Company</h6>
            <ul class="space-y-4">
              @for (link of companyLinks; track link.path) {
                <li>
                  <a [routerLink]="link.path"
                     class="text-neutral-600 text-base hover:text-neutral-900 transition-colors duration-300 font-light">
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h6 class="text-black mb-6 tracking-[0.2em] uppercase text-xs font-semibold">Get In Touch</h6>
            <ul class="space-y-4">
              <li class="flex gap-3 items-start">
                <mat-icon class="text-neutral-800 !text-sm mt-1 flex-shrink-0">location_on</mat-icon>
                <span class="text-neutral-600 text-base font-light whitespace-pre-line">{{ settingsService.settings().address }}</span>
              </li>
              <li class="flex gap-3 items-start">
                <mat-icon class="text-neutral-800 !text-sm mt-1 flex-shrink-0">phone</mat-icon>
                <div class="flex flex-col">
                  <a [href]="'tel:' + settingsService.settings().phone" class="text-neutral-600 text-base hover:text-neutral-900 transition-colors duration-300 font-light">
                    {{ settingsService.settings().phone }}
                  </a>
                </div>
              </li>
              <li class="flex gap-3 items-center">
                <mat-icon class="text-neutral-800 !text-sm flex-shrink-0">email</mat-icon>
                <a [href]="'mailto:' + settingsService.settings().email" class="text-neutral-600 text-base hover:text-neutral-900 transition-colors duration-300 font-light">
                  {{ settingsService.settings().email }}
                </a>
              </li>
              <li class="flex gap-3 items-start mt-6 pt-6 border-t border-black/10">
                <mat-icon class="text-neutral-800 !text-sm flex-shrink-0 mt-1">schedule</mat-icon>
                <div class="flex flex-col text-neutral-600 text-base font-light">
                  <span class="font-semibold text-black mb-1">Hours</span>
                  <span>Mon–Fri: 9:00 AM – 6:00 PM</span>
                  <span>Saturday: 9:00 AM – 5:00 PM</span>
                  <span>Sunday: Closed</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p class="text-neutral-500 text-sm font-light">
            © {{ currentYear }} {{ settingsService.settings().business_name }}. All rights reserved.
          </p>
          <div class="flex gap-8">
            @for (link of legalLinks; track link.path) {
              <a [routerLink]="link.path" class="text-neutral-500 text-sm hover:text-neutral-900 transition-colors duration-300 font-light">
                {{ link.label }}
              </a>
            }
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  settingsService = inject(SettingsService);
  currentYear = new Date().getFullYear();

  socials = [
    { label: 'Instagram', icon: 'photo_camera', href: 'https://instagram.com/hhclaserjm' },
    { label: 'Facebook',  icon: 'facebook',     href: 'https://facebook.com/hhclaserjm' },
    { label: 'TikTok',    icon: 'play_circle',  href: 'https://tiktok.com/@hhclaserjm' },
  ];

  treatmentLinks = [
    { path: '/services/laser-hair-removal',   label: 'Laser Hair Removal' },
    { path: '/services/heat-shock-detox',     label: 'Heat Shock Detox' },
    { path: '/services/skin-resurfacing',     label: 'Skin Resurfacing' },
    { path: '/services/body-contouring',      label: 'Body Contouring' },
    { path: '/services/facials',              label: 'Facials' },
  ];

  companyLinks = [
    { path: '/about',       label: 'About Us' },
    { path: '/gallery',     label: 'Gallery' },
    { path: '/faq',         label: 'FAQ' },
    { path: '/contact',     label: 'Contact' },
  ];

  legalLinks = [
    { path: '/privacy',  label: 'Privacy Policy' },
    { path: '/terms-of-service', label: 'Terms of Service' },
    { path: '/refund-policy', label: 'Refund Policy' },
  ];
}
