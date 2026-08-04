import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { environment } from '../../../../environments/environment';
import { InternalBookingModalComponent } from '../../../shared/components/internal-booking-modal/internal-booking-modal.component';
import { WeeklyCalendarComponent, CalendarEvent } from '../../../shared/components/weekly-calendar/weekly-calendar.component';

@Component({
  selector: 'app-employee-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, InternalBookingModalComponent, WeeklyCalendarComponent],
  templateUrl: './employee-schedule.component.html', 
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #cbd5e1;
    }
  `]
})
export class EmployeeScheduleComponent implements OnInit, OnDestroy {
  showModal = signal(false);
  calendarEvents: CalendarEvent[] = [];
  allBookings: any[] = [];
  
  // Sidebar data
  waitingCount = 0;
  checkedInCount = 0;
  inTreatmentCount = 0;
  queueList: any[] = [];
  
  constructor(private http: HttpClient, private authState: AuthStateService) {}

  ngOnInit() {
    this.fetchAppointments();
  }

  ngOnDestroy() {}

  fetchAppointments() {
    const headers = { Authorization: `Bearer ${this.authState.token()}` };
    this.http.get<any>(`${environment.apiUrl}/admin/bookings`, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.allBookings = res.data;
          this.mapToCalendarEvents();
          this.calculateQueueStats();
        }
      },
      error: (err) => console.error('Failed to load appointments', err)
    });
  }

  mapToCalendarEvents() {
    this.calendarEvents = this.allBookings.map((b: any) => {
      let status: any = 'confirmed';
      if (b.status === 'checked_in') status = 'checked_in';
      if (b.status === 'in_treatment') status = 'in_treatment';
      if (b.status === 'completed') status = 'completed';
      if (b.status === 'cancelled') status = 'cancelled';
      if (b.status === 'no_show') status = 'no_show';
      
      const duration = b.service_duration_minutes || 60;
      const startTime24 = b.appointment_time || '09:00';
      const date = b.appointment_date || new Date().toISOString().split('T')[0];
      
      return {
        id: String(b.id),
        title: b.service_name || 'Service',
        subtitle: (b.status || 'Confirmed').replace('_', ' '),
        patient: (b.customer_first_name || '') + ' ' + (b.customer_last_name || ''),
        date: date,
        startTime: startTime24,
        durationMinutes: duration,
        status: status,
        data: b
      };
    });
  }

  calculateQueueStats() {
    const todayStr = new Date().toISOString().split('T')[0];
    const todays = this.allBookings.filter(b => b.appointment_date === todayStr);
    
    this.waitingCount = todays.filter(b => b.status === 'confirmed').length;
    this.checkedInCount = todays.filter(b => b.status === 'checked_in').length;
    this.inTreatmentCount = todays.filter(b => b.status === 'in_treatment').length;
    
    this.queueList = todays.filter(b => ['confirmed', 'checked_in', 'in_treatment'].includes(b.status));
  }

  openBookingModal() {
    this.showModal.set(true);
  }

  closeBookingModal() {
    this.showModal.set(false);
  }

  onBookingCreated() {
    this.closeBookingModal();
    this.fetchAppointments();
  }

  openReschedule(event: CalendarEvent) {
    console.log('Clicked event', event);
    // In future, open a details/reschedule panel
  }
}
