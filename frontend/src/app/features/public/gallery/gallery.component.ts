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
    'live_gallery/gallery_10.webp',
    'live_gallery/gallery_11.jpg',
    'live_gallery/gallery_2.jpg',
    'live_gallery/gallery_3.webp',
    'live_gallery/gallery_4.jpg',
    'live_gallery/gallery_5.png',
    'live_gallery/gallery_6.webp',
    'live_gallery/gallery_7.jpg',
    'live_gallery/gallery_8.jpg',
    'live_gallery/gallery_9.jpg',
    '../hhclaser_img/hhclaser_images/live/10_Jawline and Neck.webp',
    '../hhclaser_img/hhclaser_images/live/11_Bikini Line.webp',
    '../hhclaser_img/hhclaser_images/live/12_Full Pubic _ Armpits.webp',
    '../hhclaser_img/hhclaser_images/live/13_Brazilian Only.webp',
    '../hhclaser_img/hhclaser_images/live/14_Pubic_ Armpit and Brazilian _Special_.webp',
    '../hhclaser_img/hhclaser_images/live/15_Armpits.png',
    '../hhclaser_img/hhclaser_images/live/16_Aerola.webp',
    '../hhclaser_img/hhclaser_images/live/17_Mid_Chest.webp',
    '../hhclaser_img/hhclaser_images/live/18_Full Chest.webp',
    '../hhclaser_img/hhclaser_images/live/19_Abdomen.webp',
    '../hhclaser_img/hhclaser_images/live/20_Full Abdomen.webp',
    '../hhclaser_img/hhclaser_images/live/21_Full Abdomen and Chest.webp',
    '../hhclaser_img/hhclaser_images/live/22_Upper Back.webp',
    '../hhclaser_img/hhclaser_images/live/23_Lower Back.png',
    '../hhclaser_img/hhclaser_images/live/24_Full Back.webp',
    '../hhclaser_img/hhclaser_images/live/25_Arms and Shoulders.webp',
    '../hhclaser_img/hhclaser_images/live/26_Full Legs.webp',
    '../hhclaser_img/hhclaser_images/live/27_Lower Legs.webp',
    '../hhclaser_img/hhclaser_images/live/28_Full Thighs.webp',
    '../hhclaser_img/hhclaser_images/live/29_Inner Thigh.webp',
    '../hhclaser_img/hhclaser_images/live/30_Posterior Thighs.webp',
    '../hhclaser_img/hhclaser_images/live/31_Posterior Thighs and Bottom.png',
    '../hhclaser_img/hhclaser_images/live/32_Full Bottom.webp',
    '../hhclaser_img/hhclaser_images/live/33_Fingers and Toes.webp',
    '../hhclaser_img/hhclaser_images/live/34_Full chest.webp',
    '../hhclaser_img/hhclaser_images/live/35_ACNE _ DARK SPOTS.jpg',
    '../hhclaser_img/hhclaser_images/live/37_SKIN TIGHTENING.png',
    '../hhclaser_img/hhclaser_images/live/38_HAIR RESTORATION.jpg',
    '../hhclaser_img/hhclaser_images/live/39_NON_SURGICAL BBL.jpg',
    '../hhclaser_img/hhclaser_images/live/40_FAT REDUCTION.jpg',
    '../hhclaser_img/hhclaser_images/live/41_BOTOX Consultation.jpg',
    '../hhclaser_img/hhclaser_images/live/42_DERMAL FILLERS _Consultation_.jpg',
    '../hhclaser_img/hhclaser_images/live/43_IV THERAPY.jpg',
    '../hhclaser_img/hhclaser_images/live/44_VITAL SHOTS.jpg',
    '../hhclaser_img/hhclaser_images/live/45_KELOID _Consultation_.jpg',
    '../hhclaser_img/hhclaser_images/live/46_FUNGUS.jpg',
    '../hhclaser_img/hhclaser_images/live/47_WEIGHTLOSS _Consultation_.webp',
    '../hhclaser_img/hhclaser_images/live/48_PRF PLASMA TREATMENT.jpg',
    '../hhclaser_img/hhclaser_images/live/49_MICRONEEDLING PRP.jpg',
    '../hhclaser_img/hhclaser_images/live/50_FOLLICULITIS.jpg',
    '../hhclaser_img/hhclaser_images/live/51_TATTOO REMOVAL.jpg',
    '../hhclaser_img/hhclaser_images/live/52_SKIN TAG.jpg',
    '../hhclaser_img/hhclaser_images/live/53_PSEUDOFOLLICULITIS.jpg',
    '../hhclaser_img/hhclaser_images/live/54_PHOTOREJUVENATION.jpg',
    '../hhclaser_img/hhclaser_images/live/55_WOOD THERAPY.jpg',
    '../hhclaser_img/hhclaser_images/live/56_CELLULITES.jpg',
    '../hhclaser_img/hhclaser_images/live/57_LYMPATHIC DRAINAGE.jpg',
    '../hhclaser_img/hhclaser_images/live/58_SKIN RESURFACING.jpg',
    '../hhclaser_img/hhclaser_images/live/59_HEAD _ BODY MASSAGE _ HEAD SPA.jpg',
    '../hhclaser_img/hhclaser_images/live/60_STRETCH MARKS.jpg',
    '../hhclaser_img/hhclaser_images/live/61_ENLARGED PORES.jpg',
    '../hhclaser_img/hhclaser_images/live/62_MICRODERMABRASION.webp',
    '../hhclaser_img/hhclaser_images/live/63_CHEMICAL PEEL.jpg',
    '../hhclaser_img/hhclaser_images/live/64_SCARS.jpg',
    '../hhclaser_img/hhclaser_images/live/65_SEMEGLUTHIDE.jpg',
    '../hhclaser_img/hhclaser_images/live/67_DARK CIRCLES.webp',
    '../hhclaser_img/hhclaser_images/live/68_HEAT SHOCK_ BODY_ SKIN DETOX.jpg',
    '../hhclaser_img/hhclaser_images/live/8_Chin Only.webp',
    '../hhclaser_img/hhclaser_images/live/9_Chin and Neck.webp'
  ];
}
