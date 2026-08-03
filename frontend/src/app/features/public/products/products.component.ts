import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from '../../../core/services/product.service';
import { PurchaseDialogComponent } from '../../../shared/components/purchase-dialog/purchase-dialog.component';
import { Product } from '../../../core/models/models';
import { SeoService } from '../../../core/services/seo.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="pt-4 pb-16 min-h-screen" style="background: var(--color-cream)">
      <div class="max-w-7xl mx-auto px-4">
        
        <!-- Header -->
        <div class="text-center mb-16">
          <span class="section-label">Luxury Skincare</span>
          <div class="divider-gold"></div>
          <h1 class="mt-4 font-heading text-4xl md:text-5xl text-charcoal-900">
            Professional <span class="text-gold-500">Products</span>
          </h1>
          <p class="mt-4 max-w-2xl mx-auto text-charcoal-500 leading-relaxed">
            Enhance and maintain your results at home with our curated selection of professional-grade skincare treatments.
          </p>
        </div>

        @if (productService.loading()) {
          <div class="flex justify-center items-center py-20">
            <mat-icon class="animate-spin text-gold-500 !w-12 !h-12 !text-5xl">refresh</mat-icon>
          </div>
        }

        <!-- Product Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (product of productService.products(); track product.id) {
            <div class="bg-white border-2 border-black shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full cursor-pointer"
                 [routerLink]="['/products', product.slug]">
              <!-- Image Container -->
              <div class="aspect-[16/9] w-full overflow-hidden bg-gray-100 border-b-2 border-black relative group">
                <img loading="lazy" [src]="product.image_url || 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=800'" 
                     [alt]="product.name" 
                     class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              </div>

              <!-- Product Details -->
              <div class="p-6 flex flex-col flex-grow">
                <div class="mb-2">
                  <span class="inline-block bg-white text-black text-xs font-bold px-3 py-1 border-2 border-black uppercase">{{ product.category_name || 'Skincare' }}</span>
                </div>
                <h3 class="text-xl font-black text-black mb-3 hover:text-gray-700 transition-colors line-clamp-2">
                  {{ product.name }}
                </h3>
                <p class="text-black text-sm mb-4 leading-relaxed font-bold flex-grow line-clamp-3">
                  {{ product.description }}
                </p>

                <!-- Pricing & Action Buttons -->
                <div class="flex flex-col gap-4 mt-auto pt-2">
                  <div class="flex items-center justify-between">
                    <span class="text-2xl font-black text-black">J$ {{ product.price_jmd | number:'1.2-2' }}</span>
                    <p class="text-xs text-green-600 font-bold">Available</p>
                  </div>
                  <button class="bg-black text-white w-full py-3 hover:bg-gray-800 transition-colors font-bold border-2 border-black tracking-wider shadow-md"
                          (click)="$event.stopPropagation(); $event.preventDefault(); openPurchaseDialog(product)">
                    Contact for Purchase
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class ProductsComponent implements OnInit {
  private seo = inject(SeoService);

  constructor(
    public productService: ProductService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.seo.updatePage({
      title: 'Luxury Medical Skincare Products Jamaica | HHC Laser & Co.',
      description: 'Shop luxury medical-grade skincare products at HHC Laser & Co. Kingston Jamaica. Achieve radiant skin with our clinically proven cleansers, serums, and treatments.',
      canonicalPath: '/products',
      keywords: 'Medical Skincare Jamaica, Luxury Skincare Kingston, HHC Laser Products, Clinical Skincare Jamaica',
    });
    this.productService.loadProducts();
  }

  openPurchaseDialog(product: Product) {
    this.dialog.open(PurchaseDialogComponent, {
      data: { product },
      width: '100%',
      maxWidth: '450px'
    });
  }
}
