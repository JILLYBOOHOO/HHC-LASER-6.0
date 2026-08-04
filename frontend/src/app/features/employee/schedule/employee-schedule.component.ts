import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { WeeklyCalendarComponent, CalendarEvent } from '../../../shared/components/weekly-calendar/weekly-calendar.component';
import { InternalBookingModalComponent } from '../../../shared/components/internal-booking-modal/internal-booking-modal.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AddNoteModalComponent } from '../../../shared/components/add-note-modal/add-note-modal.component';
import { InvoiceModalComponent } from '../../../shared/components/invoice-modal/invoice-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-employee-schedule',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    WeeklyCalendarComponent,
    InternalBookingModalComponent,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    AddNoteModalComponent,
    InvoiceModalComponent
  ],
  templateUrl: './employee-schedule.component.html'
})
export class EmployeeScheduleComponent implements OnInit {
  private http = inject(HttpClient);
  private authState = inject(AuthStateService);
  private snackBar = inject(MatSnackBar);

  showModal = signal(false);
  showAddNoteModal = signal(false);
  showInvoiceModal = signal(false);
  selectedEvent: CalendarEvent | null = null;

  allBookings: any[] = [];
  calendarEvents: CalendarEvent[] = [];
  
  waitingCount = 0;
  checkedInCount = 0;
  inTreatmentCount = 0;
  
  waitingList: CalendarEvent[] = [];
  checkedInList: CalendarEvent[] = [];
  inTreatmentList: CalendarEvent[] = [];
  arrivalsIn30Mins: CalendarEvent[] = [];

  currentDate: Date = new Date();
  zoomLevel: number = 100;
  locations = ['All Locations', 'HHC LASER Kingston', 'Constant Spring'];
  currentLocationIdx = 0;
  activeView = 'week';

  searchControl = new FormControl('');
  searchResults: CalendarEvent[] = [];
  
  blockCategories = ['Coffee', 'Lunch', 'Meeting', 'Machine Maintenance', 'Training', 'Vacation', 'Cleaning', 'Private'];

  ngOnInit() {
    this.fetchAppointments();
    
    this.searchControl.valueChanges.subscribe(val => {
      if (!val || val.length < 2) {
        this.searchResults = [];
        return;
      }
      const q = val.toLowerCase();
      this.searchResults = this.calendarEvents.filter(ev => 
        (ev.patient || '').toLowerCase().includes(q) || 
        (ev.title || '').toLowerCase().includes(q)
      );
    });
  }

  get dateRangeText(): string {
    const start = new Date(this.currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (start.getMonth() === end.getMonth()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    } else if (start.getFullYear() === end.getFullYear()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${monthNames[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
    }
  }

  get currentMonthYear(): string {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  get currentLocation(): string {
    return this.locations[this.currentLocationIdx];
  }

  goToToday() { this.currentDate = new Date(); }
  previousWeek() { const d = new Date(this.currentDate); d.setDate(d.getDate() - 7); this.currentDate = d; }
  nextWeek() { const d = new Date(this.currentDate); d.setDate(d.getDate() + 7); this.currentDate = d; }
  toggleLocation() { this.currentLocationIdx = (this.currentLocationIdx + 1) % this.locations.length; }
  zoomIn() { if (this.zoomLevel < 200) this.zoomLevel += 10; }
  zoomOut() { if (this.zoomLevel > 50) this.zoomLevel -= 10; }
  setView(view: string) { this.activeView = view; }

  addBlockTime(category: string) {
    // Quick mockup block time
    const block: CalendarEvent = {
      id: 'block-' + Date.now(),
      title: category,
      date: new Date().toISOString().split('T')[0],
      startTime: '12:00',
      durationMinutes: 60,
      status: 'confirmed',
      isBlockTime: true
    };
    this.calendarEvents = [...this.calendarEvents, block];
  }

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
      
      let paymentStatus = 'Balance Due';
      if (b.payment_status === 'paid') paymentStatus = 'Paid Online';
      else if (b.payment_status === 'partially_paid') paymentStatus = 'Pay In Person';

      return {
        id: String(b.id),
        title: b.service_name || 'Service',
        subtitle: (b.status || 'Confirmed').replace('_', ' '),
        patient: (b.customer_first_name || '') + ' ' + (b.customer_last_name || ''),
        date: date,
        startTime: startTime24,
        durationMinutes: duration,
        status: status,
        paymentStatus: paymentStatus as any,
        staffName: 'Amanda', // Mocking staff name since backend might not return it yet
        room: 'Room 1',
        data: b
      };
    });
  }

  calculateQueueStats() {
    const todayStr = new Date().toISOString().split('T')[0];
    const todays = this.calendarEvents.filter(b => b.date === todayStr && !b.isBlockTime);
    
    this.waitingList = todays.filter(b => b.status === 'confirmed');
    this.checkedInList = todays.filter(b => b.status === 'checked_in');
    this.inTreatmentList = todays.filter(b => b.status === 'in_treatment');
    
    this.waitingCount = this.waitingList.length;
    this.checkedInCount = this.checkedInList.length;
    this.inTreatmentCount = this.inTreatmentList.length;
    
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    this.arrivalsIn30Mins = this.waitingList.filter(b => {
      const [h, m] = b.startTime.split(':').map(Number);
      const apptMins = h * 60 + m;
      return apptMins >= nowMins && apptMins <= nowMins + 30;
    });
  }

  
  handleCalendarAction(payload: {action: string, event: CalendarEvent}) {
    const { action, event } = payload;
    this.selectedEvent = event;

    if (action === 'Call') {
      const phone = event.data?.customer_phone;
      if (phone) {
        window.open('tel:' + phone, '_self');
      } else {
        this.snackBar.open('No phone number available for this client.', 'Close', { duration: 3000, panelClass: ['bg-black', 'text-white'] });
      }
    } 
    else if (action === 'Invoice') {
      this.showInvoiceModal.set(true);
    } 
    else if (action === 'Add Note') {
      this.showAddNoteModal.set(true);
    } 
    else if (action === 'Check In') {
      this.updateBookingStatus(event.id, 'checked_in');
    }
    else if (action === 'Complete') {
      this.updateBookingStatus(event.id, 'completed');
    }
    else if (action === 'Reschedule') {
      // Re-use internal booking modal logic for editing (would need to pass booking data to it)
      this.openBookingModal();
    }
    else if (action === 'Cancel') {
      if (confirm(`Are you sure you want to cancel the booking for ${event.patient}?`)) {
        this.updateBookingStatus(event.id, 'cancelled');
      }
    }
    else {
      // Default fallback
      this.snackBar.open(`${action} action triggered for ${event.patient}`, 'Close', { duration: 3000, panelClass: ['bg-black', 'text-white'] });
    }
  }

  updateBookingStatus(id: string, status: string) {
    const headers = { Authorization: `Bearer ${this.authState.token()}` };
    this.http.patch(`${environment.apiUrl}/admin/bookings/${id}/status`, { status }, { headers }).subscribe({
      next: () => {
        this.snackBar.open(`Booking marked as ${status.replace('_', ' ')}`, 'Close', { duration: 3000, panelClass: ['bg-black', 'text-white'] });
        this.fetchAppointments(); // Refresh queue and calendar
      },
      error: () => {
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000, panelClass: ['bg-black', 'text-white'] });
      }
    });
  }

  openBookingModal() { this.showModal.set(true); }
  closeBookingModal() { this.showModal.set(false); }
  onBookingCreated() { this.closeBookingModal(); this.fetchAppointments(); }

  openReschedule(event: CalendarEvent) {
    console.log('Clicked event', event);
  }
}
