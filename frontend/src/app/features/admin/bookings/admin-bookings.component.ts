import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <!-- 1. RESCHEDULE APPOINTMENT VIEW (EXACT MATCH TO USER SCREENSHOT) -->
    <div *ngIf="isRescheduling()" class="bg-slate-50 min-h-screen text-slate-900 p-4 md:p-8 font-sans selection:bg-cyan-500 selection:text-black">
      
      <!-- Breadcrumb & Top Right Actions Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-2 text-xs font-bold">
          <span (click)="closeReschedule()" class="text-slate-500 hover:text-slate-900 cursor-pointer">Appointments</span>
          <span class="text-slate-300">›</span>
          <span class="text-emerald-600 font-extrabold">Reschedule Booking</span>
        </div>

        <div class="flex items-center gap-4 self-end sm:self-auto">
          <button class="p-2 text-slate-400 hover:text-slate-700"><mat-icon class="!text-xl">notifications</mat-icon></button>
          <button class="p-2 text-slate-400 hover:text-slate-700"><mat-icon class="!text-xl">settings</mat-icon></button>

          <div class="flex items-center gap-2.5 pl-3 pr-2 py-1 bg-white border border-slate-200 rounded-full shadow-xs">
            <div class="text-right">
              <div class="text-xs font-black text-slate-900 leading-tight">Admin User</div>
              <div class="text-[9px] font-extrabold text-amber-600 uppercase tracking-widest leading-tight">Super Admin</div>
            </div>
            <div class="w-8 h-8 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center text-xs shadow-sm">
              H
            </div>
          </div>
        </div>
      </div>

      <!-- Page Header & Cancel Return Button -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Reschedule Appointment</h1>
          <p class="text-xs font-semibold text-slate-500 mt-1">Manage and update the date/time for current service bookings.</p>
        </div>

        <button (click)="closeReschedule()" class="px-5 py-2.5 border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto">
          <mat-icon class="!text-base">west</mat-icon>
          <span>Cancel & Return</span>
        </button>
      </div>

      <!-- Middle Content 2-Column Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        <!-- Left Column (Current Booking Card + Select New Date Calendar) -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Current Booking Details Card -->
          <div class="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div class="flex items-center gap-5">
              <img loading="lazy" src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&q=80" class="w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider rounded-md">CURRENT BOOKING</span>
                  <span class="text-xs font-bold text-amber-600">ID: #HHC-88219</span>
                </div>
                <h3 class="text-2xl font-black text-slate-900 tracking-tight">{{ selectedBooking.service }}</h3>
                <div class="text-xs font-bold text-slate-600">Patient: <span class="font-extrabold text-slate-900">{{ selectedBooking.patient }}</span></div>
                
                <div class="flex flex-wrap items-center gap-3 pt-1">
                  <div class="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 border border-slate-200">
                    <mat-icon class="!text-base text-slate-500">calendar_today</mat-icon>
                    <span>{{ selectedBooking.date }}</span>
                  </div>
                  <div class="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 border border-slate-200">
                    <mat-icon class="!text-base text-slate-500">schedule</mat-icon>
                    <span>{{ selectedBooking.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Select New Date Calendar Box -->
          <div class="bg-white rounded-3xl border-2 border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 class="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <mat-icon class="text-cyan-500">calendar_month</mat-icon>
                <span>Select New Date</span>
              </h3>

              <div class="flex items-center gap-4 text-sm font-extrabold text-slate-900">
                <button class="p-1 hover:bg-slate-100 rounded-lg text-slate-500"><mat-icon class="!text-base">chevron_left</mat-icon></button>
                <span>May 2024</span>
                <button class="p-1 hover:bg-slate-100 rounded-lg text-slate-500"><mat-icon class="!text-base">chevron_right</mat-icon></button>
              </div>
            </div>

            <!-- Month Days Grid -->
            <div class="space-y-4">
              <div class="grid grid-cols-7 gap-2 text-center text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
              </div>

              <div class="grid grid-cols-7 gap-2 text-center text-xs font-bold">
                <div class="p-3 text-slate-300">28</div>
                <div class="p-3 text-slate-300">29</div>
                <div class="p-3 text-slate-300">30</div>

                <div (click)="selectedNewDay = 1" [class.bg-cyan-500]="selectedNewDay === 1" [class.text-black]="selectedNewDay === 1" class="p-3 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">1</div>
                <div (click)="selectedNewDay = 2" [class.bg-cyan-500]="selectedNewDay === 2" [class.text-black]="selectedNewDay === 2" class="p-3 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">2</div>
                <div (click)="selectedNewDay = 3" [class.bg-cyan-500]="selectedNewDay === 3" [class.text-black]="selectedNewDay === 3" class="p-3 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">3</div>
                <div (click)="selectedNewDay = 4" [class.bg-cyan-500]="selectedNewDay === 4" [class.text-black]="selectedNewDay === 4" class="p-3 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">4</div>

                <div (click)="selectedNewDay = 5" class="p-3 rounded-2xl bg-cyan-500 text-black font-extrabold cursor-pointer shadow-md">5</div>
                <div (click)="selectedNewDay = 6" [class.bg-cyan-500]="selectedNewDay === 6" [class.text-black]="selectedNewDay === 6" class="p-3 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">6</div>
                <div (click)="selectedNewDay = 7" [class.bg-cyan-500]="selectedNewDay === 7" [class.text-black]="selectedNewDay === 7" class="p-3 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">7</div>
                <div (click)="selectedNewDay = 8" [class.bg-cyan-500]="selectedNewDay === 8" [class.text-black]="selectedNewDay === 8" class="p-3 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">8</div>
                <div (click)="selectedNewDay = 9" [class.bg-cyan-500]="selectedNewDay === 9" [class.text-black]="selectedNewDay === 9" class="p-3 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">9</div>
                <div (click)="selectedNewDay = 10" [class.bg-cyan-500]="selectedNewDay === 10" [class.text-black]="selectedNewDay === 10" class="p-3 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">10</div>
                <div (click)="selectedNewDay = 11" [class.bg-cyan-500]="selectedNewDay === 11" [class.text-black]="selectedNewDay === 11" class="p-3 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">11</div>

                <div (click)="selectedNewDay = 12" [class.bg-cyan-500]="selectedNewDay === 12" [class.text-black]="selectedNewDay === 12" class="p-3 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">12</div>
                <div (click)="selectedNewDay = 13" [class.bg-cyan-500]="selectedNewDay === 13" [class.text-black]="selectedNewDay === 13" class="p-3 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">13</div>
                
                <div (click)="selectedNewDay = 14" class="p-3 rounded-2xl border-2 border-slate-900 text-slate-900 font-extrabold cursor-pointer">14</div>
                
                <div (click)="selectedNewDay = 15" [class.bg-cyan-500]="selectedNewDay === 15" [class.text-black]="selectedNewDay === 15" class="p-3 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">15</div>
                
                <div (click)="selectedNewDay = 16" class="p-3 rounded-2xl bg-slate-900 text-black font-extrabold cursor-pointer shadow-md">16</div>
                
                <div (click)="selectedNewDay = 17" [class.bg-cyan-500]="selectedNewDay === 17" [class.text-black]="selectedNewDay === 17" class="p-3 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">17</div>
                <div (click)="selectedNewDay = 18" [class.bg-cyan-500]="selectedNewDay === 18" [class.text-black]="selectedNewDay === 18" class="p-3 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">18</div>
              </div>
            </div>

            <!-- Calendar Legend -->
            <div class="flex items-center gap-6 pt-4 border-t border-slate-100 text-xs font-bold text-slate-600">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-cyan-500"></span>
                <span>New Selection</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-rose-500"></span>
                <span>Current Booking</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column (Available Slots + Summary + Update Button) -->
        <div class="space-y-6">
          <div class="bg-white rounded-3xl border-2 border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
            <h3 class="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <mat-icon class="text-emerald-500">schedule</mat-icon>
              <span>Available Slots</span>
            </h3>

            <!-- Morning Slots -->
            <div class="space-y-2">
              <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">MORNING</div>
              <div class="grid grid-cols-2 gap-3 text-xs font-extrabold">
                <button (click)="selectedSlot = '09:00 AM'" [class.bg-slate-900]="selectedSlot === '09:00 AM'" [class.text-black]="selectedSlot === '09:00 AM'" class="py-3 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-400">09:00 AM</button>
                <button (click)="selectedSlot = '11:15 AM'" [class.bg-slate-900]="selectedSlot === '11:15 AM'" [class.text-black]="selectedSlot === '11:15 AM'" class="py-3 bg-slate-900 text-black rounded-2xl shadow-md">11:15 AM</button>
                <button (click)="selectedSlot = '11:15 AM'" class="py-3 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-400 text-slate-700">11:15 AM</button>
                <button (click)="selectedSlot = '11:45 AM'" class="py-3 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-400 text-slate-700">11:45 AM</button>
              </div>
            </div>

            <!-- Afternoon Slots -->
            <div class="space-y-2 pt-2">
              <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">AFTERNOON</div>
              <div class="grid grid-cols-2 gap-3 text-xs font-extrabold">
                <button (click)="selectedSlot = '01:30 PM'" class="py-3 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-400 text-slate-700">01:30 PM</button>
                <button (click)="selectedSlot = '02:15 PM'" class="py-3 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-400 text-slate-700">02:15 PM</button>
                <button disabled class="py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-300 cursor-not-allowed">03:00 PM</button>
                <button (click)="selectedSlot = '04:30 PM'" class="py-3 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-400 text-slate-700">04:30 PM</button>
              </div>
            </div>

            <!-- Schedule Summary Card -->
            <div class="p-4 rounded-2xl bg-slate-50 border-l-4 border-cyan-500 space-y-1">
              <div class="text-xs font-black text-slate-900">Schedule Summary</div>
              <p class="text-xs font-bold text-slate-600">
                Rescheduling from <span class="text-rose-500 font-extrabold">May 14 at 10:30 AM</span> to <span class="text-cyan-600 font-black">May 16 at {{ selectedSlot }}.</span>
              </p>
            </div>

            <!-- Update Booking Action Button -->
            <button (click)="confirmReschedule()" class="w-full py-4 bg-slate-900 hover:bg-slate-800 text-black font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
              <span>Update Booking</span>
              <mat-icon class="!text-lg">check_circle_outline</mat-icon>
            </button>
            <p class="text-[10px] font-bold text-slate-400 text-center">Patient will receive an automated confirmation SMS & Email.</p>

          </div>
        </div>

      </div>

      <!-- 3 Action Cards Row (Bottom) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        <!-- Card 1: Add Appointment Note -->
        <div class="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm hover:border-slate-400 transition-all cursor-pointer space-y-3 group">
          <div class="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <mat-icon class="!text-xl">chat</mat-icon>
          </div>
          <h4 class="text-base font-black text-slate-900 tracking-tight">Add Appointment Note</h4>
          <p class="text-xs font-semibold text-slate-500">Mention special requests or clinical prerequisites for this visit.</p>
        </div>

        <!-- Card 2: Change Provider -->
        <div class="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm hover:border-slate-400 transition-all cursor-pointer space-y-3 group">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <mat-icon class="!text-xl">badge</mat-icon>
          </div>
          <h4 class="text-base font-black text-slate-900 tracking-tight">Change Provider</h4>
          <p class="text-xs font-semibold text-slate-500">Currently: <span class="font-extrabold text-slate-800">Dr. Sarah Jenkins</span>. Click to switch.</p>
        </div>

        <!-- Card 3: Cancel Appointment -->
        <div class="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm hover:border-rose-300 transition-all cursor-pointer space-y-3 group">
          <div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <mat-icon class="!text-xl">cancel</mat-icon>
          </div>
          <h4 class="text-base font-black text-slate-900 tracking-tight">Cancel Appointment</h4>
          <p class="text-xs font-semibold text-slate-500">Permanently remove this booking from the schedule entirely.</p>
        </div>

      </div>

      <!-- Footer -->
      <div class="text-center text-xs font-bold text-slate-400 border-t border-slate-200 pt-6">
        © 2024 HHC Laser Admin Portal. <span class="text-emerald-600 font-extrabold">Precise Care, Modern Excellence.</span>
      </div>

    </div>

    <!-- 2. SCHEDULE GRID VIEW -->
    <div *ngIf="!isRescheduling()" class="min-h-screen bg-[#110d08] text-black p-4 md:p-8 font-sans selection:bg-cyan-500 selection:text-black">
      
      <!-- Top Search & Admin Action Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        
        <!-- Search Field -->
        <div class="relative flex-1 max-w-xl">
          <mat-icon class="absolute left-4 top-3.5 !text-xl text-amber-500/70">search</mat-icon>
          <input type="text"
                 [(ngModel)]="searchQuery"
                 placeholder="Search appointments..."
                 class="w-full pl-12 pr-4 py-3 bg-[#1c160e] border border-amber-900/30 rounded-2xl text-sm font-semibold text-black placeholder-amber-700/60 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner">
        </div>

        <!-- Right Side Actions -->
        <div class="flex items-center gap-4 self-end lg:self-auto">
          <button (click)="openCreateModal()" class="px-6 py-3 bg-[#00f0ff] hover:bg-[#33f3ff] text-black font-black text-xs uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2 transform active:scale-95">
            <mat-icon class="!text-lg">add</mat-icon>
            <span>Add Booking</span>
          </button>

          <button class="w-11 h-11 rounded-full bg-[#1c160e] border border-amber-900/40 flex items-center justify-center text-amber-500/80 hover:text-black hover:border-amber-700 transition-all">
            <mat-icon class="!text-xl">notifications</mat-icon>
          </button>

          <button class="w-11 h-11 rounded-full bg-[#1c160e] border border-amber-900/40 flex items-center justify-center text-amber-500/80 hover:text-black hover:border-amber-700 transition-all">
            <mat-icon class="!text-xl">settings</mat-icon>
          </button>

          <div class="flex items-center gap-3 pl-2 py-1.5 pr-4 bg-[#1c160e] border border-amber-900/40 rounded-full">
            <div class="w-8 h-8 rounded-full bg-cyan-400 text-black font-black flex items-center justify-center text-xs shadow-[0_0_10px_rgba(0,240,255,0.5)]">
              A
            </div>
            <div>
              <div class="text-xs font-black text-black leading-tight">Admin User</div>
              <div class="text-[10px] font-bold text-amber-600/80 uppercase tracking-widest leading-tight">CLINIC MANAGER</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Header Title & Date View Controls -->
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <h1 class="text-4xl md:text-5xl font-black tracking-tight text-[#00f0ff] drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            Appointment Schedule
          </h1>
          <p class="text-sm font-extrabold text-amber-600/80 mt-2">
            Managing clinics for <span class="text-emerald-400 font-black">May 2024</span>
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <div class="bg-[#1c160e] border border-amber-900/40 p-1 rounded-2xl flex items-center shadow-inner">
            <button (click)="viewMode = 'Day'" [ngClass]="{'bg-cyan-400': viewMode === 'Day', 'text-black': viewMode === 'Day'}" class="px-5 py-2 rounded-xl text-xs font-extrabold text-amber-600/80 hover:text-black transition-all">Day</button>
            <button (click)="viewMode = 'Week'" [ngClass]="{'bg-cyan-400': viewMode === 'Week', 'text-black': viewMode === 'Week'}" class="px-5 py-2 rounded-xl text-xs font-extrabold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]">Week</button>
            <button (click)="viewMode = 'Month'" [ngClass]="{'bg-cyan-400': viewMode === 'Month', 'text-black': viewMode === 'Month'}" class="px-5 py-2 rounded-xl text-xs font-extrabold text-amber-600/80 hover:text-black transition-all">Month</button>
          </div>

          <div class="bg-[#1c160e] border border-amber-900/40 px-3 py-1.5 rounded-2xl flex items-center gap-3 text-xs font-black text-amber-200">
            <button class="p-1 hover:text-cyan-400"><mat-icon class="!text-base">chevron_left</mat-icon></button>
            <span class="tracking-wide">May 12 – 18</span>
            <button class="p-1 hover:text-cyan-400"><mat-icon class="!text-base">chevron_right</mat-icon></button>
          </div>
        </div>
      </div>

      <!-- Weekly Calendar Header Row -->
      <div class="grid grid-cols-7 gap-3 mb-6 border-b border-amber-900/30 pb-4">
        <div *ngFor="let day of daysOfWeek"
             (click)="selectDay(day.name)"
             [ngClass]="{'border-b-2': selectedDay === day.name, 'border-cyan-400': selectedDay === day.name}"
             class="text-center cursor-pointer group pb-2 transition-all">
          <div class="text-[11px] font-black tracking-widest uppercase"
               [ngClass]="{'text-cyan-400': selectedDay === day.name, 'text-amber-600': selectedDay !== day.name}">
            {{ day.name }}
          </div>
          <div class="text-3xl font-black mt-1"
               [ngClass]="{'text-cyan-400': selectedDay === day.name, 'text-black': selectedDay !== day.name}">
            {{ day.date }}
          </div>
        </div>
      </div>

      <!-- Schedule Columns Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-7 gap-4 mb-14">
        
        <!-- MON 12 -->
        <div class="space-y-4">
          <div (click)="openReschedule('Sarah Jenkins', 'Laser Hair Removal', 'May 12, 2024', '09:00 AM')"
               class="p-4 rounded-2xl bg-[#0f292d] border-2 border-[#16565e] space-y-3 hover:border-cyan-400 transition-all shadow-md group cursor-pointer relative">
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-black text-cyan-400 uppercase tracking-widest">LASER HAIR REMOVAL</span>
              <mat-icon class="!text-sm text-cyan-400/60 group-hover:text-cyan-400">edit_calendar</mat-icon>
            </div>
            <div class="text-base font-black text-black group-hover:text-cyan-300">Sarah Jenkins</div>
            <div class="text-xs font-extrabold text-cyan-400/90 flex items-center gap-1.5">
              <mat-icon class="!text-sm">schedule</mat-icon>
              <span>09:00 AM</span>
            </div>
          </div>

          <div (click)="openReschedule('Marcus Wright', 'Body / Skin Detox', 'May 12, 2024', '11:30 AM')"
               class="p-4 rounded-2xl bg-[#2e0926] border-2 border-[#5c134d] space-y-3 hover:border-pink-500 transition-all shadow-md group cursor-pointer">
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-black text-pink-400 uppercase tracking-widest">BODY / SKIN DETOX</span>
              <mat-icon class="!text-sm text-pink-400/60 group-hover:text-pink-400">edit_calendar</mat-icon>
            </div>
            <div class="text-base font-black text-black group-hover:text-pink-300">Marcus Wright</div>
            <div class="text-xs font-extrabold text-pink-400/90 flex items-center gap-1.5">
              <mat-icon class="!text-sm">schedule</mat-icon>
              <span>11:30 AM</span>
            </div>
          </div>
        </div>

        <!-- TUE 13 -->
        <div class="space-y-4">
          <div (click)="openReschedule('Eleanor Rigby', 'Consultation', 'May 13, 2024', '10:15 AM')"
               class="p-4 rounded-2xl bg-[#331808] border-2 border-[#663010] space-y-3 hover:border-amber-500 transition-all shadow-md group cursor-pointer">
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">CONSULTATION</span>
              <mat-icon class="!text-sm text-amber-500/60 group-hover:text-amber-400">edit_calendar</mat-icon>
            </div>
            <div class="text-base font-black text-black group-hover:text-amber-300">Eleanor Rigby</div>
            <div class="text-xs font-extrabold text-amber-500/90 flex items-center gap-1.5">
              <mat-icon class="!text-sm">schedule</mat-icon>
              <span>10:15 AM</span>
            </div>
          </div>

          <div (click)="openCreateModal()" class="p-4 rounded-2xl border-2 border-dashed border-amber-900/40 hover:border-cyan-400 bg-amber-950/10 flex items-center justify-center cursor-pointer text-amber-700 hover:text-cyan-400 transition-all h-20">
            <mat-icon class="!text-3xl">add_circle_outline</mat-icon>
          </div>

          <div (click)="openReschedule('Quick Consult', 'Quick Check', 'May 13, 2024', '02:30 PM')"
               class="p-4 rounded-2xl bg-[#132d10] border-2 border-[#24591e] space-y-2 hover:border-emerald-400 transition-all shadow-md cursor-pointer">
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-black text-emerald-400 uppercase tracking-widest">QUICK CHECK</span>
              <span class="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-extrabold text-[9px] rounded">15m</span>
            </div>
            <div class="text-sm font-black text-black">Quick Consult</div>
            <div class="text-xs font-extrabold text-emerald-400">02:30 PM</div>
          </div>

          <div (click)="openReschedule('John Doe', 'Chemical Peel', 'May 13, 2024', '03:00 PM')"
               class="p-4 rounded-2xl bg-[#262409] border-2 border-[#4d4812] space-y-3 hover:border-yellow-400 transition-all shadow-md group cursor-pointer">
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-black text-yellow-400 uppercase tracking-widest">CHEMICAL PEEL</span>
              <mat-icon class="!text-sm text-yellow-400/60 group-hover:text-yellow-400">edit_calendar</mat-icon>
            </div>
            <div class="text-base font-black text-black group-hover:text-yellow-300">John Doe</div>
            <div class="text-xs font-extrabold text-yellow-400/90 flex items-center gap-1.5">
              <mat-icon class="!text-sm">schedule</mat-icon>
              <span>03:00 PM</span>
            </div>
          </div>
        </div>

        <!-- WED 14 -->
        <div class="space-y-4 relative p-2 rounded-3xl bg-cyan-950/20 border-2 border-cyan-500/40 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
          <div (click)="openReschedule('Amelia Pond', 'Facial Resurfacing', 'May 14, 2024', '11:00 AM')"
               class="p-4 rounded-2xl bg-[#360933] border-2 border-[#6d1367] space-y-3 hover:border-fuchsia-400 transition-all shadow-md relative group cursor-pointer">
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest">FACIAL RESURFACING</span>
              <span class="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping"></span>
            </div>
            <div class="text-base font-black text-black group-hover:text-fuchsia-300">Amelia Pond</div>
            <div class="text-xs font-extrabold text-fuchsia-400/90 flex items-center gap-1.5">
              <mat-icon class="!text-sm">schedule</mat-icon>
              <span>11:00 AM</span>
            </div>
          </div>

          <div (click)="openReschedule('Eleanor Shellstrop', 'Microdermabrasion', 'May 14, 2024', '10:30 AM')"
               class="p-4 rounded-2xl bg-[#09262e] border-2 border-[#00f0ff] space-y-3 shadow-[0_0_20px_rgba(0,240,255,0.2)] relative cursor-pointer group">
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-black text-[#00f0ff] uppercase tracking-widest">MICRODERMABRASION</span>
              <mat-icon class="!text-base text-cyan-400 group-hover:scale-110 transition-transform">edit_calendar</mat-icon>
            </div>
            <div class="text-lg font-black text-black">Eleanor Shellstrop</div>
            <div class="flex items-center justify-between pt-1">
              <div class="text-xs font-extrabold text-[#00f0ff] flex items-center gap-1">
                <mat-icon class="!text-sm">schedule</mat-icon>
                <span>10:30 AM</span>
              </div>
              <span class="px-2.5 py-1 bg-[#39ff14] text-black font-black text-[9px] uppercase tracking-wider rounded-md shadow-[0_0_10px_rgba(57,255,20,0.6)]">
                IN PROGRESS
              </span>
            </div>
          </div>

          <div (click)="openReschedule('Clara Oswald', 'Microdermabrasion', 'May 14, 2024', '04:30 PM')"
               class="p-4 rounded-2xl bg-[#143609] border-2 border-[#286d12] space-y-3 hover:border-lime-400 transition-all shadow-md group cursor-pointer">
            <div class="text-[9px] font-black text-lime-400 uppercase tracking-widest">MICRODERMABRASION</div>
            <div class="text-base font-black text-black group-hover:text-lime-300">Clara Oswald</div>
            <div class="text-xs font-extrabold text-lime-400/90 flex items-center gap-1.5">
              <mat-icon class="!text-sm">schedule</mat-icon>
              <span>04:30 PM</span>
            </div>
          </div>
        </div>

        <!-- THU 15 -->
        <div class="space-y-4">
          <div class="p-4 rounded-2xl bg-[#1a140b] border-2 border-amber-900/40 bg-[linear-gradient(135deg,#2e2213_25%,transparent_25%,transparent_50%,#2e2213_50%,#2e2213_75%,transparent_75%,transparent)] bg-[length:16px_16px] text-center py-5">
            <mat-icon class="text-amber-500 !text-xl mb-1">build</mat-icon>
            <div class="text-[10px] font-black text-amber-500 uppercase tracking-widest">MAINTENANCE</div>
          </div>

          <div class="p-4 rounded-2xl bg-[#0d2226] border-2 border-[#1a444d] space-y-3 hover:border-cyan-500 transition-all shadow-md">
            <div class="text-[9px] font-black text-cyan-400 uppercase tracking-widest">STAFF MEETING</div>
            <div class="text-base font-black text-black">Internal Sync</div>
            <div class="text-xs font-extrabold text-cyan-400/90 flex items-center gap-1.5">
              <mat-icon class="!text-sm">lock</mat-icon>
              <span>08:30 AM</span>
            </div>
          </div>

          <div (click)="openReschedule('Rose Tyler', 'Laser Hair Removal', 'May 15, 2024', '12:00 PM')"
               class="p-4 rounded-2xl bg-[#0f292d] border-2 border-[#16565e] space-y-3 hover:border-cyan-400 transition-all shadow-md group cursor-pointer">
            <div class="text-[9px] font-black text-cyan-400 uppercase tracking-widest">LASER HAIR REMOVAL</div>
            <div class="text-base font-black text-black group-hover:text-cyan-300">Rose Tyler</div>
            <div class="text-xs font-extrabold text-cyan-400/90 flex items-center gap-1.5">
              <mat-icon class="!text-sm">schedule</mat-icon>
              <span>12:00 PM</span>
            </div>
          </div>
        </div>

        <!-- FRI 16 -->
        <div class="space-y-4">
          <div (click)="openReschedule('Martha Jones', 'Chemical Peel', 'May 16, 2024', '10:00 AM')"
               class="p-4 rounded-2xl bg-[#262409] border-2 border-[#4d4812] space-y-3 hover:border-yellow-400 transition-all shadow-md group cursor-pointer">
            <div class="text-[9px] font-black text-yellow-400 uppercase tracking-widest">CHEMICAL PEEL</div>
            <div class="text-base font-black text-black group-hover:text-yellow-300">Martha Jones</div>
            <div class="text-xs font-extrabold text-yellow-400/90 flex items-center gap-1.5">
              <mat-icon class="!text-sm">schedule</mat-icon>
              <span>10:00 AM</span>
            </div>
          </div>

          <div (click)="openReschedule('Donna Noble', 'Consultation', 'May 16, 2024', '02:15 PM')"
               class="p-4 rounded-2xl bg-[#331808] border-2 border-[#663010] space-y-3 hover:border-amber-500 transition-all shadow-md group cursor-pointer">
            <div class="text-[9px] font-black text-amber-500 uppercase tracking-widest">CONSULTATION</div>
            <div class="text-base font-black text-black group-hover:text-amber-300">Donna Noble</div>
            <div class="text-xs font-extrabold text-amber-500/90 flex items-center gap-1.5">
              <mat-icon class="!text-sm">schedule</mat-icon>
              <span>02:15 PM</span>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-[#1a140b] border-2 border-amber-900/40 bg-[linear-gradient(135deg,#2e2213_25%,transparent_25%,transparent_50%,#2e2213_50%,#2e2213_75%,transparent_75%,transparent)] bg-[length:16px_16px] text-center py-4">
            <div class="text-[10px] font-black text-amber-500/90 uppercase tracking-widest">STAFF BREAK</div>
          </div>
        </div>

        <!-- SAT 17 -->
        <div class="rounded-3xl border-2 border-dashed border-amber-900/40 p-4 flex items-center justify-center text-center">
          <div class="rotate-90 md:rotate-0 text-xs font-black text-amber-700/60 uppercase tracking-[0.3em]">
            WEEKEND HOURS
          </div>
        </div>

        <!-- SUN 18 -->
        <div class="rounded-3xl bg-[#17120a] border-2 border-amber-900/30 p-6 flex flex-col items-center justify-center text-center h-full min-h-[220px]">
          <div class="w-12 h-12 rounded-2xl border-2 border-amber-900/50 flex items-center justify-center text-amber-700 mb-3">
            <mat-icon class="!text-2xl">event_busy</mat-icon>
          </div>
          <div class="text-xs font-black text-amber-700/80 uppercase tracking-widest">CLOSED</div>
        </div>

      </div>

      <!-- Provider Workload Bottom Section -->
      <div class="space-y-6 pt-4 border-t border-amber-900/30">
        <div class="flex items-center justify-between">
          <h2 class="text-3xl font-black text-[#39ff14] tracking-tight drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]">
            Provider Workload
          </h2>
          <button class="text-xs font-black text-amber-400 hover:text-black flex items-center gap-1 uppercase tracking-wider">
            <span>MANAGE SHIFTS</span>
            <mat-icon class="!text-sm">open_in_new</mat-icon>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-5 rounded-3xl bg-[#1c160e] border-2 border-amber-900/40 hover:border-cyan-400 transition-all flex items-center gap-5 shadow-lg group">
            <div class="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(0,240,255,0.4)] flex-shrink-0">
              <img loading="lazy" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&q=80" class="w-full h-full rounded-2xl object-cover">
            </div>
            <div class="flex-1">
              <div class="text-lg font-black text-black group-hover:text-cyan-300 transition-colors">Dr. Aris Thorne</div>
              <div class="flex items-center gap-3 mt-3">
                <div class="flex-1 bg-white/50 h-2.5 rounded-full overflow-hidden border border-amber-900/40">
                  <div class="bg-cyan-400 h-full rounded-full shadow-[0_0_10px_rgba(0,240,255,0.6)]" style="width: 88%"></div>
                </div>
                <span class="text-xs font-black text-cyan-400">88%</span>
              </div>
            </div>
          </div>

          <div class="p-5 rounded-3xl bg-[#1c160e] border-2 border-amber-900/40 hover:border-lime-400 transition-all flex items-center gap-5 shadow-lg group">
            <div class="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-lime-500 to-emerald-500 shadow-[0_0_15px_rgba(57,255,20,0.4)] flex-shrink-0">
              <img loading="lazy" src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&q=80" class="w-full h-full rounded-2xl object-cover">
            </div>
            <div class="flex-1">
              <div class="text-lg font-black text-black group-hover:text-lime-300 transition-colors">James Cooper</div>
              <div class="flex items-center gap-3 mt-3">
                <div class="flex-1 bg-white/50 h-2.5 rounded-full overflow-hidden border border-amber-900/40">
                  <div class="bg-[#39ff14] h-full rounded-full shadow-[0_0_10px_rgba(57,255,20,0.6)]" style="width: 45%"></div>
                </div>
                <span class="text-xs font-black text-lime-400">45%</span>
              </div>
            </div>
          </div>

          <div class="p-5 rounded-3xl bg-[#1c160e] border-2 border-amber-900/40 hover:border-fuchsia-400 transition-all flex items-center gap-5 shadow-lg group">
            <div class="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-fuchsia-500 to-pink-500 shadow-[0_0_15px_rgba(224,36,195,0.4)] flex-shrink-0">
              <img loading="lazy" src="https://images.unsplash.com/photo-1594824813566-78853c829393?w=150&q=80" class="w-full h-full rounded-2xl object-cover">
            </div>
            <div class="flex-1">
              <div class="text-lg font-black text-black group-hover:text-fuchsia-300 transition-colors">Elena Vance</div>
              <div class="flex items-center gap-3 mt-3">
                <div class="flex-1 bg-white/50 h-2.5 rounded-full overflow-hidden border border-amber-900/40">
                  <div class="bg-fuchsia-500 h-full rounded-full shadow-[0_0_10px_rgba(224,36,195,0.6)]" style="width: 95%"></div>
                </div>
                <span class="text-xs font-black text-fuchsia-400">95%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 3. ADD NEW BOOKING MODAL (MULTI-STEP) -->
    <div *ngIf="showModal()" class="fixed inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-[#1c160e] border-2 border-cyan-400 rounded-3xl shadow-[0_0_40px_rgba(0,240,255,0.3)] w-full max-w-2xl p-6 md:p-8 space-y-6 animate-fade-up max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-amber-900/40 pb-4">
          <h2 class="text-2xl font-black text-[#00f0ff] tracking-tight flex items-center gap-2">
            <mat-icon class="!text-2xl">event_available</mat-icon>
            <span>New Admin Appointment</span>
          </h2>
          <button (click)="closeModal()" class="p-1 hover:bg-amber-900/30 rounded-full text-amber-500"><mat-icon>close</mat-icon></button>
        </div>

        <div class="flex items-center mb-6 gap-2 text-xs font-bold text-amber-500/50">
          <div [class.text-cyan-400]="creationStep() === 1">1. Customer</div>
          <div>›</div>
          <div [class.text-cyan-400]="creationStep() === 2">2. Details</div>
          <div>›</div>
          <div [class.text-cyan-400]="creationStep() === 3">3. Payment</div>
        </div>

        <div *ngIf="creationError()" class="bg-red-900/20 border border-red-500 p-3 rounded text-red-400 text-sm font-bold">
          {{ creationError() }}
        </div>

        <form [formGroup]="bookingForm" (ngSubmit)="saveBooking()" class="space-y-4">
          <!-- STEP 1: Customer -->
          <div *ngIf="creationStep() === 1" class="space-y-4">
            <div>
              <label class="text-xs font-black text-amber-400 uppercase tracking-widest block mb-1">Customer ID *</label>
              <input type="number" formControlName="customerId" placeholder="1" class="w-full px-4 py-3 bg-[#0f0c08] border border-amber-900/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400">
              <p class="text-[10px] mt-1 text-amber-700">Enter a valid user ID (e.g. 1 or 2)</p>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-amber-900/40">
              <button type="button" (click)="closeModal()" class="px-5 py-2.5 bg-amber-950/60 hover:bg-amber-900/60 text-amber-400 font-extrabold text-xs rounded-xl">Cancel</button>
              <button type="button" (click)="creationStep.set(2)" class="px-6 py-2.5 bg-cyan-900 hover:bg-cyan-800 text-cyan-400 font-black text-xs uppercase tracking-wider rounded-xl">Next ›</button>
            </div>
          </div>

          <!-- STEP 2: Details -->
          <div *ngIf="creationStep() === 2" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-black text-amber-400 uppercase tracking-widest block mb-1">Service ID *</label>
                <input type="number" formControlName="serviceId" placeholder="1" class="w-full px-4 py-3 bg-[#0f0c08] border border-amber-900/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400">
              </div>
              <div>
                <label class="text-xs font-black text-amber-400 uppercase tracking-widest block mb-1">Employee ID *</label>
                <input type="number" formControlName="employeeId" placeholder="1" class="w-full px-4 py-3 bg-[#0f0c08] border border-amber-900/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-black text-amber-400 uppercase tracking-widest block mb-1">Location ID *</label>
                <input type="number" formControlName="locationId" placeholder="1" class="w-full px-4 py-3 bg-[#0f0c08] border border-amber-900/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-black text-amber-400 uppercase tracking-widest block mb-1">Date (YYYY-MM-DD) *</label>
                <input type="text" formControlName="date" placeholder="2026-09-01" class="w-full px-4 py-3 bg-[#0f0c08] border border-amber-900/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400">
              </div>
              <div>
                <label class="text-xs font-black text-amber-400 uppercase tracking-widest block mb-1">Time (HH:MM:SS) *</label>
                <input type="text" formControlName="time" placeholder="14:00:00" class="w-full px-4 py-3 bg-[#0f0c08] border border-amber-900/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400">
              </div>
            </div>

            <div class="flex justify-between gap-3 pt-4 border-t border-amber-900/40">
              <button type="button" (click)="creationStep.set(1)" class="px-5 py-2.5 bg-amber-950/60 hover:bg-amber-900/60 text-amber-400 font-extrabold text-xs rounded-xl">‹ Back</button>
              <button type="button" (click)="creationStep.set(3)" class="px-6 py-2.5 bg-cyan-900 hover:bg-cyan-800 text-cyan-400 font-black text-xs uppercase tracking-wider rounded-xl">Next ›</button>
            </div>
          </div>

          <!-- STEP 3: Payment -->
          <div *ngIf="creationStep() === 3" class="space-y-4">
            
            <div class="p-4 bg-[#0f0c08] border border-cyan-400/30 rounded-xl mb-4">
              <label class="text-xs font-black text-cyan-400 uppercase tracking-widest block mb-3">Payment Strategy *</label>
              
              <div class="space-y-2">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="radio" formControlName="paymentMethod" value="send_link" class="text-cyan-400 bg-[#1c160e] border-amber-900/50">
                  <span class="text-sm font-bold text-white">Generate Payment Link (Send to customer)</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="radio" formControlName="paymentMethod" value="manual_cash" class="text-cyan-400 bg-[#1c160e] border-amber-900/50">
                  <span class="text-sm font-bold text-white">Mark as Paid (Manual / Cash In-person)</span>
                </label>
              </div>
            </div>

            <div class="flex justify-between gap-3 pt-4 border-t border-amber-900/40">
              <button type="button" (click)="creationStep.set(2)" class="px-5 py-2.5 bg-amber-950/60 hover:bg-amber-900/60 text-amber-400 font-extrabold text-xs rounded-xl">‹ Back</button>
              <button type="submit" [disabled]="bookingForm.invalid || creatingBooking()" class="px-6 py-2.5 bg-[#00f0ff] hover:bg-[#33f3ff] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50 flex items-center gap-2">
                <span *ngIf="creatingBooking()" class="animate-spin border-2 border-black border-t-transparent rounded-full w-4 h-4"></span>
                <span>Confirm & Create</span>
              </button>
            </div>
          </div>

        </form>

        <div *ngIf="createdBookingInfo()" class="mt-4 p-4 border-2 border-emerald-500 bg-emerald-900/20 rounded-xl space-y-3">
          <div class="text-emerald-400 font-black text-sm flex items-center gap-2">
            <mat-icon>check_circle</mat-icon> Booking Created!
          </div>
          <div *ngIf="createdBookingInfo()?.paymentUrl" class="text-white text-xs mt-2">
            <p class="font-bold mb-1">Share this payment link with the customer:</p>
            <div class="flex items-center gap-2">
              <input type="text" readonly [value]="createdBookingInfo()?.paymentUrl" class="flex-1 px-3 py-2 bg-black border border-emerald-500/30 rounded text-emerald-300 font-mono text-[10px]">
              <a [href]="createdBookingInfo()?.paymentUrl" target="_blank" class="px-3 py-2 bg-emerald-600 text-black font-bold rounded">Open</a>
            </div>
          </div>
          <div *ngIf="createdBookingInfo()?.paymentMethod === 'manual'" class="text-white text-xs mt-2">
            <p class="font-bold text-amber-400">Marked as manually paid.</p>
          </div>
          <button (click)="closeModal()" class="mt-4 w-full px-4 py-2 bg-slate-800 text-white rounded font-bold text-xs">Close</button>
        </div>
      </div>
    </div>
  `
})
export class AdminBookingsComponent {
  searchQuery: string = '';
  viewMode: 'Day' | 'Week' | 'Month' = 'Week';
  selectedDay: string = 'WED';
  showModal = signal(false);
  isRescheduling = signal(false);

  selectedBooking = {
    patient: 'Eleanor Shellstrop',
    service: 'Microdermabrasion',
    date: 'May 14, 2024',
    time: '10:30 AM - 11:00 AM'
  };

  selectedNewDay = 16;
  selectedSlot = '11:15 AM';

  creationStep = signal<1|2|3>(1);
  creatingBooking = signal(false);
  creationError = signal<string | null>(null);
  createdBookingInfo = signal<{ paymentUrl?: string, paymentMethod?: string } | null>(null);

  bookingForm: FormGroup;

  daysOfWeek = [
    { name: 'MON', date: '12' },
    { name: 'TUE', date: '13' },
    { name: 'WED', date: '14' },
    { name: 'THU', date: '15' },
    { name: 'FRI', date: '16' },
    { name: 'SAT', date: '17' },
    { name: 'SUN', date: '18' },
  ];

  constructor(private fb: FormBuilder, private http: HttpClient, private authState: AuthStateService) {
    this.bookingForm = this.fb.group({
      customerId: [1, Validators.required],
      serviceId: [1, Validators.required],
      employeeId: [1, Validators.required],
      locationId: [1, Validators.required],
      date: ['2026-09-01', Validators.required],
      time: ['14:00:00', Validators.required],
      paymentMethod: ['send_link', Validators.required]
    });
  }

  selectDay(dayName: string): void {
    this.selectedDay = dayName;
  }

  openCreateModal(): void {
    this.bookingForm.reset({
      customerId: 1,
      serviceId: 1,
      employeeId: 1,
      locationId: 1,
      date: '2026-09-01',
      time: '14:00:00',
      paymentMethod: 'send_link'
    });
    this.creationStep.set(1);
    this.creationError.set(null);
    this.createdBookingInfo.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveBooking(): void {
    if (this.bookingForm.valid) {
      this.creatingBooking.set(true);
      this.creationError.set(null);
      
      const payload = {
        customerId: this.bookingForm.value.customerId,
        serviceIds: [this.bookingForm.value.serviceId],
        date: this.bookingForm.value.date,
        time: this.bookingForm.value.time,
        locationId: this.bookingForm.value.locationId,
        employeeId: this.bookingForm.value.employeeId,
        notes: 'Admin booked via dashboard'
      };

      const headers = { Authorization: `Bearer ${this.authState.token()}` };

      this.http.post<any>(`${environment.apiUrl}/bookings/admin`, payload, { headers })
        .subscribe({
          next: (res) => {
            if (res.success && res.data) {
              const appointmentId = res.data.id;
              const paymentUrl = res.data.payment_url;
              
              if (this.bookingForm.value.paymentMethod === 'manual_cash') {
                // Record manual payment
                this.http.post<any>(`${environment.apiUrl}/payments/record-manual`, {
                  appointmentId,
                  amountJmd: 5000,
                  notes: 'Manual cash payment recorded by admin'
                }, { headers }).subscribe({
                  next: () => {
                    this.creatingBooking.set(false);
                    this.createdBookingInfo.set({ paymentMethod: 'manual' });
                  },
                  error: (err) => {
                    this.creatingBooking.set(false);
                    this.creationError.set('Booking created, but manual payment failed: ' + err.message);
                  }
                });
              } else {
                // Return payment link
                this.creatingBooking.set(false);
                this.createdBookingInfo.set({ paymentUrl });
              }
            } else {
              this.creatingBooking.set(false);
              this.creationError.set(res.message || 'Failed to create booking');
            }
          },
          error: (err) => {
            this.creatingBooking.set(false);
            this.creationError.set(err.error?.message || 'Server error creating booking');
          }
        });
    }
  }

  openReschedule(patientName: string, serviceName: string, dateStr: string, timeStr: string): void {
    this.selectedBooking = {
      patient: patientName,
      service: serviceName,
      date: dateStr,
      time: timeStr
    };
    this.isRescheduling.set(true);
  }

  closeReschedule(): void {
    this.isRescheduling.set(false);
  }

  confirmReschedule(): void {
    alert(`Appointment for ${this.selectedBooking.patient} rescheduled to May ${this.selectedNewDay}, 2024 at ${this.selectedSlot}!`);
    this.closeReschedule();
  }
}
