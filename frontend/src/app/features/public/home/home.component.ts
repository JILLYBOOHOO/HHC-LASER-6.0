import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import { BeforeAfterSliderComponent } from '../../../shared/components/before-after-slider/before-after-slider.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    BeforeAfterSliderComponent,
  ],
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate(
          '1000ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
  template: `
    <!-- Hero Section -->
    <section
      class="relative h-screen min-h-[700px] flex items-center overflow-hidden bg-background"
    >
      <!-- Dark Cinematic Background Video -->
      <div class="absolute inset-0 z-0">
        <!-- Overlay Gradients -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-black/40 to-black/10 z-10"
        ></div>
        <div
          class="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10"
        ></div>
        <div
          class="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"
        ></div>
        <div
          class="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(214,179,106,0.08),transparent_45%)] z-10"
        ></div>
        <video
          #heroVideo
          autoplay
          [muted]="true"
          loop
          playsinline
          preload="auto"
          class="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/HCCVID.mp4" type="video/mp4" />
        </video>
      </div>

      <!-- Hero Content -->
      <div
        class="container-luxury relative z-10 px-6 w-full mt-24 pb-24 md:pb-0"
        @fadeUp
      >
        <div class="max-w-3xl">
          <!-- Brand name tag -->
          <!-- Main Headline -->
          <h1
            class="text-white font-heading leading-[1.05] tracking-tight mb-8 drop-shadow-lg"
          >
            HHC LASER .co
          </h1>

          <!-- Tagline -->
          <p
            class="text-white text-base md:text-lg font-medium leading-relaxed max-w-xl mb-10 drop-shadow-lg"
          >
            Premium medical spa — laser hair removal, Botox, fillers, IV
            therapy, weight loss, body contouring and advanced skincare at
            Jamaica's premier wellness destination.
          </p>

          <!-- CTA -->
          <div class="flex flex-col sm:flex-row gap-4 mb-8 drop-shadow-lg">
            <a
              routerLink="/customer/book"
              class="btn-primary text-center hover:!text-black"
              >Book Your Treatment</a
            >
            <a
              routerLink="/services"
              class="btn-secondary text-center"
              style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);"
              >View All Services</a
            >
          </div>

          <!-- Trust Badges -->
          <div class="flex flex-wrap items-center gap-3 pt-2">
            <div class="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <mat-icon
                class="text-gold !text-base !w-4 !h-4 flex items-center justify-center"
                >verified</mat-icon
              >
              <span class="text-white text-[11px] font-medium tracking-wide"
                >Licensed Professionals</span
              >
            </div>
            <div class="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <mat-icon
                class="text-gold !text-base !w-4 !h-4 flex items-center justify-center"
                >science</mat-icon
              >
              <span class="text-white text-[11px] font-medium tracking-wide"
                >FDA Approved Equipment</span
              >
            </div>
            <div class="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <mat-icon
                class="text-gold !text-base !w-4 !h-4 flex items-center justify-center"
                >favorite</mat-icon
              >
              <span class="text-white text-[11px] font-medium tracking-wide"
                >1,000+ Happy Clients</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Subtle bottom scroll indicator -->
      <div
        class="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
      >
        <span
          class="text-[9px] tracking-[0.25em] font-semibold text-text-muted/50 uppercase"
          >DISCOVER</span
        >
        <div
          class="w-[1px] h-10 bg-gradient-to-b from-gold to-transparent"
        ></div>
      </div>
    </section>

    <!-- Editorial Philosophy Section (Aman-inspired Magazine Layout) -->
    <section class="section bg-background">
      <div class="container-luxury px-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <!-- Text Content -->
          <div class="lg:col-span-5 space-y-6 @fadeUp">
            <span class="section-label">Our Philosophy</span>
            <h2 class="font-heading text-white leading-tight">
              The Science of Subtle Transformation.
            </h2>
            <div class="divider-gold-left"></div>
            <p class="text-text-muted text-base font-light leading-relaxed">
              At HHC Laser, we believe that true beauty lies in the preservation
              of authenticity. Our bespoke treatments use industry-leading laser
              technology and medical-grade injectables to enhance your natural
              architecture.
            </p>
            <div class="space-y-4 pt-4">
              <div class="flex items-start gap-4">
                <mat-icon class="text-gold !text-lg !w-5 !h-5 mt-1"
                  >flare</mat-icon
                >
                <div>
                  <h6 class="text-white font-medium text-sm">
                    Advanced Laser Resurfacing
                  </h6>
                  <p class="text-text-muted text-xs font-light">
                    Targeted precision for flawless, luminous skin.
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <mat-icon class="text-gold !text-lg !w-5 !h-5 mt-1"
                  >blur_on</mat-icon
                >
                <div>
                  <h6 class="text-white font-medium text-sm">
                    Precision Facial Contouring
                  </h6>
                  <p class="text-text-muted text-xs font-light">
                    Bespoke injectables that respect your structure.
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <mat-icon class="text-gold !text-lg !w-5 !h-5 mt-1"
                  >waves</mat-icon
                >
                <div>
                  <h6 class="text-white font-medium text-sm">
                    Skin Vitality Optimization
                  </h6>
                  <p class="text-text-muted text-xs font-light">
                    Cellular level nourishment for lasting wellness.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Overlapping Images Grid -->
          <div class="lg:col-span-7 relative flex items-center justify-center">
            <!-- Background luxury ambient light glow -->
            <div
              class="absolute w-72 h-72 bg-gold/5 rounded-full filter blur-[100px] z-0"
            ></div>

            <div
              class="relative w-full max-w-lg aspect-[4/5] rounded-3xl overflow-hidden border border-white/5 shadow-2xl z-10"
            >
              <div
                class="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent z-10"
              ></div>
              <img
                src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80"
                alt="Modern Aesthetic Equipment"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Frosted Glass Overlapping Panel -->
            <div
              class="absolute bottom-[-30px] left-[-30px] hidden md:block glass p-6 rounded-2xl max-w-xs z-20"
            >
              <p class="text-white text-sm italic font-light leading-relaxed">
                "We reject the mass-market approach to beauty. Each client
                journey begins with a private residency — a comprehensive
                analysis that considers cellular health, lifestyle architecture,
                and long-term vitality."
              </p>
              <div
                class="text-[9px] tracking-widest font-semibold text-gold uppercase mt-4"
              >
                — Clinical Board
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Treatments Section -->
    <section class="section bg-surface-light border-y border-white/5 relative overflow-hidden">
      <div
        class="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full opacity-40"
        style="background: radial-gradient(circle, rgba(214,179,106,0.08) 0%, transparent 68%);"
      ></div>

      <div class="container-luxury px-6 relative z-10">
        <div class="text-center max-w-2xl mx-auto mb-14" @fadeUp>
          <span class="section-label">Clinical Outcomes</span>
          <h2 class="mt-4 font-heading text-white">Proven Transformation</h2>
          <div class="divider-gold"></div>
          <p class="text-text-muted text-base font-light">
            Explore featured treatments clients love. Drag the laser comparison
            to see real results, then view details or book your session.
          </p>
        </div>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 max-w-6xl mx-auto"
          @fadeUp
        >
          @for (service of featuredTreatments; track service.id) {
            <article
              class="group relative flex flex-col h-full rounded-2xl overflow-hidden border border-white/10 bg-[#141416] transition-all duration-500 hover:-translate-y-1.5 hover:border-[rgba(214,179,106,0.45)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
            >
              <div
                class="relative block aspect-[4/5] sm:aspect-[5/6] overflow-hidden bg-black"
              >
                @if (service.beforeImage && service.afterImage) {
                  <app-before-after-slider
                    class="absolute inset-0 block h-full w-full"
                    [mediaOnly]="true"
                    [beforeImage]="service.beforeImage"
                    [afterImage]="service.afterImage"
                    [treatmentName]="service.name"
                    [duration]="service.duration"
                  >
                  </app-before-after-slider>
                } @else {
                  <a [routerLink]="service.detailsLink" class="absolute inset-0 block">
                    <img
                      loading="lazy"
                      [src]="service.image"
                      [alt]="service.name"
                      class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                  </a>
                }

                <div
                  class="absolute inset-0 bg-gradient-to-t from-[#141416] via-[#141416]/45 to-transparent pointer-events-none z-[25]"
                ></div>
                <div class="absolute inset-x-0 bottom-0 p-5 md:p-6 pointer-events-none z-[26]">
                  <div class="text-[10px] tracking-[0.22em] uppercase text-[var(--gold)] mb-2 font-semibold">
                    Featured Treatment
                  </div>
                  <h3 class="font-heading text-white text-2xl md:text-[1.65rem] leading-tight">
                    {{ service.name }}
                  </h3>
                </div>
              </div>

              <div class="px-5 md:px-6 pb-5 md:pb-6 pt-1 flex flex-col flex-1">
                @if (service.priceLabel) {
                  <div class="text-[var(--gold-light)] font-medium text-sm mb-3 tracking-wide">
                    {{ service.priceLabel }}
                    @if (service.duration) {
                      <span class="text-white/35 mx-2">·</span>
                      <span class="text-text-muted font-light">{{ service.duration }}</span>
                    }
                  </div>
                }

                <p class="text-text-muted text-sm font-light leading-relaxed mb-6 flex-1 line-clamp-3">
                  {{ service.description }}
                </p>

                <div class="grid grid-cols-2 gap-2.5 mt-auto">
                  <a
                    [routerLink]="service.detailsLink"
                    class="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/15 text-white/85 text-xs font-semibold tracking-wide hover:border-[var(--gold)] hover:text-[var(--gold-light)] transition-colors duration-300"
                  >
                    Details
                  </a>
                  <a
                    [routerLink]="['/customer/book']"
                    [queryParams]="service.bookParams"
                    class="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-black text-xs font-bold tracking-wide transition-all duration-300 hover:brightness-110"
                    style="background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 55%, var(--gold-dark) 100%);"
                  >
                    Book Now
                  </a>
                </div>
              </div>
            </article>
          }
        </div>
      </div>
    </section>

    <!-- Call to Action Section (Cinematic Banner) -->
    <section
      class="section relative overflow-hidden bg-surface border-t border-white/5"
    >
      <!-- Light gold ambient glow background -->
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full filter blur-[150px]"
      ></div>

      <div
        class="relative z-10 text-center px-6 max-w-3xl mx-auto space-y-8"
        @fadeUp
      >
        <span class="section-label">Begin Your Transformation</span>
        <h2 class="font-heading text-white leading-tight">
          Ready for your transformation?
        </h2>
        <p class="text-text-muted text-base font-light leading-relaxed">
          Book your complimentary private consultation today and let our
          certified clinical specialists design a personalized treatment plan
          for your unique goals.
        </p>
        <div class="pt-4">
          <a routerLink="/customer/book" class="btn-primary"
            >Book Consultation</a
          >
        </div>
      </div>
    </section>

    <!-- Instagram Section -->
    <section class="section bg-surface border-t border-white/5">
      <div class="container-luxury px-6 max-w-5xl mx-auto" @fadeUp>
        <div class="text-center max-w-xl mx-auto mb-14">
          <span class="section-label">Social</span>
          <h2 class="mt-4 font-heading text-white">Stay connected with HHC Laser</h2>
          <div class="divider-gold"></div>
          <p class="text-text-muted text-sm font-light leading-relaxed mt-1">
            Clinical results and clinic life from Havendale Healthcare.
          </p>
        </div>

        <div
          class="flex md:grid md:grid-cols-4 gap-3 md:gap-4 mb-12 overflow-x-auto pb-2 md:overflow-visible snap-x snap-mandatory"
        >
          @for (post of instagramPosts; track post.url) {
            <a
              [href]="post.link"
              target="_blank"
              rel="noopener noreferrer"
              class="group relative block shrink-0 w-[42vw] max-w-[200px] md:w-auto md:max-w-none snap-center aspect-[3/4] overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1d] transition-colors duration-300 hover:border-[rgba(214,179,106,0.45)]"
            >
              <video
                [src]="post.url"
                autoplay
                [muted]="true"
                loop
                playsinline
                preload="metadata"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] pointer-events-none"
                (loadeddata)="playFeedVideo($event)"
                (canplay)="playFeedVideo($event)"
              ></video>

              <div
                class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300"
              ></div>

              <div
                class="absolute inset-x-0 bottom-0 p-4 md:p-5 flex items-center justify-between gap-3"
              >
                <span
                  class="text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-semibold text-white/80 group-hover:text-[var(--gold-light)] transition-colors"
                >
                  View on Instagram
                </span>
                <mat-icon
                  class="!text-lg !w-5 !h-5 text-white/70 group-hover:text-[var(--gold)] transition-colors"
                  >arrow_outward</mat-icon
                >
              </div>
            </a>
          }
        </div>

        <div class="text-center">
          <a
            href="https://www.instagram.com/havendale_healthcare"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-outline inline-flex items-center gap-2"
          >
            Follow &#64;havendale_healthcare
            <mat-icon class="!w-4 !h-4 !text-sm flex items-center justify-center"
              >open_in_new</mat-icon
            >
          </a>
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;

  instagramPosts = [
    {
      type: 'video' as const,
      url: '/instagram/acne-dark-spots.mp4',
      link: 'https://www.instagram.com/havendale_healthcare',
    },
    {
      type: 'video' as const,
      url: '/instagram/no-filter-photorejuvenation.mp4',
      link: 'https://www.instagram.com/havendale_healthcare',
    },
    {
      type: 'video' as const,
      url: '/instagram/skin-update-clip.mp4',
      link: 'https://www.instagram.com/havendale_healthcare',
    },
    {
      type: 'video' as const,
      url: '/instagram/keloid-results.mp4',
      link: 'https://www.instagram.com/havendale_healthcare',
    },
  ];

  ngAfterViewInit() {
    if (this.heroVideo && this.heroVideo.nativeElement) {
      this.heroVideo.nativeElement.muted = true;
      this.heroVideo.nativeElement
        .play()
        .catch((e) => console.warn('Video autoplay blocked:', e));
    }
  }

  playFeedVideo(event: Event) {
    const el = event.target as HTMLVideoElement;
    if (!el) return;
    el.muted = true;
    el.playsInline = true;
    if (el.paused) {
      el.play().catch((e) => console.warn('Instagram feed video autoplay blocked:', e));
    }
  }

  featuredTreatments = [
    {
      id: 8,
      name: 'Laser Hair Removal',
      description:
        'Reduced coarse facial hair and ingrown bumps along the chin and neck, leaving skin smoother and clearer.',
      priceLabel: 'JMD $ 10,000',
      duration: '10 mins',
      image: '/images/before-after/laser-hair-removal-after.png',
      beforeImage: '/images/before-after/laser-hair-removal-before.png',
      afterImage: '/images/before-after/laser-hair-removal-after.png',
      detailsLink: '/services/8',
      bookParams: { service: 8 },
    },
    {
      id: 60,
      name: 'Stretch Marks',
      description:
        'Laser, radiofrequency, and growth factors stimulate collagen to soften stretch marks and improve skin texture over time.',
      priceLabel: 'JMD $ 16,000',
      duration: '45 mins',
      image: '/hhclaser_img/hhclaser_images/live/60_STRETCH MARKS.jpg',
      detailsLink: '/services/60',
      bookParams: { service: 60 },
    },
    {
      id: 55,
      name: 'Wood Therapy',
      description:
        'Improves circulation, reduces cellulite and fat deposits, and supports lymphatic drainage to flush toxins.',
      priceLabel: 'JMD $ 9,000',
      duration: '45 mins',
      image: '/hhclaser_img/hhclaser_images/live/55_WOOD THERAPY.jpg',
      detailsLink: '/services/55',
      bookParams: { service: 55 },
    },
    {
      id: 50,
      name: 'Folliculitis',
      description:
        'A consultation-led treatment plan to calm inflamed follicles, reduce bumps, and improve skin clarity.',
      priceLabel: 'JMD $ 12,000',
      duration: '10 mins',
      image: '/hhclaser_img/hhclaser_images/live/50_FOLLICULITIS.jpg',
      detailsLink: '/services/50',
      bookParams: { service: 50 },
    },
    {
      id: 35,
      name: 'Acne / Dark Spots',
      description:
        'Targets hormonal acne, blackheads, whiteheads, pustules, and milia — with skin resurfacing support included.',
      priceLabel: 'JMD $ 12,000',
      duration: '25 mins',
      image: '/hhclaser_img/hhclaser_images/live/35_ACNE _ DARK SPOTS.jpg',
      detailsLink: '/services/35',
      bookParams: { service: 35 },
    },
    {
      id: 58,
      name: 'Skin Resurfacing',
      description:
        'Advanced laser resurfacing to reduce hyperpigmentation, spots, pores, scars, wrinkles, and fine lines.',
      priceLabel: 'JMD $ 14,000',
      duration: '25 mins',
      image: '/hhclaser_img/hhclaser_images/live/58_SKIN RESURFACING.jpg',
      detailsLink: '/services/58',
      bookParams: { service: 58 },
    },
  ];
}
