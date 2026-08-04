import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { RealtimeService } from '../../../core/services/realtime.service';
import { environment } from '../../../../environments/environment';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

// ─── Treatment autocomplete types ───────────────────────────────────────────
interface Treatment {
  id: string; name: string; category: string;
  bodyArea: string; keywords: string[];
  duration: number; price: number;
}
interface TreatmentGroup { category: string; treatments: Treatment[]; }

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <!-- 1. RESCHEDULE APPOINTMENT VIEW (EXACT MATCH TO USER SCREENSHOT, WHITE BACKDROP RE-THEMED) -->
    <div *ngIf="isRescheduling()" class="bg-[#f8fafc] min-h-screen text-slate-800 p-4 md:p-8 font-sans selection:bg-[#b8924f] selection:text-white">
      
      <!-- Breadcrumb & Top Right Actions Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-2 text-xs font-bold">
          <span (click)="closeReschedule()" class="text-slate-500 hover:text-slate-900 cursor-pointer">Appointments</span>
          <span class="text-slate-300">›</span>
          <span class="text-[#b8924f] font-extrabold">Reschedule Booking</span>
        </div>

        <div class="flex items-center gap-4 self-end sm:self-auto">
          <button class="p-2 text-slate-400 hover:text-slate-700"><mat-icon class="!text-xl">notifications</mat-icon></button>
          <button class="p-2 text-slate-400 hover:text-slate-700"><mat-icon class="!text-xl">settings</mat-icon></button>

          <div class="flex items-center gap-2.5 pl-3 pr-2 py-1 bg-white border border-slate-200 rounded-full shadow-xs">
            <div class="text-right">
              <div class="text-xs font-black text-slate-900 leading-tight">Admin User</div>
              <div class="text-[9px] font-extrabold text-[#b8924f] uppercase tracking-widest leading-tight">Super Admin</div>
            </div>
            <div class="w-8 h-8 rounded-full bg-[#b8924f] text-white font-black flex items-center justify-center text-xs shadow-sm">
              H
            </div>
          </div>
        </div>
      </div>

      <!-- Page Header & Cancel Return Button -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight">Reschedule Appointment</h1>
          <p class="text-xs font-semibold text-slate-500 mt-1">Manage and update the date/time for current service bookings.</p>
        </div>

        <button (click)="closeReschedule()" class="px-5 py-2.5 border border-slate-200 text-slate-750 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto bg-white">
          <mat-icon class="!text-base text-slate-500">west</mat-icon>
          <span>Cancel & Return</span>
        </button>
      </div>

      <!-- Middle Content 2-Column Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        <!-- Left Column (Current Booking Card + Select New Date Calendar) -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Current Booking Details Card -->
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div class="flex items-center gap-5">
              <img loading="lazy" src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&q=80" class="w-24 flex-1 min-h-[60px] rounded-2xl object-cover border border-slate-100 shadow-xs flex-shrink-0">
              <div class="space-y-2 text-left">
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 bg-slate-100 text-slate-805 border border-slate-200 font-extrabold text-[10px] uppercase tracking-wider rounded-md">CURRENT BOOKING</span>
                  <span class="text-xs font-bold text-[#b8924f]">ID: #HHC-88219</span>
                </div>
                <h3 class="text-2xl font-serif font-bold text-slate-900 tracking-tight">{{ selectedBooking.service }}</h3>
                <div class="text-xs font-bold text-slate-600">Patient: <span class="font-extrabold text-slate-900">{{ selectedBooking.patient }}</span></div>
                
                <div class="flex flex-wrap items-center gap-3 pt-1">
                  <div class="px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 border border-slate-150">
                    <mat-icon class="!text-base text-slate-400">calendar_today</mat-icon>
                    <span>{{ selectedBooking.date }}</span>
                  </div>
                  <div class="px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 border border-slate-150">
                    <mat-icon class="!text-base text-slate-400">schedule</mat-icon>
                    <span>{{ selectedBooking.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Select New Date Calendar Box -->
          <div class="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <mat-icon class="text-[#b8924f]">calendar_month</mat-icon>
                <span>Select New Date</span>
              </h3>

              <div class="flex items-center gap-4 text-sm font-extrabold text-slate-800">
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
                <div class="p-3 text-slate-200">28</div>
                <div class="p-3 text-slate-200">29</div>
                <div class="p-3 text-slate-200">30</div>

                <div (click)="selectedNewDay = 1" [class.bg-[#b8924f]]="selectedNewDay === 1" [class.text-white]="selectedNewDay === 1" class="p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100">1</div>
                <div (click)="selectedNewDay = 2" [class.bg-[#b8924f]]="selectedNewDay === 2" [class.text-white]="selectedNewDay === 2" class="p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100">2</div>
                <div (click)="selectedNewDay = 3" [class.bg-[#b8924f]]="selectedNewDay === 3" [class.text-white]="selectedNewDay === 3" class="p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100">3</div>
                <div (click)="selectedNewDay = 4" [class.bg-[#b8924f]]="selectedNewDay === 4" [class.text-white]="selectedNewDay === 4" class="p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100">4</div>

                <div (click)="selectedNewDay = 5" [class.bg-[#b8924f]]="selectedNewDay === 5" [class.text-white]="selectedNewDay === 5" [class.bg-slate-100]="selectedNewDay !== 5" class="p-3 rounded-2xl text-slate-800 font-extrabold cursor-pointer transition-all">5</div>
                <div (click)="selectedNewDay = 6" [class.bg-[#b8924f]]="selectedNewDay === 6" [class.text-white]="selectedNewDay === 6" class="p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100">6</div>
                <div (click)="selectedNewDay = 7" [class.bg-[#b8924f]]="selectedNewDay === 7" [class.text-white]="selectedNewDay === 7" class="p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100">7</div>
                <div (click)="selectedNewDay = 8" [class.bg-[#b8924f]]="selectedNewDay === 8" [class.text-white]="selectedNewDay === 8" class="p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100">8</div>
                <div (click)="selectedNewDay = 9" [class.bg-[#b8924f]]="selectedNewDay === 9" [class.text-white]="selectedNewDay === 9" class="p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100">9</div>
                <div (click)="selectedNewDay = 10" [class.bg-[#b8924f]]="selectedNewDay === 10" [class.text-white]="selectedNewDay === 10" class="p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100">10</div>
                <div (click)="selectedNewDay = 11" [class.bg-[#b8924f]]="selectedNewDay === 11" [class.text-white]="selectedNewDay === 11" class="p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100">11</div>

                <div (click)="selectedNewDay = 12" [class.bg-[#b8924f]]="selectedNewDay === 12" [class.text-white]="selectedNewDay === 12" class="p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100">12</div>
                <div (click)="selectedNewDay = 13" [class.bg-[#b8924f]]="selectedNewDay === 13" [class.text-white]="selectedNewDay === 13" class="p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100">13</div>
                
                <div (click)="selectedNewDay = 14" [class.bg-[#b8924f]]="selectedNewDay === 14" [class.text-white]="selectedNewDay === 14" class="p-3 rounded-2xl border border-slate-300 text-slate-800 font-extrabold cursor-pointer">14</div>
                
                <div (click)="selectedNewDay = 15" [class.bg-[#b8924f]]="selectedNewDay === 15" [class.text-white]="selectedNewDay === 15" class="p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100">15</div>
                
                <div (click)="selectedNewDay = 16" [class.bg-[#b8924f]]="selectedNewDay === 16" [class.text-white]="selectedNewDay === 16" [class.bg-slate-100]="selectedNewDay !== 16" class="p-3 rounded-2xl text-slate-800 font-extrabold cursor-pointer transition-all">16</div>
                
                <div (click)="selectedNewDay = 17" [class.bg-[#b8924f]]="selectedNewDay === 17" [class.text-white]="selectedNewDay === 17" class="p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100">17</div>
                <div (click)="selectedNewDay = 18" [class.bg-[#b8924f]]="selectedNewDay === 18" [class.text-white]="selectedNewDay === 18" class="p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100">18</div>
              </div>
            </div>

            <!-- Calendar Legend -->
            <div class="flex items-center gap-6 pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-[#b8924f]"></span>
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
          <div class="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
            <h3 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <mat-icon class="text-emerald-500">schedule</mat-icon>
              <span>Available Slots</span>
            </h3>

            <!-- Morning Slots -->
            <div class="space-y-2 text-left">
              <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">MORNING</div>
              <div class="grid grid-cols-2 gap-3 text-xs font-extrabold">
                <button (click)="selectedSlot = '09:00 AM'" 
                        [class.bg-[#b8924f]]="selectedSlot === '09:00 AM'" 
                        [class.text-white]="selectedSlot === '09:00 AM'" 
                        [class.bg-white]="selectedSlot !== '09:00 AM'"
                        [class.text-slate-700]="selectedSlot !== '09:00 AM'"
                        class="py-3 border border-slate-200 rounded-2xl hover:border-slate-400">09:00 AM</button>
                <button (click)="selectedSlot = '11:15 AM'" 
                        [class.bg-[#b8924f]]="selectedSlot === '11:15 AM'" 
                        [class.text-white]="selectedSlot === '11:15 AM'" 
                        [class.bg-white]="selectedSlot !== '11:15 AM'"
                        [class.text-slate-700]="selectedSlot !== '11:15 AM'"
                        class="py-3 border border-slate-200 rounded-2xl hover:border-slate-400">11:15 AM</button>
                <button (click)="selectedSlot = '11:45 AM'" 
                        [class.bg-[#b8924f]]="selectedSlot === '11:45 AM'" 
                        [class.text-white]="selectedSlot === '11:45 AM'" 
                        [class.bg-white]="selectedSlot !== '11:45 AM'"
                        [class.text-slate-700]="selectedSlot !== '11:45 AM'"
                        class="py-3 border border-slate-200 rounded-2xl hover:border-slate-400">11:45 AM</button>
              </div>
            </div>

            <!-- Afternoon Slots -->
            <div class="space-y-2 pt-2 text-left">
              <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">AFTERNOON</div>
              <div class="grid grid-cols-2 gap-3 text-xs font-extrabold">
                <button (click)="selectedSlot = '01:30 PM'" 
                        [class.bg-[#b8924f]]="selectedSlot === '01:30 PM'" 
                        [class.text-white]="selectedSlot === '01:30 PM'" 
                        class="py-3 bg-white border border-slate-200 rounded-2xl hover:border-slate-400 text-slate-700">01:30 PM</button>
                <button (click)="selectedSlot = '02:15 PM'" 
                        [class.bg-[#b8924f]]="selectedSlot === '02:15 PM'" 
                        [class.text-white]="selectedSlot === '02:15 PM'" 
                        class="py-3 bg-white border border-slate-200 rounded-2xl hover:border-slate-400 text-slate-700">02:15 PM</button>
                <button disabled class="py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-300 cursor-not-allowed">03:00 PM</button>
                <button (click)="selectedSlot = '04:30 PM'" 
                        [class.bg-[#b8924f]]="selectedSlot === '04:30 PM'" 
                        [class.text-white]="selectedSlot === '04:30 PM'" 
                        class="py-3 bg-white border border-slate-200 rounded-2xl hover:border-slate-400 text-slate-700">04:30 PM</button>
              </div>
            </div>

            <!-- Schedule Summary Card -->
            <div class="p-4 rounded-2xl bg-slate-50 border-l-4 border-[#b8924f] space-y-1 text-left">
              <div class="text-xs font-black text-slate-900">Schedule Summary</div>
              <p class="text-xs font-bold text-slate-600">
                Rescheduling from <span class="text-rose-500 font-extrabold">May 14 at 10:30 AM</span> to <span class="text-slate-800 font-black">May 16 at {{ selectedSlot }}.</span>
              </p>
            </div>

            <!-- Update Booking Action Button -->
            <button (click)="confirmReschedule()" class="w-full py-4 bg-[#b8924f] hover:bg-[#a6803b] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
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
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-[#b8924f] hover:shadow-md transition-all cursor-pointer space-y-3 group text-left">
          <div class="w-10 h-10 rounded-2xl bg-[#b8924f]/10 text-[#b8924f] flex items-center justify-center group-hover:scale-110 transition-transform">
            <mat-icon class="!text-xl">chat</mat-icon>
          </div>
          <h4 class="text-base font-bold text-slate-900 tracking-tight">Add Appointment Note</h4>
          <p class="text-xs font-semibold text-slate-500">Mention special requests or clinical prerequisites for this visit.</p>
        </div>

        <!-- Card 2: Change Provider -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-[#b8924f] hover:shadow-md transition-all cursor-pointer space-y-3 group text-left">
          <div class="w-10 h-10 rounded-2xl bg-[#b8924f]/10 text-[#b8924f] flex items-center justify-center group-hover:scale-110 transition-transform">
            <mat-icon class="!text-xl">badge</mat-icon>
          </div>
          <h4 class="text-base font-bold text-slate-900 tracking-tight">Change Provider</h4>
          <p class="text-xs font-semibold text-slate-500">Currently: <span class="font-extrabold text-slate-800">Dr. Sarah Jenkins</span>. Click to switch.</p>
        </div>

        <!-- Card 3: Cancel Appointment -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer space-y-3 group text-left">
          <div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <mat-icon class="!text-xl">cancel</mat-icon>
          </div>
          <h4 class="text-base font-bold text-slate-900 tracking-tight">Cancel Appointment</h4>
          <p class="text-xs font-semibold text-slate-500">Permanently remove this booking from the schedule entirely.</p>
        </div>

      </div>

      <!-- Footer -->
      <div class="text-center text-xs font-bold text-slate-400 border-t border-slate-200 pt-6">
        © 2024 HHC Laser Admin Portal. <span class="text-[#b8924f] font-extrabold">Precise Care, Modern Excellence.</span>
      </div>

    </div>    <!-- 2. SCHEDULE GRID VIEW (RE-THEMED WHITE APPOINTMENTS VIEW) -->
    <div *ngIf="!isRescheduling()" class="min-h-screen bg-[#f8fafc] text-slate-800 p-4 md:p-8 font-sans selection:bg-cyan-500 selection:text-black">
      
      <!-- Top Search & Actions Bar (from image) -->
      <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-6">
        <!-- Search Field -->
        <div class="relative flex-1 max-w-xl">
          <mat-icon class="absolute left-4 top-3.5 !text-lg text-slate-400">search</mat-icon>
          <input type="text"
                 [(ngModel)]="searchQuery"
                 placeholder="Search appointments, patients, phone, booking #..."
                 class="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#007aff] transition-all shadow-xs">
        </div>

        <!-- Right Side Actions -->
        <div class="flex flex-wrap items-center gap-4">
          <!-- + New Appointment Dropdown Button -->
          <div class="relative">
            <button (click)="openCreateModal()" class="px-5 py-3 bg-[#007aff] hover:bg-[#0062cc] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center gap-2 transform active:scale-95">
              <mat-icon class="!text-lg">add</mat-icon>
              <span>New Appointment</span>
              <mat-icon class="!text-sm">keyboard_arrow_down</mat-icon>
            </button>
          </div>

          <!-- Notification Bell with count 5 -->
          <button class="relative w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-350 transition-all shadow-xs">
            <mat-icon class="!text-xl">notifications</mat-icon>
            <span class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white font-black text-[9px] flex items-center justify-center border-2 border-white">5</span>
          </button>

          <!-- Settings Button -->
          <button class="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-350 transition-all shadow-xs">
            <mat-icon class="!text-xl">settings</mat-icon>
          </button>

          <!-- User profile metadata matching admin user -->
          <div class="flex items-center gap-3 pl-2 py-1.5 pr-4 bg-white border border-slate-200 rounded-full shadow-xs">
            <div class="w-8 h-8 rounded-full bg-[#007aff] text-white font-black flex items-center justify-center text-xs shadow-xs">
              A
            </div>
            <div class="text-left flex items-center gap-1.5">
              <div>
                <div class="text-xs font-black text-slate-800 leading-tight">Admin User</div>
                <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">CLINIC MANAGER</div>
              </div>
              <mat-icon class="!text-sm text-slate-400">keyboard_arrow_down</mat-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Header Row (Location and View) -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 text-left">
        <!-- Location filter buttons matching HHC terminal styling -->
        <div class="flex flex-col gap-2">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">LOCATION</span>
          <div class="flex flex-wrap items-center gap-2">
            <!-- All Clinics -->
            <button (click)="selectedLocationFilter = 'all'"
                    [class.bg-white]="selectedLocationFilter === 'all'"
                    [class.border-slate-300]="selectedLocationFilter === 'all'"
                    [class.text-slate-800]="selectedLocationFilter === 'all'"
                    [class.bg-slate-50]="selectedLocationFilter !== 'all'"
                    [class.border-slate-200]="selectedLocationFilter !== 'all'"
                    [class.text-slate-500]="selectedLocationFilter !== 'all'"
                    class="px-4 py-2 border rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-xs">
              <mat-icon class="!text-sm">language</mat-icon>
              <span>All Clinics</span>
            </button>
            
            <!-- Constant Spring -->
            <button (click)="selectedLocationFilter = 'cs'"
                    [class.bg-blue-50]="selectedLocationFilter === 'cs'"
                    [class.border-blue-300]="selectedLocationFilter === 'cs'"
                    [class.text-blue-800]="selectedLocationFilter === 'cs'"
                    [class.bg-slate-50]="selectedLocationFilter !== 'cs'"
                    [class.border-slate-200]="selectedLocationFilter !== 'cs'"
                    [class.text-slate-500]="selectedLocationFilter !== 'cs'"
                    class="px-4 py-2 border rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-xs">
              <span class="w-5 h-5 rounded-md bg-blue-600 text-white font-black text-[9px] flex items-center justify-center">CS</span>
              <span>Constant Spring</span>
            </button>
            
            <!-- Mannings Hill -->
            <button (click)="selectedLocationFilter = 'mh'"
                    [class.bg-orange-500]="selectedLocationFilter === 'mh'"
                    [class.border-orange-600]="selectedLocationFilter === 'mh'"
                    [class.text-white]="selectedLocationFilter === 'mh'"
                    [class.bg-slate-50]="selectedLocationFilter !== 'mh'"
                    [class.border-slate-200]="selectedLocationFilter !== 'mh'"
                    [class.text-slate-500]="selectedLocationFilter !== 'mh'"
                    class="px-4 py-2 border rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-xs">
              <span class="w-5 h-5 rounded-md bg-white text-orange-600 font-black text-[9px] flex items-center justify-center border border-orange-200">MH</span>
              <span>Mannings Hill</span>
            </button>
          </div>
        </div>

        <!-- View Controls (Day, Week, Month) -->
        <div class="flex flex-col gap-2">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">VIEW</span>
          <div class="bg-slate-100 border border-slate-200 p-1 rounded-2xl flex items-center shadow-xs">
            <button (click)="viewMode = 'Day'" [ngClass]="{'bg-white': viewMode === 'Day', 'text-slate-900': viewMode === 'Day', 'text-slate-500': viewMode !== 'Day'}" class="px-5 py-2 rounded-xl text-xs font-extrabold hover:text-slate-850 transition-all shadow-xs">Day</button>
            <button (click)="viewMode = 'Week'" [ngClass]="{'bg-white': viewMode === 'Week', 'text-slate-900': viewMode === 'Week', 'text-slate-500': viewMode !== 'Week'}" class="px-5 py-2 rounded-xl text-xs font-extrabold hover:text-slate-850 transition-all shadow-xs">Week</button>
            <button (click)="viewMode = 'Month'" [ngClass]="{'bg-white': viewMode === 'Month', 'text-slate-900': viewMode === 'Month', 'text-slate-500': viewMode !== 'Month'}" class="px-5 py-2 rounded-xl text-xs font-extrabold hover:text-slate-850 transition-all shadow-xs">Month</button>
          </div>
        </div>
      </div>

      <!-- Dropdown selectors row (Staff, Service, Status) -->
      <div class="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-3xl mb-6 shadow-xs text-left">
        <div class="flex flex-wrap items-center gap-6">
          <!-- Staff filter -->
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Staff</span>
            <select [(ngModel)]="staffFilter" (change)="filterAppointments()" class="px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#007aff] transition-all">
              <option value="all">All Staff</option>
              <option value="sarah">Sarah Jenkins</option>
              <option value="marcus">Marcus Wright</option>
              <option value="james">James Cooper</option>
            </select>
          </div>

          <!-- Service filter – Smart Autocomplete -->
          <div class="flex items-center gap-2 relative">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Service</span>
            <div class="relative">
              <mat-icon class="absolute left-2.5 top-1.5 !text-sm text-slate-400 pointer-events-none z-10">search</mat-icon>
              <input type="text"
                     [formControl]="serviceCtrl"
                     (focus)="showServiceDropdown = true"
                     (keydown)="onServiceKeydown($event)"
                     (blur)="onServiceBlur()"
                     placeholder="All Services"
                     aria-label="Treatment search"
                     aria-autocomplete="list"
                     autocomplete="off"
                     class="pl-8 pr-7 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#007aff] transition-all w-48">
              <button *ngIf="serviceCtrl.value" (mousedown)="clearServiceFilter()" type="button"
                      class="absolute right-2 top-1.5 text-slate-400 hover:text-slate-700 z-10">
                <mat-icon class="!text-base leading-none">close</mat-icon>
              </button>

              <!-- Autocomplete dropdown panel -->
              <div *ngIf="showServiceDropdown"
                   role="listbox" aria-label="Treatment suggestions"
                   class="absolute top-full left-0 mt-1.5 w-[22rem] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[999] max-h-96 overflow-y-auto">

                <!-- Empty state: Recent + Most Booked -->
                <ng-container *ngIf="!serviceCtrl.value || serviceCtrl.value.length < 2">
                  <div *ngIf="recentTreatments.length > 0">
                    <div class="px-4 pt-3 pb-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <mat-icon class="!text-xs !w-3 !h-3">history</mat-icon> Recent Treatments
                    </div>
                    <div *ngFor="let t of recentTreatments; let i = index"
                         (mousedown)="selectTreatmentOption(t)"
                         role="option"
                         [class.bg-blue-50]="activeDropdownIndex === i"
                         class="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors border-l-2 border-transparent hover:border-[#007aff]">
                      <div class="text-left">
                        <div class="text-xs font-bold text-slate-800">{{ t.name }}</div>
                        <div class="text-[10px] text-slate-400 font-semibold">{{ t.category }}</div>
                      </div>
                      <div class="text-right shrink-0">
                        <div class="text-[10px] font-black text-slate-700">{{ t.duration }}m</div>
                        <div class="text-[10px] font-bold text-[#b8924f]">J\${{ t.price | number:'1.0-0' }}</div>
                      </div>
                    </div>
                  </div>

                  <div [class.border-t]="recentTreatments.length > 0" class="border-slate-100">
                    <div class="px-4 pt-3 pb-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <mat-icon class="!text-xs !w-3 !h-3">trending_up</mat-icon> Most Booked
                    </div>
                    <div *ngFor="let t of mostBookedTreatments; let i = index"
                         (mousedown)="selectTreatmentOption(t)"
                         role="option"
                         [class.bg-blue-50]="activeDropdownIndex === (recentTreatments.length + i)"
                         class="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors border-l-2 border-transparent hover:border-[#b8924f]">
                      <div class="flex items-center gap-2 text-left">
                        <span class="w-5 h-5 rounded-full bg-[#b8924f]/10 text-[#b8924f] flex items-center justify-center text-[8px] font-black shrink-0">{{ i + 1 }}</span>
                        <div>
                          <div class="text-xs font-bold text-slate-800">{{ t.name }}</div>
                          <div class="text-[10px] text-slate-400 font-semibold">{{ t.category }}</div>
                        </div>
                      </div>
                      <div class="text-right shrink-0">
                        <div class="text-[10px] font-black text-slate-700">{{ t.duration }}m</div>
                        <div class="text-[10px] font-bold text-[#b8924f]">J\${{ t.price | number:'1.0-0' }}</div>
                      </div>
                    </div>
                  </div>
                </ng-container>

                <!-- Search results grouped by category -->
                <ng-container *ngIf="serviceCtrl.value && serviceCtrl.value.length >= 2">
                  <ng-container *ngIf="groupedFilteredTreatments.length > 0; else noTreatmentResults">
                    <div *ngFor="let group of groupedFilteredTreatments; let gi = index">
                      <div class="px-4 pt-3 pb-1 text-[9px] font-black text-slate-400 uppercase tracking-widest"
                           [class.border-t]="gi > 0" [class.border-slate-100]="gi > 0">{{ group.category }}</div>
                      <div *ngFor="let t of group.treatments"
                           (mousedown)="selectTreatmentOption(t)"
                           role="option"
                           class="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors border-l-2 border-transparent hover:border-[#007aff]">
                        <div class="text-left">
                          <div class="text-xs font-bold text-slate-800" [innerHTML]="highlightMatch(t.name, serviceCtrl.value!)"></div>
                          <div class="text-[10px] text-slate-400 font-semibold">{{ t.bodyArea }}</div>
                        </div>
                        <div class="text-right shrink-0">
                          <div class="text-[10px] font-black text-slate-700">{{ t.duration }}m</div>
                          <div class="text-[10px] font-bold text-[#b8924f]">J\${{ t.price | number:'1.0-0' }}</div>
                        </div>
                      </div>
                    </div>
                  </ng-container>
                  <ng-template #noTreatmentResults>
                    <div class="px-4 py-8 text-center flex flex-col items-center gap-2">
                      <mat-icon class="text-slate-300 !text-4xl">search_off</mat-icon>
                      <div class="text-xs font-bold text-slate-400">No treatments match "{{ serviceCtrl.value }}"</div>
                    </div>
                  </ng-template>
                </ng-container>

              </div>
            </div>
          </div>

          <!-- Status filter -->
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</span>
            <select [(ngModel)]="statusFilter" (change)="filterAppointments()" class="px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#007aff] transition-all">
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked-in">Checked In</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <!-- More Filters -->
        <button class="px-4 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-extrabold text-slate-700 flex items-center gap-1.5 transition-all shadow-xs">
          <span>More Filters</span>
          <mat-icon class="!text-base text-slate-500">filter_list</mat-icon>
        </button>
      </div>

      <!-- Stats Metrics Cards Row -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <!-- Today Appointments (Blue) -->
        <div class="bg-[#007aff] text-white p-4 rounded-3xl shadow-xs flex items-center gap-4 text-left relative overflow-hidden">
          <div class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <mat-icon class="!text-xl">event_note</mat-icon>
          </div>
          <div>
            <div class="text-3xl font-black leading-none">34</div>
            <div class="text-[9px] font-black uppercase tracking-wider text-white/80 mt-1">TODAY Appointments</div>
          </div>
        </div>

        <!-- Checked In (Green) -->
        <div class="bg-[#34c759] text-white p-4 rounded-3xl shadow-xs flex items-center gap-4 text-left relative overflow-hidden">
          <div class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <mat-icon class="!text-xl">check_circle</mat-icon>
          </div>
          <div>
            <div class="text-3xl font-black leading-none">12</div>
            <div class="text-[9px] font-black uppercase tracking-wider text-white/80 mt-1">CHECKED IN <span class="font-extrabold opacity-60">(35%)</span></div>
          </div>
        </div>

        <!-- Waiting (Orange) -->
        <div class="bg-[#ff9500] text-white p-4 rounded-3xl shadow-xs flex items-center gap-4 text-left relative overflow-hidden">
          <div class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <mat-icon class="!text-xl">hourglass_empty</mat-icon>
          </div>
          <div>
            <div class="text-3xl font-black leading-none">8</div>
            <div class="text-[9px] font-black uppercase tracking-wider text-white/80 mt-1">WAITING <span class="font-extrabold opacity-60">(24%)</span></div>
          </div>
        </div>

        <!-- Completed (Purple) -->
        <div class="bg-[#af52de] text-white p-4 rounded-3xl shadow-xs flex items-center gap-4 text-left relative overflow-hidden">
          <div class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <mat-icon class="!text-xl">done_all</mat-icon>
          </div>
          <div>
            <div class="text-3xl font-black leading-none">14</div>
            <div class="text-[9px] font-black uppercase tracking-wider text-white/80 mt-1">COMPLETED <span class="font-extrabold opacity-60">(41%)</span></div>
          </div>
        </div>

        <!-- Revenue (Teal) -->
        <div class="bg-[#1f9397] text-white p-4 rounded-3xl shadow-xs col-span-2 md:col-span-1 flex items-center gap-4 text-left relative overflow-hidden">
          <div class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <mat-icon class="!text-xl">monetization_on</mat-icon>
          </div>
          <div>
            <div class="text-lg font-black leading-none">J$ 245,000</div>
            <div class="text-[9px] font-black uppercase tracking-wider text-white/80 mt-1">REVENUE Expected</div>
          </div>
        </div>
      </div>

      <!-- Main Columns: Scheduler + Right Sidebar -->
      <div class="grid grid-cols-1 xl:grid-cols-4 gap-6 text-left">
        
        <!-- Left 3 Columns: Grid Table -->
        <div class="xl:col-span-3 space-y-6">
          <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            
            <!-- Calendar Navigation Header -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div class="flex items-center gap-3">
                <button class="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-xs">
                  <mat-icon class="!text-sm">chevron_left</mat-icon>
                  <span>Previous Week</span>
                </button>
                <button class="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl shadow-xs">Today</button>
                <button class="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-xs">
                  <span>Next Week</span>
                  <mat-icon class="!text-sm">chevron_right</mat-icon>
                </button>
                
                <h2 class="text-xl font-bold text-slate-900 font-serif flex items-center gap-1.5 ml-2 cursor-pointer">
                  <span>May 12 – 18, 2024</span>
                  <mat-icon class="text-slate-400">keyboard_arrow_down</mat-icon>
                </h2>
              </div>
              
              <!-- Export button -->
              <button class="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-xs">
                <span>Export</span>
                <mat-icon class="!text-sm text-slate-500">download</mat-icon>
              </button>
            </div>

            <!-- Legend Dots -->
            <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-slate-500 mb-6 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
              <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#007aff]"></span><span>Confirmed</span></div>
              <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#34c759]"></span><span>Checked In</span></div>
              <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#ff9500]"></span><span>In Progress</span></div>
              <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#af52de]"></span><span>Completed</span></div>
              <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span><span>Cancelled</span></div>
              <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span><span>No Show</span></div>
              <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-slate-200 stripe-bg"></span><span>Blocked</span></div>
            </div>

            <!-- Calendar Table Grid -->
            <div class="overflow-x-auto">
              <div class="min-w-[900px] border border-slate-200 rounded-2xl overflow-hidden relative">
                <!-- Grid header (Days) -->
                <div class="grid grid-cols-8 bg-slate-50 border-b border-slate-200 text-center font-black py-3 text-[11px] text-slate-500 uppercase tracking-widest">
                  <div class="border-r border-slate-200">Time</div>
                  <div class="border-r border-slate-200">MON 12</div>
                  <div class="border-r border-slate-200">TUE 13</div>
                  <div class="border-r border-slate-200 bg-blue-50/50 text-[#007aff] relative">
                    WED 14
                    <span class="absolute top-1 right-2 px-1.5 py-0.5 bg-[#007aff] text-white text-[8px] font-black rounded-full">TODAY</span>
                  </div>
                  <div class="border-r border-slate-200">THU 15</div>
                  <div class="border-r border-slate-200">FRI 16</div>
                  <div class="border-r border-slate-200">SAT 17</div>
                  <div>SUN 18</div>
                </div>

                <!-- Grid rows -->
                <div class="relative bg-white divide-y divide-slate-100 text-xs font-semibold text-slate-700 flex flex-col h-[calc(100vh-320px)] min-h-[500px]">
                  <div *ngFor="let hour of hours" class="grid grid-cols-8 flex-1 min-h-[60px] divide-x divide-slate-150 relative">
                    <!-- Hour label -->
                    <div class="p-2 text-right bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-start justify-end pt-1.5 pr-3">{{ hour }}</div>

                    <!-- MON 12 Column -->
                    <div class="p-1 relative group hover:bg-slate-50/50 transition-colors">
                      <!-- sarah jenkins card at 09:00 AM -->
                      <div *ngIf="hour === '09:00 AM'" (click)="openReschedule(1, 'Sarah Jenkins', 'Laser Hair Removal', 'May 12, 2024', '09:00 AM')"
                           class="absolute inset-x-1.5 z-10 bg-blue-50 border-l-4 border-[#007aff] rounded-xl p-2.5 shadow-xs hover:shadow-md cursor-pointer hover:-translate-y-0.5 transition-all text-left" style="top: 4px; height: calc(150% - 8px);">
                        <div class="text-[8px] font-black text-[#007aff] uppercase tracking-wider">09:00 AM</div>
                        <h4 class="text-xs font-black text-slate-900 leading-tight mt-0.5">Sarah Jenkins</h4>
                        <p class="text-[9px] font-semibold text-slate-500">Laser Hair Removal</p>
                        <span class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[8px] font-black rounded border border-blue-200">CS</span>
                      </div>
                      <!-- marcus wright card at 11:30 AM -->
                      <div *ngIf="hour === '11:00 AM'" (click)="openReschedule(2, 'Marcus Wright', 'Body / Skin Detox', 'May 12, 2024', '11:30 AM')"
                           class="absolute inset-x-1.5 z-10 bg-purple-50 border-l-4 border-[#af52de] rounded-xl p-2.5 shadow-xs hover:shadow-md cursor-pointer hover:-translate-y-0.5 transition-all text-left" style="top: 50%; height: calc(125% - 8px);">
                        <div class="text-[8px] font-black text-[#af52de] uppercase tracking-wider">11:30 AM</div>
                        <h4 class="text-xs font-black text-slate-900 leading-tight mt-0.5">Marcus Wright</h4>
                        <p class="text-[9px] font-semibold text-slate-500">Body / Skin Detox</p>
                        <span class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-purple-100 text-purple-800 text-[8px] font-black rounded border border-purple-200">MH</span>
                      </div>
                      <!-- quick check card at 02:30 PM -->
                      <div *ngIf="hour === '02:00 PM'" (click)="openReschedule(3, 'Quick Consult', 'Quick Check', 'May 12, 2024', '02:30 PM')"
                           class="absolute inset-x-1.5 z-10 bg-emerald-50 border-l-4 border-[#34c759] rounded-xl p-2.5 shadow-xs hover:shadow-md cursor-pointer hover:-translate-y-0.5 transition-all text-left" style="top: 50%; height: calc(75% - 8px);">
                        <div class="flex items-center justify-between text-[8px] font-black text-[#34c759] uppercase tracking-wider">
                          <span>02:30 PM</span>
                          <span>15m</span>
                        </div>
                        <h4 class="text-xs font-black text-slate-900 leading-tight mt-0.5">Quick Consult</h4>
                        <span class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-805 text-[8px] font-black rounded border border-emerald-250">CS</span>
                      </div>
                    </div>

                    <!-- TUE 13 Column -->
                    <div class="p-1 relative group hover:bg-slate-50/50 transition-colors">
                      <!-- eleanor rigby card at 10:15 AM -->
                      <div *ngIf="hour === '10:00 AM'" (click)="openReschedule(4, 'Eleanor Rigby', 'Consultation', 'May 13, 2024', '10:15 AM')"
                           class="absolute inset-x-1.5 z-10 bg-orange-50 border-l-4 border-[#ff9500] rounded-xl p-2.5 shadow-xs hover:shadow-md cursor-pointer hover:-translate-y-0.5 transition-all text-left" style="top: 25%; height: calc(150% - 8px);">
                        <div class="text-[8px] font-black text-[#ff9500] uppercase tracking-wider">10:15 AM</div>
                        <h4 class="text-xs font-black text-slate-900 leading-tight mt-0.5">Eleanor Rigby</h4>
                        <p class="text-[9px] font-semibold text-slate-500">Consultation</p>
                        <span class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-orange-100 text-orange-850 text-[8px] font-black rounded border border-orange-200">CS</span>
                      </div>
                      <!-- staff meeting blocked slot at 01:00 PM - 02:00 PM -->
                      <div *ngIf="hour === '01:00 PM'"
                           class="absolute inset-x-1.5 z-10 bg-slate-50 hover:bg-slate-100 rounded-xl p-2 flex flex-col justify-center border border-slate-200 border-dashed text-left stripe-bg" style="top: 4px; height: calc(100% - 8px);">
                        <div class="text-[8px] font-black text-slate-400 uppercase tracking-wider">01:00 PM – 02:00 PM</div>
                        <h4 class="text-xs font-extrabold text-slate-650 mt-0.5 leading-tight">Staff Meeting</h4>
                        <span class="absolute bottom-1.5 right-2 px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[8px] font-black rounded">CS</span>
                      </div>
                    </div>

                    <!-- WED 14 Column (Highlighted column) -->
                    <div class="p-1 relative group bg-blue-50/10 hover:bg-blue-50/20 transition-colors">
                      <!-- eleanor shellstrop card at 10:30 AM -->
                      <div *ngIf="hour === '10:00 AM'" (click)="openReschedule(5, 'Eleanor Shellstrop', 'Microdermabrasion', 'May 14, 2024', '10:30 AM')"
                           class="absolute inset-x-1.5 z-10 bg-blue-50 border border-[#b8924f] border-l-4 border-l-[#007aff] rounded-xl p-2.5 shadow-xs hover:shadow-md cursor-pointer hover:-translate-y-0.5 transition-all text-left" style="top: 50%; height: calc(125% - 8px);">
                        <div class="text-[8px] font-black text-[#007aff] uppercase tracking-wider">10:30 AM</div>
                        <h4 class="text-xs font-black text-slate-900 leading-tight mt-0.5">Eleanor Shellstrop</h4>
                        <p class="text-[9px] font-semibold text-slate-500">Microdermabrasion</p>
                        <div class="absolute bottom-2 left-2.5 px-2 py-0.5 bg-[#b8924f] text-white text-[7px] font-black tracking-wider uppercase rounded">IN PROGRESS</div>
                        <span class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[8px] font-black rounded border border-blue-200">CS</span>
                      </div>
                      <!-- amelia pond card at 11:00 AM -->
                      <div *ngIf="hour === '11:00 AM'" (click)="openReschedule(6, 'Amelia Pond', 'Facial Resurfacing', 'May 14, 2024', '11:00 AM')"
                           class="absolute inset-x-1.5 z-10 bg-purple-50 border-l-4 border-[#af52de] rounded-xl p-2.5 shadow-xs hover:shadow-md cursor-pointer hover:-translate-y-0.5 transition-all text-left" style="top: 4px; height: calc(100% - 8px);">
                        <div class="text-[8px] font-black text-[#af52de] uppercase tracking-wider">11:00 AM</div>
                        <h4 class="text-xs font-black text-slate-900 leading-tight mt-0.5">Amelia Pond</h4>
                        <span class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-purple-100 text-purple-800 text-[8px] font-black rounded border border-purple-200">CS</span>
                      </div>
                      <!-- martha jones card at 03:00 PM -->
                      <div *ngIf="hour === '03:00 PM'" (click)="openReschedule(7, 'Martha Jones', 'Chemical Peel', 'May 14, 2024', '03:00 PM')"
                           class="absolute inset-x-1.5 z-10 bg-orange-50 border-l-4 border-[#ff9500] rounded-xl p-2.5 shadow-xs hover:shadow-md cursor-pointer hover:-translate-y-0.5 transition-all text-left" style="top: 4px; height: calc(100% - 8px);">
                        <div class="text-[8px] font-black text-[#ff9500] uppercase tracking-wider">03:00 PM</div>
                        <h4 class="text-xs font-black text-slate-900 leading-tight mt-0.5">Martha Jones</h4>
                        <span class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-orange-100 text-orange-850 text-[8px] font-black rounded border border-orange-200">MH</span>
                      </div>
                    </div>

                    <!-- THU 15 Column -->
                    <div class="p-1 relative group hover:bg-slate-50/50 transition-colors">
                      <!-- maintenance blocked slot at 08:00 AM - 09:00 AM -->
                      <div *ngIf="hour === '08:00 AM'"
                           class="absolute inset-x-1.5 z-10 bg-slate-50 rounded-xl p-2 flex flex-col justify-center border border-slate-200 border-dashed text-left stripe-bg" style="top: 4px; height: calc(100% - 8px);">
                        <div class="text-[8px] font-black text-slate-400 uppercase tracking-wider">08:00 AM – 09:00 AM</div>
                        <h4 class="text-xs font-extrabold text-slate-650 mt-0.5 leading-tight">Maintenance</h4>
                        <div class="text-[8.5px] font-semibold text-slate-400">All Staff</div>
                      </div>
                      <!-- internal sync slot at 08:30 AM -->
                      <div *ngIf="hour === '08:00 AM'"
                           class="absolute inset-x-1.5 z-20 bg-blue-50 border-l-4 border-[#007aff] rounded-xl p-2 flex items-center justify-between text-left shadow-xs" style="top: 100%; height: calc(75% - 8px);">
                        <div>
                          <div class="text-[8px] font-black text-[#007aff] uppercase tracking-wider">08:30 AM</div>
                          <h4 class="text-xs font-extrabold text-slate-900 leading-tight">Internal Sync</h4>
                        </div>
                        <mat-icon class="!text-xs text-[#007aff]/60">lock</mat-icon>
                      </div>
                      <!-- rose tyler at 12:00 PM -->
                      <div *ngIf="hour === '12:00 PM'" (click)="openReschedule(8, 'Rose Tyler', 'Laser Hair Removal', 'May 15, 2024', '12:00 PM')"
                           class="absolute inset-x-1.5 z-10 bg-blue-50 border-l-4 border-[#007aff] rounded-xl p-2.5 shadow-xs hover:shadow-md cursor-pointer hover:-translate-y-0.5 transition-all text-left" style="top: 4px; height: calc(100% - 8px);">
                        <div class="text-[8px] font-black text-[#007aff] uppercase tracking-wider">12:00 PM</div>
                        <h4 class="text-xs font-black text-slate-900 leading-tight mt-0.5">Rose Tyler</h4>
                        <span class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[8px] font-black rounded border border-blue-200">CS</span>
                      </div>
                      <!-- staff break blocked slot at 04:00 PM - 04:30 PM -->
                      <div *ngIf="hour === '04:00 PM'"
                           class="absolute inset-x-1.5 z-10 bg-slate-50 rounded-xl p-2 flex flex-col justify-center border border-slate-200 border-dashed text-left stripe-bg" style="top: 4px; height: calc(50% - 8px);">
                        <div class="text-[8px] font-black text-slate-400">04:00 PM – 04:30 PM</div>
                        <h4 class="text-[10px] font-extrabold text-slate-600">Staff Break</h4>
                      </div>
                    </div>

                    <!-- FRI 16 Column -->
                    <div class="p-1 relative group hover:bg-slate-50/50 transition-colors">
                      <!-- martha jones card at 10:00 AM -->
                      <div *ngIf="hour === '10:00 AM'" (click)="openReschedule(9, 'Martha Jones', 'Chemical Peel', 'May 16, 2024', '10:00 AM')"
                           class="absolute inset-x-1.5 z-10 bg-orange-50 border-l-4 border-[#ff9500] rounded-xl p-2.5 shadow-xs hover:shadow-md cursor-pointer hover:-translate-y-0.5 transition-all text-left" style="top: 4px; height: calc(100% - 8px);">
                        <div class="text-[8px] font-black text-[#ff9500] uppercase tracking-wider">10:00 AM</div>
                        <h4 class="text-xs font-black text-slate-900 leading-tight mt-0.5">Martha Jones</h4>
                        <span class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-orange-100 text-orange-850 text-[8px] font-black rounded border border-orange-200">CS</span>
                      </div>
                      <!-- donna noble card at 02:15 PM -->
                      <div *ngIf="hour === '02:00 PM'" (click)="openReschedule(10, 'Donna Noble', 'Consultation', 'May 16, 2024', '02:15 PM')"
                           class="absolute inset-x-1.5 z-10 bg-orange-50 border-l-4 border-[#ff9500] rounded-xl p-2.5 shadow-xs hover:shadow-md cursor-pointer hover:-translate-y-0.5 transition-all text-left" style="top: 25%; height: calc(100% - 8px);">
                        <div class="text-[8px] font-black text-[#ff9500] uppercase tracking-wider">02:15 PM</div>
                        <h4 class="text-xs font-black text-slate-900 leading-tight mt-0.5">Donna Noble</h4>
                        <span class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-orange-100 text-orange-850 text-[8px] font-black rounded border border-orange-200">MH</span>
                      </div>
                    </div>

                    <!-- SAT 17 Column -->
                    <div class="p-1 relative group hover:bg-slate-50/50 transition-colors">
                      <!-- james wilson card at 09:00 AM -->
                      <div *ngIf="hour === '09:00 AM'" (click)="openReschedule(11, 'James Wilson', 'Laser Hair Removal', 'May 17, 2024', '09:00 AM')"
                           class="absolute inset-x-1.5 z-10 bg-blue-50 border-l-4 border-[#007aff] rounded-xl p-2.5 shadow-xs hover:shadow-md cursor-pointer hover:-translate-y-0.5 transition-all text-left" style="top: 4px; height: calc(100% - 8px);">
                        <div class="text-[8px] font-black text-[#007aff] uppercase tracking-wider">09:00 AM</div>
                        <h4 class="text-xs font-black text-slate-900 leading-tight mt-0.5">James Wilson</h4>
                        <span class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[8px] font-black rounded border border-blue-200">CS</span>
                      </div>
                      <!-- michelle travis card at 01:30 PM -->
                      <div *ngIf="hour === '01:00 PM'" (click)="openReschedule(12, 'Michelle Travis', 'Facial', 'May 17, 2024', '01:30 PM')"
                           class="absolute inset-x-1.5 z-10 bg-green-50 border-l-4 border-[#34c759] rounded-xl p-2.5 shadow-xs hover:shadow-md cursor-pointer hover:-translate-y-0.5 transition-all text-left" style="top: 50%; height: calc(100% - 8px);">
                        <div class="text-[8px] font-black text-[#34c759] uppercase tracking-wider">01:30 PM</div>
                        <h4 class="text-xs font-black text-slate-900 leading-tight mt-0.5">Michelle Travis</h4>
                        <span class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-green-100 text-green-800 text-[8px] font-black rounded border border-emerald-250">MH</span>
                      </div>
                    </div>

                    <!-- SUN 18 Column (CLOSED state) -->
                    <div class="p-1 bg-slate-50/50 flex items-center justify-center relative">
                      <div *ngIf="hour === '12:00 PM'" class="flex flex-col items-center justify-center p-3 text-center border border-orange-300 bg-white rounded-2xl shadow-xs">
                        <mat-icon class="text-orange-500 !text-xl">event_busy</mat-icon>
                        <span class="text-[9px] font-black text-orange-600 uppercase tracking-widest mt-1">CLOSED</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Timetable Footer -->
            <div class="flex flex-col md:flex-row items-center justify-center gap-6 pt-4 border-t border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <div class="flex items-center gap-1.5"><mat-icon class="!text-xs">sync_alt</mat-icon><span>Drag & drop to reschedule</span></div>
              <div class="flex items-center gap-1.5"><mat-icon class="!text-xs">touch_app</mat-icon><span>Click appointment for details</span></div>
              <div class="flex items-center gap-1.5"><mat-icon class="!text-xs">menu_open</mat-icon><span>Right click for more options</span></div>
            </div>

          </div>
        </div>

        <!-- Right 1 Column: Sidebar overview (Today Overview, Upcoming, Reminders) -->
        <div class="xl:col-span-1 space-y-6">
          <!-- Today Overview Card -->
          <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs text-left space-y-4">
            <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <mat-icon class="text-slate-400 !text-base">assessment</mat-icon>
              <span>Today Overview</span>
            </h3>
            
            <div class="space-y-2.5 text-xs font-bold text-slate-600">
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-1.5"><mat-icon class="!text-sm text-blue-500">event_note</mat-icon>Appointments</span>
                <span class="text-slate-900 font-black">34</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-1.5"><mat-icon class="!text-sm text-green-500">check_circle</mat-icon>Checked In</span>
                <span class="text-slate-900 font-black">12</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-1.5"><mat-icon class="!text-sm text-orange-500">hourglass_empty</mat-icon>Waiting</span>
                <span class="text-slate-900 font-black">8</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-1.5"><mat-icon class="!text-sm text-cyan-500">directions_walk</mat-icon>Walk-ins</span>
                <span class="text-slate-900 font-black">3</span>
              </div>
            </div>
            
            <div class="border-t border-slate-100 pt-3 text-left">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Expected Revenue</span>
              <span class="text-2xl font-black text-[#007aff] block mt-0.5">J$ 245,000</span>
            </div>
          </div>
          
          <!-- Upcoming Next 5 Panel -->
          <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs text-left space-y-4">
            <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <mat-icon class="text-[#b8924f] !text-base">event_upcoming</mat-icon>
              <span>Upcoming (Next 5)</span>
            </h3>
            
            <div class="divide-y divide-slate-100">
              <div *ngFor="let item of upcomingList" class="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div class="flex items-center gap-2.5 min-w-0">
                  <img [src]="item.photo" class="w-8 h-8 rounded-full object-cover border border-slate-100 flex-shrink-0">
                  <div class="min-w-0">
                    <div class="text-xs font-black text-slate-900 truncate leading-tight">{{ item.name }}</div>
                    <div class="text-[10px] font-semibold text-slate-500 truncate mt-0.5">{{ item.treatment }}</div>
                  </div>
                </div>
                
                <div class="text-right flex-shrink-0">
                  <div class="text-[10px] font-black text-slate-800 leading-none">{{ item.time }}</div>
                  <span class="inline-block px-1.5 py-0.5 mt-1 rounded text-[8px] font-black uppercase tracking-wider border"
                        [ngClass]="item.loc === 'CS' ? 'bg-blue-50 text-blue-800 border-blue-100' : 'bg-orange-50 text-orange-855 border-orange-100'">
                    {{ item.loc }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Today's Reminders Panel -->
          <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs text-left space-y-4">
            <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <mat-icon class="text-rose-500 !text-base">notifications_active</mat-icon>
              <span>Today's Reminders</span>
            </h3>
            
            <div class="space-y-2">
              <div class="flex items-center justify-between p-2.5 bg-rose-50/50 rounded-2xl border border-rose-100">
                <span class="text-xs font-bold text-rose-800">Late Arrivals</span>
                <span class="w-5 h-5 rounded-md bg-rose-600 text-white font-black text-[10px] flex items-center justify-center">2</span>
              </div>
              <div class="flex items-center justify-between p-2.5 bg-amber-50/50 rounded-2xl border border-amber-100">
                <span class="text-xs font-bold text-amber-800">Payments Pending</span>
                <span class="w-5 h-5 rounded-md bg-amber-600 text-white font-black text-[10px] flex items-center justify-center">3</span>
              </div>
              <div class="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <span class="text-xs font-bold text-emerald-805">Needs Confirmation</span>
                <span class="w-5 h-5 rounded-md bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">1</span>
              </div>
              <div class="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-2xl border border-blue-100">
                <span class="text-xs font-bold text-blue-800">New Online Bookings</span>
                <span class="w-5 h-5 rounded-md bg-blue-600 text-white font-black text-[10px] flex items-center justify-center">4</span>
              </div>
            </div>
        </div>
      </div>
    </div>

    <!-- 3. ADD NEW BOOKING MODAL (MULTI-STEP RE-THEMED WHITE CARD) -->
    <div *ngIf="showModal()" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl p-6 md:p-8 space-y-6 animate-fade-up max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 class="text-2xl font-bold font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <mat-icon class="text-[#b8924f]">event_available</mat-icon>
            <span>New Admin Appointment</span>
          </h2>
          <button (click)="closeModal()" class="p-2 hover:bg-slate-150 rounded-full text-slate-500 transition-all"><mat-icon>close</mat-icon></button>
        </div>

        <div class="flex items-center mb-6 gap-2 text-xs font-black text-slate-400">
          <div [class.text-[#b8924f]]="creationStep() === 1">1. Customer</div>
          <div>›</div>
          <div [class.text-[#b8924f]]="creationStep() === 2">2. Details</div>
          <div>›</div>
          <div [class.text-[#b8924f]]="creationStep() === 3">3. Payment</div>
        </div>

        <div *ngIf="creationError()" class="bg-red-50 border border-red-200 p-3 rounded text-red-700 text-sm font-bold text-left">
          {{ creationError() }}
        </div>

        <form [formGroup]="bookingForm" (ngSubmit)="saveBooking()" class="space-y-4">
          <!-- STEP 1: Customer -->
          <div *ngIf="creationStep() === 1" class="space-y-4 text-left">
            <div>
              <label class="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1">Customer ID *</label>
              <input type="number" formControlName="customerId" placeholder="1" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#b8924f]">
              <p class="text-[10px] mt-1 text-slate-405">Enter a valid user ID (e.g. 1 or 2)</p>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" (click)="closeModal()" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">Cancel</button>
              <button type="button" (click)="creationStep.set(2)" class="px-6 py-2.5 bg-[#b8924f] hover:bg-[#a6803b] text-white font-bold text-xs uppercase tracking-wider rounded-xl">Next ›</button>
            </div>
          </div>

          <!-- STEP 2: Details -->
          <div *ngIf="creationStep() === 2" class="space-y-4 text-left">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-black text-slate-505 uppercase tracking-widest block mb-1">Service ID *</label>
                <input type="number" formControlName="serviceId" placeholder="1" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#b8924f]">
              </div>
              <div>
                <label class="text-xs font-black text-slate-505 uppercase tracking-widest block mb-1">Employee ID *</label>
                <input type="number" formControlName="employeeId" placeholder="1" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#b8924f]">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-black text-slate-505 uppercase tracking-widest block mb-1">Location ID *</label>
                <input type="number" formControlName="locationId" placeholder="1" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#b8924f]">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-black text-slate-505 uppercase tracking-widest block mb-1">Date (YYYY-MM-DD) *</label>
                <input type="text" formControlName="date" placeholder="2026-09-01" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#b8924f]">
              </div>
              <div>
                <label class="text-xs font-black text-slate-550 uppercase tracking-widest block mb-1">Time (HH:MM:SS) *</label>
                <input type="text" formControlName="time" placeholder="14:00:00" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#b8924f]">
              </div>
            </div>

            <div class="flex justify-between gap-3 pt-4 border-t border-slate-100">
              <button type="button" (click)="creationStep.set(1)" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">‹ Back</button>
              <button type="button" (click)="creationStep.set(3)" class="px-6 py-2.5 bg-[#b8924f] hover:bg-[#a6803b] text-white font-bold text-xs uppercase tracking-wider rounded-xl">Next ›</button>
            </div>
          </div>

          <!-- STEP 3: Payment -->
          <div *ngIf="creationStep() === 3" class="space-y-4 text-left">
            
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
              <label class="text-xs font-black text-slate-500 uppercase tracking-widest block mb-3">Payment Strategy *</label>
              
              <div class="space-y-2">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="radio" formControlName="paymentMethod" value="send_link" class="text-[#b8924f] bg-slate-100 border-slate-200">
                  <span class="text-sm font-bold text-slate-850">Generate Payment Link (Send to customer)</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="radio" formControlName="paymentMethod" value="manual_cash" class="text-[#b8924f] bg-slate-100 border-slate-200">
                  <span class="text-sm font-bold text-slate-850">Mark as Paid (Manual / Cash In-person)</span>
                </label>
              </div>
            </div>

            <div class="flex justify-between gap-3 pt-4 border-t border-slate-100">
              <button type="button" (click)="creationStep.set(2)" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">‹ Back</button>
              <button type="submit" [disabled]="bookingForm.invalid || creatingBooking()" class="px-6 py-2.5 bg-[#b8924f] hover:bg-[#a6803b] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2">
                <span *ngIf="creatingBooking()" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                <span>Confirm & Create</span>
              </button>
            </div>
          </div>

        </form>

        <div *ngIf="createdBookingInfo()" class="mt-4 p-4 border border-emerald-250 bg-emerald-50 rounded-xl space-y-3 text-left">
          <div class="text-emerald-850 font-black text-sm flex items-center gap-2">
            <mat-icon>check_circle</mat-icon> Booking Created!
          </div>
          <div *ngIf="createdBookingInfo()?.paymentUrl" class="text-slate-800 text-xs mt-2">
            <p class="font-bold mb-1">Share this payment link with the customer:</p>
            <div class="flex items-center gap-2">
              <input type="text" readonly [value]="createdBookingInfo()?.paymentUrl" class="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-700 font-mono text-[10px]">
              <a [href]="createdBookingInfo()?.paymentUrl" target="_blank" class="px-3 py-2 bg-emerald-600 text-white font-bold rounded">Open</a>
            </div>
          </div>
          <div *ngIf="createdBookingInfo()?.paymentMethod === 'manual'" class="text-slate-800 text-xs mt-2">
            <p class="font-bold text-[#b8924f]">Marked as manually paid.</p>
          </div>
          <button (click)="closeModal()" class="mt-4 w-full px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded font-bold text-xs">Close</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stripe-bg {
      background-image: repeating-linear-gradient(45deg, rgba(30, 41, 59, 0.03), rgba(30, 41, 59, 0.03) 10px, transparent 10px, transparent 20px);
    }
  `]
})
export class AdminBookingsComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  viewMode: 'Day' | 'Week' | 'Month' = 'Week';
  selectedDay: string = 'WED';
  showModal = signal(false);
  isRescheduling = signal(false);

  selectedLocationFilter = 'all';
  staffFilter = 'all';
  serviceFilter = 'all';
  statusFilter = 'all';

  // ── Service autocomplete ──────────────────────────────────────────────────
  serviceCtrl = new FormControl('');
  showServiceDropdown = false;
  activeDropdownIndex = -1;
  groupedFilteredTreatments: TreatmentGroup[] = [];
  recentTreatments: Treatment[] = [];
  mostBookedTreatments: Treatment[] = [];

  readonly treatments: Treatment[] = [
    { id: '1',  name: 'Laser Hair Removal',        category: 'Laser Treatments',           bodyArea: 'Full Body',  keywords: ['laser','hair','removal','permanent'],          duration: 60, price: 8500  },
    { id: '2',  name: 'Diode Laser (Underarms)',    category: 'Laser Treatments',           bodyArea: 'Underarms',  keywords: ['laser','underarms','diode','axilla'],          duration: 30, price: 4500  },
    { id: '3',  name: 'Diode Laser (Bikini Line)',  category: 'Laser Treatments',           bodyArea: 'Bikini',     keywords: ['laser','bikini','diode','intimate'],           duration: 30, price: 5000  },
    { id: '4',  name: 'Chemical Peel',              category: 'Facial & Skin',             bodyArea: 'Face',       keywords: ['peel','chemical','facial','resurfacing'],      duration: 45, price: 6000  },
    { id: '5',  name: 'Microdermabrasion',          category: 'Facial & Skin',             bodyArea: 'Face',       keywords: ['microderm','abrasion','facial','exfoliation'], duration: 45, price: 5500  },
    { id: '6',  name: 'Hydrafacial',                category: 'Facial & Skin',             bodyArea: 'Face',       keywords: ['hydra','facial','hydration','glow'],           duration: 60, price: 9000  },
    { id: '7',  name: 'Facial Resurfacing',         category: 'Facial & Skin',             bodyArea: 'Face',       keywords: ['resurfacing','facial','renewal','peel'],       duration: 60, price: 7000  },
    { id: '8',  name: 'Body / Skin Detox',          category: 'Body & Wellness',           bodyArea: 'Full Body',  keywords: ['detox','body','wellness','skin','cleanse'],    duration: 90, price: 7500  },
    { id: '9',  name: 'Body Sculpting',             category: 'Body & Wellness',           bodyArea: 'Abdomen',    keywords: ['sculpt','body','contour','fat','slim'],        duration: 60, price: 10000 },
    { id: '10', name: 'Consultation',               category: 'General',                   bodyArea: 'N/A',        keywords: ['consult','assessment','evaluation','review'],  duration: 30, price: 2500  },
    { id: '11', name: 'Botox Injections',           category: 'Injectables & Aesthetics', bodyArea: 'Face',       keywords: ['botox','inject','wrinkle','anti-aging','tox'], duration: 30, price: 15000 },
    { id: '12', name: 'Dermal Fillers',             category: 'Injectables & Aesthetics', bodyArea: 'Face',       keywords: ['filler','dermal','lip','cheek','volume'],      duration: 45, price: 18000 },
  ];

  hours = [
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM'
  ];

  upcomingList = [
    { photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&q=80', name: 'Sarah Jenkins', treatment: 'Laser Hair Removal', time: '09:00 AM', loc: 'CS' },
    { photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&q=80', name: 'Eleanor Rigby', treatment: 'Consultation', time: '10:15 AM', loc: 'CS' },
    { photo: 'https://images.unsplash.com/photo-1594824813566-78853c829393?w=150&q=80', name: 'Amelia Pond', treatment: 'Facial Resurfacing', time: '11:00 AM', loc: 'CS' },
    { photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80', name: 'Donna Noble', treatment: 'Consultation', time: '02:15 PM', loc: 'MH' },
    { photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80', name: 'Martha Jones', treatment: 'Chemical Peel', time: '03:00 PM', loc: 'MH' }
  ];

  selectedBooking = {
    id: 1, // default mock ID
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
  private realtimeSub?: Subscription;

  daysOfWeek = [
    { name: 'MON', date: '12' },
    { name: 'TUE', date: '13' },
    { name: 'WED', date: '14' },
    { name: 'THU', date: '15' },
    { name: 'FRI', date: '16' },
    { name: 'SAT', date: '17' },
    { name: 'SUN', date: '18' },
  ];

  filterAppointments() {
    console.log('Filtering appointments by:', this.selectedLocationFilter, this.staffFilter, this.serviceFilter, this.statusFilter);
  }

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private authState: AuthStateService,
    private realtime: RealtimeService
  ) {
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

  ngOnInit() {
    this.realtimeSub = this.realtime.bookingEvents$.subscribe(event => {
      console.log('Realtime event received in AdminBookingsComponent:', event);
      // In a full implementation, this would trigger a refetch of the appointments list
      // For now we just log it to verify the socket is working
      if (event.type === 'created' || event.type === 'updated') {
        // e.g. this.fetchAppointments();
      }
    });

    // ── Seed suggestion lists ─────────────────────────────────────────────
    this.recentTreatments      = [this.treatments[0], this.treatments[3], this.treatments[7]];
    this.mostBookedTreatments  = [this.treatments[0], this.treatments[4], this.treatments[3], this.treatments[5], this.treatments[9]];

    // ── Wire up autocomplete debounce ─────────────────────────────────────
    this.serviceCtrl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(term => this.buildGroupedResults(term || ''));
  }

  ngOnDestroy() {
    if (this.realtimeSub) {
      this.realtimeSub.unsubscribe();
    }
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

  openReschedule(appointmentId: number, patientName: string, serviceName: string, dateStr: string, timeStr: string): void {
    this.selectedBooking = {
      id: appointmentId,
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
    const headers = { Authorization: `Bearer ${this.authState.token()}` };
    
    // We should map selectedNewDay and selectedSlot to a proper date and time format
    // For now we'll do a simple mock date conversion since this is UI-driven
    const payload = {
      date: `2026-05-${this.selectedNewDay.toString().padStart(2, '0')}`,
      time: '11:15:00' // mock time parse
    };

    this.http.patch<any>(`${environment.apiUrl}/bookings/${this.selectedBooking.id}/reschedule`, payload, { headers })
      .subscribe({
        next: (res) => {
          alert(`Appointment for ${this.selectedBooking.patient} rescheduled!`);
          this.closeReschedule();
        },
        error: (err) => {
          alert(`Failed to reschedule: ${err.error?.message || 'Server error'}`);
        }
      });
  }

  // ── Service Autocomplete Methods ──────────────────────────────────────────

  buildGroupedResults(term: string): void {
    if (!term || term.length < 2) {
      this.groupedFilteredTreatments = [];
      this.activeDropdownIndex = -1;
      return;
    }
    const t = term.toLowerCase();
    const matched = this.treatments.filter(tx =>
      tx.name.toLowerCase().includes(t) ||
      tx.category.toLowerCase().includes(t) ||
      tx.bodyArea.toLowerCase().includes(t) ||
      tx.keywords.some(k => k.toLowerCase().includes(t))
    );
    const groups = new Map<string, Treatment[]>();
    matched.forEach(tx => {
      if (!groups.has(tx.category)) groups.set(tx.category, []);
      groups.get(tx.category)!.push(tx);
    });
    this.groupedFilteredTreatments = Array.from(groups.entries()).map(([category, treatments]) => ({ category, treatments }));
    this.activeDropdownIndex = -1;
  }

  highlightMatch(text: string, term: string): string {
    if (!term) return text;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'),
      '<strong style="color:#007aff;background:rgba(0,122,255,.08);border-radius:2px;padding:0 1px">$1</strong>');
  }

  selectTreatmentOption(t: Treatment): void {
    this.serviceCtrl.setValue(t.name, { emitEvent: false });
    this.serviceFilter = t.id;
    this.showServiceDropdown = false;
    this.activeDropdownIndex = -1;
    this.filterAppointments();
  }

  clearServiceFilter(): void {
    this.serviceCtrl.setValue('');
    this.serviceFilter = 'all';
    this.showServiceDropdown = false;
    this.groupedFilteredTreatments = [];
    this.filterAppointments();
  }

  onServiceBlur(): void {
    setTimeout(() => { this.showServiceDropdown = false; }, 150);
  }

  onServiceKeydown(event: KeyboardEvent): void {
    const flat: Treatment[] =
      this.serviceCtrl.value && this.serviceCtrl.value.length >= 2
        ? this.groupedFilteredTreatments.flatMap(g => g.treatments)
        : [...this.recentTreatments, ...this.mostBookedTreatments];

    switch (event.key) {
      case 'Escape':
        this.showServiceDropdown = false;
        this.activeDropdownIndex = -1;
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.activeDropdownIndex = Math.min(this.activeDropdownIndex + 1, flat.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeDropdownIndex = Math.max(this.activeDropdownIndex - 1, 0);
        break;
      case 'Enter':
        if (this.activeDropdownIndex >= 0 && flat[this.activeDropdownIndex]) {
          event.preventDefault();
          this.selectTreatmentOption(flat[this.activeDropdownIndex]);
        }
        break;
    }
  }

}
