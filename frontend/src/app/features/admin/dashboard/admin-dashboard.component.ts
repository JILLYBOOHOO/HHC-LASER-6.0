import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { getContactMessages, ContactMessage, CONTACT_MESSAGES_KEY } from '../../../core/services/contact-messages';

import { RouterModule } from '@angular/router';
import { InternalBookingModalComponent } from '../../../shared/components/internal-booking-modal/internal-booking-modal.component';

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
            <div class="text-xl font-black mt-0.5 tracking-tight">411</div>
          </div>
          <div class="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0">
            <mat-icon class="!text-lg text-emerald-100">calendar_today</mat-icon>
          </div>
        </div>

        <!-- Patients Card -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-sm border border-orange-400/20 flex items-center justify-between h-20 group hover:scale-[1.01] transition-transform">
          <div>
            <div class="text-[10px] font-extrabold text-orange-100 uppercase tracking-widest">Total Patients</div>
            <div class="text-xl font-black mt-0.5 tracking-tight">479</div>
          </div>
          <div class="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0">
            <mat-icon class="!text-lg text-orange-100">people</mat-icon>
          </div>
        </div>

        <!-- Pending Transactions Card -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-700 text-white shadow-sm border border-blue-400/20 flex items-center justify-between h-20 group hover:scale-[1.01] transition-transform">
          <div>
            <div class="text-[10px] font-extrabold text-blue-100 uppercase tracking-widest">Pending Transactions</div>
            <div class="text-xl font-black mt-0.5 tracking-tight">12 pending</div>
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
                  <th class="py-2 px-4 w-20">Time</th>
                  <th class="py-2 px-4">Patient</th>
                  <th class="py-2 px-4">Service</th>
                  <th class="py-2 px-4">Specialist</th>
                  <th class="py-2 px-4">Location</th>
                  <th class="py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700 font-bold">
                
                <!-- Appointment Row 1 (Mannings Hill) -->
                @if (selectedLocation === 'all' || selectedLocation === 'mannings') {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-2 px-4 text-slate-900 font-black whitespace-nowrap">09:00 AM</td>
                    <td class="py-2 px-4">Jane Bennett</td>
                    <td class="py-2 px-4 text-slate-600">Laser Hair Removal</td>
                    <td class="py-2 px-4 text-slate-600">Dr. Sarah Jenkins</td>
                    <td class="py-2 px-4"><span class="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-extrabold">Mannings Hill</span></td>
                    <td class="py-2 px-4"><span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">In Room</span></td>
                  </tr>
                }

                <!-- Appointment Row 2 (Constant Spring) -->
                @if (selectedLocation === 'all' || selectedLocation === 'constant') {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-2 px-4 text-slate-900 font-black whitespace-nowrap">10:30 AM</td>
                    <td class="py-2 px-4">Marcus Sterling</td>
                    <td class="py-2 px-4 text-slate-600">Microdermabrasion</td>
                    <td class="py-2 px-4 text-slate-600">Dr. Marcus Wright</td>
                    <td class="py-2 px-4"><span class="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-extrabold">Constant Spring</span></td>
                    <td class="py-2 px-4"><span class="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-full uppercase">Checked In</span></td>
                  </tr>
                }

                <!-- Appointment Row 3 (Mannings Hill) -->
                @if (selectedLocation === 'all' || selectedLocation === 'mannings') {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-2 px-4 text-slate-900 font-black whitespace-nowrap">01:00 PM</td>
                    <td class="py-2 px-4">Alianna Myers</td>
                    <td class="py-2 px-4 text-slate-600">Chemical Peel</td>
                    <td class="py-2 px-4 text-slate-600">Dr. Sarah Jenkins</td>
                    <td class="py-2 px-4"><span class="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-extrabold">Mannings Hill</span></td>
                    <td class="py-2 px-4"><span class="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full uppercase">Pending</span></td>
                  </tr>
                }

                <!-- Appointment Row 4 (Constant Spring) -->
                @if (selectedLocation === 'all' || selectedLocation === 'constant') {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-2 px-4 text-slate-900 font-black whitespace-nowrap">02:30 PM</td>
                    <td class="py-2 px-4">Donald Sinclair</td>
                    <td class="py-2 px-4 text-slate-600">Laser Treatment</td>
                    <td class="py-2 px-4 text-slate-600">Dr. Marcus Wright</td>
                    <td class="py-2 px-4"><span class="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-extrabold">Constant Spring</span></td>
                    <td class="py-2 px-4"><span class="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full uppercase">Pending</span></td>
                  </tr>
                }

                <!-- Appointment Row 5 (Mannings Hill) -->
                @if (selectedLocation === 'all' || selectedLocation === 'mannings') {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-2 px-4 text-slate-900 font-black whitespace-nowrap">04:00 PM</td>
                    <td class="py-2 px-4">Vanessa Campbell</td>
                    <td class="py-2 px-4 text-slate-600">Chemical Peel</td>
                    <td class="py-2 px-4 text-slate-600">Dr. Sarah Jenkins</td>
                    <td class="py-2 px-4"><span class="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-extrabold">Mannings Hill</span></td>
                    <td class="py-2 px-4"><span class="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase">Scheduled</span></td>
                  </tr>
                }
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
              <div class="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><mat-icon class="!text-base">calendar_today</mat-icon></div>
                <div>
                  <div class="font-extrabold text-slate-800">New appointment booked</div>
                  <div class="text-[10px] font-bold text-slate-500">John Doe - Consultation (2m ago)</div>
                </div>
              </div>
              <div class="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0"><mat-icon class="!text-base">check_circle</mat-icon></div>
                <div>
                  <div class="font-extrabold text-slate-800">Appointment completed</div>
                  <div class="text-[10px] font-bold text-slate-500">Sarah Smith - Follow-up (15m ago)</div>
                </div>
              </div>
              <div class="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0"><mat-icon class="!text-base">schedule</mat-icon></div>
                <div>
                  <div class="font-extrabold text-slate-800">Appointment rescheduled</div>
                  <div class="text-[10px] font-bold text-slate-500">Mike Johnson - Check-up (1h ago)</div>
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
                  @if (unreadCount() > 0) {
                    <span class="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full">{{ unreadCount() }} NEW</span>
                  }
                </span>
              </div>
              <button type="button" (click)="clearAll()" class="text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider">Clear</button>
            </div>

            @if (messages().length === 0) {
              <div class="py-8 text-center text-slate-400 text-xs font-bold">
                <mat-icon class="!text-3xl text-slate-200 block mx-auto mb-1">inbox</mat-icon>
                No submissions.
              </div>
            } @else {
              <div class="divide-y divide-slate-100 max-h-48 overflow-y-auto custom-scrollbar">
                @for (msg of messages(); track msg.id) {
                  <div class="px-4 py-2.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
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
                }
              </div>
            }
          </div>
        </div>

      </div>

      <app-internal-booking-modal *ngIf="showBookingModal" (close)="closeBookingModal()"></app-internal-booking-modal>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  selectedLocation = 'all';
  todayDate = new Date();
  searchQuery = '';
  messages = signal<ContactMessage[]>([]);
  unreadCount = signal(0);
  showBookingModal = false;

  openBookingModal() {
    this.showBookingModal = true;
  }

  closeBookingModal() {
    this.showBookingModal = false;
  }

  ngOnInit() {
    this.loadMessages();
    // Poll for new messages every 10s
    setInterval(() => this.loadMessages(), 10000);
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
