import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { environment } from '../../../../environments/environment';
import { getContactMessages, ContactMessage, CONTACT_MESSAGES_KEY } from '../../../core/services/contact-messages';
import { InternalBookingModalComponent } from '../../../shared/components/internal-booking-modal/internal-booking-modal.component';

export interface TodayScheduleItem {
  id: string;
  time: string;
  patientName: string;
  serviceName: string;
  specialistName: string;
  locationName: string;
  locationClass: string;
  status: string;
  statusClass: string;
  rawDate: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatButtonModule, InternalBookingModalComponent],
  template: `
    <div class="p-4 max-w-7xl mx-auto space-y-4 font-sans text-slate-800">

      <!-- Admin Dashboard Header / Fast Controls Toolbar -->
      <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <!-- Location filter tabs -->
        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 w-full md:w-auto">
          <button type="button" (click)="selectedLocation = 'all'" 
                  [class.bg-white]="selectedLocation === 'all'"
                  [class.shadow-sm]="selectedLocation === 'all'"
                  [class.text-slate-900]="selectedLocation === 'all'"
                  [class.text-slate-500]="selectedLocation !== 'all'"
                  class="flex-1 md:flex-none px-3 py-1.5 text-xs font-black rounded-md transition-all uppercase tracking-wider">
            All Locations
          </button>
          <button type="button" (click)="selectedLocation = 'mannings'" 
                  [class.bg-white]="selectedLocation === 'mannings'"
                  [class.shadow-sm]="selectedLocation === 'mannings'"
                  [class.text-slate-900]="selectedLocation === 'mannings'"
                  [class.text-slate-500]="selectedLocation !== 'mannings'"
                  class="flex-1 md:flex-none px-3 py-1.5 text-xs font-black rounded-md transition-all uppercase tracking-wider whitespace-nowrap">
            Mannings Hill
          </button>
          <button type="button" (click)="selectedLocation = 'constant'" 
                  [class.bg-white]="selectedLocation === 'constant'"
                  [class.shadow-sm]="selectedLocation === 'constant'"
                  [class.text-slate-900]="selectedLocation === 'constant'"
                  [class.text-slate-500]="selectedLocation !== 'constant'"
                  class="flex-1 md:flex-none px-3 py-1.5 text-xs font-black rounded-md transition-all uppercase tracking-wider whitespace-nowrap">
            Constant Spring
          </button>
        </div>

        <!-- Date navigator -->
        <div class="flex items-center gap-2">
          <button type="button" class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><mat-icon class="!text-lg">chevron_left</mat-icon></button>
          <span class="text-xs font-black tracking-wide text-slate-800 uppercase flex items-center gap-1.5">
            <mat-icon class="!text-sm text-[#b8924f]">calendar_today</mat-icon>
            {{ todayDate | date:'mediumDate' }}
          </span>
          <button type="button" class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><mat-icon class="!text-lg">chevron_right</mat-icon></button>
        </div>

        <!-- Fast Actions & Search -->
        <div class="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap sm:flex-nowrap">
          <div class="relative w-full sm:w-48">
            <mat-icon class="absolute left-3 top-2.5 !text-base text-slate-400">search</mat-icon>
            <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="onSearch()"
                   placeholder="Patient or Confirm #..."
                   class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-slate-800 text-slate-900 placeholder:text-slate-400">
          </div>
          <button type="button" (click)="openBookingModal()"
                  class="px-3 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0 shadow-sm">
            <mat-icon class="!text-sm text-[#B36A17]">add_circle</mat-icon>
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      <!-- 4 Compact Metric Cards (Streamlined Height for Single Screen Layout) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Revenue Card -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-sm border border-purple-400/20 flex items-center justify-between h-20 group hover:scale-[1.01] transition-transform">
          <div>
            <div class="text-[10px] font-extrabold text-purple-200 uppercase tracking-widest">Total Revenue</div>
            <div class="text-xl font-black mt-0.5 tracking-tight">$2,516,120.00</div>
          </div>
          <div class="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0">
            <mat-icon class="!text-lg text-purple-200">attach_money</mat-icon>
          </div>
        </div>

        <!-- Appointments Card -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-sm border border-emerald-400/20 flex items-center justify-between h-20 group hover:scale-[1.01] transition-transform">
          <div>
            <div class="text-[10px] font-extrabold text-emerald-100 uppercase tracking-widest">Appointments</div>
            <div class="text-xl font-black mt-0.5 tracking-tight">{{ todayAppointmentCount() }}</div>
          </div>
          <div class="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0">
            <mat-icon class="!text-lg text-emerald-100">calendar_today</mat-icon>
          </div>
        </div>

        <!-- Patients Card -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-sm border border-orange-400/20 flex items-center justify-between h-20 group hover:scale-[1.01] transition-transform">
          <div>
            <div class="text-[10px] font-extrabold text-orange-100 uppercase tracking-widest">Total Patients</div>
            <div class="text-xl font-black mt-0.5 tracking-tight">{{ totalPatientsCount() }}</div>
          </div>
          <div class="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0">
            <mat-icon class="!text-lg text-orange-100">people</mat-icon>
          </div>
        </div>

        <!-- Pending Transactions Card -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-700 text-white shadow-sm border border-blue-400/20 flex items-center justify-between h-20 group hover:scale-[1.01] transition-transform">
          <div>
            <div class="text-[10px] font-extrabold text-blue-100 uppercase tracking-widest">Pending Transactions</div>
            <div class="text-xl font-black mt-0.5 tracking-tight">{{ pendingCount() }} pending</div>
          </div>
          <div class="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0">
            <mat-icon class="!text-lg text-blue-100">payment</mat-icon>
          </div>
        </div>
      </div>

      <!-- Main Operational Split Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        <!-- Left: Real-time Schedule Calendar View (2/3 width) -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-2">
              <mat-icon class="text-cyan-600 !text-lg">schedule</mat-icon>
              <span class="font-extrabold text-sm text-slate-800 tracking-tight">Today's Appointment Schedule</span>
            </div>
            <span class="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live View
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th class="py-2.5 px-4 w-24">Time</th>
                  <th class="py-2.5 px-4">Patient</th>
                  <th class="py-2.5 px-4">Service</th>
                  <th class="py-2.5 px-4">Specialist</th>
                  <th class="py-2.5 px-4">Location</th>
                  <th class="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700 font-bold">
                <tr *ngFor="let appt of filteredAppointments()" class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-2.5 px-4 text-slate-900 font-black whitespace-nowrap">{{ appt.time }}</td>
                  <td class="py-2.5 px-4 font-extrabold text-slate-900">{{ appt.patientName }}</td>
                  <td class="py-2.5 px-4 text-slate-600 font-semibold">{{ appt.serviceName }}</td>
                  <td class="py-2.5 px-4 text-slate-600 font-semibold">{{ appt.specialistName }}</td>
                  <td class="py-2.5 px-4">
                    <span class="text-[10px] px-2.5 py-0.5 rounded-full font-extrabold whitespace-nowrap" [ngClass]="appt.locationClass">
                      {{ appt.locationName }}
                    </span>
                  </td>
                  <td class="py-2.5 px-4">
                    <span class="px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase whitespace-nowrap" [ngClass]="appt.statusClass">
                      {{ appt.status }}
                    </span>
                  </td>
                </tr>

                <tr *ngIf="filteredAppointments().length === 0">
                  <td colspan="6" class="py-8 text-center text-slate-400 text-xs font-bold">
                    No appointments scheduled for today.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Recent Activity & Submissions (1/3 width) -->
        <div class="space-y-4">
          <!-- Recent Activity Widget -->
          <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-sm text-slate-800 tracking-tight">Recent Activity</span>
              <button type="button" class="text-[10px] font-black text-cyan-600 hover:text-cyan-800 uppercase tracking-wider">View all</button>
            </div>
            <div class="space-y-2 text-xs">
              <div *ngFor="let act of recentActivities()" class="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" [ngClass]="act.iconBg">
                  <mat-icon class="!text-base">{{ act.icon }}</mat-icon>
                </div>
                <div>
                  <div class="font-extrabold text-slate-800">{{ act.title }}</div>
                  <div class="text-[10px] font-bold text-slate-500">{{ act.sub }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form Submissions Widget -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div class="flex items-center gap-2">
                <mat-icon class="text-amber-500 !text-lg">mail</mat-icon>
                <span class="font-extrabold text-sm text-slate-800 tracking-tight">
                  Form Submissions
                  <span *ngIf="unreadCount() > 0" class="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full">{{ unreadCount() }} NEW</span>
                </span>
              </div>
              <button type="button" (click)="clearAll()" class="text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider">Clear</button>
            </div>

            <div *ngIf="messages().length === 0" class="py-8 text-center text-slate-400 text-xs font-bold">
              <mat-icon class="!text-3xl text-slate-200 block mx-auto mb-1">inbox</mat-icon>
              No submissions.
            </div>

            <div *ngIf="messages().length > 0" class="divide-y divide-slate-100 max-h-48 overflow-y-auto custom-scrollbar">
              <div *ngFor="let msg of messages()" class="px-4 py-2.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                   [class.bg-blue-50]="!msg.read"
                   (click)="markRead(msg)">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-black font-black text-xs flex-shrink-0"
                     style="background: linear-gradient(135deg, #D6B36A, #b8924f);">
                  {{ msg.name.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1">
                    <span class="font-extrabold text-xs text-slate-800 truncate">{{ msg.name }}</span>
                    <span class="text-[9px] font-bold text-slate-400 whitespace-nowrap">{{ formatTime(msg.timestamp) }}</span>
                  </div>
                  <p class="text-xs text-slate-600 truncate">{{ msg.message }}</p>
                </div>
                <button type="button" (click)="deleteMsg($event, msg.id)" class="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0">
                  <mat-icon class="!text-base">delete_outline</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <app-internal-booking-modal *ngIf="showBookingModal" (close)="closeBookingModal()"></app-internal-booking-modal>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  selectedLocation = 'all';
  todayDate = new Date();
  searchQuery = '';
  messages = signal<ContactMessage[]>([]);
  unreadCount = signal(0);
  showBookingModal = false;

  // Real-time dynamic state signals
  todayAppointments = signal<TodayScheduleItem[]>([]);
  todayAppointmentCount = signal<number>(0);
  totalPatientsCount = signal<number>(479);
  pendingCount = signal<number>(0);
  recentActivities = signal<{title: string, sub: string, icon: string, iconBg: string}[]>([]);

  private pollInterval: any;

  constructor(private http: HttpClient, private authState: AuthStateService) {}

  ngOnInit() {
    this.loadMessages();
    this.fetchDashboardData();

    // Poll every 5 seconds for real-time synchronization with calendar & backend database
    this.pollInterval = setInterval(() => {
      this.loadMessages();
      this.fetchDashboardData();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  fetchDashboardData() {
    const headers = { Authorization: `Bearer ${this.authState.token()}` };
    this.http.get<any>(`${environment.apiUrl}/admin/bookings`, { headers }).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          const todayStr = new Date().toISOString().split('T')[0];
          const allBookings = res.data;
          
          const mapped: TodayScheduleItem[] = allBookings.map((b: any) => {
            const time24 = b.appointment_time || b.start_time || '09:00';
            const [h, m] = time24.split(':').map(Number);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            const formattedTime = `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
            
            const locId = b.location_id || 1;
            const locationName = locId === 2 ? 'Constant Spring' : 'Mannings Hill';
            const locationClass = locId === 2 ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700';
            
            let statusLabel = 'SCHEDULED';
            let statusClass = 'bg-slate-100 text-slate-600';

            if (b.status === 'in_treatment') {
              statusLabel = 'IN ROOM';
              statusClass = 'bg-emerald-100 text-emerald-800';
            } else if (b.status === 'checked_in') {
              statusLabel = 'CHECKED IN';
              statusClass = 'bg-blue-100 text-blue-800';
            } else if (b.status === 'completed') {
              statusLabel = 'COMPLETED';
              statusClass = 'bg-purple-100 text-purple-800';
            } else if (b.status === 'cancelled') {
              statusLabel = 'CANCELLED';
              statusClass = 'bg-red-100 text-red-800';
            } else if (b.status === 'pending' || b.payment_status === 'pending_payment') {
              statusLabel = 'PENDING';
              statusClass = 'bg-amber-100 text-amber-800';
            }

            return {
              id: String(b.id),
              time: formattedTime,
              patientName: `${b.customer_first_name || ''} ${b.customer_last_name || ''}`.trim() || 'Patient',
              serviceName: b.service_name || 'Service',
              specialistName: b.employee_name || (locId === 2 ? 'Dr. Marcus Wright' : 'Dr. Sarah Jenkins'),
              locationName,
              locationClass,
              status: statusLabel,
              statusClass,
              rawDate: b.appointment_date || b.scheduled_date || todayStr
            };
          });

          // Show today's active appointments or fallback to latest appointments
          const todaysOnly = mapped.filter(item => item.rawDate === todayStr && item.status !== 'CANCELLED');
          const activeList = todaysOnly.length > 0 ? todaysOnly : mapped.filter(i => i.status !== 'CANCELLED').slice(0, 10);
          
          this.todayAppointments.set(activeList);
          this.todayAppointmentCount.set(activeList.length);
          this.pendingCount.set(mapped.filter(i => i.status === 'PENDING').length);

          // Generate dynamic recent activity feed from latest bookings
          const recentActs = mapped.slice(0, 3).map((item: TodayScheduleItem) => ({
            title: item.status === 'COMPLETED' ? 'Appointment completed' : (item.status === 'CANCELLED' ? 'Appointment cancelled' : 'New appointment booked'),
            sub: `${item.patientName} - ${item.serviceName}`,
            icon: item.status === 'COMPLETED' ? 'check_circle' : (item.status === 'CANCELLED' ? 'cancel' : 'calendar_today'),
            iconBg: item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : (item.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600')
          }));
          this.recentActivities.set(recentActs);
        }
      },
      error: (err) => console.error('Failed to load dashboard bookings', err)
    });
  }

  filteredAppointments(): TodayScheduleItem[] {
    const query = this.searchQuery.toLowerCase().trim();
    return this.todayAppointments().filter(item => {
      const matchLoc = this.selectedLocation === 'all' || 
                       (this.selectedLocation === 'mannings' && item.locationName === 'Mannings Hill') ||
                       (this.selectedLocation === 'constant' && item.locationName === 'Constant Spring');
      const matchSearch = !query || item.patientName.toLowerCase().includes(query) || item.serviceName.toLowerCase().includes(query);
      return matchLoc && matchSearch;
    });
  }

  openBookingModal() {
    this.showBookingModal = true;
  }

  closeBookingModal() {
    this.showBookingModal = false;
    this.fetchDashboardData();
  }

  loadMessages() {
    const msgs = getContactMessages();
    this.messages.set(msgs);
    this.unreadCount.set(msgs.filter(m => !m.read).length);
  }

  markRead(msg: ContactMessage) {
    const msgs = getContactMessages();
    const found = msgs.find(m => m.id === msg.id);
    if (found) {
      found.read = true;
      localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(msgs));
      this.loadMessages();
    }
  }

  deleteMsg(event: Event, id: string) {
    event.stopPropagation();
    const msgs = getContactMessages().filter(m => m.id !== id);
    localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(msgs));
    this.loadMessages();
  }

  clearAll() {
    localStorage.removeItem(CONTACT_MESSAGES_KEY);
    this.loadMessages();
  }

  formatTime(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString();
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      console.log(`Searching confirmation: ${this.searchQuery}`);
    }
  }
}
