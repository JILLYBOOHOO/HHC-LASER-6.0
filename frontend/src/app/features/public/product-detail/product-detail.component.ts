import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from '../../../core/services/product.service';
import { PurchaseDialogComponent } from '../../../shared/components/purchase-dialog/purchase-dialog.component';
import { Product } from '../../../core/models/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="pt-4 pb-16 min-h-screen" style="background: var(--color-cream)">
      
      @if (loading()) {
        <div class="flex justify-center items-center py-32">
          <mat-icon class="animate-spin text-gold-500 !w-12 !h-12 !text-5xl">refresh</mat-icon>
        </div>
      } @else if (product()) {
        <div class="max-w-6xl mx-auto px-4">
          
          <a routerLink="/products" class="inline-flex items-center text-charcoal-500 hover:text-gold-600 transition-colors mb-8 text-sm font-medium">
            <mat-icon class="!text-sm !w-4 !h-4 mr-1">arrow_back</mat-icon> Back to Products
          </a>

          <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-cream-200">
            <div class="grid grid-cols-1 md:grid-cols-2">
              
              <!-- Image Gallery Side -->
              <div class="relative bg-charcoal-50 aspect-square md:aspect-auto">
                <img loading="lazy" [src]="product()?.image_url || 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=800'" 
                     [alt]="product()?.name" 
                     class="absolute inset-0 w-full h-full object-cover" />

              </div>

              <!-- Content Side -->
              <div class="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                <div class="text-gold-600 text-sm font-semibold tracking-[0.2em] uppercase mb-4">{{ product()?.category_name }}</div>
                <h1 class="text-4xl md:text-5xl font-heading text-charcoal-900 mb-6 leading-tight">
                  {{ product()?.name }}
                </h1>
                


                <div class="prose prose-charcoal mb-12 text-charcoal-400 leading-relaxed font-light text-lg">
                  <p>{{ product()?.description }}</p>
                </div>

                <button mat-flat-button class="!bg-white !text-black !h-14 !text-lg !rounded-xl w-full hover:!bg-gold-500 hover:!text-white transition-all shadow-lg"
                        (click)="openPurchaseDialog()">
                  Contact To Purchase
                </button>
                <p class="text-center text-xs text-charcoal-400 mt-6 tracking-wide">Available exclusively at HHC LASER clinics.</p>
              </div>

            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-32">
          <mat-icon class="text-charcoal-300 !w-16 !h-16 !text-6xl mb-4">inventory_2</mat-icon>
          <h2 class="text-2xl font-heading text-charcoal-900 mb-2">Product Not Found</h2>
          <p class="text-charcoal-500 mb-6">The product you are looking for does not exist or has been removed.</p>
          <a routerLink="/products" mat-flat-button class="!bg-white !text-black shadow-md hover:!bg-gold-500 hover:!text-white transition-colors">Return to Catalog</a>
        </div>
      }

    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  loading = signal<boolean>(true);

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const slug = params.get('slug');
      if (slug) {
        this.loading.set(true);
        const p = await this.productService.getProductBySlug(slug);
        this.product.set(p);
        this.loading.set(false);
      }
    });
  }

  openPurchaseDialog() {
    const p = this.product();
    if (p) {
      this.dialog.open(PurchaseDialogComponent, {
        data: { product: p },
        width: '100%',
        maxWidth: '450px'
      });
    }
  }
}
