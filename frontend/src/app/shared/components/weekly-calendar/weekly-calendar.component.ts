import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface CalendarEvent {
  id: string;
  title: string;
  subtitle?: string;
  patient?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24-hour)
  durationMinutes: number;
  status: 'confirmed' | 'checked_in' | 'in_treatment' | 'completed' | 'cancelled' | 'no_show';
  color?: string; // Optional custom color class
  data?: any; // Original appointment data
}

@Component({
  selector: 'app-weekly-calendar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './weekly-calendar.component.html',
  styles: [`
    .calendar-grid {
      display: grid;
      grid-template-columns: 60px repeat(7, minmax(120px, 1fr));
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
    .grid-cell {
      height: 60px; /* 1 hour = 60px, so 15 min = 15px */
      border-bottom: 1px solid #f1f5f9;
      box-sizing: border-box;
    }
    .grid-cell-half {
      height: 30px;
      border-bottom: 1px dashed #f8fafc;
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
    }
    .current-time-label {
      position: absolute;
      left: -50px;
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
    
    /* Additional custom ones */
    .status-payment_due { background-color: #fef9c3; border-left-color: #eab308; color: #854d0e; }
  `]
})
export class WeeklyCalendarComponent implements OnInit, OnDestroy {
  @Input() events: CalendarEvent[] = [];
  @Input() startDate: Date = new Date(); // Start of the week (Monday)
  @Output() eventClick = new EventEmitter<CalendarEvent>();
  
  hours = Array.from({length: 10}, (_, i) => i + 8); // 8 AM to 5 PM (17:00)
  days: { date: Date, label: string, dayNum: number }[] = [];
  
  currentTimeStr: string = '';
  currentTopPos: number = 0;
  private timeInterval: any;

  ngOnInit() {
    this.generateDays();
    this.updateCurrentTime();
    this.timeInterval = setInterval(() => this.updateCurrentTime(), 60000);
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  generateDays() {
    this.days = [];
    const start = new Date(this.startDate);
    // Ensure it's Monday
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
    // 8:00 AM is 0px
    const [h, m] = event.startTime.split(':').map(Number);
    const startMins = (h * 60 + m) - (8 * 60);
    const topPx = startMins; // 1 min = 1px since 60min = 60px
    const heightPx = event.durationMinutes;
    
    return {
      top: topPx + 'px',
      height: heightPx + 'px'
    };
  }

  getEventClass(event: CalendarEvent): string {
    if (event.color) return event.color;
    return 'status-' + event.status;
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

  updateCurrentTime() {
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    this.currentTimeStr = h12 + ':' + m.toString().padStart(2, '0') + ' ' + ampm;
    
    // Position (1 min = 1px from 8AM)
    if (h >= 8 && h <= 17) {
      this.currentTopPos = ((h * 60 + m) - (8 * 60));
    } else {
      this.currentTopPos = -9999; // Hide if outside 8-5
    }
  }
}
