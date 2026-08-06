import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-consultation',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  template: `
    <div class="min-h-screen bg-background text-white pt-24 pb-20">
      
      <!-- Hero Section -->
      <div class="container-luxury px-6 relative mb-20">
        <div class="max-w-3xl mx-auto text-center">
          <div class="inline-flex items-center gap-3 mb-6">
            <div class="h-px w-8 bg-gold"></div>
            <span class="text-gold tracking-[0.2em] uppercase text-xs font-semibold">Take The First Step</span>
            <div class="h-px w-8 bg-gold"></div>
          </div>
          
          <h1 class="font-heading text-5xl md:text-6xl lg:text-7xl mb-6 tracking-tight">
            Free <span class="text-white/80 italic">Consultation</span>
          </h1>
          
          <p class="text-text-muted text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Start your aesthetic journey with a personalized consultation from our experienced medical professionals.
          </p>
        </div>
      </div>

      <!-- Information Card & Glassmorphism -->
      <div class="container-luxury px-6">
        <div class="max-w-4xl mx-auto">
          
          <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 md:p-12 shadow-2xl">
            <!-- Decorative gradient blur -->
            <div class="absolute -top-32 -right-32 w-64 h-64 bg-gold/20 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-32 -left-32 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative z-10">
              <h2 class="text-2xl md:text-3xl font-heading mb-8 text-center">What to Expect</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                @for (item of expectations; track item.title) {
                  <div class="flex gap-4 items-start">
                    <div class="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center bg-gold/10 flex-shrink-0 text-gold">
                      <mat-icon class="!text-sm">{{ item.icon }}</mat-icon>
                    </div>
                    <div>
                      <h3 class="text-lg text-white font-medium mb-2">{{ item.title }}</h3>
                      <p class="text-text-muted text-sm font-light leading-relaxed">
                        {{ item.description }}
                      </p>
                    </div>
                  </div>
                }
              </div>

              <div class="text-center pt-8 border-t border-white/10">
                <a routerLink="/contact"
                   class="inline-flex items-center justify-center gap-3 bg-gold hover:bg-gold-light text-background px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                  <span>Contact us for your Free Consultation</span>
                  <mat-icon>arrow_forward</mat-icon>
                </a>
                <p class="mt-4 text-xs text-text-muted font-light">
                  No commitment required. Secure your spot today.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ConsultationComponent {
  expectations = [
    {
      icon: 'chat_bubble_outline',
      title: 'Discuss Your Goals',
      description: 'Share your aesthetic aspirations in a private, comfortable setting where we listen to your unique needs.'
    },
    {
      icon: 'search',
      title: 'Professional Assessment',
      description: 'Receive a thorough evaluation of your skin and features from our certified medical professionals.'
    },
    {
      icon: 'auto_awesome',
      title: 'Recommended Treatments',
      description: 'Learn about the most effective, cutting-edge procedures suited specifically for your goals.'
    },
    {
      icon: 'list_alt',
      title: 'Customized Plan',
      description: 'Walk away with a bespoke treatment plan designed to deliver natural, beautiful results.'
    },
    {
      icon: 'help_outline',
      title: 'Ask Questions',
      description: 'Get clear, honest answers to all your concerns, ensuring you feel completely confident.'
    },
    {
      icon: 'payments',
      title: 'Pricing & Results',
      description: 'Understand the investment required and the timeline for achieving your desired outcome.'
    }
  ];
}
