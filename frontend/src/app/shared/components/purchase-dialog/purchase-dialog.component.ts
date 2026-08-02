import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../../core/models/models';

@Component({
  selector: 'app-purchase-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="p-6 max-w-md w-full" style="background: var(--color-cream)">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="font-heading text-2xl text-gray-50 mb-1">Contact To Purchase</h2>
          <p class="text-charcoal-500 text-sm">You are interested in: <strong>{{ data.product.name }}</strong></p>
        </div>
        <button mat-icon-button mat-dialog-close class="!text-charcoal-400 hover:!text-gray-50">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <p class="text-charcoal-600 mb-6 leading-relaxed text-sm">
        To maintain the highest level of care, our professional skincare products are available for direct purchase from our clinic. Please reach out to us using any of the methods below to secure your product.
      </p>

      <div class="space-y-4 mb-8">
        
        <!-- Call -->
        <a href="tel:+18763196241" 
           class="flex items-center gap-4 p-4 rounded-xl border border-gold-200 bg-white hover:border-gold-500 hover:shadow-md transition-all group">
          <div class="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center text-gold-600 group-hover:bg-gold-500 group-hover:text-black transition-colors">
            <mat-icon>phone</mat-icon>
          </div>
          <div>
            <div class="font-medium text-gray-50">Call Us</div>
            <div class="text-charcoal-500 text-sm">(876) 319-6241</div>
          </div>
        </a>

        <!-- WhatsApp -->
        <a [href]="whatsappLink" target="_blank" rel="noopener noreferrer"
           class="flex items-center gap-4 p-4 rounded-xl border border-green-200 bg-white hover:border-green-500 hover:shadow-md transition-all group">
          <div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-black transition-colors">
            <mat-icon>chat</mat-icon>
          </div>
          <div>
            <div class="font-medium text-gray-50">WhatsApp Us</div>
            <div class="text-charcoal-500 text-sm">Message our care team</div>
          </div>
        </a>

        <!-- Email -->
        <a [href]="emailLink"
           class="flex items-center gap-4 p-4 rounded-xl border border-blue-200 bg-white hover:border-blue-500 hover:shadow-md transition-all group">
          <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-black transition-colors">
            <mat-icon>email</mat-icon>
          </div>
          <div>
            <div class="font-medium text-gray-50">Email Us</div>
            <div class="text-charcoal-500 text-sm">infohhcLaser&#64;gmail.com</div>
          </div>
        </a>

      </div>

      <div class="bg-white rounded-xl p-4 border border-cream-200 text-sm">
        <div class="font-medium text-gray-50 mb-2 flex items-center gap-2">
          <mat-icon class="!text-sm !w-4 !h-4 text-gold-500">storefront</mat-icon> Clinic Hours
        </div>
        <div class="text-charcoal-500 grid grid-cols-2 gap-1">
          <div>Mon – Fri:</div><div>9:00 AM – 6:00 PM</div>
          <div>Saturday:</div><div>9:00 AM – 5:00 PM</div>
        </div>
      </div>
    </div>
  `
})
export class PurchaseDialogComponent {
  
  get whatsappLink(): string {
    const text = encodeURIComponent(`Hello! I am interested in purchasing: ${this.data.product.name}. Is it currently in stock?`);
    return `https://wa.me/18763196241?text=${text}`;
  }

  get emailLink(): string {
    const subject = encodeURIComponent(`Product Inquiry: ${this.data.product.name}`);
    const body = encodeURIComponent(`Hello,\n\I would like to purchase ${this.data.product.name}.\n\nPlease let me know how I can proceed.`);
    return `mailto:infohhcLaser@gmail.com?subject=${subject}&body=${body}`;
  }

  constructor(
    public dialogRef: MatDialogRef<PurchaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: Product }
  ) {}
}
