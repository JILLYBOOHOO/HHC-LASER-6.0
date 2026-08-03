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
    <div class="bg-white min-h-screen pt-20 pb-16">
      <div class="container-luxury px-4">
        
        <!-- Ultra-Compact Hero Header -->
        <div class="text-center pt-0">
          <span class="text-black tracking-[0.2em] text-xs md:text-sm uppercase block font-extrabold mb-0.5">Our Treatments</span>
          <h1 class="text-neutral-700 font-heading text-xs md:text-sm font-medium tracking-wide mt-0 mb-1">
            Luxury Medical Aesthetics
          </h1>
          <p class="text-neutral-500 mx-auto text-[11px] md:text-xs leading-snug max-w-xl mb-3">
            Discover our comprehensive range of premium treatments tailored to enhance your natural beauty and well-being.
          </p>

          <!-- Search Bar -->
          <div class="max-w-md mx-auto relative shadow-xs mb-2">
            <mat-icon class="absolute left-3.5 top-1/2 -translate-y-1/2 !text-neutral-400 !text-lg flex items-center">search</mat-icon>
            <input type="text"
                   placeholder="Search treatments (e.g. Laser, Botox, Chemical Peel)..."
                   [ngModel]="searchQuery()"
                   (ngModelChange)="searchQuery.set($event)"
                   class="w-full pl-10 pr-9 py-2 border border-black/25 rounded-full bg-white text-xs text-black focus:outline-none focus:border-black transition-colors" />
            @if (searchQuery()) {
              <button (click)="searchQuery.set('')" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black">
                <mat-icon class="!text-base">close</mat-icon>
              </button>
            }
          </div>
        </div>

        <!-- Filter Categories (Sits closer to search bar) -->
        <div class="flex flex-wrap justify-center gap-1.5 mb-2">
          <button (click)="selectCategory(null)"
                  class="px-3.5 py-1 rounded-full text-xs transition-all duration-200"
                  [ngClass]="!selectedCategoryId() ? 'bg-gold-500 text-black shadow-xs font-bold' : 'bg-black/5 text-neutral-700 hover:bg-black/10 font-semibold'">
            All Treatments
          </button>
          
          @for (cat of categories(); track cat.id) {
            <button (click)="selectCategory(cat.id)"
                    class="px-3.5 py-1 rounded-full text-xs transition-all duration-200"
                    [ngClass]="selectedCategoryId() === cat.id ? 'bg-gold-500 text-black shadow-xs font-bold' : 'bg-black/5 text-neutral-700 hover:bg-black/10 font-semibold'">
              {{ cat.name }}
            </button>
          }
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
              <div class="group relative bg-white border border-black/80 rounded-lg flex flex-col h-full hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                   [routerLink]="['/services', service.slug || service.id]">
                
                <!-- Image -->
                <div class="aspect-[16/11] w-full overflow-hidden relative bg-gray-50">
                  <img loading="lazy" [src]="service.thumbnail_url" 
                       [alt]="service.name"
                       class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                       (error)="handleImageError($event, service)">
                </div>

                <!-- Content -->
                <div class="p-3 md:p-3.5 flex flex-col flex-1">
                  <!-- Title & CTA -->
                  <div class="flex justify-between items-start gap-2 mb-1">
                    <h3 class="text-black font-extrabold text-xs md:text-sm uppercase tracking-wide line-clamp-1 group-hover:text-gold-500 transition-colors flex-1">
                      {{ service.name }}
                    </h3>
                    <div class="bg-neutral-100 text-neutral-600 border border-neutral-200 text-[9px] uppercase font-bold px-2 py-0.5 rounded-sm whitespace-nowrap group-hover:bg-black group-hover:text-white group-hover:border-black transition-colors">
                      Details &rarr;
                    </div>
                  </div>
                  
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
                  <button (click)="$event.stopPropagation(); bookNow(service)" 
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
