import os

ts_content = """import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { WeeklyCalendarComponent, CalendarEvent } from '../../../shared/components/weekly-calendar/weekly-calendar.component';
import { InternalBookingModalComponent } from '../../../shared/components/internal-booking-modal/internal-booking-modal.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    WeeklyCalendarComponent,
    InternalBookingModalComponent,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './admin-bookings.component.html'
})
export class AdminBookingsComponent implements OnInit {
  private http = inject(HttpClient);
  private authState = inject(AuthService);

  showModal = signal(false);
  allBookings: any[] = [];
  calendarEvents: CalendarEvent[] = [];
  
  waitingCount = 0;
  checkedInCount = 0;
  inTreatmentCount = 0;
  
  waitingList: CalendarEvent[] = [];
  checkedInList: CalendarEvent[] = [];
  inTreatmentList: CalendarEvent[] = [];
  arrivalsIn30Mins: CalendarEvent[] = [];

  currentDate: Date = new Date();
  zoomLevel: number = 100;
  locations = ['All Locations', 'HHC LASER Kingston', 'Constant Spring'];
  currentLocationIdx = 0;
  activeView = 'week';

  searchControl = new FormControl('');
  searchResults: CalendarEvent[] = [];
  
  blockCategories = ['Coffee', 'Lunch', 'Meeting', 'Machine Maintenance', 'Training', 'Vacation', 'Cleaning', 'Private'];

  ngOnInit() {
    this.fetchAppointments();
    
    this.searchControl.valueChanges.subscribe(val => {
      if (!val || val.length < 2) {
        this.searchResults = [];
        return;
      }
      const q = val.toLowerCase();
      this.searchResults = this.calendarEvents.filter(ev => 
        (ev.patient || '').toLowerCase().includes(q) || 
        (ev.title || '').toLowerCase().includes(q)
      );
    });
  }

  get dateRangeText(): string {
    const start = new Date(this.currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (start.getMonth() === end.getMonth()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    } else if (start.getFullYear() === end.getFullYear()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${monthNames[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
    }
  }

  get currentMonthYear(): string {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  get currentLocation(): string {
    return this.locations[this.currentLocationIdx];
  }

  goToToday() { this.currentDate = new Date(); }
  previousWeek() { const d = new Date(this.currentDate); d.setDate(d.getDate() - 7); this.currentDate = d; }
  nextWeek() { const d = new Date(this.currentDate); d.setDate(d.getDate() + 7); this.currentDate = d; }
  toggleLocation() { this.currentLocationIdx = (this.currentLocationIdx + 1) % this.locations.length; }
  zoomIn() { if (this.zoomLevel < 200) this.zoomLevel += 10; }
  zoomOut() { if (this.zoomLevel > 50) this.zoomLevel -= 10; }
  setView(view: string) { this.activeView = view; }

  addBlockTime(category: string) {
    // Quick mockup block time
    const block: CalendarEvent = {
      id: 'block-' + Date.now(),
      title: category,
      date: new Date().toISOString().split('T')[0],
      startTime: '12:00',
      durationMinutes: 60,
      status: 'confirmed',
      isBlockTime: true
    };
    this.calendarEvents = [...this.calendarEvents, block];
  }

  fetchAppointments() {
    const headers = { Authorization: `Bearer ${this.authState.token()}` };
    this.http.get<any>(`${environment.apiUrl}/admin/bookings`, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.allBookings = res.data;
          this.mapToCalendarEvents();
          this.calculateQueueStats();
        }
      },
      error: (err) => console.error('Failed to load appointments', err)
    });
  }

  mapToCalendarEvents() {
    this.calendarEvents = this.allBookings.map((b: any) => {
      let status: any = 'confirmed';
      if (b.status === 'checked_in') status = 'checked_in';
      if (b.status === 'in_treatment') status = 'in_treatment';
      if (b.status === 'completed') status = 'completed';
      if (b.status === 'cancelled') status = 'cancelled';
      if (b.status === 'no_show') status = 'no_show';
      
      const duration = b.service_duration_minutes || 60;
      const startTime24 = b.appointment_time || '09:00';
      const date = b.appointment_date || new Date().toISOString().split('T')[0];
      
      let paymentStatus = 'Balance Due';
      if (b.payment_status === 'paid') paymentStatus = 'Paid Online';
      else if (b.payment_status === 'partially_paid') paymentStatus = 'Pay In Person';

      return {
        id: String(b.id),
        title: b.service_name || 'Service',
        subtitle: (b.status || 'Confirmed').replace('_', ' '),
        patient: (b.customer_first_name || '') + ' ' + (b.customer_last_name || ''),
        date: date,
        startTime: startTime24,
        durationMinutes: duration,
        status: status,
        paymentStatus: paymentStatus as any,
        staffName: 'Amanda', // Mocking staff name since backend might not return it yet
        room: 'Room 1',
        data: b
      };
    });
  }

  calculateQueueStats() {
    const todayStr = new Date().toISOString().split('T')[0];
    const todays = this.calendarEvents.filter(b => b.date === todayStr && !b.isBlockTime);
    
    this.waitingList = todays.filter(b => b.status === 'confirmed');
    this.checkedInList = todays.filter(b => b.status === 'checked_in');
    this.inTreatmentList = todays.filter(b => b.status === 'in_treatment');
    
    this.waitingCount = this.waitingList.length;
    this.checkedInCount = this.checkedInList.length;
    this.inTreatmentCount = this.inTreatmentList.length;
    
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    this.arrivalsIn30Mins = this.waitingList.filter(b => {
      const [h, m] = b.startTime.split(':').map(Number);
      const apptMins = h * 60 + m;
      return apptMins >= nowMins && apptMins <= nowMins + 30;
    });
  }

  openBookingModal() { this.showModal.set(true); }
  closeBookingModal() { this.showModal.set(false); }
  onBookingCreated() { this.closeBookingModal(); this.fetchAppointments(); }

  openReschedule(event: CalendarEvent) {
    console.log('Clicked event', event);
  }
}
"""

html_content = """<div class="h-screen w-full flex flex-col bg-white overflow-hidden text-slate-800 font-sans selection:bg-[#b8924f] selection:text-white">
      
  <!-- Top Navbar (1st Row) -->
  <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shadow-xs z-20 shrink-0 h-[64px]">
    <!-- Left: Search -->
    <div class="relative w-64 md:w-80">
      <mat-icon class="absolute left-3 top-2.5 !text-[20px] text-slate-400">search</mat-icon>
      <input type="text" [formControl]="searchControl" [matAutocomplete]="auto" placeholder="Search clients, phone, booking ID, service..."
             class="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-[#b8924f] transition-all">
      <mat-autocomplete #auto="matAutocomplete">
        <mat-option *ngFor="let res of searchResults" [value]="res.patient">
          <div class="flex flex-col py-1">
            <span class="text-xs font-bold">{{ res.patient }}</span>
            <span class="text-[10px] text-slate-500">{{ res.title }} - {{ res.date }} {{ res.startTime }} ({{ res.subtitle }})</span>
          </div>
        </mat-option>
      </mat-autocomplete>
      <div class="absolute right-3 top-2.5 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-400 tracking-wider">Ctrl + F</div>
    </div>

    <!-- Center: Date Controls -->
    <div class="flex items-center gap-3">
      <button (click)="openBookingModal()" class="flex items-center gap-2 bg-[#8c6225] hover:bg-[#724e1c] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
        <mat-icon class="!text-[18px]">add</mat-icon>
        <span>New Appointment</span>
      </button>
      
      <div class="w-px h-6 bg-slate-200 mx-1"></div>
      
      <button (click)="goToToday()" class="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold transition-colors">Today</button>
      
      <div class="flex items-center gap-1">
        <button (click)="previousWeek()" class="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors"><mat-icon class="!text-[18px]">chevron_left</mat-icon></button>
        <button (click)="nextWeek()" class="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors"><mat-icon class="!text-[18px]">chevron_right</mat-icon></button>
      </div>
      
      <div class="text-sm font-extrabold tracking-tight min-w-[140px] text-center flex items-center justify-center gap-2">
        <span>{{ dateRangeText }}</span>
        <mat-icon class="!text-[16px] text-slate-400">calendar_today</mat-icon>
      </div>
    </div>

    <!-- Right: View Toggles & Filters -->
    <div class="flex items-center gap-4">
      <div class="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
        <button (click)="setView('day')" [ngClass]="activeView === 'day' ? 'font-extrabold bg-[#fef3c7] text-[#92400e] shadow-sm' : 'font-bold text-slate-600 hover:text-slate-900'" class="px-4 py-1.5 rounded-lg text-xs transition-colors">Day</button>
        <button (click)="setView('week')" [ngClass]="activeView === 'week' ? 'font-extrabold bg-[#fef3c7] text-[#92400e] shadow-sm' : 'font-bold text-slate-600 hover:text-slate-900'" class="px-4 py-1.5 rounded-lg text-xs transition-colors">Week</button>
        <button (click)="setView('month')" [ngClass]="activeView === 'month' ? 'font-extrabold bg-[#fef3c7] text-[#92400e] shadow-sm' : 'font-bold text-slate-600 hover:text-slate-900'" class="px-4 py-1.5 rounded-lg text-xs transition-colors">Month</button>
      </div>
      
      <button class="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
        <mat-icon class="!text-[16px]">filter_list</mat-icon>
        <span>Filters</span>
      </button>
    </div>
  </div>

  <!-- Second Navbar (2nd Row) -->
  <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white shadow-xs z-10 shrink-0 overflow-x-auto custom-scrollbar">
    <!-- Quick Filters -->
    <div class="flex items-center gap-3">
      <div (click)="toggleLocation()" class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-100 transition-colors">
        <span>{{ currentLocation }}</span>
        <mat-icon class="!text-[16px]">keyboard_arrow_down</mat-icon>
      </div>
      
      <div class="w-px h-4 bg-slate-200 mx-1"></div>
      
      <div class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-50 transition-colors">
        <span>Admin</span>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-50 transition-colors">
        <div class="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-[8px] text-green-700">J</div>
        <span>John</span>
      </div>
      
      <div class="w-px h-4 bg-slate-200 mx-1"></div>
      
      <!-- Quick Block Categories -->
      <div *ngFor="let cat of blockCategories" (click)="addBlockTime(cat)" class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-50 transition-colors whitespace-nowrap">
        <span>{{ cat }}</span>
      </div>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="flex-1 flex overflow-hidden">
    
    <!-- Left Sidebar (Mini Calendar & Staff) -->
    <div class="w-[240px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-full overflow-y-auto custom-scrollbar">
      
      <!-- Mini Calendar -->
      <div class="p-5 border-b border-slate-200">
        <div class="flex justify-between items-center mb-4">
          <button (click)="previousWeek()" class="p-1 hover:bg-slate-100 rounded text-slate-500"><mat-icon class="!text-[18px]">chevron_left</mat-icon></button>
          <div class="text-sm font-extrabold tracking-tight">{{ currentMonthYear }}</div>
          <button (click)="nextWeek()" class="p-1 hover:bg-slate-100 rounded text-slate-500"><mat-icon class="!text-[18px]">chevron_right</mat-icon></button>
        </div>
        <!-- (Keeping original static grid layout just for visuals) -->
        <div class="grid grid-cols-7 gap-1 text-center text-xs mb-2">
          <div class="text-[10px] font-bold text-slate-400">SU</div><div class="text-[10px] font-bold text-slate-400">MO</div>
          <div class="text-[10px] font-bold text-slate-400">TU</div><div class="text-[10px] font-bold text-slate-400">WE</div>
          <div class="text-[10px] font-bold text-slate-400">TH</div><div class="text-[10px] font-bold text-slate-400">FR</div>
          <div class="text-[10px] font-bold text-slate-400">SA</div>
        </div>
        <div class="grid grid-cols-7 gap-1 text-center text-xs font-medium">
          <div class="p-1 text-slate-300">27</div><div class="p-1 text-slate-300">28</div><div class="p-1 text-slate-300">29</div>
          <div class="p-1 text-slate-300">30</div><div class="p-1 hover:bg-slate-100 rounded cursor-pointer">1</div>
          <div class="p-1 hover:bg-slate-100 rounded cursor-pointer">2</div><div class="p-1 hover:bg-slate-100 rounded cursor-pointer">3</div>
          <div class="p-1 hover:bg-slate-100 rounded cursor-pointer">4</div><div class="p-1 hover:bg-slate-100 rounded cursor-pointer">5</div>
          <div class="p-1 hover:bg-slate-100 rounded cursor-pointer">6</div><div class="p-1 hover:bg-slate-100 rounded cursor-pointer">7</div>
          <div class="p-1 hover:bg-slate-100 rounded cursor-pointer">8</div><div class="p-1 hover:bg-slate-100 rounded cursor-pointer">9</div>
          <div class="p-1 hover:bg-slate-100 rounded cursor-pointer">10</div><div class="p-1 hover:bg-slate-100 rounded cursor-pointer">11</div>
          <div class="p-1 bg-[#8c6225] text-white rounded font-bold cursor-pointer shadow-sm">12</div>
          <div class="p-1 font-bold text-slate-900">13</div><div class="p-1 font-bold text-slate-900">14</div>
          <div class="p-1 font-bold text-slate-900">15</div><div class="p-1 font-bold text-slate-900">16</div>
          <div class="p-1 font-bold text-slate-900">17</div><div class="p-1 hover:bg-slate-100 rounded cursor-pointer">18</div>
          <div class="p-1 hover:bg-slate-100 rounded cursor-pointer">19</div><div class="p-1 hover:bg-slate-100 rounded cursor-pointer">20</div>
          <div class="p-1 hover:bg-slate-100 rounded cursor-pointer">21</div><div class="p-1 hover:bg-slate-100 rounded cursor-pointer">22</div>
          <div class="p-1 hover:bg-slate-100 rounded cursor-pointer">23</div><div class="p-1 hover:bg-slate-100 rounded cursor-pointer">24</div>
          <div class="p-1 hover:bg-slate-100 rounded cursor-pointer">25</div><div class="p-1 hover:bg-slate-100 rounded cursor-pointer">26</div>
          <div class="p-1 hover:bg-slate-100 rounded cursor-pointer">27</div><div class="p-1 hover:bg-slate-100 rounded cursor-pointer">28</div>
          <div class="p-1 hover:bg-slate-100 rounded cursor-pointer">29</div><div class="p-1 hover:bg-slate-100 rounded cursor-pointer">30</div>
          <div class="p-1 hover:bg-slate-100 rounded cursor-pointer">31</div>
        </div>
      </div>
    </div>

    <!-- Center Calendar Grid -->
    <div class="flex-1 relative h-full overflow-x-auto overflow-y-auto custom-scrollbar">
      
      <!-- Zoom Controls -->
      <div class="absolute bottom-4 right-4 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center text-xs font-bold text-slate-700 z-50">
        <button (click)="zoomOut()" class="px-3 py-1.5 hover:bg-slate-50 transition-colors border-r border-slate-200 flex items-center gap-1"><mat-icon class="!text-[14px]">remove</mat-icon> Zoom</button>
        <div class="px-3 py-1.5 border-r border-slate-200">{{ zoomLevel }}%</div>
        <button (click)="zoomIn()" class="px-3 py-1.5 hover:bg-slate-50 transition-colors flex items-center gap-1"><mat-icon class="!text-[14px]">add</mat-icon> Zoom</button>
      </div>

      <div class="min-w-[700px] h-full" [style.zoom]="zoomLevel / 100">
        <app-weekly-calendar [startDate]="currentDate" [events]="calendarEvents" (eventClick)="openReschedule($event)"></app-weekly-calendar>
      </div>
    </div>

    <!-- Right Sidebar (Queue & Arrivals) -->
    <div class="w-[280px] shrink-0 border-l border-slate-200 bg-white flex flex-col h-full overflow-y-auto custom-scrollbar">
      
      <!-- Arrivals in Next 30 Mins -->
      <div class="p-4 border-b border-slate-200 bg-slate-50">
        <h3 class="text-sm font-extrabold text-slate-800 mb-3 flex items-center justify-between">
          <span>Arrivals (Next 30m)</span>
          <span class="bg-[#8c6225] text-white text-[10px] px-2 py-0.5 rounded-full">{{ arrivalsIn30Mins.length }}</span>
        </h3>
        
        <div class="space-y-2">
          <div *ngIf="arrivalsIn30Mins.length === 0" class="text-xs text-slate-500 italic">No upcoming arrivals.</div>
          
          <div *ngFor="let arr of arrivalsIn30Mins" class="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div class="flex justify-between items-start">
              <span class="text-xs font-bold">{{ arr.patient }}</span>
              <span class="text-[10px] font-bold text-slate-500">{{ arr.startTime }}</span>
            </div>
            <div class="text-[10px] font-medium text-slate-500 mt-1">Room: {{ arr.room }}</div>
            <div class="mt-2 text-[9px] font-bold px-2 py-1 bg-slate-100 rounded w-max"
                 [ngClass]="{'text-green-700 bg-green-50': arr.paymentStatus === 'Paid Online'}">
              {{ arr.paymentStatus }}
            </div>
          </div>
        </div>
      </div>

      <!-- Today's Queue Panel -->
      <div class="p-4 border-b border-slate-200">
        <h3 class="text-sm font-extrabold text-slate-800 mb-4">Today's Queue</h3>
        
        <!-- Waiting Section -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-2 h-2 rounded-full bg-[#0ea5e9]"></div>
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wide">Waiting ({{ waitingCount }})</span>
          </div>
          <div class="space-y-2">
            <div *ngFor="let q of waitingList" class="p-2 border border-slate-100 rounded bg-slate-50 flex flex-col gap-1">
              <div class="flex justify-between text-[11px] font-bold">
                <span>{{ q.patient }}</span> <span>{{ q.startTime }}</span>
              </div>
              <div class="text-[10px] text-slate-500">{{ q.room }} • <span class="uppercase font-semibold text-[#0ea5e9]">{{ q.status }}</span></div>
            </div>
          </div>
        </div>

        <!-- Checked In Section -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-2 h-2 rounded-full bg-[#22c55e]"></div>
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wide">Checked In ({{ checkedInCount }})</span>
          </div>
          <div class="space-y-2">
            <div *ngFor="let q of checkedInList" class="p-2 border border-green-100 rounded bg-green-50 flex flex-col gap-1">
              <div class="flex justify-between text-[11px] font-bold text-green-900">
                <span>{{ q.patient }}</span> <span>{{ q.startTime }}</span>
              </div>
              <div class="text-[10px] text-green-700">{{ q.room }} • <span class="uppercase font-semibold">{{ q.status.replace('_', ' ') }}</span></div>
            </div>
          </div>
        </div>
        
        <!-- In Treatment Section -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-2 h-2 rounded-full bg-[#f97316]"></div>
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wide">In Treatment ({{ inTreatmentCount }})</span>
          </div>
          <div class="space-y-2">
            <div *ngFor="let q of inTreatmentList" class="p-2 border border-orange-100 rounded bg-orange-50 flex flex-col gap-1">
              <div class="flex justify-between text-[11px] font-bold text-orange-900">
                <span>{{ q.patient }}</span> <span>{{ q.startTime }}</span>
              </div>
              <div class="text-[10px] text-orange-700">{{ q.room }} • <span class="uppercase font-semibold">{{ q.status.replace('_', ' ') }}</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>

<app-internal-booking-modal *ngIf="showModal()" (close)="closeBookingModal()" (bookingCreated)="onBookingCreated()"></app-internal-booking-modal>
"""

admin_dir = r"c:\\Users\\church\\Downloads\\HHCLASER5.0-main\\HHCLASER5.0-main\\frontend\\src\\app\\features\\admin\\bookings"
staff_dir = r"c:\\Users\\church\\Downloads\\HHCLASER5.0-main\\HHCLASER5.0-main\\frontend\\src\\app\\features\\employee\\schedule"

# Overwrite Admin
with open(os.path.join(admin_dir, "admin-bookings.component.ts"), "w", encoding="utf-8") as f:
    f.write(ts_content)
with open(os.path.join(admin_dir, "admin-bookings.component.html"), "w", encoding="utf-8") as f:
    f.write(html_content)

# Overwrite Staff with slightly modified class name
with open(os.path.join(staff_dir, "employee-schedule.component.ts"), "w", encoding="utf-8") as f:
    f.write(ts_content.replace('AdminBookingsComponent', 'EmployeeScheduleComponent').replace('app-admin-bookings', 'app-employee-schedule').replace('admin-bookings.component.html', 'employee-schedule.component.html'))
with open(os.path.join(staff_dir, "employee-schedule.component.html"), "w", encoding="utf-8") as f:
    f.write(html_content)

print("Admin and Staff booking dashboards updated successfully!")
