import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GalleryItem {
  id: number;
  title: string;
  description: string | null;
  category: string;
  alt_text: string | null;
  is_featured: boolean;
  local_path: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen py-16 px-4 bg-charcoal-900">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-5xl font-light text-cream-50 mb-4" style="font-family: var(--font-heading)">
            Our <span class="text-gold-500 italic">Gallery</span>
          </h2>
          <div class="divider-gold mx-auto mb-6"></div>
          <p class="text-cream-400 max-w-2xl mx-auto text-lg leading-relaxed">
            See real before-and-after results from Havendale Healthcare (HHC Laser) — laser hair removal, laser resurfacing and skincare treatments in Kingston, Jamaica.
          </p>
        </div>

        <!-- Category Filter -->
        <div class="flex flex-wrap justify-center gap-3 mb-12">
          @for (cat of categories; track cat.key) {
            <button
              (click)="selectedCategory.set(cat.key)"
              [class]="selectedCategory() === cat.key
                ? 'px-5 py-2 rounded-full text-sm font-medium bg-gold-500 text-charcoal-900 shadow-lg shadow-gold-500/25 transition-all duration-300'
                : 'px-5 py-2 rounded-full text-sm font-medium bg-charcoal-800 text-cream-300 border border-white/10 hover:border-gold-500/50 hover:text-gold-500 transition-all duration-300'">
              {{ cat.label }}
            </button>
          }
        </div>

        <!-- Gallery Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          @for (item of filteredGallery(); track item.id) {
            <div class="group relative overflow-hidden rounded-lg aspect-square bg-charcoal-800 shadow-xl border border-white/5 hover:border-gold-500/50 transition-all duration-500 hover:-translate-y-2 cursor-pointer">
              <img [src]="'/images/' + item.local_path"
                   [alt]="item.alt_text || item.title"
                   class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                   loading="lazy"
                   (error)="handleImageError($event)">

              <!-- Hover Overlay with Title & Description -->
              <div class="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="absolute bottom-0 left-0 w-full p-5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 class="text-gold-500 font-semibold text-sm uppercase tracking-wider mb-1">{{ item.title }}</h3>
                  @if (item.description) {
                    <p class="text-cream-300 text-xs leading-relaxed line-clamp-2">{{ item.description }}</p>
                  }
                </div>
              </div>

              <!-- Featured Badge -->
              @if (item.is_featured) {
                <div class="absolute top-3 right-3 bg-gold-500 text-charcoal-900 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                  Featured
                </div>
              }
            </div>
          }
        </div>

        <!-- Empty State -->
        @if (filteredGallery().length === 0) {
          <div class="text-center py-20">
            <p class="text-cream-400 text-lg">No images found in this category.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .aspect-square {
      aspect-ratio: 1 / 1;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class GalleryComponent {
  selectedCategory = signal<string>('all');

  categories = [
    { key: 'all', label: 'All' },
    { key: 'before_after', label: 'Before & After' },
    { key: 'treatments', label: 'Treatments' },
    { key: 'facility', label: 'Facility' },
    { key: 'general', label: 'General' },
  ];

  galleryItems: GalleryItem[] = [
    {
      id: 12,
      title: 'From the Start',
      description: 'Been Creating Before & After Pictures Before Instagram',
      category: 'before_after',
      alt_text: null,
      is_featured: false,
      local_path: 'live_gallery/gallery_12_From the Start.webp'
    },
    {
      id: 11,
      title: 'LASER HAIR REMOVAL',
      description: null,
      category: 'treatments',
      alt_text: null,
      is_featured: false,
      local_path: 'live_gallery/gallery_11_LASER HAIR REMOVAL.jpg'
    },
    {
      id: 1,
      title: 'Modern Laser Treatment Room',
      description: 'State-of-the-art laser treatment facility with cutting-edge technology',
      category: 'facility',
      alt_text: 'Modern laser treatment room with advanced equipment',
      is_featured: true,
      local_path: 'live_gallery/gallery_1_Modern Laser Treatment Room.webp'
    },
    {
      id: 2,
      title: 'Professional Consultation',
      description: 'Expert dermatologist consultation for personalized treatment plans',
      category: 'general',
      alt_text: 'Professional medical consultation in progress',
      is_featured: true,
      local_path: 'live_gallery/gallery_2_Professional Consultation.jpg'
    },
    {
      id: 3,
      title: 'Laser Hair Removal Results',
      description: 'Smooth, hair-free skin after laser treatment',
      category: 'before_after',
      alt_text: 'Before and after laser hair removal results',
      is_featured: false,
      local_path: 'live_gallery/gallery_3_Laser Hair Removal Results.png'
    },
    {
      id: 4,
      title: 'Skin Rejuvenation Treatment',
      description: 'Advanced skin rejuvenation therapy in progress',
      category: 'treatments',
      alt_text: 'Skin rejuvenation laser treatment',
      is_featured: false,
      local_path: 'live_gallery/gallery_4_Skin Rejuvenation Treatment.jpg'
    },
    {
      id: 5,
      title: 'Luxury Clinic Reception',
      description: 'Welcoming reception area with modern design',
      category: 'facility',
      alt_text: 'Modern luxury clinic reception area',
      is_featured: false,
      local_path: 'live_gallery/gallery_5_Luxury Clinic Reception.webp'
    },
    {
      id: 6,
      title: 'Treatment Room Interior',
      description: 'Clean and comfortable treatment environment',
      category: 'facility',
      alt_text: 'Professional treatment room setup',
      is_featured: false,
      local_path: 'live_gallery/gallery_6_Treatment Room Interior.jpg'
    },
    {
      id: 7,
      title: 'Expert Medical Team',
      description: 'Our certified laser specialists and medical professionals',
      category: 'before_after',
      alt_text: 'Professional medical team members',
      is_featured: false,
      local_path: 'live_gallery/gallery_7_Expert Medical Team.jpg'
    },
    {
      id: 8,
      title: 'Advanced Laser Equipment',
      description: 'State-of-the-art laser technology for optimal results',
      category: 'facility',
      alt_text: 'Advanced medical laser equipment',
      is_featured: false,
      local_path: 'live_gallery/gallery_8_Advanced Laser Equipment.jpg'
    },
    {
      id: 9,
      title: 'Facial Treatment',
      description: 'Precision facial laser treatment for skin perfection',
      category: 'treatments',
      alt_text: 'Facial laser treatment in progress',
      is_featured: false,
      local_path: 'live_gallery/gallery_9_Facial Treatment.webp'
    },
    {
      id: 10,
      title: 'Body Contouring',
      description: 'Non-invasive body contouring treatment',
      category: 'treatments',
      alt_text: 'Body contouring laser treatment',
      is_featured: false,
      local_path: 'live_gallery/gallery_10_Body Contouring.jpg'
    }
  ];

  filteredGallery = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'all') return this.galleryItems;
    return this.galleryItems.filter(item => item.category === cat);
  });

  handleImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }
}
