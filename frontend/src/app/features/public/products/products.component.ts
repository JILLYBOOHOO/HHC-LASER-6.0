import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from '../../../core/services/product.service';
import { PurchaseDialogComponent } from '../../../shared/components/purchase-dialog/purchase-dialog.component';
import { Product } from '../../../core/models/models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="pt-24 pb-16 min-h-screen" style="background: var(--color-cream)">
      <div class="max-w-7xl mx-auto px-4">
        
        <!-- Header -->
        <div class="text-center mb-16">
          <span class="section-label">Luxury Skincare</span>
          <div class="divider-gold"></div>
          <h1 class="mt-4 font-heading text-4xl md:text-5xl text-charcoal-800">
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
            <div class="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden group flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
              
              <!-- Image Container -->
              <div class="relative aspect-square overflow-hidden bg-charcoal-50" [routerLink]="['/products', product.slug]">
                <div class="absolute inset-0 bg-charcoal-900/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                <img [src]="product.image_url || 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=800'" 
                     [alt]="product.name" 
                     class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 cursor-pointer" />
                @if (product.stock_quantity <= 0) {
                  <div class="absolute top-4 right-4 z-20 bg-charcoal-900 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                    Out of Stock
                  </div>
                }
              </div>

              <!-- Product Details -->
              <div class="p-6 flex flex-col flex-grow">
                <div class="text-gold-600 text-xs font-semibold tracking-wider uppercase mb-2">{{ product.category_name }}</div>
                <h3 class="text-2xl font-heading text-charcoal-800 mb-2 hover:text-gold-600 transition-colors cursor-pointer" [routerLink]="['/products', product.slug]">
                  {{ product.name }}
                </h3>
                <p class="text-charcoal-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                  {{ product.description }}
                </p>

                <div class="flex items-end justify-between mb-6">
                  <div>
                    <div class="text-xs text-charcoal-400 uppercase tracking-wider mb-1">Price</div>
                    <div class="text-xl font-medium text-charcoal-900">J$ {{ product.price_jmd | number:'1.2-2' }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-xs text-charcoal-400 uppercase tracking-wider mb-1">Availability</div>
                    <div class="text-sm font-medium" [ngClass]="product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'">
                      @if (product.stock_quantity > 0) {
                        <mat-icon class="!text-sm !w-4 !h-4 inline-block align-middle">check_circle</mat-icon> In Stock ({{product.stock_quantity}})
                      } @else {
                        <mat-icon class="!text-sm !w-4 !h-4 inline-block align-middle">cancel</mat-icon> Sold Out
                      }
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-3">
                  <button mat-stroked-button color="primary" class="flex-1 !border-charcoal-200 !text-charcoal-800" [routerLink]="['/products', product.slug]">
                    View Details
                  </button>
                  <button mat-flat-button class="flex-1 !bg-charcoal-900 !text-white" 
                          [disabled]="product.stock_quantity <= 0"
                          (click)="openPurchaseDialog(product)">
                    Contact To Purchase
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

  constructor(
    public productService: ProductService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
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
