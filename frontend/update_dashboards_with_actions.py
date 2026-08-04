import os

admin_ts_path = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\features\admin\bookings\admin-bookings.component.ts"
admin_html_path = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\features\admin\bookings\admin-bookings.component.html"

staff_ts_path = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\features\employee\schedule\employee-schedule.component.ts"
staff_html_path = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\features\employee\schedule\employee-schedule.component.html"

def update_ts_file(path, is_admin=True):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 1. Imports
    if "AddNoteModalComponent" not in content:
        import_str = """import { AddNoteModalComponent } from '../../../shared/components/add-note-modal/add-note-modal.component';
import { InvoiceModalComponent } from '../../../shared/components/invoice-modal/invoice-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';\n"""
        content = content.replace("import { MatInputModule } from '@angular/material/input';", import_str + "import { MatInputModule } from '@angular/material/input';")
    
    if "AddNoteModalComponent" not in content.split("@Component")[1].split("]")[0]:
        content = content.replace("ReactiveFormsModule", "ReactiveFormsModule,\n    AddNoteModalComponent,\n    InvoiceModalComponent")

    # 2. Inject SnackBar
    if "private snackBar = inject(MatSnackBar);" not in content:
        content = content.replace("private authState = inject(AuthStateService);", "private authState = inject(AuthStateService);\n  private snackBar = inject(MatSnackBar);")

    # 3. Add modal state variables
    if "showAddNoteModal =" not in content:
        state_vars = """
  showAddNoteModal = signal(false);
  showInvoiceModal = signal(false);
  selectedEvent: CalendarEvent | null = null;
"""
        content = content.replace("showModal = signal(false);", "showModal = signal(false);" + state_vars)

    # 4. Add handleCalendarAction method
    if "handleCalendarAction(event" not in content:
        handle_method = """
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
"""
        content = content.replace("openBookingModal() {", handle_method + "\n  openBookingModal() {")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def update_html_file(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Add (actionTriggered) to <app-weekly-calendar>
    if "(actionTriggered)=" not in content:
        content = content.replace("<app-weekly-calendar [startDate]=\"currentDate\" [events]=\"calendarEvents\" (eventClick)=\"openReschedule($event)\"></app-weekly-calendar>",
                                  "<app-weekly-calendar [startDate]=\"currentDate\" [events]=\"calendarEvents\" (eventClick)=\"openReschedule($event)\" (actionTriggered)=\"handleCalendarAction($event)\"></app-weekly-calendar>")

    # 2. Add the modal HTML at the end
    if "<app-add-note-modal" not in content:
        modals_html = """
<app-add-note-modal *ngIf="showAddNoteModal()" 
  [bookingId]="selectedEvent?.id || ''" 
  [patientName]="selectedEvent?.patient || ''" 
  (close)="showAddNoteModal.set(false)" 
  (saved)="showAddNoteModal.set(false); fetchAppointments()">
</app-add-note-modal>

<app-invoice-modal *ngIf="showInvoiceModal()" 
  [eventData]="selectedEvent" 
  (close)="showInvoiceModal.set(false)">
</app-invoice-modal>
"""
        content = content + "\n" + modals_html

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

update_ts_file(admin_ts_path)
update_html_file(admin_html_path)

update_ts_file(staff_ts_path, is_admin=False)
update_html_file(staff_html_path)

print("Dashboards updated with action handlers!")
