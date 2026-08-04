import { Component, Input, OnInit, ElementRef, ViewChild, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-before-after-slider',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div
      class="relative w-full overflow-hidden rounded-3xl border border-white/5 bg-surface shadow-lg select-none"
      [class.cursor-col-resize]="isDragging || animationComplete()"
      (mousedown)="startDrag($event)"
      (touchstart)="startDrag($event)"
      #container
    >
      <!-- Before/After Images Container -->
      <div class="relative aspect-[4/3] w-full overflow-hidden bg-background">
        <!-- Before Image (Base) -->
        <img
          [src]="beforeImage"
          alt="Before treatment outcome"
          class="absolute inset-0 w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />

        <!-- After Image (Overlay, Clipped) -->
        <div
          class="absolute inset-0 w-full h-full pointer-events-none"
          [style.clip-path]="'inset(0 0 0 ' + sliderPos() + '%)'"
        >
          <img
            [src]="afterImage"
            alt="After treatment outcome"
            class="absolute inset-0 w-full h-full object-cover pointer-events-none"
            loading="lazy"
          />
        </div>

        <!-- Mobile hint after animation completes -->
        @if (animationComplete() && !hasInteracted()) {
          <div
            class="absolute inset-0 z-30 flex items-center justify-center pointer-events-none md:hidden"
          >
            <div class="glass px-4 py-2.5 rounded-full flex items-center gap-2">
              <mat-icon class="text-gold !text-lg !w-5 !h-5">swap_horiz</mat-icon>
              <span
                class="text-[10px] tracking-[0.15em] font-semibold text-white uppercase"
                >Drag to Compare</span
              >
            </div>
          </div>
        }

        <!-- Floating Labels -->
        <span
          class="absolute top-4 left-4 z-10 glass px-3 py-1.5 rounded-full text-[10px] tracking-[0.2em] font-semibold text-gold uppercase pointer-events-none"
        >
          BEFORE
        </span>
        <span
          class="absolute top-4 right-4 z-10 glass px-3 py-1.5 rounded-full text-[10px] tracking-[0.2em] font-semibold text-gold uppercase pointer-events-none"
        >
          AFTER
        </span>

        <!-- Draggable Handle Bar -->
        <div
          class="absolute top-0 bottom-0 z-20"
          [style.left]="sliderPos() + '%'"
          [class.pointer-events-none]="!animationComplete()"
          [class.cursor-col-resize]="animationComplete()"
          style="width: 44px; margin-left: -22px"
          (mousedown)="startDrag($event)"
          (touchstart)="startDrag($event)"
        >
          <div
            class="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-gold/50 via-gold to-gold/50 pointer-events-none"
          ></div>

          <!-- Champagne Gold Circular frosted glass handle -->
          <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center shadow-lg transition-transform duration-200"
            [style.background]="'rgba(18, 18, 20, 0.65)'"
            [style.backdrop-filter]="'blur(12px)'"
            [style.box-shadow]="
              isDragging
                ? '0 0 20px rgba(214, 179, 106, 0.4)'
                : '0 4px 12px rgba(0,0,0,0.5)'
            "
            [class.scale-110]="isDragging"
            [class.border-gold]="isDragging"
            [class.opacity-60]="!animationComplete()"
            tabindex="0"
            (keydown)="handleKeyDown($event)"
            role="slider"
            [attr.aria-valuenow]="sliderPos() | number: '1.0-0'"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Before and after image comparison slider"
          >
            <div class="flex items-center gap-1 text-gold pointer-events-none">
              <mat-icon class="!text-[12px] !w-[12px] !h-[12px]"
                >chevron_left</mat-icon
              >
              <mat-icon class="!text-[12px] !w-[12px] !h-[12px]"
                >chevron_right</mat-icon
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Card text details -->
      <div class="p-6 space-y-4">
        <div class="flex justify-between items-start">
          <div>
            <div
              class="text-[10px] tracking-[0.25em] font-semibold text-gold uppercase mb-1"
            >
              {{ duration }}
            </div>
            <h4 class="font-heading text-2xl text-white">{{ treatmentName }}</h4>
          </div>
          @if (rating) {
            <div
              class="flex items-center gap-0.5 text-gold"
              [attr.aria-label]="rating + ' out of 5 stars'"
            >
              @for (star of [1, 2, 3, 4, 5]; track star) {
                <mat-icon
                  class="!text-sm !w-3.5 !h-3.5 flex items-center justify-center"
                >
                  {{ star <= rating ? 'star' : 'star_border' }}
                </mat-icon>
              }
            </div>
          }
        </div>

        @if (description) {
          <p class="text-text-muted text-sm font-light leading-relaxed">
            {{ description }}
          </p>
        }

        @if (testimonial) {
          <div class="pt-4 border-t border-white/5">
            <p class="italic text-text-muted text-xs font-light leading-relaxed">
              "{{ testimonial.quote }}"
            </p>
            <div
              class="text-[9px] tracking-widest font-semibold text-white/60 uppercase mt-2"
            >
              — {{ testimonial.author }}
            </div>
          </div>
        }

        <p class="text-[9px] tracking-wider text-text-muted/40 uppercase">
          Results may vary.
        </p>
      </div>
    </div>
  `,
  styles: [],
})
export class BeforeAfterSliderComponent implements OnInit {
  @Input() beforeImage!: string;
  @Input() afterImage!: string;
  @Input() treatmentName!: string;
  @Input() duration!: string;
  @Input() description?: string;
  @Input() testimonial?: { quote: string; author: string };
  @Input() rating?: number;
  /** @deprecated lightbox enlarge removed */
  @Input() isLightbox = false;

  @ViewChild('container') containerRef!: ElementRef<HTMLElement>;

  sliderPos = signal<number>(50);
  isDragging = false;
  hasInteracted = signal<boolean>(false);
  animationComplete = signal<boolean>(false);
  private hasAnimated = false;

  ngOnInit() {
    this.initIntersectionObserver();
  }

  private initIntersectionObserver() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      this.animationComplete.set(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.runAutoDemo();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    setTimeout(() => {
      if (this.containerRef?.nativeElement) {
        observer.observe(this.containerRef.nativeElement);
      } else {
        this.animationComplete.set(true);
      }
    }, 100);
  }

  private runAutoDemo() {
    this.hasAnimated = true;
    const startPos = 50;
    let step = 0;
    const totalSteps = 120;

    const animate = () => {
      if (step >= totalSteps) {
        this.sliderPos.set(50);
        this.animationComplete.set(true);
        return;
      }

      step++;
      const phase = (step / totalSteps) * Math.PI * 2;
      const wave = Math.sin(phase);
      this.sliderPos.set(startPos + wave * 25);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  startDrag(event: MouseEvent | TouchEvent) {
    // Manual drag only after intro animation finishes
    if (!this.animationComplete()) return;

    event.preventDefault();
    event.stopPropagation();
    this.hasInteracted.set(true);
    this.isDragging = true;
    this.updatePosition(event);
  }

  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  onDrag(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;
    if ('touches' in event) {
      event.preventDefault();
    }
    this.updatePosition(event);
  }

  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  stopDrag() {
    this.isDragging = false;
  }

  private updatePosition(event: MouseEvent | TouchEvent) {
    if (!this.containerRef?.nativeElement) return;
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const clientX =
      'touches' in event
        ? event.touches[0]?.clientX
        : (event as MouseEvent).clientX;
    if (clientX == null) return;
    const percentage = Math.max(
      0,
      Math.min(100, ((clientX - rect.left) / rect.width) * 100)
    );
    this.sliderPos.set(percentage);
  }

  handleKeyDown(event: KeyboardEvent) {
    if (!this.animationComplete()) return;
    this.hasInteracted.set(true);
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.sliderPos.update((pos) => Math.max(0, pos - 2));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.sliderPos.update((pos) => Math.min(100, pos + 2));
    }
  }
}
