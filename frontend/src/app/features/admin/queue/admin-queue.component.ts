import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { ApiService } from '../../../core/services/api.service';
import { RealtimeService } from '../../../core/services/realtime.service';
import { environment } from '../../../../environments/environment';

type QueueStatus = 'pending' | 'confirmed' | 'checked_in' | 'in_treatment' | 'completed' | 'cancelled' | 'no_show';

interface QueueBooking {
  id: number;
  status: QueueStatus;
  appointment_date: string;
  appointment_time: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
  service_name?: string;
  confirmation_code?: string;
  employee_first_name?: string;
  employee_last_name?: string;
  location_name?: string;
  service_duration_minutes?: number;
  updated_at?: string;
}

@Component({
  selector: 'app-admin-queue',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-white text-slate-800 p-6 md:p-8 font-sans">

      <!-- Top Search & Actions -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div class="flex flex-1 max-w-xl gap-2">
          <div class="relative flex-1">
            <mat-icon class="absolute left-4 top-3.5 !text-xl text-slate-500">search</mat-icon>
            <input type="text"
                   [(ngModel)]="searchQuery"
                   (keydown.enter)="applySearch()"
                   placeholder="Search patient, phone, or ID..."
                   class="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-md text-sm font-semibold text-black placeholder-slate-500 focus:outline-none focus:border-slate-400 transition-all">
          </div>
          <button
            type="button"
            (click)="applySearch()"
            class="px-5 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-slate-800 transition-colors shrink-0">
            Search
          </button>
        </div>

        <div class="flex items-center gap-3 self-end lg:self-auto">
          <button
            type="button"
            (click)="fetchAppointments()"
            [disabled]="loading()"
            class="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50">
            <mat-icon class="!text-sm" [class.animate-spin]="loading()">refresh</mat-icon>
            Refresh
          </button>
          <span class="text-xs text-slate-500 font-medium">{{ todayLabel }}</span>
        </div>
      </div>

      @if (error()) {
        <div class="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <mat-icon class="!text-lg">error</mat-icon>
          {{ error() }}
        </div>
      }

      <!-- Top Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white border border-slate-200 p-5 rounded-lg flex flex-col justify-between h-32">
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Currently Waiting</div>
          <div class="text-5xl font-black text-amber-500 tracking-tight">{{ waitingCount() | number:'2.0-0' }}</div>
          <div class="text-xs text-slate-500 font-medium">Confirmed / pending arrivals</div>
        </div>

        <div class="bg-white border border-slate-200 p-5 rounded-lg flex flex-col justify-between h-32">
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Checked In</div>
          <div class="text-5xl font-black text-cyan-500 tracking-tight">{{ checkedInCount() | number:'2.0-0' }}</div>
          <div class="text-xs text-slate-500 font-medium">Ready for treatment</div>
        </div>

        <div class="bg-white border border-slate-200 p-5 rounded-lg flex flex-col justify-between h-32">
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">In Treatment</div>
          <div class="text-5xl font-black text-indigo-500 tracking-tight">{{ inTreatmentCount() | number:'2.0-0' }}</div>
          <div class="text-xs text-slate-500 font-medium">Active sessions</div>
        </div>

        <div class="bg-white border border-slate-200 p-5 rounded-lg flex flex-col justify-between h-32">
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Capacity</div>
          <div class="text-5xl font-black text-black tracking-tight">{{ capacityPercent() }}%</div>
          <div class="w-full bg-slate-100 h-1.5 mt-2 rounded-full overflow-hidden">
            <div class="bg-black h-full transition-all duration-300" [style.width.%]="capacityPercent()"></div>
          </div>
        </div>
      </div>

      <!-- Live Queue -->
      <div class="bg-white border border-slate-200 rounded-lg mb-8">
        <div class="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200">
          <h2 class="text-xl font-semibold text-black tracking-tight">Live Queue</h2>
          <div class="flex items-center gap-2 flex-wrap">
            @for (f of statusFilters; track f.value) {
              <button
                type="button"
                (click)="setStatusFilter(f.value)"
                class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-colors"
                [class.bg-black]="statusFilter() === f.value"
                [class.text-white]="statusFilter() === f.value"
                [class.border-black]="statusFilter() === f.value"
                [class.bg-white]="statusFilter() !== f.value"
                [class.text-slate-600]="statusFilter() !== f.value"
                [class.border-slate-300]="statusFilter() !== f.value">
                {{ f.label }}
              </button>
            }
          </div>
        </div>

        <div class="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <div class="col-span-4">Patient Details</div>
          <div class="col-span-2">Appointment</div>
          <div class="col-span-2">Service</div>
          <div class="col-span-1">Location</div>
          <div class="col-span-3 text-right">Status Control</div>
        </div>

        <div class="divide-y divide-slate-200">
          @if (loading() && filteredQueue().length === 0) {
            <div class="px-6 py-16 text-center text-slate-500 text-sm">Loading today's queue…</div>
          } @else if (filteredQueue().length === 0) {
            <div class="px-6 py-16 text-center text-slate-500 text-sm">
              No appointments in the queue{{ searchTerm() ? ' matching your search' : ' for today' }}.
            </div>
          } @else {
            @for (item of filteredQueue(); track item.id) {
              <div
                class="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors"
                [class.bg-blue-50]="item.status === 'in_treatment'"
                [class.border-l-2]="item.status === 'in_treatment'"
                [class.border-blue-500]="item.status === 'in_treatment'">

                <div class="md:col-span-4 flex items-center gap-4">
                  <div class="w-10 h-10 rounded bg-black text-white font-bold flex items-center justify-center shrink-0 text-sm">
                    {{ initials(item) }}
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-semibold text-black truncate">{{ fullName(item) }}</div>
                    <div class="text-[10px] text-slate-500 font-mono">
                      ID: #{{ item.confirmation_code || item.id }}
                      @if (item.customer_phone) {
                        · {{ item.customer_phone }}
                      }
                    </div>
                  </div>
                </div>

                <div class="md:col-span-2 text-xs font-medium text-slate-700">
                  {{ formatTime(item.appointment_time) }}
                  @if (isLate(item)) {
                    <span class="ml-2 text-[9px] font-bold uppercase text-red-600">Late</span>
                  }
                </div>

                <div class="md:col-span-2">
                  <span class="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-[10px] rounded border border-slate-300">
                    {{ item.service_name || 'Service' }}
                  </span>
                </div>

                <div class="md:col-span-1 text-[10px] text-slate-500 font-medium truncate">
                  {{ item.location_name || '—' }}
                </div>

                <div class="md:col-span-3 flex items-center justify-start md:justify-end gap-2 flex-wrap">
                  <div class="flex rounded-full overflow-hidden border border-slate-300 bg-white">
                    <button
                      type="button"
                      class="px-3 py-1 text-[9px] font-bold transition-colors"
                      [class.bg-amber-400]="isWaiting(item.status)"
                      [class.text-black]="isWaiting(item.status)"
                      [class.text-slate-400]="!isWaiting(item.status)"
                      disabled>
                      Waiting
                    </button>
                    <button
                      type="button"
                      (click)="setStatus(item, 'checked_in')"
                      [disabled]="!canAdvance(item, 'checked_in') || updatingId() === item.id"
                      class="px-3 py-1 text-[9px] font-bold transition-colors disabled:opacity-40"
                      [class.bg-cyan-400]="item.status === 'checked_in'"
                      [class.text-black]="item.status === 'checked_in' || canAdvance(item, 'checked_in')"
                      [class.text-slate-400]="item.status !== 'checked_in' && !canAdvance(item, 'checked_in')"
                      [class.hover:bg-cyan-100]="canAdvance(item, 'checked_in')">
                      Check-in
                    </button>
                    <button
                      type="button"
                      (click)="setStatus(item, 'in_treatment')"
                      [disabled]="!canAdvance(item, 'in_treatment') || updatingId() === item.id"
                      class="px-3 py-1 text-[9px] font-bold transition-colors disabled:opacity-40"
                      [class.bg-blue-500]="item.status === 'in_treatment'"
                      [class.text-white]="item.status === 'in_treatment'"
                      [class.text-black]="item.status !== 'in_treatment' && canAdvance(item, 'in_treatment')"
                      [class.text-slate-400]="item.status !== 'in_treatment' && !canAdvance(item, 'in_treatment')"
                      [class.hover:bg-blue-100]="canAdvance(item, 'in_treatment')">
                      Treatment
                    </button>
                    <button
                      type="button"
                      (click)="setStatus(item, 'completed')"
                      [disabled]="!canAdvance(item, 'completed') || updatingId() === item.id"
                      class="px-3 py-1 text-[9px] font-bold transition-colors disabled:opacity-40"
                      [class.bg-emerald-500]="item.status === 'completed'"
                      [class.text-white]="item.status === 'completed'"
                      [class.text-black]="item.status !== 'completed' && canAdvance(item, 'completed')"
                      [class.text-slate-400]="item.status !== 'completed' && !canAdvance(item, 'completed')"
                      [class.hover:bg-emerald-100]="canAdvance(item, 'completed')">
                      Done
                    </button>
                  </div>

                  @if (isWaiting(item.status)) {
                    <button
                      type="button"
                      (click)="setStatus(item, 'no_show')"
                      [disabled]="updatingId() === item.id"
                      class="px-2 py-1 text-[9px] font-bold uppercase text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-40"
                      title="Mark as no-show">
                      No-show
                    </button>
                  }
                </div>
              </div>
            }
          }
        </div>
      </div>

      <!-- Alerts & Staff -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white border border-slate-200 rounded-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-black">Queue Alerts</h3>
            @if (alerts().length > 0) {
              <span class="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black tracking-wider rounded">
                {{ alerts().length }} ALERT{{ alerts().length === 1 ? '' : 'S' }}
              </span>
            }
          </div>

          <div class="space-y-4">
            @if (alerts().length === 0) {
              <p class="text-sm text-slate-500">No alerts right now — queue is on track.</p>
            } @else {
              @for (alert of alerts(); track alert.id) {
                <div class="bg-white border-l-4 p-4 rounded-r-lg flex gap-4"
                     [class.border-red-500]="alert.level === 'urgent'"
                     [class.border-amber-400]="alert.level === 'warn'">
                  <mat-icon class="!text-xl mt-0.5"
                            [class.text-red-500]="alert.level === 'urgent'"
                            [class.text-amber-500]="alert.level === 'warn'">
                    {{ alert.level === 'urgent' ? 'warning_amber' : 'schedule' }}
                  </mat-icon>
                  <div>
                    <div class="text-sm font-semibold text-black">{{ alert.title }}</div>
                    <div class="text-xs font-mono text-slate-500 mt-1">{{ alert.detail }}</div>
                  </div>
                </div>
              }
            }
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-black mb-6">Today's Specialists</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            @if (staffOnDuty().length === 0) {
              <p class="text-sm text-slate-500 col-span-2">No specialists assigned on today's queue yet.</p>
            } @else {
              @for (staff of staffOnDuty(); track staff.name) {
                <div class="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3">
                  <div class="relative">
                    <div class="w-10 h-10 rounded bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                      {{ staff.initials }}
                    </div>
                    <span class="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                          [class.bg-cyan-400]="staff.active > 0"
                          [class.bg-slate-300]="staff.active === 0"></span>
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-black">{{ staff.name }}</div>
                    <div class="text-[9px] font-bold uppercase tracking-wider"
                         [class.text-cyan-600]="staff.active > 0"
                         [class.text-slate-500]="staff.active === 0">
                      {{ staff.active > 0 ? (staff.active + ' in treatment') : (staff.total + ' booked') }}
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminQueueComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private authState = inject(AuthStateService);
  private api = inject(ApiService);
  private realtime = inject(RealtimeService);

  private sub?: Subscription;
  private pollTimer?: ReturnType<typeof setInterval>;

  searchQuery = '';
  searchTerm = signal('');
  statusFilter = signal<'active' | 'all' | QueueStatus>('active');
  loading = signal(false);
  error = signal('');
  updatingId = signal<number | null>(null);
  bookings = signal<QueueBooking[]>([]);

  readonly statusFilters: { label: string; value: 'active' | 'all' | QueueStatus }[] = [
    { label: 'Active', value: 'active' },
    { label: 'All Today', value: 'all' },
    { label: 'Waiting', value: 'confirmed' },
    { label: 'Checked In', value: 'checked_in' },
    { label: 'Treatment', value: 'in_treatment' },
    { label: 'Done', value: 'completed' },
  ];

  todayLabel = new Date().toLocaleDateString('en-JM', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  private todayStr = this.localDateString(new Date());

  todaysBookings = computed(() =>
    this.bookings().filter((b) => b.appointment_date === this.todayStr),
  );

  waitingCount = computed(() =>
    this.todaysBookings().filter((b) => this.isWaiting(b.status)).length,
  );

  checkedInCount = computed(() =>
    this.todaysBookings().filter((b) => b.status === 'checked_in').length,
  );

  inTreatmentCount = computed(() =>
    this.todaysBookings().filter((b) => b.status === 'in_treatment').length,
  );

  capacityPercent = computed(() => {
    const active = this.waitingCount() + this.checkedInCount() + this.inTreatmentCount();
    const total = this.todaysBookings().filter(
      (b) => !['cancelled', 'no_show'].includes(b.status),
    ).length;
    if (total === 0) return 0;
    return Math.min(100, Math.round((active / total) * 100));
  });

  filteredQueue = computed(() => {
    const filter = this.statusFilter();
    const q = this.searchTerm().trim().toLowerCase();
    let list = this.todaysBookings();

    if (filter === 'active') {
      list = list.filter((b) =>
        ['pending', 'confirmed', 'checked_in', 'in_treatment'].includes(b.status),
      );
    } else if (filter === 'confirmed') {
      list = list.filter((b) => this.isWaiting(b.status));
    } else if (filter !== 'all') {
      list = list.filter((b) => b.status === filter);
    }

    if (q) {
      const qDigits = this.digitsOnly(q);
      list = list.filter((b) => {
        const name = this.fullName(b).toLowerCase();
        const id = String(b.confirmation_code || b.id).toLowerCase();
        const service = (b.service_name || '').toLowerCase();
        const phone = this.digitsOnly(b.customer_phone || '');
        const phoneMatch = qDigits.length >= 3 && phone.includes(qDigits);
        return name.includes(q) || id.includes(q) || service.includes(q) || phoneMatch;
      });
    }

    return [...list].sort((a, b) =>
      String(a.appointment_time || '').localeCompare(String(b.appointment_time || '')),
    );
  });

  alerts = computed(() => {
    const now = new Date();
    const items: { id: string; level: 'urgent' | 'warn'; title: string; detail: string }[] = [];

    for (const b of this.todaysBookings()) {
      if (!this.isWaiting(b.status) || !this.isLate(b, now)) continue;
      items.push({
        id: `late-${b.id}`,
        level: 'urgent',
        title: `${this.fullName(b)} delayed`,
        detail: `Appointment ${this.formatTime(b.appointment_time)} — still not checked in.`,
      });
    }

    if (this.waitingCount() >= 8) {
      items.push({
        id: 'wait-high',
        level: 'warn',
        title: 'Waiting list is getting long',
        detail: `${this.waitingCount()} patients waiting. Consider opening another room.`,
      });
    }

    return items.slice(0, 6);
  });

  staffOnDuty = computed(() => {
    const map = new Map<string, { name: string; initials: string; total: number; active: number }>();
    for (const b of this.todaysBookings()) {
      if (['cancelled', 'no_show'].includes(b.status)) continue;
      const name = `${b.employee_first_name || ''} ${b.employee_last_name || ''}`.trim() || 'Unassigned';
      const existing = map.get(name) || {
        name,
        initials: name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((p) => p[0]?.toUpperCase() || '')
          .join('') || '?',
        total: 0,
        active: 0,
      };
      existing.total += 1;
      if (b.status === 'in_treatment') existing.active += 1;
      map.set(name, existing);
    }
    return [...map.values()].sort((a, b) => b.active - a.active || b.total - a.total);
  });

  ngOnInit() {
    this.fetchAppointments();
    this.sub = this.realtime.bookingEvents$.subscribe(() => this.fetchAppointments(true));
    this.pollTimer = setInterval(() => this.fetchAppointments(true), 30000);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  applySearch() {
    this.searchTerm.set(this.searchQuery || '');
  }

  setStatusFilter(value: 'active' | 'all' | QueueStatus) {
    this.statusFilter.set(value);
  }

  fetchAppointments(silent = false) {
    if (!silent) this.loading.set(true);
    this.error.set('');
    const headers = { Authorization: `Bearer ${this.authState.token()}` };
    this.http.get<{ success: boolean; data: QueueBooking[] }>(
      `${environment.apiUrl}/admin/bookings`,
      { headers },
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.bookings.set(res.data || []);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load queue', err);
        this.error.set(err?.error?.message || 'Failed to load check-in queue.');
        this.loading.set(false);
      },
    });
  }

  setStatus(item: QueueBooking, status: QueueStatus) {
    if (this.updatingId() === item.id) return;
    this.updatingId.set(item.id);
    this.error.set('');

    this.api.updateBookingStatus(item.id, status).subscribe({
      next: () => {
        this.bookings.update((list) =>
          list.map((b) => (b.id === item.id ? { ...b, status } : b)),
        );
        this.updatingId.set(null);
      },
      error: (err) => {
        console.error('Status update failed', err);
        this.error.set(err?.error?.message || 'Could not update appointment status.');
        this.updatingId.set(null);
        this.fetchAppointments(true);
      },
    });
  }

  isWaiting(status: QueueStatus) {
    return status === 'pending' || status === 'confirmed';
  }

  canAdvance(item: QueueBooking, next: QueueStatus): boolean {
    if (item.status === next) return false;
    if (next === 'checked_in') return this.isWaiting(item.status);
    if (next === 'in_treatment') return item.status === 'checked_in';
    if (next === 'completed') return item.status === 'in_treatment';
    return false;
  }

  fullName(item: QueueBooking) {
    return `${item.customer_first_name || ''} ${item.customer_last_name || ''}`.trim() || 'Guest';
  }

  initials(item: QueueBooking) {
    const first = item.customer_first_name?.[0] || '';
    const last = item.customer_last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  }

  formatTime(time?: string) {
    if (!time) return '—';
    const [hStr, mStr] = String(time).split(':');
    let h = Number(hStr);
    const m = mStr || '00';
    if (Number.isNaN(h)) return time;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m.slice(0, 2)} ${ampm}`;
  }

  isLate(item: QueueBooking, now = new Date()) {
    if (!this.isWaiting(item.status) || !item.appointment_time) return false;
    const [h, m] = String(item.appointment_time).split(':').map(Number);
    if (Number.isNaN(h)) return false;
    const appt = new Date(now);
    appt.setHours(h, m || 0, 0, 0);
    return now.getTime() - appt.getTime() > 10 * 60 * 1000;
  }

  private digitsOnly(value: string) {
    return String(value || '').replace(/\D/g, '');
  }

  private localDateString(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
