import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SeoService } from '../../../core/services/seo.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, MatButtonModule, RouterModule, FormsModule],
  template: `
    <!-- Header Section (Beige background) -->
    <div class="pt-4 pb-16" style="background: #FDF1D6;">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h1 class="font-heading text-4xl md:text-5xl text-black font-bold mb-4">
          Frequently Asked Questions
        </h1>
        <p class="max-w-lg mx-auto text-neutral-800 text-sm leading-relaxed mb-8 font-semibold">
          Find answers to the most common questions about our treatments, booking process, and policies.
        </p>

        <!-- Search Bar -->
        <div class="max-w-md mx-auto relative shadow-sm">
          <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 !text-neutral-500 !text-xl flex items-center">search</mat-icon>
          <input type="text"
                 placeholder="Search FAQs..."
                 [ngModel]="searchQuery()"
                 (ngModelChange)="searchQuery.set($event)"
                 class="w-full pl-12 pr-4 py-3.5 border border-black/20 bg-white text-sm focus:outline-none focus:border-black transition-colors" />
        </div>
      </div>
    </div>

    <!-- Content Section (White background) -->
    <div class="py-16 bg-white min-h-[60vh]">
      <div class="max-w-4xl mx-auto px-4">
        
        <!-- Category Filter -->
        <div class="mb-10">
          <h3 class="text-black font-bold text-lg mb-4">Browse by Category</h3>
          <div class="flex flex-wrap gap-3">
            @for (cat of categories; track cat) {
              <button (click)="selectedCategory.set(cat)"
                      class="px-4 py-1.5 border border-black/80 text-xs font-bold uppercase tracking-wider transition-colors"
                      [ngClass]="selectedCategory() === cat ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'">
                {{ cat === 'all' ? 'All' : cat }}
              </button>
            }
          </div>
        </div>

        <!-- FAQ Accordion -->
        @if (filteredFaqs().length > 0) {
          <mat-accordion class="faq-accordion" multi>
            @for (faq of filteredFaqs(); track faq.question) {
              <mat-expansion-panel class="!mb-4 !rounded-none !shadow-none border border-black/40" expandedHeight="64px" collapsedHeight="64px">
                <mat-expansion-panel-header class="hover:!bg-neutral-50 px-6 border-none">
                  <mat-panel-title class="!text-black font-bold !text-sm flex items-center">
                    <mat-icon class="mr-3 !text-lg text-black">help_outline</mat-icon>
                    {{ faq.question }}
                  </mat-panel-title>
                </mat-expansion-panel-header>
                <div class="p-6 pt-2 text-neutral-800 font-medium text-sm leading-relaxed whitespace-pre-wrap bg-white">
                  {{ faq.answer }}
                </div>
              </mat-expansion-panel>
            }
          </mat-accordion>
        } @else {
          <div class="text-center py-12 text-neutral-500 font-medium">
            No FAQs found matching your criteria.
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .faq-accordion .mat-expansion-panel {
      background: white !important;
    }
    ::ng-deep .faq-accordion .mat-expansion-indicator::after {
      color: black;
      padding: 4px;
    }
    ::ng-deep .mat-expansion-panel-header {
      padding: 0 24px !important;
    }
    ::ng-deep .mat-expansion-panel-body {
      padding: 0 !important;
    }
  `]
})
export class FaqComponent implements OnInit {
  private seo = inject(SeoService);

  searchQuery = signal('');
  selectedCategory = signal('all');

  categories = ['all', 'general', 'safety', 'results', 'payment', 'treatment', 'recovery'];

  faqs: FaqItem[] = [
    { category: 'general', question: 'Do you offer free consultations?', answer: 'Yes, we offer complimentary consultations to discuss your goals and recommend the best treatment plan for you. During this consultation, our certified professionals will assess your needs and explain the available options.' },
    { category: 'safety', question: 'Are your treatments safe?', answer: 'Absolutely. We use only FDA-approved equipment and follow strict safety protocols. All our practitioners are certified professionals with extensive training in aesthetic treatments. Your safety is our top priority.' },
    { category: 'results', question: 'How long do results last?', answer: "Results vary depending on the treatment and individual factors. During your consultation, we'll discuss expected results and duration for your specific treatment. Many treatments provide long-lasting results with proper maintenance." },
    { category: 'payment', question: 'Do you accept insurance?', answer: 'Most aesthetic treatments are considered elective and not covered by insurance. However, we offer flexible payment plans and financing options to make treatments more accessible. Please ask about our current payment options during your consultation.' },
    { category: 'treatment', question: 'How long does each treatment session take?', answer: "Treatment duration varies depending on the specific procedure and the area being treated. Most sessions range from 30 minutes to 2 hours. We'll provide you with an accurate time estimate during your consultation." },
    { category: 'general', question: 'What should I expect during my first visit?', answer: "Your first visit will include a comprehensive consultation where we discuss your goals, medical history, and expectations. We'll examine the treatment area and explain the recommended procedures, timeline, and costs. There's no pressure to decide immediately." },
    { category: 'recovery', question: 'Is there any downtime after treatments?', answer: "Downtime varies by treatment. Many of our procedures are minimally invasive with little to no downtime, allowing you to resume normal activities immediately. For more intensive treatments, we'll provide detailed aftercare instructions." },
    { category: 'treatment', question: 'How many sessions will I need?', answer: "The number of sessions depends on your individual goals, the treatment type, and your skin's response. During your consultation, we'll create a personalized treatment plan that outlines the recommended number of sessions for optimal results." },
    { category: 'general', question: 'What makes HHC Laser different from other clinics?', answer: 'HHC Laser combines advanced technology with personalized care. Our certified professionals stay current with the latest techniques, we use FDA-approved equipment, and we focus on creating natural-looking results that enhance your confidence.' },
    { category: 'treatment', question: 'Can I combine multiple treatments?', answer: 'Yes, many treatments can be safely combined to maximize results. During your consultation, we can discuss creating a comprehensive treatment plan that addresses multiple concerns safely and effectively.' }
  ];

  filteredFaqs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    
    return this.faqs.filter(faq => {
      const matchesCategory = cat === 'all' || faq.category === cat;
      const matchesSearch = !q || faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  });

  ngOnInit(): void {
    this.seo.updatePage({
      title: 'FAQ | Laser Hair Removal, Botox & Med Spa Questions | HHC Laser Jamaica',
      description: 'Frequently asked questions about HHC Laser & Co. medical spa treatments in Kingston Jamaica. Learn about laser hair removal, Botox, safety, consultations, downtime, and pricing.',
      canonicalPath: '/faq',
      keywords: 'HHC Laser FAQ Jamaica, Laser Hair Removal Questions Jamaica, Botox FAQ Kingston Jamaica, Med Spa FAQ Jamaica',
    });
    this.seo.injectSchema('faq-page', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': this.faqs.map(f => ({
        '@type': 'Question',
        'name': f.question,
        'acceptedAnswer': { '@type': 'Answer', 'text': f.answer }
      }))
    });
  }
}
