import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SettingsService } from '../../../core/services/settings.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, MatIconModule],
  template: `
    <footer class="bg-background border-t border-white/5">
      <div class="container-luxury px-6 pt-24 pb-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 pb-16 border-b border-white/5">

          <!-- Brand -->
          <div class="lg:col-span-1 space-y-6">
            <div>
              <div class="font-heading text-3xl tracking-wide text-white">{{ settingsService.settings().business_name }}</div>
              <div class="text-gold text-[10px] tracking-[0.25em] uppercase font-semibold mt-1">{{ settingsService.settings().tagline }}</div>
            </div>
            <p class="text-text-muted text-sm font-light leading-relaxed max-w-xs">
              Luxury aesthetic treatments for every skin tone. Reimagined at the intersection of clinical precision and sanctuary-level indulgence.
            </p>
            <div class="flex gap-4 mt-6">
              @for (social of socials; track social.label) {
                <a [href]="social.href" target="_blank" rel="noopener"
                   class="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center
                          hover:border-gold hover:text-gold text-text-muted transition-all duration-300"
                   [attr.aria-label]="social.label">
                  <mat-icon class="!text-sm">{{ social.icon }}</mat-icon>
                </a>
              }
            </div>
          </div>

          <!-- Treatments -->
          <div>
            <h6 class="text-white mb-6 tracking-[0.2em] uppercase text-[11px] font-semibold">Treatments</h6>
            <ul class="space-y-4">
              @for (link of treatmentLinks; track link.path) {
                <li>
                  <a [routerLink]="link.path"
                     class="text-text-muted text-sm hover:text-gold transition-colors duration-300 font-light">
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Quick Links -->
          <div>
            <h6 class="text-white mb-6 tracking-[0.2em] uppercase text-[11px] font-semibold">Quick Links</h6>
            <ul class="space-y-4">
              @for (link of companyLinks; track link.path) {
                <li>
                  <a [routerLink]="link.path"
                     class="text-text-muted text-sm hover:text-gold transition-colors duration-300 font-light">
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h6 class="text-white mb-6 tracking-[0.2em] uppercase text-[11px] font-semibold">Get In Touch</h6>
            <ul class="space-y-4">
              <li class="flex gap-3 items-start">
                <mat-icon class="text-gold !text-sm mt-1 flex-shrink-0">location_on</mat-icon>
                <span class="text-text-muted text-sm font-light whitespace-pre-line">{{ settingsService.settings().address }}</span>
              </li>
              <li class="flex gap-3 items-start">
                <mat-icon class="text-gold !text-sm mt-1 flex-shrink-0">phone</mat-icon>
                <div class="flex flex-col">
                  <a [href]="'tel:' + settingsService.settings().phone" class="text-text-muted text-sm hover:text-gold transition-colors duration-300 font-light">
                    {{ settingsService.settings().phone }}
                  </a>
                </div>
              </li>
              <li class="flex gap-3 items-center">
                <mat-icon class="text-gold !text-sm flex-shrink-0">email</mat-icon>
                <a [href]="'mailto:' + settingsService.settings().email" class="text-text-muted text-sm hover:text-gold transition-colors duration-300 font-light">
                  {{ settingsService.settings().email }}
                </a>
              </li>
              <li class="flex gap-3 items-start mt-6 pt-6 border-t border-white/5">
                <mat-icon class="text-gold !text-sm flex-shrink-0 mt-1">schedule</mat-icon>
                <div class="flex flex-col text-text-muted text-sm font-light">
                  <span class="font-semibold text-white mb-1">Hours</span>
                  <span>Mon–Fri: 9:00 AM – 6:00 PM</span>
                  <span>Saturday: 9:00 AM – 5:00 PM</span>
                  <span>Sunday: Closed</span>
                </div>
              </li>
              <li class="mt-6 pt-6 border-t border-white/5">
                <div class="rounded-xl overflow-hidden border border-white/10 w-full h-48 opacity-80 hover:opacity-100 transition-opacity duration-300">
                  <iframe [src]="mapUrl" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="pt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p class="text-text-muted/60 text-xs font-light">
            © {{ currentYear }} {{ settingsService.settings().business_name }}. All rights reserved.
          </p>
          <div class="flex gap-8">
            @for (link of legalLinks; track link.path) {
              <a [routerLink]="link.path" class="text-text-muted/60 text-xs hover:text-gold transition-colors duration-300 font-light">
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
  sanitizer = inject(DomSanitizer);
  currentYear = new Date().getFullYear();
  mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7588.136446625609!2d-76.79566539999999!3d18.0220372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8edb3f0006095985%3A0x22ed8ba295760c21!2sHHC%20LASER!5e0!3m2!1sen!2sjm!4v1785449438222!5m2!1sen!2sjm");

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
    { path: '/consultation', label: 'Free Consultation' },
  ];

  legalLinks = [
    { path: '/terms-of-service', label: 'Terms of Service' },
    { path: '/refund-policy', label: 'Refund Policy' },
  ];
}
