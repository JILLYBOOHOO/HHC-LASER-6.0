import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-provider-availability',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="p-6 max-w-[1600px] mx-auto flex flex-col md:flex-row gap-6">
      
      <!-- Left Control & Calendar Sidebar -->
      <div class="w-full md:w-64 flex-shrink-0 space-y-6">
        
        <!-- Month Calendar Picker Widget -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-bold text-xs text-slate-800">July 2026</span>
            <div class="flex items-center gap-1">
              <button class="p-1 hover:bg-slate-100 rounded text-slate-500"><mat-icon class="!text-sm">chevron_left</mat-icon></button>
              <button class="p-1 hover:bg-slate-100 rounded text-slate-500"><mat-icon class="!text-sm">chevron_right</mat-icon></button>
            </div>
          </div>

          <!-- Calendar Days Grid -->
          <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>
          <div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-700">
            <span class="text-slate-300 py-1">28</span><span class="text-slate-300 py-1">29</span><span class="text-slate-300 py-1">30</span>
            <span class="py-1">1</span><span class="py-1">2</span><span class="py-1">3</span><span class="py-1">4</span>
            <span class="py-1">5</span><span class="py-1">6</span><span class="py-1">7</span><span class="py-1">8</span><span class="py-1">9</span><span class="py-1">10</span><span class="py-1">11</span>
            <span class="py-1">12</span><span class="py-1">13</span><span class="py-1">14</span><span class="py-1">15</span><span class="py-1">16</span><span class="py-1">17</span><span class="py-1">18</span>
            <span class="py-1">19</span><span class="py-1">20</span><span class="py-1">21</span><span class="py-1">22</span><span class="py-1">23</span><span class="py-1">24</span><span class="py-1">25</span>
            <span class="py-1">26</span><span class="py-1">27</span><span class="py-1">28</span><span class="py-1">29</span>
            <span class="py-1 bg-blue-100 text-blue-700 font-bold rounded-md shadow-xs">30</span>
            <span class="py-1">31</span><span class="text-slate-300 py-1">1</span>
          </div>
        </div>

        <!-- Provider Types Dropdown -->
        <div class="space-y-1.5">
          <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Provider Types</label>
          <select [(ngModel)]="selectedProviderType" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none shadow-xs">
            <option value="doctors">Doctors...</option>
            <option value="estheticians">Estheticians</option>
            <option value="specialists">Laser Specialists</option>
          </select>
        </div>

        <!-- Display on my calendars -->
        <div class="space-y-2 pt-2 border-t border-slate-200/60">
          <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Display on my calendars</div>
          <div class="space-y-2 text-xs font-semibold text-slate-700">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked class="rounded border-slate-300 text-slate-900 focus:ring-0">
              <span>Appointments</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked class="rounded border-slate-300 text-slate-900 focus:ring-0">
              <span>Availability</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked class="rounded border-slate-300 text-slate-900 focus:ring-0">
              <span>Blocked Time</span>
              <span class="w-2.5 h-2.5 rounded-full bg-rose-400 ml-auto"></span>
            </label>
          </div>
        </div>

        <!-- Locations Filter -->
        <div class="space-y-2 pt-2 border-t border-slate-200/60">
          <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Locations</div>
          <div class="text-xs text-slate-400 font-medium">In person</div>
          <label class="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input type="checkbox" checked class="rounded border-slate-300 text-slate-900 focus:ring-0">
            <span>Home location</span>
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 ml-auto"></span>
          </label>
        </div>

      </div>

      <!-- Main Availability Grid Area -->
      <div class="flex-1 space-y-4">
        
        <!-- Header Toolbar -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <h2 class="font-bold text-base text-slate-900">July 2026</h2>
            <button class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200">
              Today
            </button>
            <div class="flex items-center gap-1">
              <button class="p-1 hover:bg-slate-100 rounded text-slate-500"><mat-icon class="!text-base">chevron_left</mat-icon></button>
              <button class="p-1 hover:bg-slate-100 rounded text-slate-500"><mat-icon class="!text-base">chevron_right</mat-icon></button>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button (click)="onBulkDelete()" class="px-3 py-1.5 border border-rose-300 text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1">
              <mat-icon class="!text-base">delete_outline</mat-icon>
              <span>Bulk Delete</span>
            </button>
            
            <button class="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
              <mat-icon class="!text-base">settings</mat-icon>
            </button>

            <!-- Day / Week View Toggle -->
            <div class="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600">
              <button (click)="viewMode = 'day'" [class.bg-white]="viewMode === 'day'" [class.text-slate-900]="viewMode === 'day'" class="px-2.5 py-1 rounded-md transition-all">Day</button>
              <button (click)="viewMode = 'week'" [class.bg-white]="viewMode === 'week'" [class.text-slate-900]="viewMode === 'week'" class="px-2.5 py-1 rounded-md transition-all">Week</button>
            </div>

            <!-- Add Availability Primary Yellow Button -->
            <button (click)="openAddAvailabilityModal()" class="px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-xs">
              <mat-icon class="!text-base">add</mat-icon>
              <span>Add Availability</span>
            </button>
          </div>
        </div>

        <!-- Provider Info Banner -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
            D
          </div>
          <div>
            <div class="font-bold text-xs text-slate-900">Doctors</div>
            <div class="text-[11px] text-slate-500">Medical doctors and physicians providing consultation and treatment services</div>
          </div>
        </div>

        <!-- Weekly Time Slots Schedule Table -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr class="border-b border-slate-200 text-xs font-bold text-slate-700 bg-slate-50">
                <th class="py-3 px-4 w-20 border-r border-slate-200"></th>
                <th class="py-3 px-4 border-r border-slate-200 text-center">Sun 26</th>
                <th class="py-3 px-4 border-r border-slate-200 text-center">Mon 27</th>
                <th class="py-3 px-4 border-r border-slate-200 text-center">Tue 28</th>
                <th class="py-3 px-4 border-r border-slate-200 text-center">Wed 29</th>
                <th class="py-3 px-4 border-r border-slate-200 text-center bg-blue-50/70 text-blue-700">Thu 30</th>
                <th class="py-3 px-4 border-r border-slate-200 text-center">Fri 31</th>
                <th class="py-3 px-4 text-center">Sat 1</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs text-slate-600">
              @for (time of timeSlots; track time) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-3 px-4 font-semibold text-slate-400 border-r border-slate-200 text-right pr-3">{{ time }}</td>
                  <td class="py-3 px-4 border-r border-slate-200"></td>
                  <td class="py-3 px-4 border-r border-slate-200"></td>
                  <td class="py-3 px-4 border-r border-slate-200"></td>
                  <td class="py-3 px-4 border-r border-slate-200"></td>
                  <td class="py-3 px-4 border-r border-slate-200 bg-blue-50/40">
                    @if (time === '9 AM' || time === '10 AM' || time === '2 PM') {
                      <div class="bg-amber-100 border border-amber-300 text-amber-900 p-2 rounded-lg font-semibold text-[11px] shadow-xs flex items-center justify-between">
                        <span>Available (Dr. Smith)</span>
                        <mat-icon class="!text-xs text-amber-700">check_circle</mat-icon>
                      </div>
                    }
                  </td>
                  <td class="py-3 px-4 border-r border-slate-200"></td>
                  <td class="py-3 px-4"></td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Admin Management Controls (Business Hours & Blocked Dates) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <!-- Blocked Dates Management Card -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 class="font-bold text-sm text-slate-900 flex items-center gap-2">
              <mat-icon class="text-rose-500">block</mat-icon>
              <span>Block Custom Dates</span>
            </h3>
            
            <!-- Add Blocked Date Form -->
            <div class="flex flex-col sm:flex-row gap-3">
              <input type="date" [(ngModel)]="newBlockedDate" class="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none flex-1">
              <input type="text" [(ngModel)]="newBlockedReason" placeholder="Reason (e.g. Renovation)" class="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none flex-1">
              <button (click)="addBlocked()" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-black font-bold text-xs rounded-xl transition-colors">
                Block Date
              </button>
            </div>

            <!-- Blocked Dates List -->
            <div class="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-2">
              @for (bd of blockedDates(); track bd.blocked_date) {
                <div class="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span class="font-bold text-slate-800">{{ bd.blocked_date | date:'mediumDate':'UTC' }}</span>
                    @if (bd.reason) {
                      <span class="text-slate-400 ml-2">({{ bd.reason }})</span>
                    }
                  </div>
                  <button (click)="deleteBlocked(bd.blocked_date)" class="text-rose-500 hover:text-rose-700 p-1">
                    <mat-icon class="!text-base">delete</mat-icon>
                  </button>
                </div>
              } @empty {
                <div class="text-center py-6 text-slate-400 italic text-xs">No dates are currently blocked.</div>
              }
            </div>
          </div>

          <!-- Business Hours Management Card -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 class="font-bold text-sm text-slate-900 flex items-center gap-2">
              <mat-icon class="text-amber-500">schedule</mat-icon>
              <span>Business Operating Hours</span>
            </h3>

            <!-- Business Hours Days List -->
            <div class="space-y-3">
              @for (day of [
                { id: 0, name: 'Sunday' },
                { id: 1, name: 'Monday' },
                { id: 2, name: 'Tuesday' },
                { id: 3, name: 'Wednesday' },
                { id: 4, name: 'Thursday' },
                { id: 5, name: 'Friday' },
                { id: 6, name: 'Saturday' }
              ]; track day.id) {
                <!-- Find current day's business hours -->
                @let bh = getDayHours(day.id);
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-slate-50 pb-2 last:border-0">
                  <span class="font-bold text-slate-800 w-24">{{ day.name }}</span>
                  <div class="flex items-center gap-2 flex-1 justify-end">
                    <label class="flex items-center gap-1 cursor-pointer mr-2">
                      <input type="checkbox" [checked]="bh?.is_closed" #isClosedInput class="rounded border-slate-300 text-slate-900 focus:ring-0">
                      <span class="text-[11px] text-slate-500">Closed</span>
                    </label>
                    <input type="time" [value]="bh?.open_time || '09:00'" #openInput class="px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none" [disabled]="isClosedInput.checked">
                    <span class="text-slate-400">to</span>
                    <input type="time" [value]="bh?.close_time || '18:00'" #closeInput class="px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none" [disabled]="isClosedInput.checked">
                    
                    <button (click)="saveBusinessHours(day.id, openInput.value, closeInput.value, isClosedInput.checked)" class="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                      <mat-icon class="!text-base">save</mat-icon>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

      </div>

    </div>
  `
})
export class AdminProviderAvailabilityComponent implements OnInit {
  selectedProviderType: string = 'doctors';
  viewMode: 'day' | 'week' = 'week';

  timeSlots: string[] = [
    '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM'
  ];

  blockedDates = signal<any[]>([]);
  businessHours = signal<any[]>([]);
  
  newBlockedDate = '';
  newBlockedReason = '';
  selectedLocationId = 1;

  constructor(
    private api: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadBlockedDates();
    this.loadBusinessHours();
  }

  loadBlockedDates() {
    this.api.getBlockedDates().subscribe({
      next: res => {
        if (res.data) this.blockedDates.set(res.data);
      }
    });
  }

  loadBusinessHours() {
    this.api.getBusinessHours(this.selectedLocationId).subscribe({
      next: res => {
        if (res.data) this.businessHours.set(res.data);
      }
    });
  }

  getDayHours(dayId: number) {
    return this.businessHours().find(bh => bh.day_of_week === dayId);
  }

  addBlocked() {
    if (!this.newBlockedDate) {
      this.snackBar.open('Please select a date', 'Close', { duration: 3000 });
      return;
    }
    this.api.addBlockedDate(this.newBlockedDate, this.newBlockedReason).subscribe({
      next: () => {
        this.snackBar.open('Date blocked successfully', 'Close', { duration: 3000 });
        this.newBlockedDate = '';
        this.newBlockedReason = '';
        this.loadBlockedDates();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to block date', 'Close', { duration: 5000 });
      }
    });
  }

  deleteBlocked(dateStr: string) {
    const formatted = dateStr.slice(0, 10);
    this.api.deleteBlockedDate(formatted).subscribe({
      next: () => {
        this.snackBar.open('Blocked date removed', 'Close', { duration: 3000 });
        this.loadBlockedDates();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to remove blocked date', 'Close', { duration: 5000 });
      }
    });
  }

  saveBusinessHours(dayOfWeek: number, openTime: string, closeTime: string, isClosed: boolean) {
    // Add seconds if not present
    const formattedOpen = openTime.length === 5 ? `${openTime}:00` : openTime;
    const formattedClose = closeTime.length === 5 ? `${closeTime}:00` : closeTime;

    this.api.updateBusinessHours(this.selectedLocationId, dayOfWeek, formattedOpen, formattedClose, isClosed).subscribe({
      next: () => {
        this.snackBar.open('Business hours updated successfully', 'Close', { duration: 3000 });
        this.loadBusinessHours();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to update business hours', 'Close', { duration: 5000 });
      }
    });
  }

  onBulkDelete(): void {
    alert('Bulk delete selected availability slots (Demo)');
  }

  openAddAvailabilityModal(): void {
    alert('Add Availability Slot Dialog (Demo)');
  }
}
