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
    .calendar-container {
      background-color: #ffffff;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: 70px repeat(7, minmax(130px, 1fr));
      background-color: #ffffff;
    }
    .time-col {
      border-right: 1px solid #cbd5e1;
      background: #ffffff;
    }
    .day-col {
      border-right: 1px solid #e2e8f0;
      position: relative;
      background: #ffffff;
    }
    .day-col:last-child {
      border-right: none;
    }
    .event-card {
      position: absolute;
      left: 3px;
      right: 3px;
      border-radius: 8px;
      padding: 5px 7px;
      font-size: 11px;
      line-height: 1.25;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      border-left-width: 4px;
      cursor: pointer;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 10;
      border-top-width: 1px;
      border-right-width: 1px;
      border-bottom-width: 1px;
    }
    .event-card:hover {
      z-index: 30;
      transform: translateY(-1px);
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
    }
    .current-time-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #ef4444;
      z-index: 40;
      pointer-events: none;
      box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);
    }
    .current-time-line::before {
      content: '';
      position: absolute;
      left: -5px;
      top: -4px;
      width: 10px;
      height: 10px;
      background-color: #ef4444;
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
      animation: pulse-red 2s infinite;
    }
    @keyframes pulse-red {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
      70% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    .current-time-label {
      position: absolute;
      left: 10px;
      top: -10px;
      background: #ef4444;
      color: white;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      z-index: 40;
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
    }

    /* Status Colors based on specs: Blue=Confirmed, Green=Checked In, Orange=In Treatment, Purple=Completed, Red=Cancelled, Gray=Blocked */
    .status-confirmed {
      background-color: #eff6ff;
      border-left-color: #3b82f6;
      border-color: #bfdbfe;
      color: #1e3a8a;
    }
    .status-checked_in {
      background-color: #ecfdf5;
      border-left-color: #10b981;
      border-color: #a7f3d0;
      color: #064e3b;
    }
    .status-in_treatment {
      background-color: #fff7ed;
      border-left-color: #f97316;
      border-color: #fed7aa;
      color: #7c2d12;
    }
    .status-completed {
      background-color: #faf5ff;
      border-left-color: #8b5cf6;
      border-color: #e9d5ff;
      color: #4c1d95;
    }
    .status-cancelled {
      background-color: #fef2f2;
      border-left-color: #ef4444;
      border-color: #fecaca;
      color: #7f1d1d;
    }
    .status-no_show, .status-block_time {
      background-color: #f8fafc;
      border-left-color: #6b7280;
      border-color: #cbd5e1;
      color: #334155;
    }
  `]
})
export class WeeklyCalendarComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() events: CalendarEvent[] = [];
  @Input() startDate: Date = new Date();
  @Output() eventClick = new EventEmitter<CalendarEvent>();
  @Output() actionTriggered = new EventEmitter<{action: string, event: CalendarEvent}>();
  
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(private snackBar: MatSnackBar) {}

  // 8:00 AM to 5:00 PM (10 hours total: 8, 9, 10, 11, 12, 1, 2, 3, 4, 5)
  hours = Array.from({length: 10}, (_, i) => i + 8);
  days: { date: Date, label: string, dayNum: number, isToday: boolean }[] = [];
  
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
    const todayStr = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      this.days.push({
        date: d,
        label: dayNames[i],
        dayNum: d.getDate(),
        isToday: dateStr === todayStr
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
    // Each hour is 76px tall (1.2667px per minute)
    const topPx = Math.round(startMins * 1.2667);
    
    // Snap duration to 15 mins visually
    let durationMins = event.durationMinutes || 45;
    let heightPx = Math.round(durationMins * 1.2667);
    if (heightPx < 24) heightPx = 24; // Ensure min height
    
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

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-blue-100/80 text-blue-900 border-blue-200';
      case 'checked_in': return 'bg-emerald-100/80 text-emerald-900 border-emerald-200';
      case 'in_treatment': return 'bg-orange-100/80 text-orange-900 border-orange-200';
      case 'completed': return 'bg-purple-100/80 text-purple-900 border-purple-200';
      case 'cancelled': return 'bg-red-100/80 text-red-900 border-red-200';
      case 'no_show': return 'bg-slate-200/80 text-slate-900 border-slate-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'checked_in': return 'Checked In';
      case 'in_treatment': return 'In Treatment';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'no_show': return 'No Show';
      default: return status;
    }
  }

  getStatusTagIcon(status: string): string {
    switch (status) {
      case 'confirmed': return '🔵';
      case 'checked_in': return '🟢';
      case 'in_treatment': return '🟠';
      case 'completed': return '✅';
      case 'cancelled': return '🔴';
      case 'no_show': return '🚫';
      default: return '⚪';
    }
  }

  getPaymentDisplay(paymentStatus?: string): string {
    if (!paymentStatus) return '💳 Deposit Paid';
    if (paymentStatus === 'Paid Online') return '💳 Deposit Paid';
    if (paymentStatus === 'Pay In Person') return '💳 Pay at Location';
    if (paymentStatus === 'Balance Due') return '💳 Balance Due';
    return `💳 ${paymentStatus}`;
  }

  getFormattedTime(startTimeStr: string, durationMinutes: number): string {
    if (!startTimeStr) return '09:00 AM';
    const [h, m] = startTimeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  getServiceIcon(serviceName: string): string {
    const name = (serviceName || '').toLowerCase();
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
    
    if (h >= 8 && h < 18) {
      this.currentTopPos = Math.round((((h * 60) + m) - (8 * 60)) * 1.2667);
    } else {
      this.currentTopPos = -100;
    }
  }

  scrollToCurrentTime() {
    if (this.currentTopPos > 0 && this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.currentTopPos - 100;
    }
  }
}
