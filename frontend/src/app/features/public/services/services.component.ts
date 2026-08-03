import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Service, ServiceCategory } from '../../../core/models/models';
import { SeoService } from '../../../core/services/seo.service';
import { treatments } from '../../../core/data/services.data';


import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, FormsModule],
  template: `
    <div class="bg-white min-h-screen pt-[54px] pb-16">
      <div class="container-luxury px-4">
        
        <!-- Ultra-Compact Hero Header -->
        <div class="text-center pt-0">
          <span class="text-black tracking-[0.2em] text-base uppercase block font-bold">Our Treatments</span>
          <h1 class="text-black font-heading text-lg md:text-xl lg:text-2xl font-bold mt-0 mb-0">
            Luxury Medical Aesthetics
          </h1>
          <p class="text-black mx-auto text-xs md:text-sm leading-snug lg:whitespace-nowrap">
            Discover our comprehensive range of premium treatments tailored to enhance your natural beauty and well-being.
          </p>

          <!-- Search & Filter Controls -->
          <div class="max-w-md mx-auto flex flex-col gap-3 mb-6">
            <!-- Search Bar -->
            <div class="relative shadow-sm">
              <mat-icon class="absolute left-3.5 top-1/2 -translate-y-1/2 !text-neutral-400 !text-lg flex items-center">search</mat-icon>
              <input type="text"
                     placeholder="Search treatments (e.g. Laser, Botox)..."
                     [ngModel]="searchQuery()"
                     (ngModelChange)="searchQuery.set($event)"
                     class="w-full pl-10 pr-9 py-2.5 border border-black/20 rounded-xl bg-white text-sm text-black focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all" />
              @if (searchQuery()) {
                <button (click)="searchQuery.set('')" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black">
                  <mat-icon class="!text-base">close</mat-icon>
                </button>
              }
            </div>

            <!-- Filter Dropdown -->
            <div class="relative shadow-sm">
              <select 
                [ngModel]="selectedCategoryId() === null ? 'null' : selectedCategoryId()"
                (ngModelChange)="selectCategory($event === 'null' ? null : +$event)"
                class="w-full appearance-none pl-4 pr-10 py-2.5 border border-black/20 rounded-xl bg-white text-sm text-charcoal-900 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-medium cursor-pointer">
                <option value="null">All Treatments</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-charcoal-400">
                <mat-icon class="!text-[20px] !w-[20px] !h-[20px]">expand_more</mat-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- Counter (Minimal Spacing directly above treatment grid) -->
        <div class="text-center text-neutral-500 text-[11px] font-medium mb-3">
          Showing {{ filteredServices().length }} of {{ services().length }} Treatments
        </div>

        <!-- Services Grid (First 4 cards visible immediately above the fold) -->
        @if (loading()) {
          <div class="flex justify-center py-12">
            <div class="w-10 h-10 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
            @for (service of filteredServices(); track service.id) {
              
              <!-- Minimalist Luxury Card -->
              <div class="group relative bg-white border border-black/80 rounded-lg flex flex-col h-full hover:shadow-lg transition-all duration-300 overflow-hidden">
                
                <!-- Image -->
                <div class="aspect-[16/11] w-full overflow-hidden relative bg-gray-50">
                  <img loading="lazy" [src]="service.thumbnail_url" 
                       [alt]="service.name"
                       class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                       (error)="handleImageError($event, service)">
                </div>

                <!-- Content -->
                <div class="p-3 md:p-3.5 flex flex-col flex-1">
                  <!-- Title -->
                  <h3 class="text-black font-extrabold text-xs md:text-sm uppercase tracking-wide mb-1 line-clamp-1">
                    {{ service.name }}
                  </h3>
                  
                  <!-- Price -->
                  <div class="text-black font-extrabold text-sm md:text-base mb-1.5">
                    JMD $ {{ service.price_jmd | number:'1.0-0' }}
                  </div>

                  <!-- Description -->
                  <p class="text-neutral-600 text-[11px] font-normal leading-snug mb-2 flex-1 line-clamp-2">
                    {{ service.short_description || service.description }}
                  </p>
                  
                  <!-- Duration -->
                  <div class="text-[10px] text-neutral-500 flex items-center gap-1 mb-2.5">
                    <mat-icon class="!text-[13px] !w-[13px] !h-[13px] text-gold-500">schedule</mat-icon>
                    <span>{{ service.duration_minutes }} mins</span>
                  </div>

                  <!-- Book Button -->
                  <button (click)="bookNow(service)" 
                          class="w-full py-1.5 border border-black bg-white text-black font-bold text-xs hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-1.5 rounded-md">
                    <mat-icon class="!text-[14px] !w-[14px] !h-[14px]">calendar_today</mat-icon> Book Now
                  </button>
                </div>
              </div>
              
            }
          </div>
          
          @if (filteredServices().length === 0) {
            <div class="text-center py-12 text-neutral-500">
              <mat-icon class="!text-4xl mb-2 text-black/20">search_off</mat-icon>
              <p class="text-xs">No treatments found in this category.</p>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class ServicesComponent implements OnInit {
  private router = inject(Router);
  private seo = inject(SeoService);

  services = signal<Service[]>([]);
  categories = signal<ServiceCategory[]>([
    { id: 1, name: 'Body & Wellness', description: '' } as ServiceCategory,
    { id: 2, name: 'Injectables & Aesthetics', description: '' } as ServiceCategory,
    { id: 3, name: 'Facial & Skin Treatments', description: '' } as ServiceCategory,
    { id: 4, name: 'Laser Hair Removal', description: '' } as ServiceCategory
  ]);
  selectedCategoryId = signal<number | null>(null);
  searchQuery = signal<string>('');
  loading = signal<boolean>(true);

  filteredServices = computed(() => {
    const catId = this.selectedCategoryId();
    const query = this.searchQuery().toLowerCase().trim();

    return this.services().filter(s => {
      const matchesCat = !catId || s.category_id === catId;
      const matchesSearch = !query || 
        s.name.toLowerCase().includes(query) || 
        (s.short_description && s.short_description.toLowerCase().includes(query)) ||
        (s.description && s.description.toLowerCase().includes(query));
      return matchesCat && matchesSearch;
    });
  });

  ngOnInit() {
    this.seo.updatePage({
      title: 'Medical Spa Services Kingston Jamaica | Laser Hair Removal, Botox, IV Therapy | HHC Laser',
      description: 'Explore our full range of medical aesthetic services in Kingston, Jamaica: laser hair removal, Botox, dermal fillers, IV therapy, chemical peels, body contouring, acne treatment, hair restoration, skin resurfacing & more.',
      canonicalPath: '/services',
      keywords: 'Laser Hair Removal Jamaica, Botox Jamaica, Dermal Fillers Jamaica, Chemical Peel Jamaica, IV Therapy Jamaica, Body Contouring Jamaica, Acne Treatment Jamaica, Hair Restoration Jamaica, Skin Resurfacing Jamaica, Med Spa Kingston Jamaica',
    });
    this.loadData();
  }

  loadData() {
    

    this.services.set(treatments as Service[]);
    this.loading.set(false);
  }

  selectCategory(id: number | null) {
    this.selectedCategoryId.set(id);
  }

    handleImageError(event: any, service?: any) {
    const name = service?.name || event.target.alt || '';
    const cat = service?.category_name || '';
    event.target.src = this.getSmartFallbackImage(name, cat);
  }

  getSmartFallbackImage(name: string = '', category: string = ''): string {
    const n = name.toLowerCase();
    // Return a generic local placeholder image for any missing thumbnail.
    // All images are stored under /hhclaser_img/hhclaser_images/.
    return '/hhclaser_img/hhclaser_images/Modern luxury clinic reception area.webp';
  }

  bookNow(service: Service) {
    this.router.navigate(['/customer/book'], { queryParams: { service: service.id } });
  }
}
