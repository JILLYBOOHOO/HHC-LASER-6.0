import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthStateService } from '../../../core/store/auth-state.service';

@Component({
  selector: 'app-internal-booking-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 class="text-2xl font-black text-neutral-900 flex items-center gap-2">
              <mat-icon class="text-cyan-500">add_circle</mat-icon>
              New Appointment
            </h2>
            <p class="text-xs font-bold text-neutral-500 mt-1">Quick-book for in-store or over-the-phone customers.</p>
          </div>
          <button (click)="close.emit()" class="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 transition-colors">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div *ngIf="error" class="mx-6 mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
          {{ error }}
        </div>

        <div *ngIf="success" class="mx-6 mt-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold border border-emerald-100 flex items-center gap-2">
          <mat-icon>check_circle</mat-icon>
          Booking created successfully!
        </div>

        <!-- Form Body -->
        <form *ngIf="!success" [formGroup]="form" (ngSubmit)="submit()" class="p-6 space-y-8">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Left Column: Customer & Service -->
            <div class="space-y-6">
              
              <!-- Customer Section -->
              <div class="bg-neutral-50 p-5 rounded-2xl border border-neutral-100 space-y-4">
                <h3 class="text-sm font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2">
                  <mat-icon class="!text-lg text-neutral-400">person</mat-icon>
                  1. Customer Details
                </h3>
                
                <div>
                  <label class="block text-xs font-bold text-neutral-600 mb-1.5">Phone Number *</label>
                  <input type="text" formControlName="phone" placeholder="(555) 123-4567" class="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all">
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-neutral-600 mb-1.5">First Name *</label>
                    <input type="text" formControlName="firstName" placeholder="Jane" class="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-cyan-500 outline-none">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-neutral-600 mb-1.5">Last Name *</label>
                    <input type="text" formControlName="lastName" placeholder="Doe" class="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-cyan-500 outline-none">
                  </div>
                </div>
              </div>

              <!-- Service & Location Section -->
              <div class="bg-neutral-50 p-5 rounded-2xl border border-neutral-100 space-y-4">
                <h3 class="text-sm font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2">
                  <mat-icon class="!text-lg text-neutral-400">spa</mat-icon>
                  2. Service Selection
                </h3>
                
                <div>
                  <label class="block text-xs font-bold text-neutral-600 mb-1.5">Location *</label>
                  <select formControlName="locationId" class="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-cyan-500 outline-none">
                    <option [value]="1">Main Clinic (Downtown)</option>
                    <option [value]="2">Northside Branch</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-neutral-600 mb-1.5">Service *</label>
                  <select formControlName="serviceId" class="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-cyan-500 outline-none">
                    <option [value]="1">Laser Hair Removal (30m)</option>
                    <option [value]="2">Microdermabrasion (45m)</option>
                    <option [value]="3">Chemical Peel (60m)</option>
                  </select>
                </div>
              </div>

            </div>

            <!-- Right Column: Date, Time & Notes -->
            <div class="space-y-6">
              
              <!-- Date & Time Section -->
              <div class="bg-neutral-50 p-5 rounded-2xl border border-neutral-100 space-y-4">
                <h3 class="text-sm font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2">
                  <mat-icon class="!text-lg text-neutral-400">event</mat-icon>
                  3. Schedule
                </h3>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-neutral-600 mb-1.5">Date *</label>
                    <input type="date" formControlName="date" class="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-cyan-500 outline-none">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-neutral-600 mb-1.5">Time *</label>
                    <input type="time" formControlName="time" class="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-cyan-500 outline-none">
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-neutral-600 mb-1.5">Provider *</label>
                  <select formControlName="employeeId" class="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-cyan-500 outline-none">
                    <option [value]="1">Dr. Sarah Jenkins</option>
                    <option [value]="2">Dr. Marcus Wright</option>
                    <option [value]="3">Any Available Provider</option>
                  </select>
                </div>
              </div>

              <!-- Additional Notes Section -->
              <div class="bg-neutral-50 p-5 rounded-2xl border border-neutral-100 space-y-4">
                <h3 class="text-sm font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2">
                  <mat-icon class="!text-lg text-neutral-400">notes</mat-icon>
                  4. Internal Notes
                </h3>
                
                <div>
                  <textarea formControlName="notes" rows="3" placeholder="Add any special instructions or patient requests here..." class="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-cyan-500 outline-none resize-none"></textarea>
                </div>
              </div>

            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between pt-6 border-t border-neutral-100">
            <button type="button" (click)="clearDraft()" class="text-xs font-bold text-neutral-400 hover:text-red-500 transition-colors">
              Clear Form
            </button>
            <div class="flex gap-3">
              <button type="button" (click)="close.emit()" class="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm rounded-xl transition-colors">
                Cancel
              </button>
              <button type="submit" [disabled]="form.invalid || loading" class="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2">
                <mat-icon *ngIf="loading" class="animate-spin !text-lg">refresh</mat-icon>
                <span>{{ loading ? 'Booking...' : 'Create Appointment' }}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  `
})
export class InternalBookingModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  
  form: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;
  private readonly DRAFT_KEY = 'hhc_internal_booking_draft';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authState: AuthStateService
  ) {
    this.form = this.fb.group({
      phone: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      locationId: [1, Validators.required],
      serviceId: [1, Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      employeeId: [1, Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadDraft();
    
    // Auto-save draft on form changes
    this.form.valueChanges.subscribe(val => {
      localStorage.setItem(this.DRAFT_KEY, JSON.stringify(val));
    });
  }

  loadDraft() {
    const saved = localStorage.getItem(this.DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed).length > 0) {
          const confirmResume = confirm('You have an unsaved booking draft. Would you like to resume it?');
          if (confirmResume) {
            this.form.patchValue(parsed);
          } else {
            this.clearDraft();
          }
        }
      } catch (e) {
        this.clearDraft();
      }
    }
  }

  clearDraft() {
    localStorage.removeItem(this.DRAFT_KEY);
    this.form.reset({ locationId: 1, serviceId: 1, employeeId: 1 });
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    const payload = {
      customer_info: {
        first_name: this.form.value.firstName,
        last_name: this.form.value.lastName,
        phone: this.form.value.phone
      },
      serviceIds: [Number(this.form.value.serviceId)],
      date: this.form.value.date,
      time: this.form.value.time,
      locationId: Number(this.form.value.locationId),
      employeeId: Number(this.form.value.employeeId),
      notes: this.form.value.notes,
      payment_option: 'pay_in_store' // Receptionists book for in-store payment
    };

    const headers = { Authorization: `Bearer ${this.authState.token()}` };

    this.http.post<any>(`${environment.apiUrl}/bookings/admin`, payload, { headers })
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.success = true;
            this.clearDraft();
            setTimeout(() => this.close.emit(), 2000);
          } else {
            this.error = res.message || 'Failed to create booking';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Server error creating booking';
        }
      });
  }
}
