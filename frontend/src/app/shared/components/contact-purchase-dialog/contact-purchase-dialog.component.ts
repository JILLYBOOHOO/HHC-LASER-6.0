import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SettingsService } from '../../../core/services/settings.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-contact-purchase-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="bg-surface border border-white/10 overflow-hidden relative">
      <!-- Glow Effect -->
      <div class="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-gold/10 rounded-full blur-[60px] z-0"></div>
      
      <div class="relative z-10">
        <div class="flex justify-between items-center p-6 border-b border-white/5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
              <mat-icon class="text-gold">shopping_bag</mat-icon>
            </div>
            <div>
              <h2 class="text-white font-heading text-xl m-0 tracking-wide">Purchase Inquiry</h2>
              <span class="text-gold-500 text-[10px] uppercase tracking-widest">{{ data.productName }}</span>
            </div>
          </div>
          <button mat-icon-button (click)="dialogRef.close()" class="!text-text-muted hover:!text-white transition-colors">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="p-8">
          <p class="text-text-muted text-sm font-light leading-relaxed mb-8 text-center max-w-sm mx-auto">
            Thank you for your interest. Please contact HHC Laser & Co. using one of the options below to purchase this product or request additional information.
          </p>

          <div class="space-y-4 max-w-sm mx-auto">
            <!-- Phone -->
            <a [href]="'tel:' + settingsService.settings().phone" class="flex items-center p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-gold/30 transition-all duration-300 group">
              <div class="w-10 h-10 rounded-full bg-background flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <mat-icon class="text-gold !text-sm">phone</mat-icon>
              </div>
              <div class="flex flex-col">
                <span class="text-white text-sm font-medium">Call Us</span>
                <span class="text-text-muted text-xs font-light">{{ settingsService.settings().phone }}</span>
              </div>
              <mat-icon class="text-text-muted/30 ml-auto group-hover:text-gold transition-colors">chevron_right</mat-icon>
            </a>

            <!-- WhatsApp -->
            <a [href]="'https://wa.me/' + (settingsService.settings().phone?.replace(' ', '') || '')" target="_blank" rel="noopener" class="flex items-center p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#25D366]/30 transition-all duration-300 group">
              <div class="w-10 h-10 rounded-full bg-background flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <mat-icon class="text-[#25D366] !text-sm">chat</mat-icon>
              </div>
              <div class="flex flex-col">
                <span class="text-white text-sm font-medium">WhatsApp</span>
                <span class="text-text-muted text-xs font-light">{{ settingsService.settings().phone }}</span>
              </div>
              <mat-icon class="text-text-muted/30 ml-auto group-hover:text-[#25D366] transition-colors">chevron_right</mat-icon>
            </a>

            <!-- Email -->
            <a [href]="'mailto:' + settingsService.settings().email" class="flex items-center p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-gold/30 transition-all duration-300 group">
              <div class="w-10 h-10 rounded-full bg-background flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <mat-icon class="text-gold !text-sm">email</mat-icon>
              </div>
              <div class="flex flex-col">
                <span class="text-white text-sm font-medium">Email Us</span>
                <span class="text-text-muted text-xs font-light">{{ settingsService.settings().email }}</span>
              </div>
              <mat-icon class="text-text-muted/30 ml-auto group-hover:text-gold transition-colors">chevron_right</mat-icon>
            </a>
          </div>

          <!-- Location & Hours -->
          <div class="mt-8 pt-8 border-t border-white/5 text-center">
            <h6 class="text-white text-xs font-semibold uppercase tracking-widest mb-4">Visit Our Clinic</h6>
            <div class="text-text-muted text-sm font-light space-y-2">
              <div class="flex items-center justify-center gap-2">
                <mat-icon class="text-gold !text-sm">location_on</mat-icon>
                <span>{{ settingsService.settings().address }}</span>
              </div>
              <div class="flex justify-center gap-4 mt-2 text-xs">
                <span><span class="text-white font-medium">Mon-Fri:</span> 9AM - 6PM</span>
                <span><span class="text-white font-medium">Sat:</span> 9AM - 5PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      border-radius: 1rem;
      overflow: hidden;
    }
  `]
})
export class ContactPurchaseDialogComponent {
  settingsService = inject(SettingsService);

  constructor(
    public dialogRef: MatDialogRef<ContactPurchaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { productName: string }
  ) {}
}
