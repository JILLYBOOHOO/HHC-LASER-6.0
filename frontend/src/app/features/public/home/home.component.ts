import { Component, OnInit, signal, inject, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ApiService } from '../../../core/services/api.service';
import { Service } from '../../../core/models/models';
import { BeforeAfterSliderComponent } from '../../../shared/components/before-after-slider/before-after-slider.component';
import { SeoService } from '../../../core/services/seo.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgClass, RouterModule, MatButtonModule, MatIconModule, BeforeAfterSliderComponent],
  styles: [`
    :host {
      display: block;
      background-color: #FFFFFF;
      --background: #FFFFFF;
      --surface: #F8F9FA;
      --surface-light: #F1F3F5;
      --border: rgba(0, 0, 0, 0.08);
      --text: #1a1a1a;
      --text-muted: #6B7280;
      --gold: #B8924F;
      --gold-light: #D6B36A;
      --gold-dark: #8A6D3B;
      --shadow-dark: 0 8px 40px rgba(0, 0, 0, 0.08);
      --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.06);
      --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }
    .bg-background {
      background-color: var(--background) !important;
    }
  `],
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('1000ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerList', [
      transition(':enter', [
        query('.stagger-item', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(150, [
            animate('800ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <!-- Hero Section -->
    <section class="relative h-screen min-h-[700px] flex items-center overflow-hidden bg-background">
      <!-- Dark Cinematic Background Video -->
      <div class="absolute inset-0 z-0">
        <!-- Overlay Gradients -->
        <div class="absolute inset-0 bg-gradient-to-r from-black/40 to-black/10 z-10"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(214,179,106,0.08),transparent_45%)] z-10"></div>
        <video
          #heroVideo
          autoplay
          [muted]="true"
          loop
          playsinline
          preload="auto"
          class="absolute inset-0 w-full h-full object-cover">
          <source src="/HCCVID.mp4" type="video/mp4" />
        </video>
      </div>

      <!-- Hero Content -->
      <div class="container-luxury relative z-10 px-6 w-full mt-24 pb-24 md:pb-0" @fadeUp>
        <div class="max-w-3xl">

          <!-- Brand name tag -->
          <!-- Main Headline -->
          <h1 class="text-white font-heading leading-[1.05] tracking-tight mb-8 drop-shadow-lg">
            HHC LASER .co
          </h1>

          <!-- Tagline -->
          <p class="text-white text-base md:text-lg font-medium leading-relaxed max-w-xl mb-10 drop-shadow-lg">
            Premium medical spa — laser hair removal, Botox, fillers, IV therapy, weight loss, body contouring and advanced skincare at Jamaica's premier wellness destination.
          </p>

          <!-- CTA -->
          <div class="flex flex-col sm:flex-row gap-4 mb-8 drop-shadow-lg">
            <a routerLink="/customer/book" class="btn-primary text-center hover:!text-white" style="font-family: 'Merriweather', serif;">Book Your Treatment</a>
            <a routerLink="/services" class="btn-secondary text-center !text-white" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);">View All Services</a>
          </div>

          <!-- Trust Badges -->
          <div class="flex flex-wrap items-center gap-3 pt-2">
            <div class="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <mat-icon class="text-gold !text-base !w-4 !h-4 flex items-center justify-center">verified</mat-icon>
              <span class="text-white text-[11px] font-medium tracking-wide">Licensed Professionals</span>
            </div>
            <div class="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <mat-icon class="text-gold !text-base !w-4 !h-4 flex items-center justify-center">science</mat-icon>
              <span class="text-white text-[11px] font-medium tracking-wide">FDA Approved Equipment</span>
            </div>
            <div class="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <mat-icon class="text-gold !text-base !w-4 !h-4 flex items-center justify-center">favorite</mat-icon>
              <span class="text-white text-[11px] font-medium tracking-wide">1,000+ Happy Clients</span>
            </div>
          </div>

        </div>
      </div>
      
      <!-- Subtle bottom scroll indicator -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2">
        <span class="text-[9px] tracking-[0.25em] font-semibold text-text-muted/50 uppercase">DISCOVER</span>
        <div class="w-[1px] h-10 bg-gradient-to-b from-gold to-transparent"></div>
      </div>
    </section>

    <!-- Editorial Philosophy Section (Aman-inspired Magazine Layout) -->
    <section class="section bg-white">
      <div class="container-luxury px-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <!-- Text Content -->
          <div class="lg:col-span-5 space-y-6 @fadeUp">
            <span class="section-label">Our Philosophy</span>
            <h2 class="font-heading text-neutral-900 leading-tight">The Science of Subtle Transformation.</h2>
            <div class="divider-gold-left"></div>
            <p class="text-neutral-600 text-base font-light leading-relaxed">
              At HHC Laser, we believe that true beauty lies in the preservation of authenticity. Our bespoke treatments use industry-leading laser technology and medical-grade injectables to enhance your natural architecture.
            </p>
            <div class="space-y-4 pt-4">
              <div class="flex items-start gap-4">
                <mat-icon class="text-gold !text-lg !w-5 !h-5 mt-1">flare</mat-icon>
                <div>
                  <h6 class="text-neutral-900 font-medium text-sm">Advanced Laser Resurfacing</h6>
                  <p class="text-neutral-500 text-xs font-light">Targeted precision for flawless, luminous skin.</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <mat-icon class="text-gold !text-lg !w-5 !h-5 mt-1">blur_on</mat-icon>
                <div>
                  <h6 class="text-neutral-900 font-medium text-sm">Precision Facial Contouring</h6>
                  <p class="text-neutral-500 text-xs font-light">Bespoke injectables that respect your structure.</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <mat-icon class="text-gold !text-lg !w-5 !h-5 mt-1">waves</mat-icon>
                <div>
                  <h6 class="text-neutral-900 font-medium text-sm">Skin Vitality Optimization</h6>
                  <p class="text-neutral-500 text-xs font-light">Cellular level nourishment for lasting wellness.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Overlapping Images Grid -->
          <div class="lg:col-span-7 relative flex items-center justify-center">
            <!-- Background luxury ambient light glow -->
            <div class="absolute w-72 h-72 bg-gold/5 rounded-full filter blur-[100px] z-0"></div>
            
            <div class="relative w-full max-w-lg aspect-[4/5] rounded-3xl overflow-hidden border border-black/10 shadow-2xl z-10">
              <div class="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent z-10"></div>
              <img loading="lazy" src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80" 
                   alt="Modern Aesthetic Equipment" 
                   class="w-full h-full object-cover" />
            </div>
            
            <!-- Frosted Glass Overlapping Panel -->
            <div class="absolute bottom-[-30px] left-[-30px] hidden md:block p-6 rounded-2xl max-w-xs z-20 bg-white shadow-xl border border-black/5">
              <p class="text-neutral-700 text-sm italic font-light leading-relaxed">
                "We reject the mass-market approach to beauty. Each client journey begins with a private residency — a comprehensive analysis that considers cellular health, lifestyle architecture, and long-term vitality."
              </p>
              <div class="text-[9px] tracking-widest font-semibold text-gold uppercase mt-4">— Clinical Board</div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Before & After Comparison Slider Section -->
    <section class="section bg-neutral-50 border-y border-black/5">
      <div class="container-luxury px-6">
        <div class="text-center max-w-2xl mx-auto mb-16" @fadeUp>
          <span class="section-label">Clinical Outcomes</span>
          <h2 class="mt-4 font-heading text-neutral-900">Proven Transformation</h2>
          <div class="divider-gold"></div>
          <p class="text-neutral-600 text-base font-light">
            Explore actual treatment results. Select a category below and drag the handle to compare outcomes.
          </p>
        </div>

        <!-- Luxury Category Filter Bar -->
        <div class="flex flex-wrap justify-center items-center gap-3 mb-16 max-w-3xl mx-auto" @fadeUp>
          @for (cat of filterCategories; track cat.id) {
            <button (click)="activeCategory.set(cat.id)"
                    [ngClass]="activeCategory() === cat.id
                      ? 'bg-gold text-white border-gold'
                      : 'bg-transparent text-neutral-600 border-black/10 hover:border-gold hover:text-neutral-900'"
                    class="px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border cursor-pointer">
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
                [testimonial]="item.testimonial">
              </app-before-after-slider>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Popular Treatments Section (Frosted Glass Card Showcase) -->
    <section class="section bg-white">
      <div class="container-luxury px-6">
        <div class="text-center max-w-2xl mx-auto mb-20" @fadeUp>
          <span class="section-label">Signature Offerings</span>
          <h2 class="mt-4 font-heading text-neutral-900">The Collection</h2>
          <div class="divider-gold"></div>
          <p class="text-neutral-600 text-base font-light">
            A curated selection of our most sought-after medical aesthetic procedures.
          </p>
        </div>

        @if (loading()) {
          <div class="flex justify-center py-20">
            <div class="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" @staggerList>
            @for (service of featuredServices(); track service.id) {
              <div class="stagger-item card group flex flex-col h-full">
                <!-- Image Wrapper with Desktop Zoom Effect -->
                <div class="aspect-[4/3] w-full overflow-hidden relative bg-neutral-100">
                  <img loading="lazy" [src]="service.thumbnail_url || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80'" 
                       [alt]="service.name"
                       class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10000ms]"
                       (error)="handleImageError($event)">
                  <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gold text-[10px] tracking-widest font-semibold px-3 py-1.5 rounded-full uppercase shadow-sm">
                    Featured
                  </div>
                </div>
                
                <div class="p-6 flex flex-col flex-1 space-y-4">
                  <div>
                    <span class="text-[10px] text-gold font-semibold uppercase tracking-widest">{{ service.category_name }}</span>
                    <h3 class="font-heading text-2xl text-neutral-900 mt-1 group-hover:text-gold transition-colors duration-300">{{ service.name }}</h3>
                  </div>
                  
                  <div class="flex items-center justify-between mt-auto pt-6 border-t border-black/10">
                    <span class="text-neutral-900 font-medium text-sm font-body">J$ {{ service.price_jmd | number:'1.2-2' }}</span>
                    <a [routerLink]="['/customer/book']" [queryParams]="{service: service.id}" 
                       class="text-xs font-semibold text-gold hover:text-gold-light uppercase tracking-widest flex items-center gap-1.5 group/btn">
                      Book Now 
                      <mat-icon class="!text-sm !w-4 !h-4 flex items-center justify-center transition-transform duration-300 group-hover/btn:translate-x-1">arrow_forward</mat-icon>
                    </a>
                  </div>
                </div>
              </div>
            }
          </div>
          
          <div class="mt-20 text-center">
            <a routerLink="/services" class="btn-outline">View All 59 Treatments</a>
          </div>
        }
      </div>
    </section>

    <!-- Call to Action Section (Cinematic Banner) -->
    <section class="section relative overflow-hidden bg-neutral-50 border-t border-black/5">
      <!-- Light gold ambient glow background -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full filter blur-[150px]"></div>
      
      <div class="relative z-10 text-center px-6 max-w-3xl mx-auto space-y-8" @fadeUp>
        <span class="section-label">Begin Your Transformation</span>
        <h2 class="font-heading text-neutral-900 leading-tight">Ready for your transformation?</h2>
        <p class="text-neutral-600 text-base font-light leading-relaxed">
          Book your complimentary private consultation today and let our certified clinical specialists design a personalized treatment plan for your unique goals.
        </p>
        <div class="pt-4">
          <a routerLink="/customer/book" class="btn-primary">Book Consultation</a>
        </div>
      </div>
    </section>

    <!-- Instagram Section -->
    <section class="bg-white py-24 border-t border-black/5">
      <div class="container-luxury px-6 max-w-7xl mx-auto" @fadeUp>
        
        <div class="text-center max-w-3xl mx-auto mb-16">
          <span class="text-xs font-semibold tracking-[0.2em] uppercase text-gold">Follow Our Journey</span>
          <h2 class="mt-4 font-heading text-4xl text-neutral-900 mb-6">Stay connected with HHC Laser</h2>
          <div class="h-px w-16 bg-gold mx-auto mb-6"></div>
          <p class="text-neutral-600 font-light leading-relaxed">
            Stay connected with HHC Laser & Co and explore our latest treatments, client transformations, wellness tips, skincare education, and behind-the-scenes moments from our clinic in Kingston, Jamaica.
          </p>
        </div>

        <!-- Instagram Gallery Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-16">
          @for (post of instagramPosts; track post.url; let i = $index) {
            <a [href]="post.link" target="_blank" rel="noopener noreferrer" 
               class="group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-neutral-200"
               [ngClass]="{'hidden md:block': i === 2 || i === 3, 'hidden lg:block': i === 4 || i === 5, 'block': i === 0 || i === 1}">
              <img [src]="post.url" alt="Instagram Post from HHC Laser" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <!-- Fallback icon since instagram icon might not be in material icons, using photo_camera -->
                <mat-icon class="text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 !text-4xl !w-10 !h-10">photo_camera</mat-icon>
              </div>
            </a>
          }
        </div>

        <!-- Call-to-Action -->
        <div class="text-center mt-12">
          <a href="https://www.instagram.com/havendale_healthcare" target="_blank" rel="noopener noreferrer" class="btn-primary hover:!text-white inline-flex items-center gap-2">
            Follow &#64;havendale_healthcare
            <mat-icon class="!w-4 !h-4 !text-sm flex items-center justify-center">open_in_new</mat-icon>
          </a>
        </div>

      </div>
    </section>
  `
})
export class HomeComponent implements OnInit, AfterViewInit {
  private api = inject(ApiService);
  private seo = inject(SeoService);

  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;

  featuredServices = signal<Service[]>([]);
  loading = signal<boolean>(true);

  instagramPosts = [
    { url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80', link: 'https://www.instagram.com/havendale_healthcare' },
    { url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80', link: 'https://www.instagram.com/havendale_healthcare' },
    { url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80', link: 'https://www.instagram.com/havendale_healthcare' },
    { url: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=600&q=80', link: 'https://www.instagram.com/havendale_healthcare' },
    { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80', link: 'https://www.instagram.com/havendale_healthcare' },
    { url: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=600&q=80', link: 'https://www.instagram.com/havendale_healthcare' }
  ];

  ngAfterViewInit() {
    if (this.heroVideo && this.heroVideo.nativeElement) {
      this.heroVideo.nativeElement.muted = true;
      this.heroVideo.nativeElement.play().catch(e => console.warn('Video autoplay blocked:', e));
    }
  }



  // Active Category Filter Signal
  activeCategory = signal<string>('all');

  filterCategories = [
    { id: 'all', name: 'All Treatments' },
    { id: 'laser-hair-removal', name: 'Laser Hair Removal' },
    { id: 'skin-rejuvenation', name: 'Skin Rejuvenation' },
    { id: 'body-contouring', name: 'Body Contouring' }
  ];

  // Raw Case Studies Datastore (Accurate Before & After Treatment Images)
  comparisons = [
    {
      beforeImage: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80',
      afterImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
      treatmentName: 'Laser Hair Removal',
      duration: '8 Sessions • 10 Months',
      description: 'Achieved permanent reduction of unwanted hair, leaving the skin texture dramatically smooth and even.',
      category: 'laser-hair-removal',
      rating: 5,
      testimonial: { quote: 'Absolutely life-changing. Smooth skin and no more shaving irritation.', author: 'Sarah M.' }
    },
    {
      beforeImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
      afterImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
      treatmentName: 'Skin Rejuvenation',
      duration: '4 Sessions • 4 Months',
      description: 'Reversed hyperpigmentation, reduced appearance of sun spots, and minimized fine lines on face.',
      category: 'skin-rejuvenation',
      rating: 5,
      testimonial: { quote: 'My skin tone is so even now, and the fine lines around my eyes are gone.', author: 'Jessica R.' }
    },
    {
      beforeImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
      afterImage: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&q=80',
      treatmentName: 'Acne Scar Treatment',
      duration: '6 Sessions • 8 Months',
      description: 'Smoothed deep pitted scars using fractional micro-needling RF laser therapy to stimulate collagen rebuild.',
      category: 'skin-rejuvenation',
      rating: 5,
      testimonial: { quote: 'Finally feel confident without makeup. The deep scars have faded.', author: 'Daniel K.' }
    },
    {
      beforeImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      afterImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
      treatmentName: 'Abdomen Sculpting',
      duration: '4 Sessions • 2 Months',
      description: 'High-intensity electromagnetic sculpting to burn fat deposits and build abdominal muscle definition.',
      category: 'body-contouring',
      rating: 5,
      testimonial: { quote: 'Highly recommend. Gained noticeable core definition and strength without any downtime.', author: 'Michael T.' }
    }
  ];

  // Reactively Filtered Comparisons
  filteredComparisons = computed(() => {
    const active = this.activeCategory();
    if (active === 'all') return this.comparisons;
    return this.comparisons.filter(item => item.category === active);
  });

  ngOnInit() {
    this.seo.updatePage({
      title: 'HHC Laser & Co. | Premier Medical Spa Kingston Jamaica | Laser Hair Removal, Botox, Fillers',
      description: 'HHC Laser & Co. is Kingston Jamaica\'s premier medical spa. Expert laser hair removal, Botox, dermal fillers, IV therapy, chemical peels, body contouring & skin rejuvenation at our Mannings Hill and Constant Spring Road clinics.',
      canonicalPath: '/',
      keywords: 'Medical Spa Jamaica, Med Spa Kingston Jamaica, Laser Hair Removal Jamaica, Botox Jamaica, Dermal Fillers Jamaica, IV Therapy Jamaica, Body Contouring Jamaica, Skin Rejuvenation Jamaica, HHC Laser Jamaica, HHC Laser & Co Kingston, Aesthetic Clinic Kingston Jamaica',
    });
    this.seo.injectSchema('home-faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        { '@type': 'Question', 'name': 'What services do you offer?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Laser hair removal, Botox, dermal fillers, and body contouring.' } }
      ]
    });
    this.api.getServices(undefined, true).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.featuredServices.set(res.data.slice(0, 6)); // Curated limit to 6 premium services
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  handleImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
  }
}
