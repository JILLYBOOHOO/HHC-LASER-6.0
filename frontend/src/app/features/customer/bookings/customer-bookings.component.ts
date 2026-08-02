import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { Appointment } from '../../../core/models/models';

@Component({
  selector: 'app-customer-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-heading text-black">My Appointments</h1>
          <p class="text-neutral-600 mt-1">Manage your upcoming and past bookings.</p>
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (booking of bookings(); track booking.id) {
            <div class="card p-6 flex flex-col justify-between" [ngClass]="{'opacity-60': isPast(booking)}">
              <div>
                <div class="flex justify-between items-start mb-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="getStatusClass(booking.status)">
                      {{ booking.status | titlecase }}
                    </span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="getPaymentStatusClass(booking.payment_status)">
                      {{ (booking.payment_status || 'unpaid').replace('_', ' ') | titlecase }}
                    </span>
                  </div>
                  <span class="text-xs font-semibold text-charcoal-400">#{{ booking.id }}</span>
                </div>
                
                <h3 class="text-lg font-bold text-gray-50 mb-1">
                  {{ $any(booking).services || 'Appointment' }}
                </h3>
                <div class="text-sm text-charcoal-500 mb-4 flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <mat-icon class="!text-sm text-gold-500">calendar_today</mat-icon>
                    {{ booking.scheduled_date | date:'longDate' }} at {{ booking.start_time }}
                  </div>
                  <div class="flex items-center gap-2">
                    <mat-icon class="!text-sm text-gold-500">location_on</mat-icon>
                    {{ $any(booking).location_name || 'Location TBD' }}
                  </div>
                  <div class="flex items-center gap-2">
                    <mat-icon class="!text-sm text-gold-500">person</mat-icon>
                    {{ $any(booking).employee_name || 'Specialist' }}
                  </div>
                </div>
              </div>
              
              <div class="pt-4 border-t border-charcoal-100 flex justify-between items-center mt-4">
                <div class="text-gray-50 font-semibold">
                  JMD $ {{ booking.total_amount_jmd | number }}
                </div>
                
                <div class="flex items-center gap-3">
                  @if (booking.payment_status === 'unpaid' || booking.payment_status === 'failed') {
                    <a [routerLink]="['/pay', booking.id]" class="text-sm px-3 py-1 bg-gold-500 hover:bg-gold-600 text-white font-bold rounded shadow-sm">
                      Pay Now
                    </a>
                  }
                  @if (booking.status === 'pending' || booking.status === 'confirmed') {
                    <button class="text-sm text-red-600 font-medium hover:underline">Cancel</button>
                  }
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-charcoal-100">
              <mat-icon class="!text-4xl text-charcoal-300 mb-3">event_busy</mat-icon>
              <h3 class="text-lg font-medium text-gray-50">No appointments found</h3>
              <p class="text-charcoal-500 mt-1 mb-6">You don't have any bookings history yet.</p>
              <a routerLink="/services" class="btn-primary inline-flex">Book your first treatment</a>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class CustomerBookingsComponent implements OnInit {
  private api = inject(ApiService);
  
  bookings = signal<Appointment[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.api.getMyBookings(1, 50).subscribe({
      next: (res: any) => {
        // Assume res is paginated or direct array based on API format.
        // Looking at api.service.ts, the response type is ApiResponse<Appointment[]>
        // but backend returns paginated format. If it has .data directly or .data is array.
        // Let's handle both.
        const data = res as any;
        if (data && data.data && Array.isArray(data.data)) {
          this.bookings.set(data.data);
        } else if (data && data.data && Array.isArray(data.data.items)) {
          this.bookings.set(data.data.items);
        } else {
          this.bookings.set([]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  isPast(booking: Appointment): boolean {
    return new Date(booking.scheduled_date) < new Date();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-charcoal-100 text-gray-50';
      case 'cancelled':
      case 'no_show': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getPaymentStatusClass(status: string | undefined): string {
    switch (status) {
      case 'paid_online':
      case 'paid_in_store': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'pending_online': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'failed': return 'bg-rose-100 text-rose-800 border border-rose-200';
      case 'refunded': return 'bg-slate-100 text-slate-800 border border-slate-200';
      case 'unpaid':
      default: return 'bg-amber-100 text-amber-800 border border-amber-200';
    }
  }
}
