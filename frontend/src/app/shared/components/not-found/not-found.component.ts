import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  template: `
    <div class="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <h1 class="text-9xl font-heading text-gold-500 mb-4 opacity-50">404</h1>
      <h2 class="text-3xl font-heading text-gray-50 mb-6">Page Not Found</h2>
      <p class="text-charcoal-500 mb-8 max-w-md text-center">We couldn't find the page you're looking for. It might have been moved or doesn't exist.</p>
      <a routerLink="/" mat-flat-button class="!bg-white !text-cream-50 px-8 py-2">Back to Home</a>
    </div>
  `
})
export class NotFoundComponent {}
