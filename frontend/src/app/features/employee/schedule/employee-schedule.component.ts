import { Component, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { RouterModule } from '@angular/router';
import { InternalBookingModalComponent } from '../../../shared/components/internal-booking-modal/internal-booking-modal.component';

@Component({
  selector: 'app-employee-schedule',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatMenuModule, RouterModule, InternalBookingModalComponent],
  template: `
    <div class="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-[#fcfbfa] min-h-screen">
      
      <!-- Header -->
      <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">My Schedule</h1>
          <p class="text-slate-600 font-medium text-sm mt-1">Welcome, <span class="font-bold text-slate-900">{{ authState.user()?.first_name || 'Specialist' }}</span>. Here is your schedule for today.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">

          <div class="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            <button mat-icon-button class="text-slate-600 hover:text-slate-900"><mat-icon>chevron_left</mat-icon></button>
            <div class="font-extrabold text-slate-900 text-sm whitespace-nowrap">Today, Aug 15</div>
            <button mat-icon-button class="text-slate-600 hover:text-slate-900"><mat-icon>chevron_right</mat-icon></button>
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
              </div>
              
              <div class="flex items-center gap-2">
                <mat-icon class="!text-sm text-slate-400">zoom_out</mat-icon>
                <input type="range" min="0.5" max="3" step="0.1" [value]="zoomLevel()" (input)="updateZoom($event)" class="w-24 accent-[#b8924f]">
                <mat-icon class="!text-sm text-slate-400">zoom_in</mat-icon>
              </div>
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
                <div class="relative bg-white divide-y divide-slate-100 text-xs font-semibold text-slate-700 flex flex-col h-[calc(100vh-210px)] min-h-[500px] overflow-y-auto custom-scrollbar">
                  
                  <!-- Current Time Line Indicator -->
                  <div *ngIf="currentTimeTop() > 0" class="absolute left-0 right-0 z-50 border-t-2 border-red-500 pointer-events-none transition-all duration-1000" [style.top.px]="currentTimeTop()">
                    <div class="absolute -left-1 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>

                  <div *ngFor="let hour of hours" [style.min-height.px]="40 * zoomLevel()" class="grid grid-cols-8 flex-1 divide-x divide-slate-150 relative hover:bg-slate-50/30 transition-colors">
                    <div class="p-1 text-right bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-start justify-end pr-2">{{ hour }}</div>

                    <div *ngFor="let day of daysOfWeek" 
                         class="p-1 relative border-transparent transition-colors"
                         (dragover)="onDragOver($event)"
                         (drop)="onDrop($event, hour, day.name)"
                         (dblclick)="onSlotDoubleClick(hour, day.name)">
                         
                         <ng-container *ngIf="day.name === 'WED'">
                           <div *ngIf="hour === '09:00 AM'" draggable="true" (dragstart)="onDragStart($event, {id: 101})" (contextmenu)="onAppointmentContextMenu($event, {id: 101})"
                                class="absolute inset-x-1 z-10 bg-blue-50 border-l-4 border-[#007aff] rounded flex flex-col p-1.5 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing text-left group" [style.top.px]="2 * zoomLevel()" [style.height]="'calc(' + (400 * zoomLevel()) + '% - 4px)'">
                             <div class="text-[8px] font-black text-[#007aff] uppercase tracking-wider flex justify-between">
                               <span>09:00 AM</span>
                               <mat-icon class="!text-[10px] !w-[10px] !h-[10px]">spa</mat-icon>
                             </div>
                             <h4 class="text-[10px] font-black text-slate-900 leading-tight">Olivia Rhoden</h4>
                             <p class="text-[9px] font-semibold text-slate-500 line-clamp-1">Laser Hair Removal</p>
                             
                             <div class="w-full h-1 bg-blue-100 rounded-full mt-1 mb-1 overflow-hidden">
                               <div class="h-full bg-[#007aff] w-3/4"></div>
                             </div>

                             <div class="mt-auto flex justify-between items-end">
                               <span class="px-1 py-0.5 bg-blue-100 text-blue-800 text-[8px] font-black rounded border border-blue-200">60m</span>
                               <span class="text-[8px] font-black text-emerald-600">Paid Online</span>
                             </div>

                             <div class="hidden group-hover:flex absolute left-full ml-2 top-0 w-48 bg-slate-900 text-white p-3 rounded-xl shadow-xl flex-col z-50">
                               <div class="font-bold text-xs">Olivia Rhoden</div>
                               <div class="text-[10px] text-slate-300">History: 3 previous bookings</div>
                               <div class="text-[10px] text-slate-300">Notes: First session</div>
                               <div class="mt-2 text-[10px] font-black text-emerald-400">Balance: $0.00</div>
                               <a [routerLink]="['/employee/treatment-notes', 101]" class="mt-2 text-[10px] text-[#b8924f] hover:underline flex items-center gap-1"><mat-icon class="!text-[10px] !w-[10px] !h-[10px]">edit_document</mat-icon> Edit Notes</a>
                             </div>
                           </div>
                         </ng-container>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right 1 Column: Queue & Utilities -->
        <div class="xl:col-span-1 space-y-6">
          <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs text-left">
            <h3 class="text-sm font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
              <mat-icon class="text-slate-400">queue_play_next</mat-icon> TODAY'S QUEUE
            </h3>
            
            <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg mb-4">
              <button class="flex-1 py-1.5 text-[10px] font-black rounded bg-white text-slate-900 shadow-sm uppercase tracking-widest">Waiting</button>
              <button class="flex-1 py-1.5 text-[10px] font-bold rounded text-slate-500 hover:text-slate-700 uppercase tracking-widest">In Treatment</button>
            </div>

            <div class="space-y-3">
              <div *ngFor="let apt of upcomingList" class="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center gap-3">
                <img [src]="apt.photo" class="w-10 h-10 rounded-full object-cover shadow-sm">
                <div class="flex-1">
                  <div class="text-xs font-black text-slate-900">{{ apt.name }}</div>
                  <div class="text-[10px] font-bold text-slate-500 line-clamp-1">{{ apt.treatment }}</div>
                </div>
                <div class="text-right">
                  <div class="text-[10px] font-black text-[#b8924f]">{{ apt.time }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs text-left">
            <h3 class="text-sm font-black text-slate-900 tracking-tight mb-4">QUICK BLOCK TIME</h3>
            <div class="grid grid-cols-2 gap-3">
              <button (click)="quickBlockTime('Coffee')" class="p-2 border border-slate-200 rounded-xl flex items-center gap-2 hover:bg-slate-50 text-slate-700">
                <mat-icon class="!text-sm">local_cafe</mat-icon><span class="text-xs font-semibold">Coffee</span>
              </button>
              <button (click)="quickBlockTime('Lunch')" class="p-2 border border-slate-200 rounded-xl flex items-center gap-2 hover:bg-slate-50 text-slate-700">
                <mat-icon class="!text-sm">restaurant</mat-icon><span class="text-xs font-semibold">Lunch</span>
              </button>
              <button (click)="quickBlockTime('Meeting')" class="p-2 border border-slate-200 rounded-xl flex items-center gap-2 hover:bg-slate-50 text-slate-700">
                <mat-icon class="!text-sm">group</mat-icon><span class="text-xs font-semibold">Meeting</span>
              </button>
              <button (click)="quickBlockTime('Maintenance')" class="p-2 border border-slate-200 rounded-xl flex items-center gap-2 hover:bg-slate-50 text-slate-700">
                <mat-icon class="!text-sm">build</mat-icon><span class="text-xs font-semibold">Maintenance</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Undo Toast -->
      <div *ngIf="showUndoToast()" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-fade-up">
        <span class="text-xs font-bold">{{ undoMessage() }}</span>
        <button (click)="performUndo()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-black text-amber-400 uppercase tracking-wider transition-colors">Undo</button>
      </div>

    </div>
    <!-- Context Menu overlay -->
    <div *ngIf="showContextMenu" (click)="closeContextMenu()" class="fixed inset-0 z-[100]">
      <div class="absolute bg-white border border-slate-200 rounded-xl shadow-2xl py-2 w-48 text-left z-[101]"
           [style.left.px]="contextMenuX" [style.top.px]="contextMenuY" (click)="$event.stopPropagation()">
        <button (click)="handleContextAction('open')" class="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
          <mat-icon class="!text-sm">open_in_new</mat-icon> Open
        </button>
        <button (click)="handleContextAction('check_in')" class="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
          <mat-icon class="!text-sm">check_circle</mat-icon> Check In
        </button>
        <button (click)="handleContextAction('complete')" class="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
          <mat-icon class="!text-sm">done_all</mat-icon> Complete
        </button>
        <div class="h-px bg-slate-100 my-1"></div>
        <button (click)="handleContextAction('cancel')" class="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2">
          <mat-icon class="!text-sm">cancel</mat-icon> Cancel
        </button>
      </div>
    </div>
    
    <app-internal-booking-modal *ngIf="showBookingModal" [initialDate]="initialModalDate" [initialTime]="initialModalTime" (close)="showBookingModal = false"></app-internal-booking-modal>
  `,
})
export class EmployeeScheduleComponent implements OnInit, OnDestroy {
  showBookingModal = false;
  initialModalDate = '';
  initialModalTime = '';
  
  showContextMenu = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextMenuAppointment: any = null;

  onSlotDoubleClick(hour: string, day: string): void {
    console.log(`Double clicked on slot: ${day} at ${hour}`);
    const today = new Date();
    this.initialModalDate = today.toISOString().split('T')[0];
    this.initialModalTime = hour;
    this.showBookingModal = true;
  }

  onAppointmentContextMenu(event: MouseEvent, appointment: any): void {
    event.preventDefault();
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.contextMenuAppointment = appointment;
    this.showContextMenu = true;
  }

  closeContextMenu(): void {
    this.showContextMenu = false;
  }

  handleContextAction(action: string): void {
    if (this.contextMenuAppointment) {
      console.log(`Action [${action}] triggered for appointment ID:`, this.contextMenuAppointment.id);
      if (action === 'check_in') {
        alert('Appointment Checked In');
      } else if (action === 'complete') {
        alert('Appointment Completed');
      } else if (action === 'cancel') {
        alert('Appointment Cancelled');
      } else if (action === 'open') {
        alert('Opening Appointment Details...');
      }
    }
    this.closeContextMenu();
  }
  
  hours = Array.from({ length: 41 }, (_, i) => {
    const totalMinutes = (7 * 60) + (i * 15);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  });

  daysOfWeek = [
    { name: 'MON', date: '12' },
    { name: 'TUE', date: '13' },
    { name: 'WED', date: '14' },
    { name: 'THU', date: '15' },
    { name: 'FRI', date: '16' },
    { name: 'SAT', date: '17' },
    { name: 'SUN', date: '18' },
  ];

  upcomingList = [
    { photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&q=80', name: 'Sarah Jenkins', treatment: 'Laser Hair Removal', time: '09:00 AM', loc: 'CS' },
    { photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&q=80', name: 'Eleanor Rigby', treatment: 'Consultation', time: '10:15 AM', loc: 'CS' },
    { photo: 'https://images.unsplash.com/photo-1594824813566-78853c829393?w=150&q=80', name: 'Amelia Pond', treatment: 'Facial Resurfacing', time: '11:00 AM', loc: 'CS' },
  ];

  zoomLevel = signal<number>(1);
  currentTimeTop = signal<number>(0);
  showUndoToast = signal(false);
  undoMessage = signal('');
  undoState: any = null;
  private timeInterval: any;

  constructor(public authState: AuthStateService) {}

  ngOnInit() {
    this.updateCurrentTimeLine();
    this.timeInterval = setInterval(() => {
      this.updateCurrentTimeLine();
    }, 60000);
  }

  ngOnDestroy() {
    if (this.timeInterval) clearInterval(this.timeInterval);
  }

  updateZoom(event: any): void {
    this.zoomLevel.set(parseFloat(event.target.value));
    this.updateCurrentTimeLine();
  }

  updateCurrentTimeLine(): void {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const minutesSince7AM = minutes - 420;
    
    if (minutesSince7AM >= 0 && minutesSince7AM < (41 * 15)) {
      const pxPerMinute = (40 * this.zoomLevel()) / 15;
      this.currentTimeTop.set(minutesSince7AM * pxPerMinute);
    } else {
      this.currentTimeTop.set(-1);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 't' || event.key === 'T') {
      console.log('Shortcut: Jumped to Today');
    }
  }

  onDragStart(event: DragEvent, appointment: any): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify(appointment));
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDrop(event: DragEvent, hour: string, day: string): void {
    event.preventDefault();
    if (event.dataTransfer) {
      const data = event.dataTransfer.getData('text/plain');
      if (data) {
        const appointment = JSON.parse(data);
        this.triggerUndoableAction(`Moved appointment to ${day} ${hour}`, { previousPos: '...' });
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  quickBlockTime(type: string): void {
    console.log(`Quick blocking time for: ${type}`);
    this.triggerUndoableAction(`Blocked time for ${type}`, {});
  }

  triggerUndoableAction(message: string, previousState: any): void {
    this.undoState = previousState;
    this.undoMessage.set(message);
    this.showUndoToast.set(true);
    setTimeout(() => {
      this.showUndoToast.set(false);
    }, 5000);
  }

  performUndo(): void {
    console.log('Undoing action, restoring state:', this.undoState);
    this.showUndoToast.set(false);
    this.undoState = null;
  }
}
