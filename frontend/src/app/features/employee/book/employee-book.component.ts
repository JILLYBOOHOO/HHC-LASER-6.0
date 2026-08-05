import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InternalBookingModalComponent } from '../../../shared/components/internal-booking-modal/internal-booking-modal.component';

@Component({
  selector: 'app-employee-book',
  standalone: true,
  imports: [CommonModule, InternalBookingModalComponent],
  template: `
    <div class="p-6 md:p-8 font-sans min-h-screen bg-slate-50">
      <app-internal-booking-modal 
        (close)="onClose()" 
        (bookingCreated)="onCreated()">
      </app-internal-booking-modal>
    </div>
  `
})
export class EmployeeBookComponent {
  constructor(private router: Router) {}

  onClose() {
    this.router.navigate(['/employee/schedule']);
  }

  onCreated() {
    this.router.navigate(['/employee/schedule']);
  }
}
