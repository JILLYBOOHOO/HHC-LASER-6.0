import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { Appointment } from '../../../core/models/models';

@Component({
  selector: 'app-customer-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <a routerLink="/customer/bookings" class="inline-flex items-center text-neutral-600 hover:text-black text-sm font-medium transition-colors">
        <mat-icon class="!text-sm !w-4 !h-4 mr-1">arrow_back</mat-icon> Back to Appointments
      </a>

      @if (loading()) {
        <div class="flex justify-center py-16"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (booking()) {
        <div class="card p-8 space-y-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-heading text-black">Appointment #{{ booking()!.id }}</h1>
              @if (booking()!.confirmation_code) {
                <p class="text-sm text-charcoal-500 mt-1">Confirmation: {{ booking()!.confirmation_code }}</p>
              }
            </div>
            <span class="inline-flex px-3 py-1 rounded-full text-xs font-medium" [ngClass]="getStatusClass(booking()!.status)">
              {{ booking()!.status | titlecase }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div class="bg-cream-50 rounded-xl p-4">
              <div class="text-xs uppercase tracking-wider text-charcoal-400 mb-1">Treatment</div>
              <div class="font-semibold text-black">{{ booking()!.services }}</div>
            </div>
            <div class="bg-cream-50 rounded-xl p-4">
              <div class="text-xs uppercase tracking-wider text-charcoal-400 mb-1">Date & Time</div>
              <div class="font-semibold text-black">{{ booking()!.scheduled_date | date:'longDate' }} at {{ booking()!.start_time }}</div>
            </div>
            <div class="bg-cream-50 rounded-xl p-4">
              <div class="text-xs uppercase tracking-wider text-charcoal-400 mb-1">Specialist</div>
              <div class="font-semibold text-black">{{ booking()!.employee_name }}</div>
            </div>
            <div class="bg-cream-50 rounded-xl p-4">
              <div class="text-xs uppercase tracking-wider text-charcoal-400 mb-1">Location</div>
              <div class="font-semibold text-black">{{ booking()!.location_name }}</div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-charcoal-100">
            <div>
              <div class="text-xs text-charcoal-400 uppercase">Total</div>
              <div class="text-xl font-bold text-black">JMD $ {{ booking()!.total_amount_jmd | number }}</div>
            </div>
            @if (booking()!.payment_status === 'unpaid' || booking()!.payment_status === 'failed') {
              <a [routerLink]="['/pay', booking()!.id]" class="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white font-bold rounded-lg text-sm">
                Pay Now
              </a>
            }
          </div>
        </div>
      } @else {
        <div class="text-center py-16">
          <mat-icon class="!text-5xl text-charcoal-300 mb-3">event_busy</mat-icon>
          <h2 class="text-xl font-heading text-black mb-2">Appointment Not Found</h2>
          <a routerLink="/customer/bookings" class="text-gold-600 hover:underline text-sm">Return to appointments</a>
        </div>
      }
    </div>
  `
})
export class CustomerBookingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  booking = signal<Appointment | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) {
        this.loading.set(false);
        return;
      }
      this.api.getBookingById(id).subscribe({
        next: res => {
          this.booking.set(res.data ?? null);
          this.loading.set(false);
        },
        error: () => {
          this.booking.set(null);
          this.loading.set(false);
        }
      });
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-charcoal-100 text-gray-800';
      case 'cancelled':
      case 'no_show': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
