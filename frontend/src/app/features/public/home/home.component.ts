import {
  Component,
  signal,
  inject,
  computed,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { BeforeAfterSliderComponent } from '../../../shared/components/before-after-slider/before-after-slider.component';
import { ContactPurchaseDialogComponent } from '../../../shared/components/contact-purchase-dialog/contact-purchase-dialog.component';
import { CheckoutComponent } from '../../../shared/components/checkout/checkout.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    BeforeAfterSliderComponent,
    CheckoutComponent,
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
    trigger('staggerList', [
      transition(':enter', [
        query(
          '.stagger-item',
          [
            style({ opacity: 0, transform: 'translateY(30px)' }),
            stagger(150, [
              animate(
                '800ms cubic-bezier(0.16, 1, 0.3, 1)',
                style({ opacity: 1, transform: 'translateY(0)' }),
              ),
            ]),
          ],
          { optional: true },
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

          <!-- Fiserv / Scotiabank certification test buttons -->
          <div
            class="flex flex-col sm:flex-row flex-wrap gap-4 mb-8 drop-shadow-lg"
          >
            <app-checkout
              orderTotal="1.00"
              buttonText="Test $1.00 Approve"
            ></app-checkout>
            <app-checkout
              orderTotal="2.00"
              buttonText="Test $2.00 Approve"
            ></app-checkout>
            <app-checkout
              orderTotal="8.99"
              buttonText="Test $8.99 Decline"
            ></app-checkout>
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

    <!-- Before & After Comparison Slider Section -->
    <section class="section bg-surface-light border-y border-white/5">
      <div class="container-luxury px-6">
        <div class="text-center max-w-2xl mx-auto mb-16" @fadeUp>
          <span class="section-label">Clinical Outcomes</span>
          <h2 class="mt-4 font-heading text-white">Proven Transformation</h2>
          <div class="divider-gold"></div>
          <p class="text-text-muted text-base font-light">
            Explore actual treatment results. Select a category below and drag
            the handle to compare outcomes.
          </p>
        </div>

        <!-- Luxury Category Filter Bar -->
        <div
          class="flex flex-wrap justify-center items-center gap-3 mb-16 max-w-3xl mx-auto"
          @fadeUp
        >
          @for (cat of filterCategories; track cat.id) {
            <button
              (click)="activeCategory.set(cat.id)"
              [ngClass]="
                activeCategory() === cat.id
                  ? 'bg-gold text-black border-gold'
                  : 'bg-transparent text-text-muted border-white/10 hover:border-gold hover:text-white'
              "
              class="px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border cursor-pointer"
            >
              {{ cat.name }}
            </button>
          }
        </div>

        <!-- Animated Filter Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (item of filteredComparisons(); track item.treatmentName) {
            <div class="transition-all duration-500 animate-fade-in">
              <app-before-after-slider
                [beforeImage]="item.beforeImage"
                [afterImage]="item.afterImage"
                [treatmentName]="item.treatmentName"
                [duration]="item.duration"
                [description]="item.description"
                [rating]="item.rating"
                [testimonial]="item.testimonial"
              >
              </app-before-after-slider>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="section bg-surface-light border-t border-white/5">
      <div class="container-luxury px-6">
        <div class="text-center max-w-2xl mx-auto mb-20" @fadeUp>
          <span class="section-label">Professional Skincare</span>
          <h2 class="mt-4 font-heading text-white">Featured Products</h2>
          <div class="divider-gold"></div>
          <p class="text-text-muted text-base font-light">
            Maintain your results at home with our clinical-grade skincare
            collection.
          </p>
        </div>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          @staggerList
        >
          @for (product of featuredProducts; track product.name) {
            <div
              class="stagger-item group flex flex-col h-full rounded-2xl overflow-hidden bg-surface border border-white/10 hover:border-gold/35 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
            >
              <div
                class="relative aspect-square w-full bg-gradient-to-b from-[#F7F3EC] to-[#EDE7DC] flex items-center justify-center p-5 md:p-6"
              >
                <img
                  [src]="product.image"
                  [alt]="product.name"
                  class="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>

              <div class="p-5 md:p-6 flex flex-col flex-1">
                <h3
                  class="font-heading text-lg text-white mb-2 leading-snug group-hover:text-gold transition-colors duration-300"
                >
                  {{ product.name }}
                </h3>
                <p class="text-text-muted text-xs font-light mb-5 flex-1 leading-relaxed">
                  {{ product.description }}
                </p>

                <div class="mb-5">
                  <span class="text-white font-medium text-base font-body">{{
                    product.price
                  }}</span>
                </div>

                <div class="flex flex-col gap-2.5 mt-auto">
                  <a
                    [routerLink]="['/products']"
                    class="btn-outline w-full text-center text-xs py-2.5 !border-white/20"
                    >View Product</a
                  >
                  <button
                    (click)="openPurchaseDialog(product.name)"
                    class="btn-primary w-full text-center text-xs py-2.5"
                  >
                    Contact for Purchase
                  </button>
                </div>
              </div>
            </div>
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
    <section class="bg-white py-24 border-t border-gray-100">
      <div class="container-luxury px-6 max-w-7xl mx-auto" @fadeUp>
        <div class="text-center max-w-3xl mx-auto mb-16">
          <span
            class="text-xs font-semibold tracking-[0.2em] uppercase text-gold"
            >Follow Our Journey</span
          >
          <h2 class="mt-4 font-heading text-4xl text-charcoal-900 mb-6">
            Stay connected with HHC Laser
          </h2>
          <div class="h-px w-16 bg-gold mx-auto mb-6"></div>
          <p class="text-charcoal-500 font-light leading-relaxed">
            Stay connected with Havendale Healthcare (HHC Laser) and explore our
            latest treatments, client transformations, wellness tips, skincare
            education, and behind-the-scenes moments from our clinic in
            Kingston, Jamaica.
          </p>
        </div>

        <!-- Instagram Gallery Grid -->
        <div
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4 mb-12 max-w-6xl mx-auto place-items-stretch"
        >
          @for (post of instagramPosts; track post.url) {
            <a
              [href]="post.link"
              target="_blank"
              rel="noopener noreferrer"
              class="group relative aspect-square w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-neutral-100 block"
            >
              @if (post.type === 'video') {
                <video
                  [src]="post.url"
                  autoplay
                  [muted]="true"
                  loop
                  playsinline
                  preload="metadata"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                  (loadeddata)="playFeedVideo($event)"
                  (canplay)="playFeedVideo($event)"
                ></video>
              } @else {
                <img
                  [src]="post.url"
                  alt="Instagram Post from HHC Laser"
                  loading="lazy"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              }
              <div
                class="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors duration-300 flex items-center justify-center"
              >
                <mat-icon
                  class="text-white opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 !text-3xl !w-9 !h-9"
                  >{{ post.type === 'video' ? 'play_circle' : 'photo_camera' }}</mat-icon
                >
              </div>
            </a>
          }
        </div>

        <!-- Call-to-Action -->
        <div class="text-center">
          <a
            href="https://www.instagram.com/havendale_healthcare"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary hover:!text-black inline-flex items-center gap-2"
          >
            Follow &#64;havendale_healthcare
            <mat-icon
              class="!w-4 !h-4 !text-sm flex items-center justify-center"
              >open_in_new</mat-icon
            >
          </a>
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent implements AfterViewInit {
  private dialog = inject(MatDialog);

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
      url: '/instagram/beforeandafter.mp4',
      link: 'https://www.instagram.com/havendale_healthcare',
    },
    {
      type: 'video' as const,
      url: '/instagram/skin-update-youtube.mp4',
      link: 'https://www.instagram.com/havendale_healthcare',
    },
    {
      type: 'video' as const,
      url: '/instagram/keloid-results.mp4',
      link: 'https://www.instagram.com/havendale_healthcare',
    },
    {
      type: 'video' as const,
      url: '/instagram/laser-hair-results.mp4',
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

  featuredProducts = [
    {
      category: 'Skin Supplement',
      name: 'Lemon Wash',
      description: 'Lemon Acne Cleanser',
      price: 'J$1,500.00',
      stock: 'In Stock (500 available)',
      image: '/assets/products/img_1.png',
    },
    {
      category: 'Skin Supplement',
      name: 'Bikini & Body Cream',
      description:
        'Reduces dead skin, rough and bumpy texture, smooths skin, and helps reduce hyperpigmentation.',
      price: 'J$4,500.00',
      stock: 'In Stock (200 available)',
      image: '/assets/products/img_2.png',
    },
    {
      category: 'Skin Supplement',
      name: 'COCO Bean & Coconut Cleanser & Moisturizer',
      description:
        'Facial cleanser and moisturizer formulated for healthy, hydrated skin.',
      price: 'J$4,500.00',
      stock: 'In Stock (200 available)',
      image: '/assets/products/img_3.png',
    },
    {
      category: 'Skin Supplement',
      name: 'Toner & Collagen Moisturizer Set',
      description: 'Best combination for clear and smooth skin.',
      price: 'J$5,000.00',
      stock: 'In Stock (200 available)',
      image: '/assets/products/img_4.png',
    },
  ];

  openPurchaseDialog(productName: string) {
    this.dialog.open(ContactPurchaseDialogComponent, {
      width: '90%',
      maxWidth: '450px',
      data: { productName },
      panelClass: 'luxury-dialog',
    });
  }

  // Active Category Filter Signal
  activeCategory = signal<string>('all');

  filterCategories = [
    { id: 'all', name: 'All Treatments' },
    { id: 'laser-hair-removal', name: 'Laser Hair Removal' },
    { id: 'folliculitis', name: 'Folliculitis' },
    { id: 'stretch-marks', name: 'Stretch Marks' },
  ];

  // Raw Case Studies Datastore
  comparisons = [
    {
      beforeImage: '/images/before-after/laser-hair-removal-before.png',
      afterImage: '/images/before-after/laser-hair-removal-after.png',
      treatmentName: 'Laser Hair Removal',
      duration: '8 Sessions • 10 Months',
      description:
        'Reduced coarse facial hair and ingrown bumps along the chin and neck, leaving skin smoother and clearer.',
      category: 'laser-hair-removal',
      rating: 5,
      testimonial: {
        quote:
          'No more ingrown hairs. My chin and neck feel so much smoother after laser.',
        author: 'Client Result',
      },
    },
    {
      beforeImage: '/images/before-after/folliculitis-before.png',
      afterImage: '/images/before-after/folliculitis-after.png',
      treatmentName: 'Folliculitis',
      duration: 'Multiple Sessions • Ongoing Care',
      description:
        'Treated inflamed hair follicles and dark spots for clearer, smoother skin with reduced bumps and irritation.',
      category: 'folliculitis',
      rating: 5,
      testimonial: {
        quote:
          'The bumps and dark spots improved so much. I finally feel comfortable again.',
        author: 'Client Result',
      },
    },
    {
      beforeImage: '/images/before-after/stretch-marks-before.png',
      afterImage: '/images/before-after/stretch-marks-after.png',
      treatmentName: 'Stretch Mark Treatment',
      duration: '6 Sessions • 8 Months',
      description:
        'Softened and lightened prominent stretch marks, reducing deep reddish-purple striae to thinner, less visible marks with smoother skin texture.',
      category: 'stretch-marks',
      rating: 5,
      testimonial: {
        quote:
          'The stretch marks faded so much. My skin looks smoother and more even.',
        author: 'Client Result',
      },
    },
  ];

  // Reactively Filtered Comparisons
  filteredComparisons = computed(() => {
    const active = this.activeCategory();
    if (active === 'all') return this.comparisons;
    return this.comparisons.filter((item) => item.category === active);
  });
}
