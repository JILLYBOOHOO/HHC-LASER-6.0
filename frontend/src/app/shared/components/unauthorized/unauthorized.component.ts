import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-[70vh] flex items-center justify-center p-4">
      <div class="text-center max-w-md">
        <mat-icon class="!text-6xl text-red-500 mb-6 mx-auto">gpp_bad</mat-icon>
        <h1 class="text-4xl font-heading text-gray-50 mb-4">Access Denied</h1>
        <p class="text-charcoal-500 mb-8">You do not have permission to access this page. Please log in with an account that has the appropriate privileges.</p>
        <a routerLink="/auth/login" mat-flat-button class="!bg-white !text-cream-50 mr-4">Go to Login</a>
        <a routerLink="/" mat-stroked-button>Return Home</a>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {}
