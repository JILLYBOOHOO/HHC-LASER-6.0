import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="min-h-screen bg-background pt-32 pb-16 overflow-hidden">
      
      <!-- Hero Section -->
      <section class="container-luxury px-6 mb-24 animate-fade-in-up">
        <div class="max-w-4xl mx-auto text-center">
          <span class="section-label">About HHC Laser</span>
          <h1 class="mt-4 font-heading text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-8 drop-shadow-lg">
            Your Trusted Partner in Medical Aesthetics & Wellness
          </h1>
          <div class="divider-gold mx-auto"></div>
          <div class="mt-8 space-y-6 text-text-muted text-lg font-light leading-relaxed max-w-3xl mx-auto">
            <p>
              At HHC Laser, we believe confidence begins with exceptional care. Our mission is to help every client look and feel their best through advanced medical aesthetics, personalized treatment plans, and a commitment to safety, excellence, and natural-looking results.
            </p>
            <p>
              From your first consultation to your final treatment, our experienced team is dedicated to delivering a professional, comfortable, and results-driven experience in a welcoming environment.
            </p>
          </div>
        </div>
      </section>

      <!-- Our Story (Split Layout) -->
      <section class="container-luxury px-6 mb-32">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div class="relative h-[600px] rounded-3xl overflow-hidden shadow-gold-lg group">
            <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80" alt="HHC Laser Clinic" class="w-full h-full object-cover transition-transform duration-[10000ms] group-hover:scale-110">
            <div class="absolute inset-0 bg-black/20 pointer-events-none"></div>
          </div>
          <div class="space-y-6 animate-fade-in-up" style="animation-delay: 0.2s;">
            <span class="section-label">Our Story</span>
            <h2 class="font-heading text-3xl md:text-4xl text-white">A Destination for Excellence</h2>
            <div class="divider-gold-left"></div>
            <div class="space-y-6 text-text-muted text-base font-light leading-relaxed">
              <p>
                Located in the heart of Kingston, Jamaica, HHC Laser has become a trusted destination for individuals seeking advanced medical spa treatments using modern technology and evidence-based techniques.
              </p>
              <div class="border-l-2 border-gold pl-6 py-2 my-8">
                <p class="text-xl text-white font-heading italic leading-relaxed">
                  "Everyone deserves access to safe, effective, and professional aesthetic treatments that enhance confidence without compromising health."
                </p>
              </div>
              <p>
                Over the years, we have built a reputation for combining medical expertise with personalized care. Every treatment is tailored to your individual goals, ensuring natural, balanced, and long-lasting results.
              </p>
              <p>
                Whether you're visiting for laser hair removal, skin rejuvenation, injectables, IV therapy, body contouring, or wellness treatments, our focus remains the same—helping you achieve your goals with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Why Choose HHC Laser -->
      <section class="bg-surface py-24 mb-32 relative border-y border-white/5">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,179,106,0.05),transparent_70%)] pointer-events-none"></div>
        <div class="container-luxury px-6 relative z-10">
          <div class="text-center max-w-2xl mx-auto mb-16 animate-fade-in-up">
            <span class="section-label">The HHC Difference</span>
            <h2 class="mt-4 font-heading text-3xl md:text-4xl text-white">Why Choose HHC Laser?</h2>
            <div class="divider-gold mx-auto"></div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Feature 1 -->
            <div class="glass p-10 rounded-3xl group hover:-translate-y-2 transition-all duration-300">
              <div class="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6 border border-gold/20 group-hover:bg-gold/20 transition-colors">
                <mat-icon class="text-gold !text-3xl !w-8 !h-8">science</mat-icon>
              </div>
              <h3 class="text-white font-heading text-2xl mb-4">Advanced Technology</h3>
              <p class="text-text-muted font-light leading-relaxed">We invest in industry-leading equipment and modern treatment techniques to deliver safe, effective, and reliable results.</p>
            </div>
            <!-- Feature 2 -->
            <div class="glass p-10 rounded-3xl group hover:-translate-y-2 transition-all duration-300">
              <div class="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6 border border-gold/20 group-hover:bg-gold/20 transition-colors">
                <mat-icon class="text-gold !text-3xl !w-8 !h-8">tune</mat-icon>
              </div>
              <h3 class="text-white font-heading text-2xl mb-4">Personalized Plans</h3>
              <p class="text-text-muted font-light leading-relaxed">Every client is unique. We take the time to understand your concerns and develop treatment plans designed specifically for your needs.</p>
            </div>
            <!-- Feature 3 -->
            <div class="glass p-10 rounded-3xl group hover:-translate-y-2 transition-all duration-300">
              <div class="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6 border border-gold/20 group-hover:bg-gold/20 transition-colors">
                <mat-icon class="text-gold !text-3xl !w-8 !h-8">verified_user</mat-icon>
              </div>
              <h3 class="text-white font-heading text-2xl mb-4">Safety & Excellence</h3>
              <p class="text-text-muted font-light leading-relaxed">Your health and safety are always our highest priority. Every procedure follows strict clinical protocols using FDA-approved equipment.</p>
            </div>
            <!-- Feature 4 -->
            <div class="glass p-10 rounded-3xl group hover:-translate-y-2 transition-all duration-300">
              <div class="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6 border border-gold/20 group-hover:bg-gold/20 transition-colors">
                <mat-icon class="text-gold !text-3xl !w-8 !h-8">psychology</mat-icon>
              </div>
              <h3 class="text-white font-heading text-2xl mb-4">Experienced Professionals</h3>
              <p class="text-text-muted font-light leading-relaxed">Our highly trained team combines medical knowledge with years of practical experience to deliver exceptional care and outstanding client experiences.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Our Core Values -->
      <section class="container-luxury px-6 mb-32">
        <div class="text-center max-w-2xl mx-auto mb-16 animate-fade-in-up">
          <span class="section-label">Our Philosophy</span>
          <h2 class="mt-4 font-heading text-3xl md:text-4xl text-white">Our Core Values</h2>
          <div class="divider-gold mx-auto"></div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="border border-white/5 bg-surface-light rounded-3xl p-8 hover:border-gold/30 hover:bg-surface-light/80 transition-all duration-300 flex flex-col items-center text-center group">
            <mat-icon class="text-gold !text-3xl !w-8 !h-8 mb-4 group-hover:scale-110 transition-transform">favorite</mat-icon>
            <h4 class="text-white font-semibold mb-3 tracking-wide text-lg">Compassionate Care</h4>
            <p class="text-text-muted text-sm font-light leading-relaxed">Every client is treated with professionalism, respect, and genuine care from consultation through aftercare.</p>
          </div>
          <div class="border border-white/5 bg-surface-light rounded-3xl p-8 hover:border-gold/30 hover:bg-surface-light/80 transition-all duration-300 flex flex-col items-center text-center group">
            <mat-icon class="text-gold !text-3xl !w-8 !h-8 mb-4 group-hover:scale-110 transition-transform">health_and_safety</mat-icon>
            <h4 class="text-white font-semibold mb-3 tracking-wide text-lg">Safety First</h4>
            <p class="text-text-muted text-sm font-light leading-relaxed">We maintain the highest standards of cleanliness, safety, and clinical excellence in every treatment we perform.</p>
          </div>
          <div class="border border-white/5 bg-surface-light rounded-3xl p-8 hover:border-gold/30 hover:bg-surface-light/80 transition-all duration-300 flex flex-col items-center text-center group">
            <mat-icon class="text-gold !text-3xl !w-8 !h-8 mb-4 group-hover:scale-110 transition-transform">diamond</mat-icon>
            <h4 class="text-white font-semibold mb-3 tracking-wide text-lg">Excellence</h4>
            <p class="text-text-muted text-sm font-light leading-relaxed">We continually invest in advanced technology, education, and innovation to provide the highest quality aesthetic treatments.</p>
          </div>
          <div class="border border-white/5 bg-surface-light rounded-3xl p-8 hover:border-gold/30 hover:bg-surface-light/80 transition-all duration-300 flex flex-col items-center text-center group">
            <mat-icon class="text-gold !text-3xl !w-8 !h-8 mb-4 group-hover:scale-110 transition-transform">balance</mat-icon>
            <h4 class="text-white font-semibold mb-3 tracking-wide text-lg">Integrity</h4>
            <p class="text-text-muted text-sm font-light leading-relaxed">We believe in honest consultations, realistic expectations, and recommending only treatments that are truly right for you.</p>
          </div>
        </div>
      </section>

      <!-- By the Numbers -->
      <section class="border-y border-white/5 bg-surface py-24 mb-32 relative">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(214,179,106,0.03),transparent_70%)] pointer-events-none"></div>
        <div class="container-luxury px-6 relative z-10">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-white/5">
            <div class="space-y-3 animate-fade-in-up" style="animation-delay: 0.1s;">
              <div class="text-5xl md:text-6xl font-heading text-gold drop-shadow-md">10+</div>
              <div class="text-white text-xs md:text-sm font-semibold tracking-[0.2em] uppercase">Years Experience</div>
            </div>
            <div class="space-y-3 animate-fade-in-up" style="animation-delay: 0.2s;">
              <div class="text-5xl md:text-6xl font-heading text-gold drop-shadow-md">5,000+</div>
              <div class="text-white text-xs md:text-sm font-semibold tracking-[0.2em] uppercase">Satisfied Clients</div>
            </div>
            <div class="space-y-3 animate-fade-in-up" style="animation-delay: 0.3s;">
              <div class="text-5xl md:text-6xl font-heading text-gold drop-shadow-md">15+</div>
              <div class="text-white text-xs md:text-sm font-semibold tracking-[0.2em] uppercase">Advanced Services</div>
            </div>
            <div class="space-y-3 animate-fade-in-up" style="animation-delay: 0.4s;">
              <div class="text-5xl md:text-6xl font-heading text-gold drop-shadow-md">98%</div>
              <div class="text-white text-xs md:text-sm font-semibold tracking-[0.2em] uppercase">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="container-luxury px-6 mb-16 animate-fade-in-up">
        <div class="glass rounded-[2rem] p-12 md:p-20 text-center relative overflow-hidden border border-gold/20 shadow-gold-lg">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(214,179,106,0.15),transparent_60%)] pointer-events-none"></div>
          <div class="relative z-10 max-w-3xl mx-auto">
            <h2 class="font-heading text-4xl md:text-5xl text-white mb-6 drop-shadow-lg">Begin Your Transformation</h2>
            <div class="text-text-muted text-lg font-light leading-relaxed mb-10 space-y-4">
              <p>
                Whether you're looking to refresh your appearance, improve your skin, enhance your wellness, or simply invest in yourself, our experienced team is here to guide you every step of the way.
              </p>
              <p>
                Experience professional medical aesthetics in a welcoming environment where your confidence, comfort, and results come first.
              </p>
            </div>
            <div class="flex flex-col items-center gap-6">
              <a routerLink="/customer/book" class="btn-primary hover:!text-black px-10 py-4 text-sm shadow-gold">Book Your Consultation Today</a>
              <span class="text-xs text-gold/80 tracking-[0.2em] uppercase font-semibold">
                Discover why clients across Jamaica trust HHC Laser.
              </span>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  `,
  styles: [`
    .animate-fade-in-up {
      animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
      transform: translateY(30px);
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class AboutComponent implements OnInit {
  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

