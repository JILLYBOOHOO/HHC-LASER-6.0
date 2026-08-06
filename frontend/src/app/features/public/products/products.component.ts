import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from '../../../core/services/product.service';
import { PurchaseDialogComponent } from '../../../shared/components/purchase-dialog/purchase-dialog.component';
import { Product } from '../../../core/models/models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-[#FAFAF8] pt-24 pb-16">
      <div class="max-w-6xl mx-auto px-4 md:px-6">
        <!-- Header (matches live structure, refined) -->
        <header class="text-center max-w-xl mx-auto mb-8 md:mb-10">
          <p
            class="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#A5813F] mb-2"
          >
            Our Products
          </p>
          <h1
            class="font-heading text-3xl md:text-4xl text-charcoal-900 tracking-tight mb-2"
          >
            Premium Products
          </h1>
          <div class="mx-auto mb-3 h-px w-12 bg-[#D6B36A]"></div>
          <p class="text-charcoal-500 text-xs md:text-sm font-light leading-relaxed">
            Enhance your laser treatment experience with our carefully selected
            professional-grade products and accessories.
          </p>
        </header>

        @if (productService.loading()) {
          <div class="flex justify-center items-center py-16">
            <div
              class="w-8 h-8 rounded-full border-2 border-[#D6B36A]/25 border-t-[#D6B36A] animate-spin"
            ></div>
          </div>
        } @else if (productService.products().length === 0) {
          <div class="text-center py-16 text-charcoal-500">
            <p class="font-heading text-xl text-charcoal-900 mb-2">
              Products coming soon
            </p>
            <p class="text-sm">Please check back shortly or contact the clinic.</p>
          </div>
        } @else {
          <!-- Compact 2x2 / 4-up grid -->
          <div
            class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
          >
            @for (product of productService.products(); track product.id) {
              <article
                class="group flex flex-col bg-white border-2 border-black overflow-hidden"
              >
                <!-- Image -->
                <a
                  [routerLink]="['/products', product.slug]"
                  class="relative block aspect-[4/3] md:aspect-[3/2] bg-gradient-to-b from-[#F7F3EC] to-[#EFE9DF] p-2 md:p-3"
                >
                  <img
                    [src]="
                      product.image_url ||
                      '/assets/products/img_1.png'
                    "
                    [alt]="product.name"
                    class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  @if (product.stock_quantity <= 0) {
                    <span
                      class="absolute top-2 right-2 bg-charcoal-900 text-white text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5"
                    >
                      Out of Stock
                    </span>
                  }
                </a>

                <!-- Details -->
                <div class="flex flex-col flex-1 px-3 pt-2 pb-2">
                  @if (product.category_name) {
                    <p
                      class="text-[9px] font-semibold tracking-[0.16em] uppercase text-[#A5813F] mb-1"
                    >
                      {{ product.category_name }}
                    </p>
                  }

                  <h2 class="mb-1">
                    <a
                      [routerLink]="['/products', product.slug]"
                      class="font-heading text-base md:text-lg text-charcoal-900 hover:text-[#A5813F] transition-colors leading-snug line-clamp-2"
                    >
                      {{ product.name }}
                    </a>
                  </h2>

                  @if (product.description) {
                    <p
                      class="text-charcoal-500 text-[11px] font-light leading-snug line-clamp-1 mb-1.5"
                    >
                      {{ product.description }}
                    </p>
                  }

                  <div class="mt-auto pt-2 border-t border-black/10">
                    <p class="text-sm md:text-base font-medium text-charcoal-900 tabular-nums mb-0">
                      J$ {{ product.price_jmd | number: '1.2-2' }}
                    </p>
                    <p
                      class="text-[10px] font-medium mb-1.5"
                      [class.text-emerald-600]="product.stock_quantity > 0"
                      [class.text-red-500]="product.stock_quantity <= 0"
                    >
                      @if (product.stock_quantity > 0) {
                        In Stock
                      } @else {
                        Sold Out
                      }
                    </p>

                    <button
                      type="button"
                      class="w-full inline-flex items-center justify-center px-3 py-2 bg-charcoal-900 text-white text-[10px] font-semibold tracking-[0.12em] uppercase hover:bg-[#A5813F] disabled:opacity-45 disabled:cursor-not-allowed transition-colors duration-300"
                      [disabled]="product.stock_quantity <= 0"
                      (click)="openPurchaseDialog(product)"
                    >
                      Contact for Purchase
                    </button>
                  </div>
                </div>
              </article>
            }
          </div>
        }

        <!-- Bottom CTA (live site pattern) -->
        <section
          class="mt-12 md:mt-16 bg-charcoal-900 px-5 py-8 md:px-10 md:py-10 text-center"
        >
          <h2 class="font-heading text-3xl md:text-4xl text-white mb-3">
            Interested in Our Products?
          </h2>
          <div class="mx-auto mb-5 h-px w-12 bg-[#D6B36A]"></div>
          <p
            class="text-white/65 text-sm md:text-base font-light max-w-xl mx-auto mb-8 leading-relaxed"
          >
            Contact us for product availability, custom bundles, and professional
            recommendations.
          </p>
          <div
            class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <a
              href="tel:+18763196241"
              class="inline-flex items-center justify-center gap-2 min-w-[200px] px-6 py-3 rounded-full bg-[#D6B36A] text-charcoal-900 text-[11px] font-semibold tracking-[0.14em] uppercase hover:bg-[#F1D89A] transition-colors"
            >
              <mat-icon class="!text-base !w-4 !h-4">call</mat-icon>
              Call (876) 319-6241
            </a>
            <a
              routerLink="/contact"
              class="inline-flex items-center justify-center gap-2 min-w-[200px] px-6 py-3 rounded-full border border-white/25 text-white text-[11px] font-semibold tracking-[0.14em] uppercase hover:border-[#D6B36A] hover:text-[#D6B36A] transition-colors"
            >
              <mat-icon class="!text-base !w-4 !h-4">mail</mat-icon>
              Email Us
            </a>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class ProductsComponent implements OnInit {
  constructor(
    public productService: ProductService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.productService.loadProducts();
  }

  openPurchaseDialog(product: Product) {
    this.dialog.open(PurchaseDialogComponent, {
      data: { product },
      width: '100%',
      maxWidth: '450px',
    });
  }
}
