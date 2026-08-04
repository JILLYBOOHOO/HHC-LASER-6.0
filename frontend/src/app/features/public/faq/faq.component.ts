import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, MatButtonModule, RouterModule],
  template: `
    <div class="pt-24 pb-16 min-h-screen" style="background: var(--color-cream)">
      <div class="max-w-4xl mx-auto px-4">
        
        <!-- Header -->
        <div class="text-center mb-16">
          <span class="section-label">Common Inquiries</span>
          <div class="divider-gold"></div>
          <h1 class="mt-4 font-heading text-4xl md:text-5xl text-charcoal-800">
            Frequently Asked <span class="text-gold-500">Questions</span>
          </h1>
          <p class="mt-4 max-w-2xl mx-auto text-charcoal-500 leading-relaxed">
            Have questions? We’ve got answers to some of the most common inquiries about our treatments and services.
          </p>
        </div>

        <!-- FAQ Accordion -->
        <mat-accordion class="faq-accordion" multi>
          @for (faq of faqs; track faq.question) {
            <mat-expansion-panel class="mb-4 !rounded-xl !shadow-sm border border-cream-200">
              <mat-expansion-panel-header class="!h-16 hover:!bg-cream-50">
                <mat-panel-title class="!text-charcoal-800 font-medium !text-base">
                  {{ faq.question }}
                </mat-panel-title>
              </mat-expansion-panel-header>
              <div class="p-4 pt-0 text-charcoal-500 leading-relaxed whitespace-pre-wrap">
                {{ faq.answer }}
              </div>
            </mat-expansion-panel>
          }
        </mat-accordion>

        <!-- CTA -->
        <div class="mt-16 text-center">
          <p class="text-charcoal-600 mb-6 text-lg">Still have questions? We're happy to help.</p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a routerLink="/contact" mat-flat-button class="!bg-charcoal-900 !text-cream-50 px-8 py-2">Contact Us</a>
            <a routerLink="/customer/book" mat-stroked-button class="!border-charcoal-300 !text-charcoal-800 px-8 py-2">Book Consultation</a>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .faq-accordion .mat-expansion-panel {
      background: white !important;
    }
  `]
})
export class FaqComponent {
  faqs = [
    {
      question: "Do you offer free consultations?",
      answer: "Yes, we offer complimentary consultations to help you understand your options and create a personalized treatment plan based on your goals. During your consultation, our certified professionals will assess your needs, answer your questions, and recommend the most suitable treatments to help you achieve your desired results."
    },
    {
      question: "Are your treatments safe?",
      answer: "Absolutely. Your safety is our highest priority. We use advanced, FDA-approved equipment and follow strict safety protocols to ensure every treatment is performed with the highest level of care. Our certified practitioners are highly trained in the latest aesthetic techniques to provide safe, effective, and natural-looking results."
    },
    {
      question: "How long do results last?",
      answer: "Results vary depending on the treatment, lifestyle factors, and individual response. During your consultation, we will explain what you can expect and discuss the expected duration of your results. Many treatments provide long-lasting improvements when combined with proper maintenance and follow-up care."
    },
    {
      question: "Do you accept insurance?",
      answer: "Most aesthetic treatments are considered elective procedures and are typically not covered by insurance. However, we offer flexible payment options and financing solutions to make treatments more accessible. Please ask about our current payment options during your consultation."
    },
    {
      question: "How long does each treatment session take?",
      answer: "Treatment times vary depending on the procedure and the area being treated. Most appointments range from 30 minutes to 2 hours. During your consultation, we will provide an estimated treatment time and explain what to expect during your visit."
    },
    {
      question: "What should I expect during my first visit?",
      answer: "Your first visit begins with a comprehensive consultation where we discuss your aesthetic goals, medical history, and expectations. Our professionals will evaluate the treatment area, explain recommended procedures, discuss your treatment plan, timeline, and costs. There is never any pressure to make a decision immediately — our goal is to ensure you feel confident and informed."
    },
    {
      question: "Is there any downtime after treatments?",
      answer: "Downtime depends on the specific treatment performed. Many of our procedures are minimally invasive and require little to no downtime, allowing you to return to your normal activities quickly. For treatments requiring additional recovery time, we will provide detailed aftercare instructions to support your healing and results."
    },
    {
      question: "How many sessions will I need?",
      answer: "The number of sessions required depends on your individual goals, the treatment selected, and how your skin responds. During your consultation, we will create a customized treatment plan outlining the recommended number of sessions needed to achieve optimal results."
    },
    {
      question: "What makes HHC Laser different from other clinics?",
      answer: "HHC Laser combines advanced technology with personalized, patient-focused care. Our certified professionals stay up to date with the latest aesthetic techniques, use FDA-approved technology, and focus on delivering natural-looking results that enhance your confidence and overall appearance."
    },
    {
      question: "Can I combine multiple treatments?",
      answer: "Yes. Many treatments can be safely combined to address multiple concerns and enhance your overall results. Our specialists will evaluate your needs and recommend the most effective combination of treatments during your consultation."
    }
  ];
}
