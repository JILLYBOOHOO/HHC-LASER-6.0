import os

ts_content = """import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface CalendarEvent {
  id: string;
  title: string;
  subtitle?: string;
  patient?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24-hour)
  durationMinutes: number;
  status: 'confirmed' | 'checked_in' | 'in_treatment' | 'completed' | 'cancelled' | 'no_show';
  color?: string;
  paymentStatus?: 'Paid Online' | 'Pay In Person' | 'Balance Due';
  staffName?: string;
  room?: string;
  isBlockTime?: boolean;
  data?: any;
}

@Component({
  selector: 'app-weekly-calendar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './weekly-calendar.component.html',
  styles: [`
    .calendar-grid {
      display: grid;
      grid-template-columns: 60px repeat(7, minmax(80px, 1fr));
      background-color: #f8fafc;
    }
    .time-col {
      border-right: 1px solid #e2e8f0;
      background: white;
    }
    .day-col {
      border-right: 1px solid #f1f5f9;
      position: relative;
    }
    .day-col:last-child {
      border-right: none;
    }
    .event-card {
      position: absolute;
      left: 4px;
      right: 4px;
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 10px;
      line-height: 1.2;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      border-left-width: 3px;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 10;
      background-color: white;
    }
    .event-card:hover {
      z-index: 20;
      filter: brightness(0.95);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .current-time-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #ef4444;
      z-index: 30;
      pointer-events: none;
      box-shadow: 0 0 4px rgba(239, 68, 68, 0.5);
    }
    .current-time-label {
      position: absolute;
      left: 5px;
      top: -9px;
      background: #ef4444;
      color: white;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      z-index: 30;
    }
    
    /* Status Colors based on the screenshot */
    .status-confirmed { background-color: #e0f2fe; border-left-color: #0ea5e9; color: #0369a1; }
    .status-checked_in { background-color: #dcfce7; border-left-color: #22c55e; color: #166534; }
    .status-in_treatment { background-color: #ffedd5; border-left-color: #f97316; color: #9a3412; }
    .status-completed { background-color: #f3e8ff; border-left-color: #a855f7; color: #6b21a8; }
    .status-cancelled { background-color: #ffe4e6; border-left-color: #f43f5e; color: #be123c; }
    .status-no_show { background-color: #f1f5f9; border-left-color: #64748b; color: #334155; }
    .status-block_time { background-color: #f3f4f6; border-left-color: #9ca3af; color: #374151; opacity: 0.8; }
  `]
})
export class WeeklyCalendarComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() events: CalendarEvent[] = [];
  @Input() startDate: Date = new Date();
  @Output() eventClick = new EventEmitter<CalendarEvent>();
  
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  hours = Array.from({length: 10}, (_, i) => i + 8); // 8 AM to 5 PM
  days: { date: Date, label: string, dayNum: number }[] = [];
  
  currentTimeStr: string = '';
  currentTopPos: number = 0;
  private timeInterval: any;

  ngOnInit() {
    this.generateDays();
    this.updateCurrentTime();
    this.timeInterval = setInterval(() => this.updateCurrentTime(), 60000);
  }

  ngAfterViewInit() {
    setTimeout(() => this.scrollToCurrentTime(), 100);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['startDate']) {
      this.generateDays();
    }
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  generateDays() {
    this.days = [];
    const start = new Date(this.startDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      this.days.push({
        date: d,
        label: dayNames[i],
        dayNum: d.getDate()
      });
    }
  }

  getEventsForDay(date: Date): CalendarEvent[] {
    const dateStr = date.toISOString().split('T')[0];
    return this.events.filter(e => e.date === dateStr);
  }

  getEventStyle(event: CalendarEvent): any {
    const [h, m] = event.startTime.split(':').map(Number);
    // Snap start to 15 mins visually
    const snappedM = Math.round(m / 15) * 15;
    const startMins = (h * 60 + snappedM) - (8 * 60);
    const topPx = startMins; // 1 min = 1px
    
    // Snap duration to 15 mins visually
    let heightPx = Math.round(event.durationMinutes / 15) * 15;
    if (heightPx < 15) heightPx = 15;
    
    return {
      top: topPx + 'px',
      height: heightPx + 'px'
    };
  }

  getEventClass(event: CalendarEvent): string {
    if (event.isBlockTime) return 'status-block_time';
    if (event.color) return event.color;
    return 'status-' + event.status;
  }

  getServiceIcon(serviceName: string): string {
    const name = serviceName.toLowerCase();
    if (name.includes('laser')) return '⚡';
    if (name.includes('rejuvenation') || name.includes('ipl')) return '✨';
    if (name.includes('facial') || name.includes('hydrafacial')) return '💆';
    if (name.includes('peel')) return '🧴';
    if (name.includes('botox') || name.includes('filler') || name.includes('inject')) return '💉';
    if (name.includes('contour') || name.includes('sculpt')) return '💪';
    if (name.includes('body')) return '🌿';
    if (name.includes('consultation')) return '🩺';
    return '📅';
  }

  getEventIcon(status: string): string {
    switch (status) {
      case 'confirmed': return 'event';
      case 'checked_in': return 'check_circle';
      case 'in_treatment': return 'healing';
      case 'completed': return 'done_all';
      case 'cancelled': return 'cancel';
      default: return 'bookmark';
    }
  }

  onEventClick(event: CalendarEvent) {
    this.eventClick.emit(event);
  }

  onRightClick(event: MouseEvent, calEvent: CalendarEvent) {
    event.preventDefault();
  }

  handleAction(action: string, ev: CalendarEvent) {
    alert(action + ' action triggered for ' + ev.patient);
  }

  updateCurrentTime() {
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    this.currentTimeStr = h12 + ':' + m.toString().padStart(2, '0') + ' ' + ampm;
    
    if (h >= 8 && h <= 17) {
      this.currentTopPos = ((h * 60 + m) - (8 * 60));
    } else {
      this.currentTopPos = -9999;
    }
  }

  scrollToCurrentTime() {
    if (this.currentTopPos > 0 && this.scrollContainer) {
      // Scroll so the current time is vertically centered
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = Math.max(0, this.currentTopPos - (el.clientHeight / 2));
    }
  }
}
"""

html_content = """<div class="calendar-container w-full h-full bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden font-sans">
  <!-- Calendar Header (Days) -->
  <div class="flex border-b border-slate-200 bg-white sticky top-0 z-40">
    <div class="w-[60px] shrink-0 border-r border-slate-200 flex items-center justify-center bg-slate-50">
      <mat-icon class="!text-[18px] text-slate-400">schedule</mat-icon>
    </div>
    <div class="flex-1 grid grid-cols-7">
      <div *ngFor="let day of days" class="py-2 text-center border-r border-slate-100 last:border-r-0">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{{ day.label }} {{ day.dayNum }}</div>
      </div>
    </div>
  </div>

  <!-- Calendar Body (Scrollable) -->
  <div #scrollContainer class="flex-1 overflow-y-auto relative custom-scrollbar bg-[#f8fafc]">
    
    <!-- Red Current Time Line -->
    <div *ngIf="currentTopPos > 0" class="current-time-line" [style.top.px]="currentTopPos">
      <div class="current-time-label">{{ currentTimeStr }}</div>
    </div>

    <!-- The Grid -->
    <div class="calendar-grid relative">
      <!-- Time Column (Left) -->
      <div class="time-col flex flex-col pt-1.5 pb-6">
        <div *ngFor="let h of hours" class="h-[60px] relative border-b border-slate-200">
          <span class="absolute -top-[7px] right-2 text-[10px] font-bold text-slate-500">
            {{ h > 12 ? h - 12 : h }}:00 {{ h >= 12 ? 'PM' : 'AM' }}
          </span>
          <span class="absolute top-[8px] right-2 text-[8px] font-medium text-slate-300">
            {{ h > 12 ? h - 12 : h }}:15
          </span>
          <span class="absolute top-[23px] right-2 text-[9px] font-medium text-slate-400">
            {{ h > 12 ? h - 12 : h }}:30
          </span>
          <span class="absolute top-[38px] right-2 text-[8px] font-medium text-slate-300">
            {{ h > 12 ? h - 12 : h }}:45
          </span>
        </div>
      </div>

      <!-- Day Columns -->
      <div *ngFor="let day of days" class="day-col pt-1.5 pb-6 relative">
        <!-- Grid Lines for this day -->
        <div *ngFor="let h of hours" class="h-[60px] border-b border-slate-200">
          <div class="h-[15px] border-b border-slate-100/50"></div>
          <div class="h-[15px] border-b border-slate-100/50"></div>
          <div class="h-[15px] border-b border-slate-100/50"></div>
          <div class="h-[15px]"></div>
        </div>

        <!-- Events for this day -->
        <ng-container *ngFor="let ev of getEventsForDay(day.date)">
          <!-- Event Card -->
          <div class="event-card"
               [ngClass]="getEventClass(ev)"
               [ngStyle]="getEventStyle(ev)"
               (click)="onEventClick(ev)"
               (contextmenu)="onRightClick($event, ev)"
               [matMenuTriggerFor]="rightClickMenu"
               [matMenuTriggerData]="{event: ev}"
               [matTooltip]="'Check In | Edit | Reschedule | Cancel | Take Payment'">
            
            <div *ngIf="ev.isBlockTime; else appointmentTpl" class="flex flex-col h-full justify-center items-center opacity-70">
              <span class="text-xs font-bold">{{ ev.title }}</span>
            </div>

            <ng-template #appointmentTpl>
              <div class="flex justify-between items-start">
                <div class="font-extrabold text-[10px] truncate">{{ ev.patient || 'Patient' }}</div>
                <div class="text-[8px] font-bold text-slate-500">{{ ev.startTime }}</div>
              </div>
              
              <div class="flex items-center gap-1 mt-0.5 truncate text-[9px] font-semibold opacity-90">
                <span class="text-[12px]">{{ getServiceIcon(ev.title) }}</span>
                <span>{{ ev.title }}</span>
              </div>
              
              <div class="flex items-center gap-1 mt-0.5 truncate text-[9px] font-medium opacity-80">
                <mat-icon class="!text-[10px] !w-2.5 !h-2.5">person</mat-icon>
                <span>{{ ev.staffName || 'Staff' }}</span>
                <span class="mx-0.5">&bull;</span>
                <mat-icon class="!text-[10px] !w-2.5 !h-2.5">schedule</mat-icon>
                <span>{{ ev.durationMinutes }}m</span>
              </div>
              
              <!-- Payment and Status at bottom -->
              <div class="absolute bottom-1 left-1.5 right-1.5 flex justify-between items-center text-[8.5px] uppercase tracking-wide">
                <div class="font-bold flex items-center gap-1">
                  <mat-icon class="!text-[10px] !w-2.5 !h-2.5 opacity-70">{{ getEventIcon(ev.status) }}</mat-icon>
                  <span>{{ ev.subtitle || (ev.status.replace('_', ' ')) }}</span>
                </div>
                <div class="font-bold px-1 py-0.5 rounded" 
                     [ngClass]="{'bg-green-100 text-green-700': ev.paymentStatus === 'Paid Online', 
                                'bg-yellow-100 text-yellow-700': ev.paymentStatus === 'Balance Due',
                                'bg-blue-100 text-blue-700': ev.paymentStatus === 'Pay In Person'}">
                  {{ ev.paymentStatus || 'Balance Due' }}
                </div>
              </div>
            </ng-template>
          </div>
        </ng-container>
      </div>
    </div>
  </div>
</div>

<!-- Right Click Context Menu Template -->
<mat-menu #rightClickMenu="matMenu">
  <ng-template matMenuContent let-event="event">
    <button mat-menu-item (click)="handleAction('Open', event)">
      <mat-icon>open_in_new</mat-icon>
      <span>Open</span>
    </button>
    <button mat-menu-item (click)="handleAction('Check In', event)">
      <mat-icon>check_circle</mat-icon>
      <span>Check In</span>
    </button>
    <button mat-menu-item (click)="handleAction('Complete', event)">
      <mat-icon>done_all</mat-icon>
      <span>Complete</span>
    </button>
    <mat-divider></mat-divider>
    <button mat-menu-item (click)="handleAction('Reschedule', event)">
      <mat-icon>event_repeat</mat-icon>
      <span>Reschedule</span>
    </button>
    <button mat-menu-item (click)="handleAction('Cancel', event)" class="text-red-500">
      <mat-icon class="text-red-500">cancel</mat-icon>
      <span>Cancel</span>
    </button>
    <mat-divider></mat-divider>
    <button mat-menu-item (click)="handleAction('Take Payment', event)">
      <mat-icon>payments</mat-icon>
      <span>Take Payment</span>
    </button>
    <button mat-menu-item (click)="handleAction('Invoice', event)">
      <mat-icon>receipt</mat-icon>
      <span>Invoice</span>
    </button>
    <mat-divider></mat-divider>
    <button mat-menu-item (click)="handleAction('View Client', event)">
      <mat-icon>person</mat-icon>
      <span>View Client</span>
    </button>
    <button mat-menu-item (click)="handleAction('Call', event)">
      <mat-icon>phone</mat-icon>
      <span>Call</span>
    </button>
    <button mat-menu-item (click)="handleAction('Add Note', event)">
      <mat-icon>note_add</mat-icon>
      <span>Add Note</span>
    </button>
  </ng-template>
</mat-menu>
"""

import pathlib
base_dir = r"c:\\Users\\church\\Downloads\\HHCLASER5.0-main\\HHCLASER5.0-main\\frontend\\src\\app\\shared\\components\\weekly-calendar"

with open(os.path.join(base_dir, "weekly-calendar.component.ts"), "w", encoding="utf-8") as f:
    f.write(ts_content)

with open(os.path.join(base_dir, "weekly-calendar.component.html"), "w", encoding="utf-8") as f:
    f.write(html_content)

print("WeeklyCalendarComponent updated successfully!")
