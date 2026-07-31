import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="min-h-screen py-16 px-4 bg-charcoal-900">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-light text-cream-50 mb-4" style="font-family: var(--font-heading)">
            Our <span class="text-gold-500 italic">Gallery</span>
          </h2>
          <div class="divider-gold mx-auto mb-6"></div>
          <p class="text-cream-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Take a look at our state-of-the-art facilities and some of the amazing results we've achieved for our clients.
          </p>
        </div>

        <!-- Gallery Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          @for (image of images; track image) {
            <div class="group relative overflow-hidden rounded-lg aspect-square bg-charcoal-800 shadow-xl border border-white/5 hover:border-gold-500/50 transition-all duration-500 hover:-translate-y-2 cursor-pointer">
              <img [src]="'/images/' + image" 
                   [alt]="'Gallery image ' + $index"
                   class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                   loading="lazy">
              
              <!-- Hover Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="absolute bottom-0 left-0 w-full p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div class="w-8 h-8 rounded-full border border-gold-500 flex items-center justify-center mx-auto bg-charcoal-900/80 backdrop-blur-sm">
                    <span class="text-gold-500 text-lg">+</span>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .aspect-square {
      aspect-ratio: 1 / 1;
    }
  `]
})
export class GalleryComponent {
  images = [
    'live_gallery/gallery_1.webp',
    'live_gallery/gallery_2.jpg',
    'live_gallery/gallery_3.webp',
    'live_gallery/gallery_4.jpg',
    'live_gallery/gallery_5.png',
    'live_gallery/gallery_6.webp',
    'live_gallery/gallery_7.jpg',
    'live_gallery/gallery_8.jpg',
    'live_gallery/gallery_9.jpg',
    'live_gallery/gallery_10.webp',
    'live_gallery/gallery_11.jpg'
  ];
}
