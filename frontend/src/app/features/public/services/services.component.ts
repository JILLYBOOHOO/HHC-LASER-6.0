import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Service, ServiceCategory } from '../../../core/models/models';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="bg-charcoal-900 min-h-screen pt-24 pb-20">
      <div class="container-luxury px-4">
        
        <!-- Header -->
        <div class="text-center mb-16">
          <span class="text-gold-500 tracking-[0.2em] text-sm uppercase mb-4 block">Our Treatments</span>
          <h1 class="text-white font-heading text-4xl md:text-5xl lg:text-6xl mb-6">
            Luxury Medical Aesthetics
          </h1>
          <p class="text-cream-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Discover our comprehensive range of premium treatments tailored to enhance your natural beauty and well-being.
          </p>
        </div>

        <!-- Filter Categories -->
        <div class="flex flex-wrap justify-center gap-3 mb-12">
          <button (click)="selectCategory(null)"
                  class="px-6 py-2.5 rounded-full text-sm transition-all duration-300"
                  [ngClass]="!selectedCategoryId() ? 'bg-gold-500 text-white' : 'bg-white/5 text-cream-300 hover:bg-white/10'">
            All Treatments
          </button>
          
          @for (cat of categories(); track cat.id) {
            <button (click)="selectCategory(cat.id)"
                    class="px-6 py-2.5 rounded-full text-sm transition-all duration-300"
                    [ngClass]="selectedCategoryId() === cat.id ? 'bg-gold-500 text-white' : 'bg-white/5 text-cream-300 hover:bg-white/10'">
              {{ cat.name }}
            </button>
          }
        </div>

        <!-- Counter -->
        <div class="text-center text-cream-500 text-sm mb-12">
          Showing {{ filteredServices().length }} of {{ services().length }} Treatments
        </div>

        <!-- Services Grid -->
        @if (loading()) {
          <div class="flex justify-center py-20">
            <div class="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (service of filteredServices(); track service.id) {
              
              <!-- Glassmorphism Card -->
              <div class="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-gold-500/50 transition-all duration-500 flex flex-col h-full">
                
                <!-- Image -->
                <div class="aspect-[4/3] w-full overflow-hidden relative bg-charcoal-800">
                  <img [src]="service.thumbnail_url" 
                       [alt]="service.name"
                       class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                       (error)="handleImageError($event)">
                  <div class="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 to-transparent"></div>
                  
                  <!-- Badges -->
                  <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <span class="bg-charcoal-900/80 backdrop-blur text-gold-400 text-xs px-3 py-1.5 rounded-full border border-white/10">
                      {{ service.category_name }}
                    </span>
                  </div>
                </div>

                <!-- Content -->
                <div class="p-6 flex flex-col flex-1">
                  <h3 class="text-white font-heading text-xl mb-3 group-hover:text-gold-400 transition-colors">
                    {{ service.name }}
                  </h3>
                  
                  <p class="text-cream-400 text-sm leading-relaxed mb-6 flex-1">
                    {{ service.short_description || service.description }}
                  </p>
                  
                  <!-- Footer Details -->
                  <div class="flex items-center justify-between pt-4 border-t border-white/10 mb-6">
                    <div class="flex flex-col">
                      <span class="text-xs text-cream-500 mb-1">Price</span>
                      <span class="text-white font-medium">J$ {{ service.price_jmd | number:'1.2-2' }}</span>
                    </div>
                    <div class="flex flex-col text-right">
                      <span class="text-xs text-cream-500 mb-1">Duration</span>
                      <span class="text-white font-medium flex items-center justify-end gap-1">
                        <mat-icon class="!text-sm !w-3.5 !h-3.5 text-gold-500">schedule</mat-icon>
                        {{ service.duration_minutes }} mins
                      </span>
                    </div>
                  </div>

                  <!-- Book Button -->
                  <button (click)="bookNow(service)" 
                          class="w-full py-3.5 rounded-xl bg-gold-500 text-white font-medium hover:bg-gold-400 transition-colors flex items-center justify-center gap-2">
                    Book Now <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">arrow_forward</mat-icon>
                  </button>
                </div>
              </div>
              
            }
          </div>
          
          @if (filteredServices().length === 0) {
            <div class="text-center py-20 text-cream-500">
              <mat-icon class="!text-5xl mb-4 text-white/20">search_off</mat-icon>
              <p>No treatments found in this category.</p>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class ServicesComponent implements OnInit {
  private router = inject(Router);

  services = signal<Service[]>([]);
  categories = signal<ServiceCategory[]>([
    { id: 1, name: 'Body & Wellness', description: '' } as ServiceCategory,
    { id: 2, name: 'Injectables & Aesthetics', description: '' } as ServiceCategory,
    { id: 3, name: 'Facial & Skin Treatments', description: '' } as ServiceCategory,
    { id: 4, name: 'Laser Hair Removal', description: '' } as ServiceCategory
  ]);
  selectedCategoryId = signal<number | null>(null);
  loading = signal<boolean>(true);

  filteredServices = computed(() => {
    const catId = this.selectedCategoryId();
    if (!catId) return this.services();
    return this.services().filter(s => s.category_id === catId);
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const treatments: Partial<Service>[] = [
  { id: 55, category_id: 1, category_name: 'Body & Wellness', name: 'WOOD THERAPY', price_jmd: 0, duration_minutes: 45, short_description: 'Improves Blood Circulation, Reduces Cellulites and Fat Deposits While Promoting Lymphatic Drainage to Flush Toxins.', thumbnail_url: '/hhclaser_img/hhclaser_images/WOOD THERAPY - 1.jpg' },
  { id: 41, category_id: 2, category_name: 'Injectables & Aesthetics', name: 'BOTOX Consultation', price_jmd: 0, duration_minutes: 20, short_description: 'Aid in SMOOTHING FACIAL WRINKLES, EXCESS SWEATING, CHRONIC MIGRAINES.  CONSULTATION IS NECESSARY TO DETERMINE TREATMENT NEEDED.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_8.webp' },
  { id: 42, category_id: 2, category_name: 'Injectables & Aesthetics', name: 'DERMAL FILLERS (Consultation)', price_jmd: 0, duration_minutes: 20, short_description: 'Filler add VOLUME and Plump Skin Face &amp; Body. CONSULTATION IS NECESSARY TO DETERMINE TREATMENT NEEDED.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_9.webp' },
  { id: 67, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'DARK CIRCLES', price_jmd: 0, duration_minutes: 15, short_description: 'A Consultation is Necessary to Determine Treatment Needed.', thumbnail_url: '/hhclaser_img/hhclaser_images/DARK CIRCLES - 1.webp' },
  { id: 58, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'SKIN RESURFACING', price_jmd: 0, duration_minutes: 25, short_description: 'CONSULTATION NECESSARY ( Fee is put towards treatment)  Advanced laser treatments for skin Resurfacing and Rejuvenation. Reduce HYPERPIGMENTATION, SPOTS, PORES, SCARS, WRINKLES  &amp; FINE LINES. A...', thumbnail_url: '/hhclaser_img/hhclaser_images/SKIN RESURFACING - 1.jpg' },
  { id: 68, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'HEAT SHOCK- BODY/ SKIN DETOX', price_jmd: 0, duration_minutes: 25, short_description: 'Balance Metabolism, Reset, Aids Weightloss, and Skin Treatments', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_47.webp' },
  { id: 35, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'ACNE / DARK SPOTS', price_jmd: 0, duration_minutes: 25, short_description: 'Inflammation cause by Hormonal, Blackheads, Whiteheads, Pustules, Milia. Skin Resurfacing is also added', thumbnail_url: '/hhclaser_img/hhclaser_images/ACNE  DARK SPOTS - 1.jpg' },
  { id: 63, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'CHEMICAL PEEL', price_jmd: 0, duration_minutes: 50, short_description: 'Reduces Fine Lines and Wrinkles, Fades Dark Spots and Acne Scars,Treats ACNE and controls Oil, and Improves Overall Skin Texture and Radiance.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_11.webp' },
  { id: 61, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'ENLARGED PORES', price_jmd: 0, duration_minutes: 30, short_description: 'TREATMENT REGENERATE  CELLS, EXOSOME : Visibly Shrink and Heal Skin Texture Appears Smooth and Soft to Touch.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_12.webp' },
  { id: 62, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'MICRODERMABRASION', price_jmd: 0, duration_minutes: 30, short_description: 'Reduces The Appearance of Fine Lines, Removes Dead Skin, While Unclogging PORES, Leavin a Smoother Skin, a Brighter Complexion and A More Even Skin Tone.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_13.webp' },
  { id: 54, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'PHOTOREJUVENATION', price_jmd: 0, duration_minutes: 25, short_description: 'Restores PEPTIDES and ENZYMES, Glow Forever When You Remove Dead Skin, Black Heads and White Heads.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_14.webp' },
  { id: 40, category_id: 1, category_name: 'Body & Wellness', name: 'FAT REDUCTION', price_jmd: 0, duration_minutes: 45, short_description: 'FAT Reduction Treatment. Mini-Non-invasive. CONSULTATION AND TREATMENT PERFORMED SAME DAY.', thumbnail_url: '/hhclaser_img/hhclaser_images/Body contouring laser treatment.jpg' },
  { id: 46, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'FUNGUS', price_jmd: 0, duration_minutes: 10, short_description: 'MEDICAL TREATMENT for Skin, Toes, Head, Nails. A CONSULTATION is Necessary to Determine Treatment Needed.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_20.webp' },
  { id: 38, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'HAIR RESTORATION', price_jmd: 0, duration_minutes: 45, short_description: 'Treats Alopecia, Hair Thinning and Bald Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_17.webp' },
  { id: 43, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'IV THERAPY', price_jmd: 0, duration_minutes: 20, short_description: 'VITAMIN B, Vitamin C, NAD &amp; GLUTHATHIONE. Power Shot Cocktails. CONSULTATION AND TREATMENT PERFORMED SAME DAY.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_18.webp' },
  { id: 44, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'VITAL SHOTS', price_jmd: 0, duration_minutes: 15, short_description: 'VITAMIN B, Vitamin C, MAGNESIUM, NAD, Power Shot Cocktails. CONSULTATION AND TREATMENT PERFORMED SAME DAY.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_19.webp' },
  { id: 45, category_id: 2, category_name: 'Injectables & Aesthetics', name: 'KELOID (Consultation)', price_jmd: 0, duration_minutes: 15, short_description: 'Reduction of Scar and Raised Areas on the Skin. CONSULTATION IS NECESSARY TO DETERMINE TREATMENT NEEDED.  Consultation &amp; Treatment Can be Performed Same Day. This a Consultation for Treatment Plan', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_10.webp' },
  { id: 19, category_id: 4, category_name: 'Laser Hair Removal', name: 'Abdomen', price_jmd: 0, duration_minutes: 10, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/LASER HAIR REMOVAL.jpg' },
  { id: 16, category_id: 4, category_name: 'Laser Hair Removal', name: 'Aerola', price_jmd: 0, duration_minutes: 10, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_24.webp' },
  { id: 15, category_id: 4, category_name: 'Laser Hair Removal', name: 'Armpits', price_jmd: 0, duration_minutes: 10, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_25.webp' },
  { id: 25, category_id: 4, category_name: 'Laser Hair Removal', name: 'Arms and Shoulders', price_jmd: 0, duration_minutes: 25, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_26.webp' },
  { id: 11, category_id: 4, category_name: 'Laser Hair Removal', name: 'Bikini Line', price_jmd: 0, duration_minutes: 10, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Bikini Line.jpg' },
  { id: 13, category_id: 4, category_name: 'Laser Hair Removal', name: 'Brazilian Only', price_jmd: 0, duration_minutes: 10, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_27.webp' },
  { id: 8, category_id: 4, category_name: 'Laser Hair Removal', name: 'Chin Only', price_jmd: 0, duration_minutes: 10, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_28.webp' },
  { id: 9, category_id: 4, category_name: 'Laser Hair Removal', name: 'Chin and Neck', price_jmd: 0, duration_minutes: 10, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_29.webp' },
  { id: 50, category_id: 4, category_name: 'Laser Hair Removal', name: 'FOLLICULITIS', price_jmd: 0, duration_minutes: 10, short_description: 'A Consultation Is Necessary to Determine Treatment Needed. This Treatment Consist of a Combination of Treatment which Depends on Condition.', thumbnail_url: '/hhclaser_img/hhclaser_images/FOLLICULITIS - 1.jpg' },
  { id: 33, category_id: 4, category_name: 'Laser Hair Removal', name: 'Fingers and Toes', price_jmd: 0, duration_minutes: 10, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_30.webp' },
  { id: 20, category_id: 4, category_name: 'Laser Hair Removal', name: 'Full Abdomen', price_jmd: 0, duration_minutes: 15, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/LASER HAIR REMOVAL.jpg' },
  { id: 21, category_id: 4, category_name: 'Laser Hair Removal', name: 'Full Abdomen and Chest', price_jmd: 0, duration_minutes: 25, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/LASER HAIR REMOVAL.jpg' },
  { id: 24, category_id: 4, category_name: 'Laser Hair Removal', name: 'Full Back', price_jmd: 0, duration_minutes: 35, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_33.webp' },
  { id: 32, category_id: 4, category_name: 'Laser Hair Removal', name: 'Full Bottom', price_jmd: 0, duration_minutes: 10, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps - Dark Spots - Folliculitis', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_34.webp' },
  { id: 18, category_id: 4, category_name: 'Laser Hair Removal', name: 'Full Chest', price_jmd: 0, duration_minutes: 15, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_35.webp' },
  { id: 26, category_id: 4, category_name: 'Laser Hair Removal', name: 'Full Legs', price_jmd: 0, duration_minutes: 55, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Full Legs.jpg' },
  { id: 12, category_id: 4, category_name: 'Laser Hair Removal', name: 'Full Pubic + Armpits', price_jmd: 0, duration_minutes: 10, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_25.webp' },
  { id: 28, category_id: 4, category_name: 'Laser Hair Removal', name: 'Full Thighs', price_jmd: 0, duration_minutes: 25, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_37.webp' },
  { id: 34, category_id: 4, category_name: 'Laser Hair Removal', name: 'Full chest', price_jmd: 0, duration_minutes: 15, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_35.webp' },
  { id: 29, category_id: 4, category_name: 'Laser Hair Removal', name: 'Inner Thigh', price_jmd: 0, duration_minutes: 10, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_38.webp' },
  { id: 10, category_id: 4, category_name: 'Laser Hair Removal', name: 'Jawline and Neck', price_jmd: 0, duration_minutes: 10, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_39.webp' },
  { id: 23, category_id: 4, category_name: 'Laser Hair Removal', name: 'Lower Back', price_jmd: 0, duration_minutes: 15, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_40.webp' },
  { id: 27, category_id: 4, category_name: 'Laser Hair Removal', name: 'Lower Legs', price_jmd: 0, duration_minutes: 25, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_41.webp' },
  { id: 17, category_id: 4, category_name: 'Laser Hair Removal', name: 'Mid-Chest', price_jmd: 0, duration_minutes: 10, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_42.webp' },
  { id: 30, category_id: 4, category_name: 'Laser Hair Removal', name: 'Posterior Thighs', price_jmd: 0, duration_minutes: 15, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_43.webp' },
  { id: 31, category_id: 4, category_name: 'Laser Hair Removal', name: 'Posterior Thighs and Bottom', price_jmd: 0, duration_minutes: 25, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_43.webp' },
  { id: 14, category_id: 4, category_name: 'Laser Hair Removal', name: 'Pubic, Armpit and Brazilian (Special)', price_jmd: 0, duration_minutes: 10, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_45.webp' },
  { id: 22, category_id: 4, category_name: 'Laser Hair Removal', name: 'Upper Back', price_jmd: 0, duration_minutes: 15, short_description: 'Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_46.webp' },
  { id: 59, category_id: 1, category_name: 'Body & Wellness', name: 'HEAD & BODY MASSAGE / HEAD SPA', price_jmd: 0, duration_minutes: 45, short_description: 'RELAXATION Head Spa Paired with Body Massage.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_1.webp' },
  { id: 57, category_id: 1, category_name: 'Body & Wellness', name: 'LYMPATHIC DRAINAGE', price_jmd: 0, duration_minutes: 55, short_description: 'Help Relieve Swelling (Lymphedema) Caused by Blockages or Medical Condition. This also Helps to Drain Fluid after Cosmetic surgery. Reduces Swelling, Brushing, and Discomfort.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_2.webp' },
  { id: 49, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'MICRONEEDLING PRP', price_jmd: 0, duration_minutes: 40, short_description: 'Treats Sun Damages and Hyperpigmentation, Improves Skin Tone and Skin Texture, Restores Collagen and Elastin Production.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_16.webp' },
  { id: 48, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'PRF PLASMA TREATMENT', price_jmd: 0, duration_minutes: 40, short_description: 'PRF Enhances Skin Rejuvenation, Gets Rid of Fine Lines, ACNE Scars,  Enlarged PORES.  Skin becomes Smoother, Firmer and More Radiant.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_15.webp' },
  { id: 39, category_id: 2, category_name: 'Injectables & Aesthetics', name: 'NON-SURGICAL BBL', price_jmd: 0, duration_minutes: 15, short_description: 'Adds Volume to Areas Necessary Ex: Hips and Bottom. A Consultation is Necessary to Determine Treatment Needed. This a Consultation for Treatment Plan.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_3.webp' },
  { id: 53, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'PSEUDOFOLLICULITIS', price_jmd: 0, duration_minutes: 15, short_description: 'Inflamation Mainly affecting head and other areas.', thumbnail_url: '/hhclaser_img/hhclaser_images/FOLLICULITIS - 1.jpg' },
  { id: 64, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'SCARS', price_jmd: 0, duration_minutes: 20, short_description: 'Reducing Appearance of scars cause by injury, insect bites, burn, surgery + more', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_21.webp' },
  { id: 56, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'CELLULITES', price_jmd: 0, duration_minutes: 10, short_description: 'can reduce the appearance of cellulite through a combination of exercise, diet and treatments.  A Consultation is Necessary to Determine Treatment Needed. This a Consultation  for Treatment Plan.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_4.webp' },
  { id: 37, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'SKIN TIGHTENING', price_jmd: 0, duration_minutes: 10, short_description: 'EFFECTIVELY Reduction of Sagging &amp; Dimpled Skin  MINIMAL/NON-INVASIVE TREATMENT. A Consultation is Necessary to Determine Treatment Needed. This a Consultation for Treatment Plan. Please See Be...', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_5.webp' },
  { id: 60, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'STRETCH MARKS', price_jmd: 0, duration_minutes: 45, short_description: 'Stimulating Collagen By Using LASER, RADIOFREQUENCY &amp; GROWTH FACTORS PROVEN to Aid  Blood Flow . STRIAE APPEARS Less Visible and Often Reversed in Appearance, While Healing Skin within 6weeks ....', thumbnail_url: '/hhclaser_img/hhclaser_images/STRETCH MARKS - 1.jpg' },
  { id: 52, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'SKIN TAG', price_jmd: 0, duration_minutes: 10, short_description: 'A Consultation is Necessary to Determine Treatment Needed.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_22.webp' },
  { id: 51, category_id: 3, category_name: 'Facial & Skin Treatments', name: 'TATTOO REMOVAL', price_jmd: 0, duration_minutes: 10, short_description: 'A Consultation is Necessary to Determine Treatment Needed.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_23.webp' },
  { id: 65, category_id: 1, category_name: 'Body & Wellness', name: 'SEMEGLUTHIDE', price_jmd: 0, duration_minutes: 15, short_description: 'Doctors Visit Consultation is Necessary. This is a Consultation for Treatment Plan', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_7.webp' },
  { id: 47, category_id: 1, category_name: 'Body & Wellness', name: 'WEIGHTLOSS (Consultation)', price_jmd: 0, duration_minutes: 10, short_description: 'During Consultation an Assessment is Performed in Order to Recommend Suitable Treatment.', thumbnail_url: '/hhclaser_img/hhclaser_images/Gallery image_6.webp' },
    ];

    this.services.set(treatments as Service[]);
    this.loading.set(false);
  }

  selectCategory(id: number | null) {
    this.selectedCategoryId.set(id);
  }

  handleImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }

  bookNow(service: Service) {
    this.router.navigate(['/customer/book'], { queryParams: { service: service.id } });
  }
}
