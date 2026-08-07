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
      grid-template-columns: 75px repeat(7, minmax(130px, 1fr));
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
      border-radius: 12px;
      padding: 0;
      font-size: 11px;
      line-height: 1.25;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
      cursor: pointer;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 10;
      border-width: 1px;
    }
    .event-card:hover {
      z-index: 30;
      transform: translateY(-2px);
      box-shadow: 0 12px 20px -3px rgba(0,0,0,0.12), 0 4px 6px -2px rgba(0,0,0,0.05);
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

    /* Soft Gradient Status Colors matching reference image */
    /* Blue = Confirmed */
    .status-confirmed {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border-color: #bfdbfe;
      color: #1e3a8a;
    }
    /* Green = Checked In */
    .status-checked_in {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border-color: #a7f3d0;
      color: #064e3b;
    }
    /* Orange = In Treatment */
    .status-in_treatment {
      background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
      border-color: #fed7aa;
      color: #7c2d12;
    }
    /* Purple = Completed */
    .status-completed {
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      border-color: #e9d5ff;
      color: #4c1d95;
    }
    /* Red = Cancelled */
    .status-cancelled {
      background: linear-gradient(135deg, #fef2f2 0%, #ffe4e6 100%);
      border-color: #fecaca;
      color: #7f1d1d;
    }
    /* Gray = Private / Blocked Time */
    .status-no_show, .status-block_time {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-color: #cbd5e1;
      color: #334155;
    }
  `]
})
export class WeeklyCalendarComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() events: CalendarEvent[] = [];
  @Input() startDate: Date = new Date();
  @Input() viewMode: string = 'week';
  @Output() eventClick = new EventEmitter<CalendarEvent>();
  @Output() actionTriggered = new EventEmitter<{action: string, event: CalendarEvent}>();
  
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(private snackBar: MatSnackBar) {}

  // 8:00 AM to 5:00 PM (10 hours total)
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
    if (changes['startDate'] || changes['viewMode']) {
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
    const todayStr = new Date().toISOString().split('T')[0];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    if (this.viewMode === 'day') {
      const d = new Date(this.startDate);
      const dayIdx = (d.getDay() + 6) % 7;
      const dateStr = d.toISOString().split('T')[0];
      this.days.push({
        date: d,
        label: dayNames[dayIdx],
        dayNum: d.getDate(),
        isToday: dateStr === todayStr
      });
    } else if (this.viewMode === 'month') {
      const start = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), 1);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      
      for (let i = 0; i < 35; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dayIdx = (d.getDay() + 6) % 7;
        const dateStr = d.toISOString().split('T')[0];
        this.days.push({
          date: d,
          label: dayNames[dayIdx],
          dayNum: d.getDate(),
          isToday: dateStr === todayStr
        });
      }
    } else {
      const start = new Date(this.startDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      
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
  }

  getEventsForDay(date: Date): CalendarEvent[] {
    const dateStr = date.toISOString().split('T')[0];
    return this.events.filter(e => e.date === dateStr && e.status !== 'cancelled');
  }

  getEventStyle(event: CalendarEvent): any {
    const [h, m] = event.startTime.split(':').map(Number);
    const snappedM = Math.round(m / 15) * 15;
    const startMins = (h * 60 + snappedM) - (8 * 60);
    // Hour row is 112px tall (1.8667px per minute) so 45m = 84px height (plenty of room!)
    const topPx = Math.round(startMins * 1.8667);
    
    let durationMins = event.durationMinutes || 45;
    let heightPx = Math.round(durationMins * 1.8667);
    if (heightPx < 32) heightPx = 32;
    
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

  getLeftBarClass(event: CalendarEvent): string {
    if (event.isBlockTime) return 'bg-slate-500';
    switch (event.status) {
      case 'confirmed': return 'bg-blue-600';
      case 'checked_in': return 'bg-emerald-500';
      case 'in_treatment': return 'bg-orange-500';
      case 'completed': return 'bg-purple-600';
      case 'cancelled': return 'bg-red-500';
      case 'no_show': return 'bg-slate-500';
      default: return 'bg-blue-600';
    }
  }

  getTimeColorClass(event: CalendarEvent): string {
    if (event.isBlockTime) return 'text-slate-700';
    switch (event.status) {
      case 'confirmed': return 'text-blue-950';
      case 'checked_in': return 'text-emerald-950';
      case 'in_treatment': return 'text-orange-950';
      case 'completed': return 'text-purple-950';
      case 'cancelled': return 'text-red-950';
      case 'no_show': return 'text-slate-700';
      default: return 'text-blue-950';
    }
  }

  getFormattedStartTime(startTimeStr: string): string {
    if (!startTimeStr) return '09:00';
    const [h, m] = startTimeStr.split(':').map(Number);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
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
    return '⚡';
  }

  getStatusOrPaymentIcon(ev: CalendarEvent): string {
    if (ev.status === 'in_treatment') return '🟠';
    if (ev.status === 'checked_in') return '🟢';
    if (ev.status === 'completed') return '✅';
    if (ev.status === 'cancelled') return '🔴';
    if (ev.status === 'no_show') return '🚫';
    
    // Confirmed -> check payment status
    if (ev.data) {
      const totalAmount = Number(ev.data.total_amount_jmd) || 0;
      const totalPaid = Number(ev.data.total_paid) || 0;
      if (totalPaid >= totalAmount && totalAmount > 0) return '💳'; // Paid
      if (totalPaid > 0 && totalPaid < totalAmount) return '🟡'; // Partial
      if (totalPaid === 0 && totalAmount > 0) return '⭕'; // Unpaid
    }

    return '💳';
  }

  getStatusOrPaymentLabel(ev: CalendarEvent): string {
    if (ev.status === 'in_treatment') return 'In Treatment';
    if (ev.status === 'checked_in') return 'Checked In';
    if (ev.status === 'completed') return 'Completed';
    if (ev.status === 'cancelled') return 'Cancelled';
    if (ev.status === 'no_show') return 'No Show';
    
    // Confirmed -> check data.total_paid vs data.total_amount_jmd if available
    if (ev.data) {
      const totalAmount = Number(ev.data.total_amount_jmd) || 0;
      const totalPaid = Number(ev.data.total_paid) || 0;
      if (totalPaid >= totalAmount && totalAmount > 0) return 'Paid';
      if (totalPaid > 0 && totalPaid < totalAmount) return 'Partial';
      if (totalPaid === 0 && totalAmount > 0) return 'Unpaid';
    }

    if (ev.paymentStatus === 'Paid Online') return 'Deposit Paid';
    if (ev.paymentStatus === 'Pay In Person') return 'Pay at Location';
    if (ev.paymentStatus === 'Balance Due') return 'Balance Due';
    return 'Deposit Paid';
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
      this.currentTopPos = Math.round((((h * 60) + m) - (8 * 60)) * 1.8667);
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
