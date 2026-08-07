import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';
import { Service } from '../../../core/models/models';
import { treatments } from '../../../core/data/services.data';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="pt-24 pb-16 min-h-screen" style="background: var(--color-cream, #faf7f2)">
      @if (loading()) {
        <div class="flex justify-center items-center py-32">
          <mat-icon class="animate-spin text-gold-500 !w-12 !h-12 !text-5xl">refresh</mat-icon>
        </div>
      } @else if (service()) {
        <div class="max-w-6xl mx-auto px-4">
          <a routerLink="/services" class="inline-flex items-center text-neutral-600 hover:text-black transition-colors mb-8 text-sm font-medium">
            <mat-icon class="!text-sm !w-4 !h-4 mr-1">arrow_back</mat-icon> Back to Services
          </a>

          <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-cream-200 mb-8">
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

                <div class="prose mb-10 leading-relaxed">
                  <p class="whitespace-pre-wrap text-black" style="font-family: Georgia, serif;">{{ service()?.description || service()?.short_description }}</p>
                </div>

                <a routerLink="/customer/book" [queryParams]="{ service: service()?.id }"
                   mat-flat-button class="!bg-black !text-white !h-14 !text-lg !rounded-xl w-full hover:!bg-gold-600 transition-colors">
                  Book This Treatment
                </a>
              </div>
            </div>
          </div>

          <div class="mb-8 relative overflow-hidden rounded-3xl border border-[#d4a359]/35"
               style="background: linear-gradient(135deg, #fffdf9 0%, #f7efe3 48%, #f3e6d4 100%);">
            <div class="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-40"
                 style="background: radial-gradient(circle, rgba(212,163,89,0.35) 0%, transparent 70%);"></div>
            <div class="pointer-events-none absolute -left-10 -bottom-16 h-44 w-44 rounded-full opacity-30"
                 style="background: radial-gradient(circle, rgba(212,163,89,0.28) 0%, transparent 70%);"></div>

            <div class="relative px-8 py-10 md:px-12 md:py-11 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div class="max-w-xl text-center md:text-left">
                <span class="inline-block text-[11px] tracking-[0.22em] uppercase font-semibold mb-3"
                      style="color: #b8893f;">Need guidance?</span>
                <h3 class="font-heading text-2xl md:text-3xl text-black leading-tight mb-3">
                  Need help choosing right treatment?
                </h3>
                <p class="text-charcoal-600 text-sm md:text-[15px] leading-relaxed">
                  Call us for Free Consultation
                </p>
              </div>

              <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 shrink-0">
                <a href="tel:+18763196241"
                   class="inline-flex items-center justify-center gap-2.5 min-w-[11.5rem] px-5 py-3.5 rounded-2xl font-semibold text-black transition-all duration-300 hover:-translate-y-0.5"
                   style="background: #d4a359; box-shadow: 0 10px 24px rgba(212,163,89,0.28);">
                  <mat-icon class="!text-[1.15rem] !w-5 !h-5">call</mat-icon>
                  (876) 319-6241
                </a>
                <a href="tel:+18766318134"
                   class="inline-flex items-center justify-center gap-2.5 min-w-[11.5rem] px-5 py-3.5 rounded-2xl font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 bg-white/80 hover:bg-white border border-[#d4a359]/45"
                   style="box-shadow: 0 8px 20px rgba(0,0,0,0.04);">
                  <mat-icon class="!text-[1.15rem] !w-5 !h-5" style="color: #b8893f;">call</mat-icon>
                  (876) 631-8134
                </a>
              </div>
            </div>
          </div>

          <div class="mb-16">
            <div class="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-cream-200">
              <h3 class="font-heading font-bold text-black mb-6 text-2xl text-center md:text-left">What to Expect</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                <div class="flex items-start space-x-4">
                  <div class="w-2 h-2 bg-black mt-2 flex-shrink-0"></div>
                  <span class="text-charcoal-600">Professional consultation before treatment</span>
                </div>
                <div class="flex items-start space-x-4">
                  <div class="w-2 h-2 bg-black mt-2 flex-shrink-0"></div>
                  <span class="text-charcoal-600">Treatment duration: approximately {{ service()?.duration_minutes }} mins</span>
                </div>
                <div class="flex items-start space-x-4">
                  <div class="w-2 h-2 bg-black mt-2 flex-shrink-0"></div>
                  <span class="text-charcoal-600">Follow-up care and aftercare instructions provided</span>
                </div>
                <div class="flex items-start space-x-4">
                  <div class="w-2 h-2 bg-black mt-2 flex-shrink-0"></div>
                  <span class="text-charcoal-600">Safe, FDA-approved equipment and procedures</span>
                </div>
              </div>
            </div>
          </div>

          @if (galleryImages().length > 0) {
            <div class="mt-8 mb-8">
              <div class="text-center mb-10">
                <span class="section-label" style="color: var(--gold, #d4a359);">RESULTS &amp; PROOF</span>
                <div class="divider-gold mx-auto"></div>
                <h2 class="mt-4 font-heading text-3xl md:text-4xl text-black">Treatment Gallery</h2>
                <p class="mt-3 text-neutral-500 text-sm">
                  {{ galleryImages().length }} media item{{ galleryImages().length === 1 ? '' : 's' }} from real client results.
                </p>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                @for (item of galleryImages(); track trackGalleryItem(item, $index)) {
                  <div class="aspect-square rounded-2xl overflow-hidden border border-black/10 shadow-sm bg-black relative">
                    @if (isVideo(item)) {
                      <video
                        [src]="videoSrc(item)"
                        controls
                        playsinline
                        preload="metadata"
                        [attr.poster]="posterSrc(item) || null"
                        class="absolute inset-0 w-full h-full object-contain bg-black"
                        (error)="onMediaError($event, item)">
                      </video>
                    } @else {
                      <img
                        loading="lazy"
                        [src]="imageSrc(item)"
                        alt="Treatment Result"
                        class="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        (error)="onMediaError($event, item)" />
                    }
                  </div>
                }
              </div>
            </div>
          }
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

  galleryImages = computed(() => {
    const s = this.service();
    if (!s || !s.gallery_images) return [];

    let items: any[] = [];
    if (Array.isArray(s.gallery_images)) {
      items = s.gallery_images as any[];
    } else if (typeof s.gallery_images === 'string') {
      try {
        const parsed = JSON.parse(s.gallery_images);
        items = Array.isArray(parsed) ? parsed : [];
      } catch {
        items = [];
      }
    } else if (typeof s.gallery_images === 'object') {
      // Postgres/json edge case: object map instead of array
      items = Object.values(s.gallery_images as Record<string, unknown>);
    }

    return items
      .filter(Boolean)
      .sort((a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0) || (a?.id ?? 0) - (b?.id ?? 0));
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) {
        this.loading.set(false);
        this.service.set(null);
        return;
      }
      this.loading.set(true);
      this.api.getServiceBySlug(slug).subscribe({
        next: (res) => {
          if (res?.data) {
            this.service.set(res.data);
          } else {
            this.service.set(this.fallbackFromCatalog(slug));
          }
          this.loading.set(false);
        },
        error: () => {
          this.service.set(this.fallbackFromCatalog(slug));
          this.loading.set(false);
        },
      });
    });
  }

  private fallbackFromCatalog(slugOrId: string): Service | null {
    const asId = Number(slugOrId);
    const match = treatments.find(
      (t) =>
        (t as any).slug === slugOrId ||
        (!Number.isNaN(asId) && t.id === asId) ||
        this.slugify(t.name || '') === slugOrId
    );
    return (match as Service) || null;
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  trackGalleryItem(item: any, index: number): string | number {
    return item?.id ?? item?.video_url ?? item?.image_url ?? index;
  }

  isVideo(item: any): boolean {
    if (!item || typeof item === 'string') {
      return typeof item === 'string' && /\.(mp4|webm|mov)(\?|$)/i.test(item);
    }
    if (item.media_type === 'video') return true;
    if (item.video_url) return true;
    const url = String(item.image_url || item.url || '');
    return /\.(mp4|webm|mov)(\?|$)/i.test(url);
  }

  videoSrc(item: any): string {
    if (typeof item === 'string') return item;
    return item?.video_url || item?.url || item?.image_url || '';
  }

  posterSrc(item: any): string | null {
    if (!item || typeof item === 'string') return null;
    const poster = item.poster_url || item.thumbnail_url;
    if (poster && !/\.(mp4|webm|mov)(\?|$)/i.test(poster)) return poster;
    // image_url is often the mp4 itself for these galleries — don't use as poster
    const img = item.image_url;
    if (img && !/\.(mp4|webm|mov)(\?|$)/i.test(img)) return img;
    return null;
  }

  imageSrc(item: any): string {
    if (typeof item === 'string') return item;
    return item?.image_url || item?.url || '';
  }

  onMediaError(event: Event, item: any) {
    console.warn('Gallery media failed to load', this.videoSrc(item) || this.imageSrc(item), event);
  }
}
