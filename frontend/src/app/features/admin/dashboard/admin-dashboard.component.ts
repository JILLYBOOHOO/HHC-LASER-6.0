import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { getContactMessages, ContactMessage, CONTACT_MESSAGES_KEY } from '../../../core/services/contact-messages';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">

      <!-- Top Bar: Search & Make Appointment for Customer Button -->
      <div class="bg-white p-4 rounded-2xl border border-slate-300 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="relative flex-1 w-full">
          <mat-icon class="absolute left-3.5 top-3 !text-lg text-slate-500">search</mat-icon>
          <input type="text" [(ngModel)]="searchQuery"
                 placeholder="Enter 5-digit confirmation number..."
                 class="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-2 border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-slate-800 text-slate-900 placeholder:text-slate-500">
        </div>
        <div class="flex items-center gap-3 w-full md:w-auto justify-end">
          <button (click)="onSearch()" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-black font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2">
            <mat-icon class="!text-base text-cyan-400">search</mat-icon>
            <span class="tracking-wider uppercase">Search</span>
          </button>
          <a routerLink="/booking" class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap">
            <mat-icon class="!text-base">add_circle</mat-icon>
            <span class="tracking-wider uppercase">+ Make Appointment for Customer</span>
          </a>
        </div>
      </div>

      <!-- 4 Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="p-5 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-black shadow-lg border border-purple-400/40 flex flex-col justify-between h-40 group hover:scale-[1.02] transition-transform">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-xs font-bold text-purple-200 uppercase tracking-widest">Total Revenue</div>
              <div class="text-3xl font-black mt-1 tracking-tight">$2,516,120.00</div>
            </div>
            <div class="w-11 h-11 rounded-xl bg-black/20 flex items-center justify-center">
              <mat-icon class="!text-2xl">attach_money</mat-icon>
            </div>
          </div>
          <div class="text-xs font-extrabold text-purple-100 flex items-center gap-1.5 bg-black/10 w-fit px-3 py-1 rounded-full">
            <mat-icon class="!text-sm">north_east</mat-icon><span>12.5% from last month</span>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-black shadow-lg border border-emerald-400/40 flex flex-col justify-between h-40 group hover:scale-[1.02] transition-transform">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-xs font-bold text-emerald-100 uppercase tracking-widest">Total Appointments</div>
              <div class="text-3xl font-black mt-1 tracking-tight">411</div>
            </div>
            <div class="w-11 h-11 rounded-xl bg-black/20 flex items-center justify-center">
              <mat-icon class="!text-2xl">calendar_today</mat-icon>
            </div>
          </div>
          <div class="text-xs font-extrabold text-emerald-100 flex items-center gap-1.5 bg-black/10 w-fit px-3 py-1 rounded-full">
            <mat-icon class="!text-sm">north_east</mat-icon><span>8.2% vs last week</span>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 text-black shadow-lg border border-orange-400/40 flex flex-col justify-between h-40 group hover:scale-[1.02] transition-transform">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-xs font-bold text-orange-100 uppercase tracking-widest">Total Patients</div>
              <div class="text-3xl font-black mt-1 tracking-tight">479</div>
            </div>
            <div class="w-11 h-11 rounded-xl bg-black/20 flex items-center justify-center">
              <mat-icon class="!text-2xl">people</mat-icon>
            </div>
          </div>
          <div class="text-xs font-extrabold text-orange-100 flex items-center gap-1.5 bg-black/10 w-fit px-3 py-1 rounded-full">
            <mat-icon class="!text-sm">north_east</mat-icon><span>15.3% growth rate</span>
          </div>
        </div>

        <!-- Contact Messages card (live count) -->
        <div class="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-700 text-black shadow-lg border border-blue-400/40 flex flex-col justify-between h-40 group hover:scale-[1.02] transition-transform">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-xs font-bold text-blue-100 uppercase tracking-widest">Contact Messages</div>
              <div class="text-3xl font-black mt-1 tracking-tight">{{ unreadCount() }}</div>
            </div>
            <div class="w-11 h-11 rounded-xl bg-black/20 flex items-center justify-center">
              <mat-icon class="!text-2xl">mail</mat-icon>
            </div>
          </div>
          <div class="text-xs font-extrabold text-blue-100 flex items-center gap-1.5 bg-black/10 w-fit px-3 py-1 rounded-full">
            <mat-icon class="!text-sm">inbox</mat-icon>
            <span>{{ unreadCount() }} unread · {{ messages().length }} total</span>
          </div>
        </div>
      </div>

      <!-- Lower 2 Column Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Appointment Activity -->
        <div class="lg:col-span-2 bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-md space-y-6">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-extrabold text-lg text-slate-900 tracking-tight">Appointment Activity</h3>
              <p class="text-xs font-bold text-slate-500 mt-0.5">Your appointment trends over the last 30 days</p>
            </div>
            <button class="text-slate-400 hover:text-slate-700"><mat-icon>more_vert</mat-icon></button>
          </div>
          <div class="h-48 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-2xl border-2 border-indigo-700/50 flex items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]"></div>
            <div class="absolute bottom-4 flex items-center gap-2 bg-white/95 px-4 py-2 rounded-full border border-blue-200 shadow-md text-xs font-extrabold text-blue-900">
              <mat-icon class="!text-base text-cyan-500">show_chart</mat-icon>
              <span>Activity Chart Visualizer</span>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4 pt-4 border-t-2 border-slate-100 text-center">
            <div><div class="text-2xl font-black text-slate-900">26</div><div class="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">This Week</div></div>
            <div><div class="text-2xl font-black text-slate-900">61</div><div class="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">This Month</div></div>
            <div><div class="text-2xl font-black text-slate-900">777</div><div class="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Active Users</div></div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-md space-y-5">
          <div class="flex items-center justify-between">
            <h3 class="font-extrabold text-lg text-slate-900 tracking-tight">Recent Activity</h3>
            <button class="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider">View all</button>
          </div>
          <div class="space-y-4">
            <div class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div class="w-9 h-9 rounded-xl bg-blue-600 text-black flex items-center justify-center flex-shrink-0 shadow-sm"><mat-icon class="!text-base">calendar_today</mat-icon></div>
              <div>
                <div class="text-xs font-extrabold text-slate-900">New appointment booked</div>
                <div class="text-xs font-semibold text-slate-600">John Doe - Consultation</div>
                <div class="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">2 minutes ago</div>
              </div>
            </div>
            <div class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div class="w-9 h-9 rounded-xl bg-emerald-600 text-black flex items-center justify-center flex-shrink-0 shadow-sm"><mat-icon class="!text-base">check_circle</mat-icon></div>
              <div>
                <div class="text-xs font-extrabold text-slate-900">Appointment completed</div>
                <div class="text-xs font-semibold text-slate-600">Sarah Smith - Follow-up</div>
                <div class="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">15 minutes ago</div>
              </div>
            </div>
            <div class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div class="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center flex-shrink-0 shadow-sm"><mat-icon class="!text-base">schedule</mat-icon></div>
              <div>
                <div class="text-xs font-extrabold text-slate-900">Appointment rescheduled</div>
                <div class="text-xs font-semibold text-slate-600">Mike Johnson - Check-up</div>
                <div class="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">1 hour ago</div>
              </div>
            </div>
            <div class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div class="w-9 h-9 rounded-xl bg-purple-600 text-black flex items-center justify-center flex-shrink-0 shadow-sm"><mat-icon class="!text-base">person_add</mat-icon></div>
              <div>
                <div class="text-xs font-extrabold text-slate-900">New patient registered</div>
                <div class="text-xs font-semibold text-slate-600">Emma Wilson</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Contact Messages Section -->
      <div class="mt-8 bg-white border border-slate-300 rounded-2xl shadow-md overflow-hidden">
        <div class="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 class="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <mat-icon class="text-blue-600">mail</mat-icon>
            Contact Messages
          </h2>
          <button *ngIf="messages().length > 0" (click)="clearAll()" class="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors uppercase tracking-wider flex items-center gap-1">
            <mat-icon class="!text-sm">delete_sweep</mat-icon> Clear All
          </button>
        </div>

        @if (messages().length === 0) {
          <div class="py-16 text-center text-slate-400">
            <mat-icon class="!text-5xl mb-3 text-slate-300">inbox</mat-icon>
            <p class="text-sm font-semibold">No messages yet.</p>
            <p class="text-xs text-slate-400 mt-1">Messages from the Contact Us form will appear here.</p>
          </div>
        } @else {
          <div class="divide-y divide-slate-100">
            @for (msg of messages(); track msg.id) {
              <div class="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                   [class.bg-blue-50]="!msg.read"
                   (click)="markRead(msg)">
                <!-- Avatar -->
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-black font-black text-sm flex-shrink-0"
                     style="background: linear-gradient(135deg, #D6B36A, #b8924f);">
                  {{ msg.name.charAt(0).toUpperCase() }}
                </div>
                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="font-extrabold text-sm text-slate-900">{{ msg.name }}</span>
                      @if (!msg.read) {
                        <span class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                      }
                    </div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {{ formatTime(msg.timestamp) }}
                    </span>
                  </div>
                  <div class="text-xs text-slate-500 font-medium">{{ msg.email }}</div>
                  <p class="text-sm text-slate-700 mt-1 truncate">{{ msg.message }}</p>
                </div>
                <!-- Delete -->
                <button (click)="deleteMsg($event, msg.id)"
                        class="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
                  <mat-icon class="!text-lg">delete_outline</mat-icon>
                </button>
              </div>
            }
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Appointment Activity -->
        <div class="lg:col-span-2 bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-md space-y-6">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-extrabold text-lg text-slate-900 tracking-tight">Appointment Activity</h3>
              <p class="text-xs font-bold text-slate-500 mt-0.5">Your appointment trends over the last 30 days</p>
            </div>
            <button class="text-slate-400 hover:text-slate-700"><mat-icon>more_vert</mat-icon></button>
          </div>
          <div class="h-48 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-2xl border-2 border-indigo-700/50 flex items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]"></div>
            <div class="absolute bottom-4 flex items-center gap-2 bg-white/95 px-4 py-2 rounded-full border border-blue-200 shadow-md text-xs font-extrabold text-blue-900">
              <mat-icon class="!text-base text-cyan-500">show_chart</mat-icon>
              <span>Activity Chart Visualizer</span>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4 pt-4 border-t-2 border-slate-100 text-center">
            <div><div class="text-2xl font-black text-slate-900">26</div><div class="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">This Week</div></div>
            <div><div class="text-2xl font-black text-slate-900">61</div><div class="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">This Month</div></div>
            <div><div class="text-2xl font-black text-slate-900">777</div><div class="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Active Users</div></div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-md space-y-5">
          <div class="flex items-center justify-between">
            <h3 class="font-extrabold text-lg text-slate-900 tracking-tight">Recent Activity</h3>
            <button class="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider">View all</button>
          </div>
          <div class="space-y-4">
            <div class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div class="w-9 h-9 rounded-xl bg-blue-600 text-black flex items-center justify-center flex-shrink-0 shadow-sm"><mat-icon class="!text-base">calendar_today</mat-icon></div>
              <div>
                <div class="text-xs font-extrabold text-slate-900">New appointment booked</div>
                <div class="text-xs font-semibold text-slate-600">John Doe - Consultation</div>
                <div class="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">2 minutes ago</div>
              </div>
            </div>
            <div class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div class="w-9 h-9 rounded-xl bg-emerald-600 text-black flex items-center justify-center flex-shrink-0 shadow-sm"><mat-icon class="!text-base">check_circle</mat-icon></div>
              <div>
                <div class="text-xs font-extrabold text-slate-900">Appointment completed</div>
                <div class="text-xs font-semibold text-slate-600">Sarah Smith - Follow-up</div>
                <div class="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">15 minutes ago</div>
              </div>
            </div>
            <div class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div class="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center flex-shrink-0 shadow-sm"><mat-icon class="!text-base">schedule</mat-icon></div>
              <div>
                <div class="text-xs font-extrabold text-slate-900">Appointment rescheduled</div>
                <div class="text-xs font-semibold text-slate-600">Mike Johnson - Check-up</div>
                <div class="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">1 hour ago</div>
              </div>
            </div>
            <div class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div class="w-9 h-9 rounded-xl bg-purple-600 text-black flex items-center justify-center flex-shrink-0 shadow-sm"><mat-icon class="!text-base">person_add</mat-icon></div>
              <div>
                <div class="text-xs font-extrabold text-slate-900">New patient registered</div>
                <div class="text-xs font-semibold text-slate-600">Emma Wilson</div>

        
        <!-- Contact Form Submissions block moved to bottom -->
<div class="bg-white rounded-2xl border-2 border-slate-200 shadow-md overflow-hidden">
  <div class="flex items-center justify-between px-6 py-4 border-b-2 border-slate-100">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
        <mat-icon class="!text-xl">mail</mat-icon>
      </div>
      <h3 class="font-extrabold text-base text-slate-900 tracking-tight">
        Contact Form Submissions
        @if (unreadCount() > 0) {
          <span class="ml-2 px-2 py-0.5 bg-red-500 text-black text-[10px] font-black rounded-full">{{ unreadCount() }} NEW</span>
        }
      </h3>
    </div>
    <button (click)="clearAll()" class="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider">Clear All</button>
  </div>

  @if (messages().length === 0) {
    <div class="py-16 text-center text-slate-400">
      <mat-icon class="!text-5xl mb-3 text-slate-300">inbox</mat-icon>
      <p class="text-sm font-semibold">No messages yet.</p>
      <p class="text-xs text-slate-400 mt-1">Messages from the Contact Us form will appear here.</p>
    </div>
  } @else {
    <div class="divide-y divide-slate-100">
      @for (msg of messages(); track msg.id) {
        <div class="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
             [class.bg-blue-50]="!msg.read"
             (click)="markRead(msg)">
          <!-- Avatar -->
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-black font-black text-sm flex-shrink-0"
               style="background: linear-gradient(135deg, #D6B36A, #b8924f);">
            {{ msg.name.charAt(0).toUpperCase() }}
          </div>
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-sm text-slate-900">{{ msg.name }}</span>
                @if (!msg.read) {
                  <span class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                }
              </div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{{ formatTime(msg.timestamp) }}</span>
            </div>
            <div class="text-xs text-slate-500 font-medium">{{ msg.email }}</div>
            <p class="text-sm text-slate-700 mt-1 truncate">{{ msg.message }}</p>
          </div>
          <!-- Delete -->
          <button (click)="deleteMsg($event, msg.id)"
                  class="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
            <mat-icon class="!text-lg">delete_outline</mat-icon>
          </button>
        </div>
      }
    </div>
  }
</div>
  `
})
export class AdminDashboardComponent implements OnInit {
  searchQuery = '';
  messages = signal<ContactMessage[]>([]);
  unreadCount = signal(0);

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
