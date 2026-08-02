import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../../core/services/seo.service';


@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pt-32 pb-16 min-h-screen" style="background: #FFFFFF;">
      <div class="max-w-7xl mx-auto px-4">

        <!-- Header -->
        <div class="text-center mb-16">
          <span class="section-label" style="color: var(--gold);">OUR WORK</span>
          <div class="divider-gold mx-auto mb-4"></div>
          <h1 class="font-heading text-4xl md:text-5xl" style="color: #000000;">
            Our <span style="color: var(--gold); font-style: italic;">Gallery</span>
          </h1>
          <p class="mt-4 max-w-2xl mx-auto text-lg leading-relaxed text-slate-600">
            Take a look at our state-of-the-art facilities and the amazing results we've achieved for our clients.
          </p>
        </div>

        <!-- Gallery Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (image of images; track image.src) {
            <div class="group relative overflow-hidden rounded-xl cursor-pointer"
                 style="aspect-ratio: 1 / 1; background: #1a1a1a;"
                 (click)="openLightbox(image.src)">
              <img [src]="image.src"
                   [alt]="image.alt"
                   class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   style="opacity: 0.85;"
                   loading="lazy"
                   (load)="onLoad($event)"
                   (error)="onError($event)">

              <!-- Hover Overlay -->
              <div class="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style="background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);">
                <div class="w-full p-4 flex items-center justify-center">
                  <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center"
                       style="border-color: var(--gold); background: rgba(0,0,0,0.6);">
                    <span style="color: var(--gold); font-size: 22px; line-height: 1;">+</span>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

      </div>

      <!-- Lightbox -->
      @if (lightboxSrc()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
             style="background: rgba(0,0,0,0.95);"
             (click)="closeLightbox()">
          <button class="absolute top-5 right-6 text-black text-5xl font-thin hover:opacity-70 transition-opacity leading-none"
                  (click)="closeLightbox()">&times;</button>
          <img loading="lazy" [src]="lightboxSrc()!"
               class="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
               (click)="$event.stopPropagation()">
        </div>
      }
    </div>
  `,
  styles: [`
    img { display: block; }
  `]
})
export class GalleryComponent implements OnInit {
  private seo = inject(SeoService);
  lightboxSrc = signal<string | null>(null);

  ngOnInit(): void {
    this.seo.updatePage({
      title: 'Results Gallery | Med Spa Before & After | HHC Laser Jamaica',
      description: 'Browse our gallery of med spa treatment results from HHC Laser & Co. Kingston Jamaica. See before and after photos of laser hair removal, skin rejuvenation, Botox, body contouring, and more.',
      canonicalPath: '/gallery',
      keywords: 'HHC Laser Jamaica Gallery, Med Spa Results Jamaica, Before After Laser Hair Removal Jamaica, Skin Rejuvenation Results Kingston',
    });
  }

  images = [
    // ── /images/ folder (confirmed present) ─────────────────────
    { src: '/images/gallery_1.webp',  alt: 'HHC Laser Gallery' },
    { src: '/images/gallery_2.jpg',   alt: 'HHC Laser Gallery' },
    { src: '/images/gallery_3.webp',  alt: 'HHC Laser Gallery' },
    { src: '/images/gallery_4.jpg',   alt: 'HHC Laser Gallery' },
    { src: '/images/gallery_5.png',   alt: 'HHC Laser Gallery' },
    { src: '/images/gallery_6.jpg',   alt: 'HHC Laser Gallery' },
    { src: '/images/gallery_7.webp',  alt: 'HHC Laser Gallery' },
    { src: '/images/gallery_8.jpg',   alt: 'HHC Laser Gallery' },
    { src: '/images/gallery_9.jpg',   alt: 'HHC Laser Gallery' },
    { src: '/images/gallery_10.jpg',  alt: 'HHC Laser Gallery' },
    { src: '/images/gallery_11.webp', alt: 'HHC Laser Gallery' },
    { src: '/images/gallery_12.jpg',  alt: 'HHC Laser Gallery' },
  ];

  openLightbox(src: string) { this.lightboxSrc.set(src); }
  closeLightbox() { this.lightboxSrc.set(null); }

  onLoad(event: Event) {
    (event.target as HTMLElement).style.opacity = '0.9';
  }

  onError(event: Event) {
    // Hide broken images gracefully
    const el = event.target as HTMLImageElement;
    el.closest('div')!.style.display = 'none';
  }
}
