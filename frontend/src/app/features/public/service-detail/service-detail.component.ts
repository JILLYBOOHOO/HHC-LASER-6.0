import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';
import { Service } from '../../../core/models/models';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="pt-4 pb-16 min-h-screen" style="background: var(--color-cream)">
      @if (loading()) {
        <div class="flex justify-center items-center py-32">
          <mat-icon class="animate-spin text-gold-500 !w-12 !h-12 !text-5xl">refresh</mat-icon>
        </div>
      } @else if (service()) {
        <div class="max-w-6xl mx-auto px-4">
          <a routerLink="/services" class="inline-flex items-center text-charcoal-500 hover:text-gold-600 transition-colors mb-8 text-sm font-medium">
            <mat-icon class="!text-sm !w-4 !h-4 mr-1">arrow_back</mat-icon> Back to Services
          </a>

          <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-cream-200">
            <div class="grid grid-cols-1 md:grid-cols-2">
              <div class="relative bg-charcoal-50 aspect-square md:aspect-auto min-h-[320px]">
                <img loading="lazy"
                     [src]="service()?.thumbnail_url || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800'"
                     [alt]="service()?.name"
                     class="absolute inset-0 w-full h-full object-cover" />
              </div>

              <div class="p-8 md:p-12 flex flex-col justify-center">
                <div class="text-gold-600 text-sm font-semibold tracking-[0.2em] uppercase mb-4">{{ service()?.category_name }}</div>
                <h1 class="text-4xl md:text-5xl font-heading text-black mb-6 leading-tight">{{ service()?.name }}</h1>

                <div class="flex flex-wrap items-center gap-4 mb-8">
                  <div class="text-3xl font-medium text-black">J$ {{ service()?.price_jmd | number:'1.0-0' }}</div>
                  <div class="text-sm text-charcoal-500 flex items-center gap-1">
                    <mat-icon class="!text-base text-gold-500">schedule</mat-icon>
                    {{ service()?.duration_minutes }} minutes
                  </div>
                </div>

                <div class="prose prose-charcoal mb-10 text-charcoal-600 leading-relaxed">
                  <p>{{ service()?.description || service()?.short_description }}</p>
                </div>

                <a routerLink="/customer/book" [queryParams]="{ serviceId: service()?.id }"
                   mat-flat-button class="!bg-black !text-white !h-14 !text-lg !rounded-xl w-full hover:!bg-gold-600 transition-colors">
                  Book This Treatment
                </a>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-32">
          <mat-icon class="text-charcoal-300 !w-16 !h-16 !text-6xl mb-4">spa</mat-icon>
          <h2 class="text-2xl font-heading text-black mb-2">Service Not Found</h2>
          <p class="text-charcoal-500 mb-6">The treatment you are looking for does not exist or has been removed.</p>
          <a routerLink="/services" mat-flat-button class="!bg-black !text-white">Browse All Services</a>
        </div>
      }
    </div>
  `
})
export class ServiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  service = signal<Service | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (!slug) {
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      this.api.getServiceBySlug(slug).subscribe({
        next: res => {
          this.service.set(res.data ?? null);
          this.loading.set(false);
        },
        error: () => {
          this.service.set(null);
          this.loading.set(false);
        }
      });
    });
  }
}
