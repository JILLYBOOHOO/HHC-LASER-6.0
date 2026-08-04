import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
  imports: [CommonModule, MatIconModule, MatMenuModule, MatTooltipModule, MatDividerModule, MatSnackBarModule],
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
      transition: top 1s linear;
    }
    .current-time-line::before {
      content: '';
      position: absolute;
      left: -4px;
      top: -3px;
      width: 8px;
      height: 8px;
      background-color: #ef4444;
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
      animation: pulse-red 2s infinite;
    }
    @keyframes pulse-red {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    .current-time-label {
      position: absolute;
      left: 10px;
      top: -9px;
      background: #ef4444;
      color: white;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      z-index: 30;
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
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
  @Output() actionTriggered = new EventEmitter<{action: string, event: CalendarEvent}>();
  
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(private snackBar: MatSnackBar) {}

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
    this.actionTriggered.emit({ action, event: ev });
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
