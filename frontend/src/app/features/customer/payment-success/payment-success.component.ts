import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="success-container">
      <div class="success-card">
        <div class="icon-circle">
          <mat-icon>check_circle</mat-icon>
        </div>
        <h1>Payment Confirmed!</h1>
        <p class="subtitle">Thank you for choosing HHC LASER. Your booking is confirmed.</p>
        
        <div class="details-box">
          <p class="label">Booking Confirmation Code</p>
          <h2 class="code">{{ confirmationCode || 'Processing...' }}</h2>
          <p class="note">A confirmation email has been sent to your inbox.</p>
        </div>
        
        <div class="actions">
          <button mat-flat-button color="primary" routerLink="/customer/dashboard">
            Go to Dashboard
          </button>
          <button mat-stroked-button routerLink="/customer/bookings">
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
    }
    .success-card {
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
      background: rgba(76, 175, 80, 0.1);
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
      color: #4CAF50;
    }
    h1 {
      font-family: 'Cinzel', serif;
      color: #F7E5A1;
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
    .label {
      font-size: 0.9rem;
      color: #a0a0a0;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }
    .code {
      font-family: monospace;
      font-size: 1.8rem;
      color: #ffffff;
      margin-bottom: 0.5rem;
      letter-spacing: 2px;
    }
    .note {
      font-size: 0.85rem;
      color: #707070;
    }
    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  confirmationCode: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.confirmationCode = params.get('code') || 'HHC-PROCESSING';
    });
  }
}
