import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { ApiService } from '../../../core/services/api.service';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { Service, Employee, Location, BookingType } from '../../../core/models/models';

type BookingStep = 'location' | 'type' | 'service_datetime' | 'details' | 'confirmation';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, RouterModule,
    MatStepperModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatCardModule, MatProgressSpinnerModule, MatSnackBarModule, MatRadioModule,
  ],
  template: `
    <div class="min-h-screen py-8 px-4" style="background: var(--color-cream)">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content (Left) -->
          <div class="lg:col-span-2">

        <!-- Header -->
        <div class="text-center mb-10">
          <span class="section-label">Online Booking</span>
          <div class="divider-gold"></div>
          <h2 class="mt-3">Book Your Treatment</h2>
          <p class="text-charcoal-500 mt-2">Complete each step to reserve your appointment.</p>
        </div>

        <!-- Progress Steps -->
        <div class="flex items-center justify-center gap-0 mb-10 overflow-x-auto">
          @for (step of steps; track step.key; let i = $index) {
            <div class="flex items-center">
              <div class="flex flex-col items-center gap-1 cursor-pointer"
                   (click)="currentStep() !== step.key && i < currentStepIndex() && goToStep(step.key)">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                     [class.bg-gold-500]="currentStepIndex() >= i"
                     [class.bg-charcoal-200]="currentStepIndex() < i"
                     [class.text-charcoal-800]="currentStepIndex() >= i"
                     [class.text-charcoal-400]="currentStepIndex() < i">
                  @if (currentStepIndex() > i) {
                    <mat-icon class="!text-sm">check</mat-icon>
                  } @else {
                    {{ i + 1 }}
                  }
                </div>
                <span class="text-xs whitespace-nowrap hidden sm:block"
                      [class.text-gold-600]="currentStep() === step.key"
                      [class.text-charcoal-400]="currentStep() !== step.key">
                  {{ step.label }}
                </span>
              </div>
              @if (!$last) {
                <div class="w-8 sm:w-16 h-px mx-1 transition-colors"
                     [class.bg-gold-400]="currentStepIndex() > i"
                     [class.bg-charcoal-200]="currentStepIndex() <= i">
                </div>
              }
            </div>
          }
        </div>

        <!-- Step Content -->
        <div class="card p-8">

          <!-- Step 1: Location -->
          @if (currentStep() === 'location') {
            <h3 class="mb-6">Choose Location</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Hardcoded locations for demo -->
              <div class="border-2 rounded-xl p-5 cursor-pointer transition-all hover:border-gold-400"
                   [class.border-gold-500]="selectedLocationId() === 1"
                   [class.border-charcoal-200]="selectedLocationId() !== 1"
                   [class.bg-gold-50]="selectedLocationId() === 1"
                   (click)="selectedLocationId.set(1)">
                <mat-icon class="!text-2xl mb-2 text-gold-500">location_on</mat-icon>
                <div class="font-semibold text-sm mb-1">Kingston Flagship</div>
                <div class="text-xs text-charcoal-400">123 Luxury Avenue, Kingston 5</div>
              </div>
              <div class="border-2 rounded-xl p-5 cursor-pointer transition-all hover:border-gold-400"
                   [class.border-gold-500]="selectedLocationId() === 2"
                   [class.border-charcoal-200]="selectedLocationId() !== 2"
                   [class.bg-gold-50]="selectedLocationId() === 2"
                   (click)="selectedLocationId.set(2)">
                <mat-icon class="!text-2xl mb-2 text-gold-500">location_on</mat-icon>
                <div class="font-semibold text-sm mb-1">Montego Bay</div>
                <div class="text-xs text-charcoal-400">45 Resort Blvd, Montego Bay</div>
              </div>
            </div>
            <div class="flex justify-end mt-8">
              <button class="btn-primary" [disabled]="!selectedLocationId()" (click)="nextStep()">
                Continue <mat-icon class="!text-base ml-1">arrow_forward</mat-icon>
              </button>
            </div>
          }



          <!-- Step 3: Service, Date, Time, Specialist -->
          @if (currentStep() === 'service_datetime') {
            <h3 class="mb-4">Select Details</h3>
            
            <div class="space-y-6">
              <!-- Service Selection -->
              <div>
                <label class="text-sm font-semibold text-charcoal-600 mb-2 block">1. Select Service</label>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Service</mat-label>
                  <mat-select [value]="selectedServiceId()" (selectionChange)="selectedServiceId.set($event.value)">
                    @for (cat of categorizedServices(); track cat.name) {
                      <mat-optgroup [label]="cat.name">
                        @for (service of cat.services; track service.id) {
                          <mat-option [value]="service.id">
                            {{ service.name }} - JMD {{ service.price_jmd | number }} ({{ service.duration_minutes }} min)
                          </mat-option>
                        }
                      </mat-optgroup>
                    }
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Specialist Selection -->
              <div>
                <label class="text-sm font-semibold text-charcoal-600 mb-2 block">2. Select Specialist (Optional)</label>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Specialist</mat-label>
                  <mat-select [value]="selectedEmployeeId()" (selectionChange)="selectedEmployeeId.set($event.value)">
                    <mat-option [value]="null">No Preference</mat-option>
                    @for (emp of employees(); track emp.id) {
                      <mat-option [value]="emp.id">{{ emp.full_name }} ({{ emp.title || 'Specialist' }})</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Date Selection -->
              <div>
                <label class="text-sm font-semibold text-charcoal-600 mb-2 block">3. Select Date</label>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Date</mat-label>
                  <input matInput type="date" [(ngModel)]="selectedDate" [min]="minDate" (change)="onDateChange()">
                </mat-form-field>
              </div>

              <!-- Time Selection -->
              @if (selectedDate && (isLoadingSlots() || availableSlots().length > 0 || !isLoadingSlots())) {
                <div>
                  <label class="text-sm font-semibold text-charcoal-600 mb-2 block">4. Select Time</label>
                  @if (isLoadingSlots()) {
                    <div class="flex justify-center py-4"><mat-spinner diameter="24"></mat-spinner></div>
                  } @else if (availableSlots().length > 0) {
                    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      @for (slot of availableSlots(); track slot) {
                        <button class="py-2 px-3 rounded-lg text-sm font-medium border transition-all"
                                [class.bg-gold-500]="selectedTime === slot"
                                [class.text-charcoal-800]="selectedTime === slot"
                                [class.border-gold-500]="selectedTime === slot"
                                [class.border-charcoal-200]="selectedTime !== slot"
                                [class.hover:border-gold-400]="selectedTime !== slot"
                                (click)="selectedTime = slot">
                          {{ slot }}
                        </button>
                      }
                    </div>
                  } @else {
                    <p class="text-sm text-charcoal-400">No available slots for this date.</p>
                  }
                </div>
              }
            </div>

            <div class="flex justify-between mt-8">
              <button class="btn-secondary" (click)="prevStep()">Back</button>
              <button class="btn-primary" [disabled]="!selectedServiceId() || !selectedDate || !selectedTime" (click)="nextStep()">
                Continue <mat-icon class="!text-base ml-1">arrow_forward</mat-icon>
              </button>
            </div>
          }

          <!-- Step 4: Customer Details -->
          @if (currentStep() === 'details') {
            <h3 class="mb-6">Customer Details</h3>
            <form [formGroup]="detailsForm" class="space-y-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email">
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Phone Number</mat-label>
                <input matInput type="tel" formControlName="phone">
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Special requests or appointment notes</mat-label>
                <textarea matInput rows="3" formControlName="notes"></textarea>
              </mat-form-field>
            </form>

            <div class="flex justify-between mt-8">
              <button class="btn-secondary" (click)="prevStep()">Back</button>
              <button class="btn-primary" [disabled]="detailsForm.invalid || isBooking()" (click)="confirmBooking()">
                @if (isBooking()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Confirm Booking <mat-icon class="!text-base ml-1">check_circle</mat-icon>
                }
              </button>
            </div>
          }

          <!-- Step 5: Confirmation -->
          @if (currentStep() === 'confirmation') {
            <div class="text-center py-8">
              <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <mat-icon class="!text-4xl text-green-600">check_circle</mat-icon>
              </div>
              <h2 class="text-3xl font-heading text-charcoal-800 mb-2">Booking Confirmed!</h2>
              <p class="text-charcoal-500 mb-8">Thank you for booking with HHC LASER. We have sent a confirmation to your email.</p>
              
              <div class="bg-cream-100 p-6 rounded-xl text-left max-w-sm mx-auto mb-8">
                <p class="text-sm text-charcoal-600 mb-1"><strong>Date:</strong> {{ selectedDate | date:'fullDate' }}</p>
                <p class="text-sm text-charcoal-600 mb-1"><strong>Time:</strong> {{ selectedTime }}</p>
                <p class="text-sm text-charcoal-600 mb-1"><strong>Location:</strong> {{ selectedLocationId() === 1 ? 'Kingston Flagship' : 'Montego Bay' }}</p>
              </div>

              <a routerLink="/customer/dashboard" class="btn-primary">Return to Dashboard</a>
            </div>
          }
        </div>

          <!-- Booking Summary Sidebar (Right) -->
          <div class="lg:col-span-1">
            <div class="card p-6 sticky top-8">
              <h3 class="text-xl font-heading mb-4 border-b border-charcoal-200 pb-2">Booking Summary</h3>
              
              @if (selectedService()) {
                <div class="mb-4">
                  <div class="text-xs text-charcoal-400 uppercase tracking-wider mb-1">Service</div>
                  <div class="font-semibold text-charcoal-800">{{ selectedService()?.name }}</div>
                  <div class="text-sm text-charcoal-600 mt-1">JMD $ {{ selectedService()?.price_jmd | number }}</div>
                  <div class="text-sm text-charcoal-600">{{ selectedService()?.duration_minutes }} mins</div>
                </div>
              } @else {
                <div class="text-sm text-charcoal-400 mb-4 italic">No service selected.</div>
              }

              @if (selectedLocationId()) {
                <div class="mb-4">
                  <div class="text-xs text-charcoal-400 uppercase tracking-wider mb-1">Location</div>
                  <div class="font-medium text-charcoal-800">{{ selectedLocationId() === 1 ? 'Kingston Flagship' : 'Montego Bay' }}</div>
                </div>
              }

              @if (selectedDate && selectedTime) {
                <div class="mb-4">
                  <div class="text-xs text-charcoal-400 uppercase tracking-wider mb-1">Date & Time</div>
                  <div class="font-medium text-charcoal-800">{{ selectedDate | date:'mediumDate' }}</div>
                  <div class="font-medium text-charcoal-800">{{ selectedTime }}</div>
                </div>
              }

              @if (selectedService()) {
                <div class="mt-6 pt-4 border-t border-charcoal-200">
                  <div class="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span>JMD $ {{ selectedService()?.price_jmd | number }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BookingComponent implements OnInit {
  currentStep       = signal<BookingStep>('location');
  selectedLocationId = signal<number | null>(null);
  selectedBookingType = signal<BookingType>('self');
  groupSize         = 1;
  selectedServiceId = signal<number | null>(null);
  selectedEmployeeId = signal<number | null>(null);
  
  availableSlots    = signal<string[]>([]);
  employees         = signal<Employee[]>([]);
  allServices       = signal<Service[]>([]);
  isLoadingServices = signal(false);
  isLoadingEmployees = signal(false);
  isLoadingSlots    = signal(false);
  isBooking         = signal(false);

  selectedDate = '';
  selectedTime = '';
  minDate = new Date().toISOString().split('T')[0];

  detailsForm: FormGroup;

  steps = [
    { key: 'location' as BookingStep,        label: 'Location' },
    { key: 'service_datetime' as BookingStep,label: 'Calendar' },
    { key: 'details' as BookingStep,         label: 'Details' },
    { key: 'confirmation' as BookingStep,    label: 'Done' },
  ];

  selectedService = computed(() => this.allServices().find(s => s.id === this.selectedServiceId()));
  
  currentStepIndex = computed(() => this.steps.findIndex(s => s.key === this.currentStep()));

  bookingTypes = [
    { value: 'self' as BookingType,  icon: 'person',       label: 'For Myself',      description: 'Book for your own treatment session' },
    { value: 'other' as BookingType, icon: 'person_add',   label: 'For Someone Else', description: 'Book on behalf of another person' },
    { value: 'group' as BookingType, icon: 'group',        label: 'Group Booking',   description: 'Book for multiple people at once' },
  ];

  categorizedServices = computed(() => {
    const cats = new Map<string, { name: string; services: Service[] }>();
    for (const s of this.allServices()) {
      if (!cats.has(s.category_name)) cats.set(s.category_name, { name: s.category_name, services: [] });
      cats.get(s.category_name)!.services.push(s);
    }
    return Array.from(cats.values());
  });

  constructor(
    private api: ApiService,
    private router: Router,
    private snackBar: MatSnackBar,
    public authState: AuthStateService,
    private fb: FormBuilder
  ) {
    this.detailsForm = this.fb.group({
      name: [this.authState.userFullName() || '', Validators.required],
      email: [this.authState.user()?.email || '', [Validators.required, Validators.email]],
      phone: [this.authState.user()?.phone || '', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadEmployees();
  }

  private loadServices(): void {
    this.isLoadingServices.set(true);
    this.api.getServices().subscribe({
      next: res => {
        if (res.data) this.allServices.set(res.data);
        this.isLoadingServices.set(false);
      },
      error: () => this.isLoadingServices.set(false),
    });
  }

  private loadEmployees(): void {
    this.isLoadingEmployees.set(true);
    this.api.getEmployees().subscribe({
      next: res => {
        if (res.data) this.employees.set(res.data);
        this.isLoadingEmployees.set(false);
      },
      error: () => this.isLoadingEmployees.set(false),
    });
  }

  goToStep(step: BookingStep): void {
    if (this.currentStep() !== 'confirmation') {
      this.currentStep.set(step);
    }
  }

  nextStep(): void {
    const order: BookingStep[] = ['location', 'service_datetime', 'details', 'confirmation'];
    const idx = order.indexOf(this.currentStep());
    if (idx < order.length - 1) this.currentStep.set(order[idx + 1]);
  }

  prevStep(): void {
    const order: BookingStep[] = ['location', 'service_datetime', 'details', 'confirmation'];
    const idx = order.indexOf(this.currentStep());
    if (idx > 0) this.currentStep.set(order[idx - 1]);
  }

  onDateChange(): void {
    if (!this.selectedDate || !this.selectedServiceId()) return;
    this.isLoadingSlots.set(true);
    this.selectedTime = '';

    const svc = this.allServices().find(s => s.id === this.selectedServiceId());
    const duration = svc ? svc.duration_minutes : 30;
    
    // For demo, if employee not selected, use first one or ID 1
    const empId = this.selectedEmployeeId() || (this.employees().length > 0 ? this.employees()[0].id : 1);

    this.api.getAvailableSlots(
      empId,
      this.selectedLocationId() || 1,
      this.selectedDate,
      duration
    ).subscribe({
      next: res => {
        // Mock some slots if API returns empty for demo purposes
        this.availableSlots.set(res.data?.length ? res.data : ['09:00', '10:30', '13:00', '14:30', '16:00']);
        this.isLoadingSlots.set(false);
      },
      error: () => {
        this.availableSlots.set(['09:00', '10:30', '13:00', '14:30', '16:00']);
        this.isLoadingSlots.set(false);
      }
    });
  }

  confirmBooking(): void {
    this.isBooking.set(true);
    const empId = this.selectedEmployeeId() || (this.employees().length > 0 ? this.employees()[0].id : 1);
    
    const dto = {
      booking_type: this.selectedBookingType(),
      employee_id: empId,
      location_id: this.selectedLocationId() || 1,
      scheduled_date: this.selectedDate,
      start_time: this.selectedTime,
      service_ids: [this.selectedServiceId()!],
      notes: this.detailsForm.value.notes
    };

    // Call the real API to create the booking and initialize payment
    this.api.createBooking(dto).subscribe({
      next: (res) => {
        this.isBooking.set(false);
        // Assuming the backend returns the Fiserv payment redirectUrl
        if (res.data?.payment?.redirectUrl) {
          this.snackBar.open('Redirecting to payment gateway...', 'Close', { duration: 3000 });
          // In a real app we'd submit the form fields to Fiserv via POST or redirect.
          // For now, redirecting to the URL or moving to confirmation for demo purposes
          // window.location.href = res.data.payment.redirectUrl;
          
          // As a fallback for demo, just go to confirmation step
          this.nextStep(); 
        } else {
          this.nextStep();
        }
      },
      error: (err) => {
        this.isBooking.set(false);
        this.snackBar.open(err.error?.message || 'Failed to create booking', 'Close', { duration: 5000 });
      }
    });
  }
}
