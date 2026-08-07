import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SettingsService } from './core/services/settings.service';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private seoService = inject(SeoService);

  ngOnInit() {
    this.settingsService.loadSettings();

    // Global Schema for GEO / Local SEO
    this.seoService.injectSchema('global-local-business', {
      "@context": "https://schema.org",
      "@type": "MedicalClinic",
      "name": "HHC LASER - Havendale Healthcare Centre",
      "description": "Premium luxury medical aesthetics, specializing in laser hair removal, botox, dermal fillers, IV therapy, and skin treatments in Kingston, Jamaica.",
      "image": "https://hhclaser.com/HCClogo.jpg",
      "url": "https://hhclaser.com",
      "telephone": "+18763196241",
      "address": [
        {
          "@type": "PostalAddress",
          "streetAddress": "48 Constant Spring Road",
          "addressLocality": "Kingston",
          "addressRegion": "St. Andrew",
          "addressCountry": "JM"
        },
        {
          "@type": "PostalAddress",
          "streetAddress": "63 Mannings Hill Rd",
          "addressLocality": "Kingston",
          "addressRegion": "St. Andrew",
          "addressCountry": "JM"
        }
      ],
      "medicalSpecialty": [
        "Dermatology",
        "Laser Hair Removal",
        "Medical Aesthetics"
      ],
      "availableService": [
        {
          "@type": "MedicalTest",
          "name": "Laser Hair Removal"
        },
        {
          "@type": "MedicalTest",
          "name": "Botox"
        },
        {
          "@type": "MedicalTest",
          "name": "Chemical Peels"
        }
      ],
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "17:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Saturday",
          "opens": "09:00",
          "closes": "17:00"
        }
      ]
    });
  }
}
