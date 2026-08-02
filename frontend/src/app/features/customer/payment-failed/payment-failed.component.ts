import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payment-failed',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="failed-container">
      <div class="failed-card">
        <div class="icon-circle">
          <mat-icon>error_outline</mat-icon>
        </div>
        <h1>Payment Failed</h1>
        <p class="subtitle">Unfortunately, your payment could not be processed.</p>
        
        <div class="details-box">
          <p class="note">Your booking is not confirmed yet. No charges were applied. Please try a different payment method or verify your card details.</p>
        </div>
        
        <div class="actions">
          <button mat-flat-button color="primary" routerLink="/customer/book">
            Retry Booking
          </button>
          <button mat-stroked-button routerLink="/contact">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .failed-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
    }
    .failed-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 3rem;
      text-align: center;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .icon-circle {
      width: 80px;
      height: 80px;
      background: rgba(244, 67, 54, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }
    .icon-circle mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #F44336;
    }
    h1 {
      font-family: 'Cinzel', serif;
      color: #F44336;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      color: #a0a0a0;
      margin-bottom: 2rem;
    }
    .details-box {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .note {
      font-size: 0.95rem;
      color: #e0e0e0;
      line-height: 1.5;
    }
    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
  `]
})
export class PaymentFailedComponent {}
