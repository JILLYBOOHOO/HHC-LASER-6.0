import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-queue',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-[#111312] text-slate-200 p-6 md:p-8 font-sans selection:bg-[#00f0ff] selection:text-black">
      
      <!-- Top Search & Admin Action Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <!-- Search Field -->
        <div class="relative flex-1 max-w-xl">
          <mat-icon class="absolute left-4 top-3.5 !text-xl text-slate-500">search</mat-icon>
          <input type="text"
                 placeholder="Search patient or ID..."
                 class="w-full pl-12 pr-4 py-3 bg-[#111312] border border-[#1e2522] rounded-md text-sm font-semibold text-black placeholder-slate-500 focus:outline-none focus:border-[#00f0ff] transition-all">
        </div>

        <!-- Right Side Actions -->
        <div class="flex items-center gap-4 self-end lg:self-auto">
          <button class="px-5 py-2.5 bg-[#00f0ff] hover:bg-[#33f3ff] text-black font-semibold text-sm rounded-md shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all flex items-center gap-2">
            <mat-icon class="!text-lg">add</mat-icon>
            <span>Add Booking</span>
          </button>
          
          <button class="p-2 text-slate-400 hover:text-black transition-colors"><mat-icon>notifications</mat-icon></button>
          <button class="p-2 text-slate-400 hover:text-black transition-colors"><mat-icon>settings</mat-icon></button>
          <button class="p-2 text-slate-400 hover:text-black transition-colors"><mat-icon>account_circle</mat-icon></button>
        </div>
      </div>

      <!-- Top Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <!-- Wait Card -->
        <div class="bg-[#141716] border border-[#1e2522] p-5 rounded-lg flex flex-col justify-between h-32">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CURRENTLY WAITING</div>
          <div class="text-5xl font-black text-[#00f0ff] tracking-tight">08</div>
          <div class="flex items-center gap-1.5 text-xs text-[#00f0ff] font-medium">
            <mat-icon class="!text-sm">trending_up</mat-icon>
            <span>+2 since last hour</span>
          </div>
        </div>

        <!-- Avg Wait Time Card -->
        <div class="bg-[#141716] border border-[#1e2522] p-5 rounded-lg flex flex-col justify-between h-32">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AVG. WAIT TIME</div>
          <div class="text-5xl font-black text-amber-400 tracking-tight">14m</div>
          <div class="text-xs text-slate-400 font-medium">Optimal range: <15m</div>
        </div>

        <!-- In Treatment Card -->
        <div class="bg-[#141716] border border-[#1e2522] p-5 rounded-lg flex flex-col justify-between h-32">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IN TREATMENT</div>
          <div class="text-5xl font-black text-indigo-400 tracking-tight">03</div>
          <div class="text-xs text-slate-400 font-medium">4 rooms occupied</div>
        </div>

        <!-- Capacity Card -->
        <div class="bg-[#141716] border border-[#1e2522] p-5 rounded-lg flex flex-col justify-between h-32">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CAPACITY</div>
          <div class="text-5xl font-black text-black tracking-tight">82%</div>
          <div class="w-full bg-[#1e2522] h-1.5 mt-2 rounded-full overflow-hidden">
            <div class="bg-[#00f0ff] h-full" style="width: 82%"></div>
          </div>
        </div>
      </div>

      <!-- Live Queue Section -->
      <div class="bg-[#141716] border border-[#1e2522] rounded-lg mb-8">
        
        <div class="px-6 py-5 flex items-center justify-between border-b border-[#1e2522]">
          <h2 class="text-xl font-semibold text-black tracking-tight">Live Queue</h2>
          <div class="flex items-center gap-3">
            <button class="px-4 py-1.5 bg-[#1a201d] border border-[#232f2a] text-slate-300 text-xs font-semibold rounded hover:bg-[#232f2a] flex items-center gap-2">
              <mat-icon class="!text-sm">filter_list</mat-icon> Filter
            </button>
            <button class="px-4 py-1.5 bg-[#1a201d] border border-[#232f2a] text-slate-300 text-xs font-semibold rounded hover:bg-[#232f2a] flex items-center gap-2">
              <mat-icon class="!text-sm">download</mat-icon> Export
            </button>
          </div>
        </div>

        <!-- Table Header -->
        <div class="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1e2522] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <div class="col-span-4">PATIENT DETAILS</div>
          <div class="col-span-2">ARRIVAL</div>
          <div class="col-span-2">APPOINTMENT</div>
          <div class="col-span-2">SERVICE</div>
          <div class="col-span-2 text-right">STATUS CONTROL</div>
        </div>

        <!-- Table Rows -->
        <div class="divide-y divide-[#1e2522]">
          
          <!-- Row 1 -->
          <div class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#1a201d] transition-colors">
            <div class="col-span-4 flex items-center gap-4">
              <div class="w-10 h-10 rounded bg-[#105a5a] text-[#00f0ff] font-bold flex items-center justify-center">MS</div>
              <div>
                <div class="text-sm font-semibold text-black">Marcus Sterling</div>
                <div class="text-[10px] text-slate-500 font-mono">ID: #HL-8821</div>
              </div>
            </div>
            <div class="col-span-2 text-xs font-medium text-slate-300">
              09:15<br><span class="text-[10px] text-slate-500">AM</span>
            </div>
            <div class="col-span-2 text-xs font-medium text-slate-300">09:30 AM</div>
            <div class="col-span-2">
              <span class="px-2 py-1 bg-[#232f2a] text-slate-300 text-[10px] rounded border border-[#2d3a35]">Laser Rejuvenation</span>
            </div>
            <div class="col-span-2 flex items-center justify-end">
              <div class="flex rounded-full overflow-hidden border border-[#232f2a] bg-[#111312]">
                <button class="px-3 py-1 text-[9px] font-bold bg-amber-400 text-black">ARRIVED</button>
                <button class="px-3 py-1 text-[9px] font-bold text-slate-400 hover:text-black">CHECK-IN</button>
                <button class="px-3 py-1 text-[9px] font-bold text-slate-400 hover:text-black">TREATMENT</button>
              </div>
            </div>
          </div>

          <!-- Row 2 -->
          <div class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#1a201d] transition-colors">
            <div class="col-span-4 flex items-center gap-4">
              <div class="w-10 h-10 rounded bg-[#184a30] text-emerald-400 font-bold flex items-center justify-center">EL</div>
              <div>
                <div class="text-sm font-semibold text-black">Elena Lund</div>
                <div class="text-[10px] text-slate-500 font-mono">ID: #HL-4412</div>
              </div>
            </div>
            <div class="col-span-2 text-xs font-medium text-slate-300">
              08:55<br><span class="text-[10px] text-slate-500">AM</span>
            </div>
            <div class="col-span-2 text-xs font-medium text-slate-300">09:00 AM</div>
            <div class="col-span-2">
              <span class="px-2 py-1 bg-[#232f2a] text-slate-300 text-[10px] rounded border border-[#2d3a35]">Scar Therapy</span>
            </div>
            <div class="col-span-2 flex items-center justify-end">
              <div class="flex rounded-full overflow-hidden border border-[#232f2a] bg-[#111312]">
                <button class="px-3 py-1 text-[9px] font-bold text-slate-400 hover:text-black">ARRIVED</button>
                <button class="px-3 py-1 text-[9px] font-bold bg-[#00f0ff] text-black">CHECKED IN</button>
                <button class="px-3 py-1 text-[9px] font-bold text-slate-400 hover:text-black">TREATMENT</button>
              </div>
            </div>
          </div>

          <!-- Row 3 (Active Background for Treatment) -->
          <div class="grid grid-cols-12 gap-4 px-6 py-4 items-center bg-[#171f22] border-l-2 border-[#4185f4]">
            <div class="col-span-4 flex items-center gap-4">
              <div class="w-10 h-10 rounded bg-[#1b3a2a] text-emerald-400 font-bold flex items-center justify-center">DC</div>
              <div>
                <div class="text-sm font-semibold text-black">David Chen</div>
                <div class="text-[10px] text-slate-500 font-mono">ID: #HL-3390</div>
              </div>
            </div>
            <div class="col-span-2 text-xs font-medium text-slate-300">
              08:30<br><span class="text-[10px] text-slate-500">AM</span>
            </div>
            <div class="col-span-2 text-xs font-medium text-slate-300">08:30 AM</div>
            <div class="col-span-2">
              <span class="px-2 py-1 bg-[#232f2a] text-slate-300 text-[10px] rounded border border-[#2d3a35]">Deep Pulse Laser</span>
            </div>
            <div class="col-span-2 flex items-center justify-end">
              <div class="flex rounded-full overflow-hidden border border-[#232f2a] bg-[#111312]">
                <button class="px-3 py-1 text-[9px] font-bold text-slate-400 hover:text-black">CHECKED IN</button>
                <button class="px-3 py-1 text-[9px] font-bold bg-[#4185f4] text-black">IN TREATMENT</button>
                <button class="px-3 py-1 text-[9px] font-bold text-slate-400 hover:text-black">CHECKOUT</button>
              </div>
            </div>
          </div>

          <!-- Row 4 -->
          <div class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#1a201d] transition-colors">
            <div class="col-span-4 flex items-center gap-4">
              <div class="w-10 h-10 rounded bg-[#2a2e2c] text-slate-300 font-bold flex items-center justify-center">SP</div>
              <div>
                <div class="text-sm font-semibold text-black">Sarah Parker</div>
                <div class="text-[10px] text-slate-500 font-mono">ID: #HL-1102</div>
              </div>
            </div>
            <div class="col-span-2 text-xs font-medium text-slate-300">
              08:15<br><span class="text-[10px] text-slate-500">AM</span>
            </div>
            <div class="col-span-2 text-xs font-medium text-slate-300">08:15 AM</div>
            <div class="col-span-2">
              <span class="px-2 py-1 bg-[#232f2a] text-slate-300 text-[10px] rounded border border-[#2d3a35]">Skin Analysis</span>
            </div>
            <div class="col-span-2 flex items-center justify-end">
              <div class="flex rounded-full overflow-hidden border border-[#232f2a] bg-[#111312]">
                <button class="px-3 py-1 text-[9px] font-bold text-slate-400 hover:text-black">TREATMENT</button>
                <button class="px-3 py-1 text-[9px] font-bold bg-[#a472f7] text-black">READY FOR CHECKOUT</button>
                <button class="px-3 py-1 text-[9px] font-bold text-slate-400 hover:text-black">DONE</button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Bottom Grids: Alerts & Staff -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Queue Alerts -->
        <div class="bg-[#141716] border border-[#1e2522] rounded-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-black">Queue Alerts</h3>
            <span class="px-2 py-0.5 bg-red-600 text-black text-[9px] font-black tracking-wider rounded">2 URGENT</span>
          </div>

          <div class="space-y-4">
            <!-- Alert 1 -->
            <div class="bg-[#1a201d] border-l-4 border-[#ff6b6b] p-4 rounded-r-lg flex gap-4">
              <mat-icon class="text-[#ff6b6b] !text-xl mt-0.5">warning_amber</mat-icon>
              <div>
                <div class="text-sm font-semibold text-black">Patient #HL-2921 delayed</div>
                <div class="text-xs font-mono text-slate-400 mt-1">Appointment 09:45 AM - Still not arrived. Contact initiated.</div>
              </div>
            </div>

            <!-- Alert 2 -->
            <div class="bg-[#1a201d] border-l-4 border-amber-400 p-4 rounded-r-lg flex gap-4">
              <mat-icon class="text-amber-400 !text-xl mt-0.5">schedule</mat-icon>
              <div>
                <div class="text-sm font-semibold text-black">Wait time increasing</div>
                <div class="text-xs font-mono text-slate-400 mt-1">Average wait time has exceeded 15m. Check Room 02 turnover.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Service Staff -->
        <div class="bg-[#141716] border border-[#1e2522] rounded-lg p-6">
          <h3 class="text-lg font-semibold text-black mb-6">Service Staff</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <!-- Staff 1 -->
            <div class="bg-[#111312] border border-[#1e2522] rounded-lg p-3 flex items-center gap-3">
              <div class="relative">
                <img loading="lazy" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80" class="w-10 h-10 rounded object-cover">
                <span class="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#00f0ff] rounded-full border-2 border-[#111312]"></span>
              </div>
              <div>
                <div class="text-xs font-semibold text-black">Dr. Aris Thorne</div>
                <div class="text-[9px] font-bold text-[#00f0ff] uppercase tracking-wider">IN ROOM 01</div>
              </div>
            </div>

            <!-- Staff 2 -->
            <div class="bg-[#111312] border border-[#1e2522] rounded-lg p-3 flex items-center gap-3">
              <div class="relative">
                <img loading="lazy" src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&q=80" class="w-10 h-10 rounded object-cover">
                <span class="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#00f0ff] rounded-full border-2 border-[#111312]"></span>
              </div>
              <div>
                <div class="text-xs font-semibold text-black">Nurse Valery</div>
                <div class="text-[9px] font-bold text-[#00f0ff] uppercase tracking-wider">IN ROOM 04</div>
              </div>
            </div>

            <!-- Staff 3 -->
            <div class="bg-[#111312] border border-[#1e2522] rounded-lg p-3 flex items-center gap-3">
              <div class="relative">
                <img loading="lazy" src="https://images.unsplash.com/photo-1594824813566-78853c829393?w=100&q=80" class="w-10 h-10 rounded object-cover">
                <span class="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-[#111312]"></span>
              </div>
              <div>
                <div class="text-xs font-semibold text-black">Reception 01</div>
                <div class="text-[9px] font-bold text-amber-400 uppercase tracking-wider">ON BREAK</div>
              </div>
            </div>

            <!-- Staff 4 -->
            <div class="bg-[#111312] border border-[#1e2522] rounded-lg p-3 flex items-center gap-3 opacity-60">
              <div class="w-10 h-10 rounded bg-[#1a201d] flex items-center justify-center text-slate-600">
                <mat-icon>person_off</mat-icon>
              </div>
              <div>
                <div class="text-xs font-semibold text-slate-500">Tech Sam</div>
                <div class="text-[9px] font-bold text-slate-600 uppercase tracking-wider">CLOCKED OUT</div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  `,
  styles: []
})
export class AdminQueueComponent {
}
