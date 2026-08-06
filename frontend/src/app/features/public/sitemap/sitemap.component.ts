import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sitemap',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="pt-24 pb-16 min-h-screen bg-[#faf9f6]">
      <div class="max-w-4xl mx-auto px-4">
        
        <!-- Header -->
        <div class="text-center mb-16">
          <span class="section-label">Directory</span>
          <div class="divider-gold"></div>
          <h1 class="mt-4 font-heading text-4xl md:text-5xl text-charcoal-800">
            Site <span class="text-gold-500">Map</span>
          </h1>
          <p class="mt-4 max-w-2xl mx-auto text-charcoal-500 leading-relaxed">
            Navigate through all pages available on the HHC Laser & Co. website.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <!-- Main Pages -->
          <div>
            <h2 class="font-heading text-2xl text-charcoal-800 border-b border-gold-200 pb-2 mb-6">Main Menu</h2>
            <ul class="space-y-4">
              <li>
                <a routerLink="/" class="flex items-center text-charcoal-600 hover:text-gold-600 transition-colors group">
                  <mat-icon class="text-gold-400 mr-3 group-hover:translate-x-1 transition-transform">chevron_right</mat-icon>
                  Home
                </a>
              </li>
              <li>
                <a routerLink="/services" class="flex items-center text-charcoal-600 hover:text-gold-600 transition-colors group">
                  <mat-icon class="text-gold-400 mr-3 group-hover:translate-x-1 transition-transform">chevron_right</mat-icon>
                  Services
                </a>
              </li>
              <li>
                <a routerLink="/products" class="flex items-center text-charcoal-600 hover:text-gold-600 transition-colors group">
                  <mat-icon class="text-gold-400 mr-3 group-hover:translate-x-1 transition-transform">chevron_right</mat-icon>
                  Products
                </a>
              </li>
              <li>
                <a routerLink="/gallery" class="flex items-center text-charcoal-600 hover:text-gold-600 transition-colors group">
                  <mat-icon class="text-gold-400 mr-3 group-hover:translate-x-1 transition-transform">chevron_right</mat-icon>
                  Gallery
                </a>
              </li>
              <li>
                <a routerLink="/about" class="flex items-center text-charcoal-600 hover:text-gold-600 transition-colors group">
                  <mat-icon class="text-gold-400 mr-3 group-hover:translate-x-1 transition-transform">chevron_right</mat-icon>
                  About Us
                </a>
              </li>
              <li>
                <a routerLink="/contact" class="flex items-center text-charcoal-600 hover:text-gold-600 transition-colors group">
                  <mat-icon class="text-gold-400 mr-3 group-hover:translate-x-1 transition-transform">chevron_right</mat-icon>
                  Contact
                </a>
              </li>
              <li>
                <a routerLink="/faq" class="flex items-center text-charcoal-600 hover:text-gold-600 transition-colors group">
                  <mat-icon class="text-gold-400 mr-3 group-hover:translate-x-1 transition-transform">chevron_right</mat-icon>
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <!-- Accounts & Legal -->
          <div>
            <h2 class="font-heading text-2xl text-charcoal-800 border-b border-gold-200 pb-2 mb-6">Account & Policies</h2>
            <ul class="space-y-4">
              <li>
                <a routerLink="/auth/login" class="flex items-center text-charcoal-600 hover:text-gold-600 transition-colors group">
                  <mat-icon class="text-gold-400 mr-3 group-hover:translate-x-1 transition-transform">chevron_right</mat-icon>
                  Login
                </a>
              </li>
              <li>
                <a routerLink="/auth/register" class="flex items-center text-charcoal-600 hover:text-gold-600 transition-colors group">
                  <mat-icon class="text-gold-400 mr-3 group-hover:translate-x-1 transition-transform">chevron_right</mat-icon>
                  Create Account
                </a>
              </li>
              <li>
                <a routerLink="/terms-of-service" class="flex items-center text-charcoal-600 hover:text-gold-600 transition-colors group">
                  <mat-icon class="text-gold-400 mr-3 group-hover:translate-x-1 transition-transform">chevron_right</mat-icon>
                  Terms of Service
                </a>
              </li>
              <li>
                <a routerLink="/privacy" class="flex items-center text-charcoal-600 hover:text-gold-600 transition-colors group">
                  <mat-icon class="text-gold-400 mr-3 group-hover:translate-x-1 transition-transform">chevron_right</mat-icon>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a routerLink="/refund-policy" class="flex items-center text-charcoal-600 hover:text-gold-600 transition-colors group">
                  <mat-icon class="text-gold-400 mr-3 group-hover:translate-x-1 transition-transform">chevron_right</mat-icon>
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  `
})
export class SitemapComponent {}
