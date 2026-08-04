import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthStateService } from '../../../core/store/auth-state.service';

@Component({
  selector: 'app-internal-booking-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm p-4 overflow-y-auto flex items-start justify-center">
      <div class="rounded-2xl shadow-2xl w-full max-w-[1200px] flex flex-col text-neutral-800 animate-fadeIn relative bg-white overflow-hidden my-auto mt-8 mb-8">
        
        <!-- Header -->
        <div class="px-8 py-5 flex items-center justify-between shrink-0 bg-white border-b border-neutral-100">
          <h2 class="text-xl font-bold text-neutral-900 tracking-tight">New Appointment</h2>
          <button type="button" (click)="close.emit()" class="text-neutral-500 hover:text-black transition-colors">
            <mat-icon class="!text-3xl !w-8 !h-8">close</mat-icon>
          </button>
        </div>

        <div class="bg-dot-pattern relative flex flex-col w-full h-full">
          <!-- Progress Stepper -->
          <div class="px-10 py-5 flex items-center justify-start gap-4 shrink-0 max-w-[800px]">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-[#d8972e] text-white flex items-center justify-center text-xs font-bold">1</div>
              <span class="text-sm font-bold text-neutral-900">Client</span>
            </div>
            <div class="w-16 border-t-[3px] border-dotted border-[#d8972e]"></div>
            
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-[#d8972e] text-white flex items-center justify-center text-xs font-bold">2</div>
              <span class="text-sm font-bold text-neutral-900">Service</span>
            </div>
            <div class="w-16 border-t-[3px] border-dotted border-[#d8972e]"></div>
            
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-[#d8972e] text-white flex items-center justify-center text-xs font-bold">3</div>
              <span class="text-sm font-bold text-neutral-900">Location</span>
            </div>
            <div class="w-16 border-t-[3px] border-dotted border-neutral-400"></div>
            
            <div class="flex items-center gap-2 opacity-60">
              <div class="w-6 h-6 rounded-full bg-neutral-500 text-white flex items-center justify-center text-xs font-bold">4</div>
              <span class="text-sm font-bold text-neutral-900">Date & Time</span>
            </div>
          </div>

          <div class="flex-1 flex overflow-hidden px-8 pb-8 gap-8 items-stretch">
            
            <!-- LEFT SIDE Form Area -->
            <div *ngIf="showResumePrompt" class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <mat-icon class="!text-6xl text-[#d8972e] mb-4">restore_page</mat-icon>
              <h3 class="text-xl font-bold text-neutral-900 mb-2">Resume Booking?</h3>
              <p class="text-sm text-neutral-500 mb-8 max-w-md">We found an unsaved booking draft. Would you like to resume where you left off or start a new booking?</p>
              <div class="flex gap-4">
                <button type="button" (click)="resumeDraft()" class="px-8 py-3 bg-[#d8972e] hover:bg-[#cc8a23] text-white font-bold rounded-lg transition-colors">
                  Resume Draft
                </button>
                <button type="button" (click)="startNewBooking()" class="px-8 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg transition-colors">
                  Start New
                </button>
              </div>
            </div>

            <form *ngIf="!success && !showResumePrompt" [formGroup]="form" class="flex-1 flex flex-col justify-between">
              
              <div class="grid grid-cols-2 gap-8 flex-1">
                
                <!-- Left Column of Grid -->
                <div class="flex flex-col gap-8 h-full">
                  <!-- 1. Client Details -->
                  <div class="bg-white p-6 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                    <h3 class="text-base font-bold text-neutral-900 mb-4">1. Client Details</h3>
                    
                    <div class="relative mb-4 flex gap-2">
                      <div class="relative flex-1">
                        <mat-icon class="absolute left-3 top-2.5 !text-[20px] text-neutral-400">search</mat-icon>
                        <input type="text" [(ngModel)]="customerSearchQuery" [ngModelOptions]="{standalone: true}" (input)="searchCustomer()"
                               placeholder="Search or add customer"
                               class="w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-lg text-sm outline-none focus:border-[#d8972e]">
                        
                        <!-- search results dropdown -->
                        <div *ngIf="searchedCustomers.length > 0" class="absolute z-20 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-neutral-100">
                          <div *ngFor="let c of searchedCustomers" (click)="selectCustomer(c)" 
                               class="p-3 text-sm hover:bg-neutral-50 cursor-pointer flex flex-col text-left">
                            <span class="font-bold text-neutral-900">{{ c.first_name }} {{ c.last_name }}</span>
                            <span class="text-xs text-neutral-500">{{ c.phone }} · {{ c.email || 'No email' }}</span>
                          </div>
                        </div>
                      </div>
                      <button type="button" (click)="startNewCustomer()" class="px-6 py-2.5 bg-[#d8972e] hover:bg-[#cc8a23] text-white text-sm font-bold rounded-lg transition-colors">
                        New
                      </button>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs font-bold text-neutral-500 mb-1">First Name</label>
                        <input type="text" formControlName="firstName" class="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-900 outline-none focus:border-[#d8972e]">
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-neutral-500 mb-1">Last Name</label>
                        <input type="text" formControlName="lastName" class="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-900 outline-none focus:border-[#d8972e]">
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-neutral-500 mb-1">Phone</label>
                        <input type="text" formControlName="phone" class="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-900 outline-none focus:border-[#d8972e]">
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-neutral-500 mb-1">Email</label>
                        <input type="email" formControlName="email" class="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-900 outline-none focus:border-[#d8972e]">
                      </div>
                    </div>
                  </div>

                  <!-- 3. Choose Location -->
                  <div class="bg-white p-6 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex-1">
                    <h3 class="text-base font-bold text-neutral-900 mb-4">3. Choose Location</h3>
                    <div class="grid grid-cols-2 gap-4">
                      <!-- Location 1 -->
                      <div (click)="form.patchValue({locationId: 2})" [class.border-[#d8972e]]="form.value.locationId === 2" [class.shadow-sm]="form.value.locationId === 2" class="border border-neutral-200 rounded-xl p-4 cursor-pointer flex gap-3 items-start transition-all bg-white">
                        <div class="mt-0.5 w-5 h-5 rounded-full border-[3px] flex items-center justify-center shrink-0 transition-colors" [class.border-[#d8972e]]="form.value.locationId === 2" [class.border-neutral-200]="form.value.locationId !== 2">
                          <div *ngIf="form.value.locationId === 2" class="w-2.5 h-2.5 bg-[#d8972e] rounded-full"></div>
                        </div>
                        <div>
                          <div class="text-sm font-bold text-neutral-900">Constant Spring</div>
                          <div class="text-xs text-neutral-500 mt-1 leading-relaxed">48 Constant Spring Road<br>Kingston, Jamaica</div>
                        </div>
                      </div>
                      <!-- Location 2 -->
                      <div (click)="form.patchValue({locationId: 1})" [class.border-[#d8972e]]="form.value.locationId === 1" [class.shadow-sm]="form.value.locationId === 1" class="border border-neutral-200 rounded-xl p-4 cursor-pointer flex gap-3 items-start transition-all bg-white">
                        <div class="mt-0.5 w-5 h-5 rounded-full border-[3px] flex items-center justify-center shrink-0 transition-colors" [class.border-[#d8972e]]="form.value.locationId === 1" [class.border-neutral-200]="form.value.locationId !== 1">
                          <div *ngIf="form.value.locationId === 1" class="w-2.5 h-2.5 bg-[#d8972e] rounded-full"></div>
                        </div>
                        <div>
                          <div class="text-sm font-bold text-neutral-900">Mannings Hill</div>
                          <div class="text-xs text-neutral-500 mt-1 leading-relaxed">63 Mannings Hill Rd<br>Kingston, Jamaica</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right Column of Grid -->
                <div class="flex flex-col gap-8 h-full">
                  <!-- 2. Select Services -->
                  <div class="bg-white p-6 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                    <h3 class="text-base font-bold text-neutral-900 mb-4">2. Select Services</h3>
                    
                    <div class="relative mb-4">
                      <mat-icon class="absolute left-3 top-2.5 !text-[20px] text-neutral-400">search</mat-icon>
                      <input type="text" [(ngModel)]="serviceSearchQuery" [ngModelOptions]="{standalone: true}" (input)="filterServicesList()"
                             placeholder="Search services..."
                             class="w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-lg text-sm outline-none focus:border-[#d8972e]">
                    </div>

                    <div class="rounded-lg flex flex-col gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                      <div *ngFor="let s of filteredServices" (click)="selectService(s)"
                           [class.bg-[#fbf7f0]]="form.value.serviceId === s.id"
                           [class.border-[#d8972e]]="form.value.serviceId === s.id"
                           [class.bg-white]="form.value.serviceId !== s.id"
                           [class.border-neutral-100]="form.value.serviceId !== s.id"
                           class="px-4 py-3 border rounded-xl flex items-center justify-between cursor-pointer hover:border-[#d8972e] transition-all">
                        
                        <div class="flex items-center gap-3 w-1/2">
                          <div class="w-6 h-6 rounded-full text-white flex items-center justify-center shrink-0 shadow-sm" [class.bg-[#d8972e]]="form.value.serviceId === s.id" [class.bg-neutral-300]="form.value.serviceId !== s.id">
                            <mat-icon class="!text-[14px] !w-[14px] !h-[14px]">star</mat-icon>
                          </div>
                          <div class="text-sm font-bold text-neutral-900 truncate">{{ s.name }}</div>
                        </div>
                        
                        <div class="text-xs font-bold text-neutral-500 w-16 text-center">{{ s.duration_minutes }}m</div>
                        <div class="text-sm font-bold text-neutral-900 w-24 text-right">JMD $ {{ s.price_jmd | number:'1.0-0' }}</div>
                        
                        <button type="button" class="w-7 h-7 rounded border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors ml-2 shrink-0">
                          <mat-icon class="!text-[18px] !w-[18px] !h-[18px] text-neutral-600">add</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- 4. Date & Time -->
                  <div class="bg-white p-6 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex-1 flex flex-col">
                    <h3 class="text-base font-bold text-neutral-900 mb-4">4. Date & Time</h3>
                    
                    <div class="flex flex-col gap-6 flex-1">
                      <!-- Calendar -->
                      <div class="bg-[#0a0a0a] text-white rounded-xl p-5 shadow-lg flex flex-col">
                        <div class="flex items-center justify-between mb-4">
                          <button type="button" (click)="prevMonth()" class="text-neutral-400 hover:text-white transition-colors">
                            <mat-icon class="!text-[20px] !w-[20px] !h-[20px]">chevron_left</mat-icon>
                          </button>
                          <div class="text-sm font-bold tracking-wide">{{ currentMonthName }}</div>
                          <button type="button" (click)="nextMonth()" class="text-neutral-400 hover:text-white transition-colors">
                            <mat-icon class="!text-[20px] !w-[20px] !h-[20px]">chevron_right</mat-icon>
                          </button>
                        </div>
                        
                        <div class="grid grid-cols-7 gap-1 mb-2">
                          <div *ngFor="let day of weekDays" class="text-[10px] font-bold text-neutral-400 text-center">{{ day }}</div>
                        </div>
                        
                        <div class="grid grid-cols-7 gap-y-2 gap-x-1 content-start">
                          <button type="button" *ngFor="let day of calendarDays" 
                                  (click)="selectDate(day.fullDate)"
                                  [class.opacity-30]="!day.isCurrentMonth"
                                  [class.bg-[#d8972e]]="form.value.date === day.fullDate"
                                  [class.text-white]="form.value.date === day.fullDate"
                                  [class.text-neutral-300]="form.value.date !== day.fullDate"
                                  class="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold hover:bg-neutral-800 transition-colors mx-auto">
                            {{ day.date }}
                          </button>
                        </div>
                      </div>

                      <!-- Time Select -->
                      <div class="flex-1 mt-2">
                        <div class="text-sm font-bold text-neutral-900 mb-3">Select Time</div>
                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                          <button type="button" *ngFor="let slot of timeSlots" (click)="selectTimeSlot(slot)"
                                  [class.bg-[#d8972e]]="form.value.time === convertTo24h(slot)" 
                                  [class.text-white]="form.value.time === convertTo24h(slot)" 
                                  [class.border-transparent]="form.value.time === convertTo24h(slot)"
                                  [class.shadow-sm]="form.value.time === convertTo24h(slot)"
                                  [class.bg-white]="form.value.time !== convertTo24h(slot)" 
                                  [class.border-neutral-200]="form.value.time !== convertTo24h(slot)" 
                                  [class.text-neutral-700]="form.value.time !== convertTo24h(slot)"
                                  class="py-2 px-1 border rounded-lg text-xs font-bold transition-all text-center">
                            {{ slot }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </form>

            <!-- RIGHT SIDE Appointment Summary -->
            <div class="w-[320px] shrink-0 bg-[#fbf7f0] p-7 flex flex-col justify-between rounded-2xl relative shadow-md z-10">
              
              <div *ngIf="success" class="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl text-center p-6">
                <mat-icon class="!text-6xl text-emerald-500 mb-4">check_circle</mat-icon>
                <h3 class="text-xl font-black text-neutral-900 mb-2">Booking Confirmed!</h3>
                <p class="text-sm text-neutral-500">Your appointment has been successfully scheduled.</p>
              </div>

              <div *ngIf="error" class="absolute top-4 left-4 right-4 bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold border border-red-100 shadow-sm z-20">
                {{ error }}
              </div>

              <div>
                <h3 class="text-[#d8972e] text-xs font-black tracking-widest mb-8">APPOINTMENT SUMMARY</h3>
                
                <div class="space-y-6">
                  <!-- Treatment -->
                  <div>
                    <div class="text-[10px] text-neutral-500 font-bold tracking-widest uppercase mb-2">Treatment</div>
                    <div class="text-base font-black text-neutral-900 mb-2 uppercase">{{ selectedServiceObj?.name || 'Select a service' }}</div>
                    <div class="flex items-center justify-between text-sm font-bold mb-3">
                      <div class="flex items-center gap-1.5 text-neutral-700">
                        <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">schedule</mat-icon>
                        {{ selectedServiceObj?.duration_minutes || 0 }} min
                      </div>
                      <div class="text-neutral-900">JMD $ {{ selectedServiceObj?.price_jmd || 0 | number:'1.0-0' }}</div>
                    </div>
                    <p class="text-xs text-neutral-700 leading-relaxed pb-6 border-b border-neutral-300">
                      {{ selectedServiceObj?.description || 'Improves Blood Circulation, Reduces Cellulites While Promoting Lymphatic Drainage to Flush Toxins.' }}
                    </p>
                  </div>

                  <!-- Location -->
                  <div class="pb-6 border-b border-neutral-300">
                    <div class="text-[10px] text-[#d8972e] font-bold tracking-widest uppercase mb-2">Location</div>
                    <div class="text-sm font-black text-neutral-900 mb-1">
                      {{ form.value.locationId === 2 ? 'Constant Spring' : 'Mannings Hill' }}
                    </div>
                    <div class="text-xs text-neutral-700 leading-relaxed">
                      {{ form.value.locationId === 2 ? '48 Constant Spring Road' : '63 Mannings Hill Rd' }}<br>Kingston, Jamaica
                    </div>
                  </div>

                </div>
              </div>

              <div class="mt-8 flex flex-col gap-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs text-neutral-500 font-bold tracking-widest">TOTAL AMOUNT DUE</span>
                  <span class="text-lg font-black text-[#d8972e]">JMD $ {{ totalJmd | number:'1.0-0' }}</span>
                </div>

                <button type="button" (click)="submit()" [disabled]="form.invalid || loading" 
                        class="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold text-sm rounded-lg transition-colors tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                  <mat-icon *ngIf="loading" class="animate-spin !text-sm !w-4 !h-4">refresh</mat-icon>
                  BOOK NOW
                </button>
                <button type="button" (click)="close.emit()" 
                        class="w-full py-3.5 bg-transparent border-2 border-[#f0c586] hover:bg-[#d8972e]/10 text-[#d8972e] font-bold text-sm rounded-lg transition-colors tracking-widest">
                  CANCEL
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-none::-webkit-scrollbar { display: none; }
    .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 4px; }
    
    .bg-dot-pattern {
      background-image: radial-gradient(#d4d4d4 1px, transparent 1px);
      background-size: 24px 24px;
      background-color: #fafafa;
    }
  `]
})
export class InternalBookingModalComponent implements OnInit {
  @Input() initialDate: string = '';
  @Input() initialTime: string = '';
  @Output() close = new EventEmitter<void>();
  
  form: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;
  showResumePrompt = false;
  tempDraftData: any = null;
  private readonly DRAFT_KEY = 'hhc_internal_booking_draft';

  // Customer search items
  customerSearchQuery = '';
  searchedCustomers: any[] = [];

  // Service listing items
  categories = ['All', 'Popular Services', 'Facial & Skin Treatments', 'Body & Wellness', 'Injectables & Aesthetics'];
  selectedCategory = 'All';
  serviceSearchQuery = '';
  services: any[] = [];
  filteredServices: any[] = [];

  // Time navigation slots
  timeSlots = ['09:00 AM', '10:11 AM', '10:30 AM', '1:00 PM', '2:30 PM', '4:00 PM'];
  
  // Calendar properties
  currentMonthDate = new Date();
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  calendarDays: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authState: AuthStateService
  ) {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      phone: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [''],
      locationId: [1, Validators.required],
      serviceId: [1, Validators.required],
      date: [today, Validators.required],
      time: ['10:11', Validators.required],
      employeeId: [1, Validators.required],
      notes: [''],
      paymentMethod: ['pay_in_store', Validators.required]
    });
  }

  ngOnInit() {
    if (this.initialDate) {
      this.form.patchValue({ date: this.initialDate });
    }
    if (this.initialTime) {
      this.form.patchValue({ time: this.initialTime });
    }
    
    this.generateCalendar();
    this.loadServices();
    this.loadDraft();
    
    // Auto-save draft on form changes
    this.form.valueChanges.subscribe(val => {
      if (!this.showResumePrompt) {
        localStorage.setItem(this.DRAFT_KEY, JSON.stringify(val));
      }
    });
  }

  generateCalendar() {
    this.calendarDays = [];
    const year = this.currentMonthDate.getFullYear();
    const month = this.currentMonthDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      this.calendarDays.push({
        date: daysInPrevMonth - i,
        fullDate: this.formatDate(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push({
        date: i,
        fullDate: this.formatDate(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Next month days to complete grid (42 days total for 6 rows)
    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      this.calendarDays.push({
        date: i,
        fullDate: this.formatDate(year, month + 1, i),
        isCurrentMonth: false
      });
    }
  }

  formatDate(year: number, month: number, day: number): string {
    const d = new Date(year, month, day);
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${m}-${dayStr}`;
  }

  prevMonth() {
    this.currentMonthDate = new Date(this.currentMonthDate.getFullYear(), this.currentMonthDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonthDate = new Date(this.currentMonthDate.getFullYear(), this.currentMonthDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectDate(fullDate: string) {
    this.form.patchValue({ date: fullDate });
  }

  get currentMonthName(): string {
    return this.currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  loadServices() {
    this.http.get<any>(`${environment.apiUrl}/services`).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          this.services = res.data;
        } else {
          this.useFallbackServices();
        }
        this.filterServicesList();
        this.selectDefaultService();
      },
      error: () => {
        this.useFallbackServices();
        this.filterServicesList();
        this.selectDefaultService();
      }
    });
  }

  useFallbackServices() {
    this.services = [
      { id: 1, name: 'Laser Hair Removal (30m)', price_jmd: 5000, duration_minutes: 30, category_name: 'Popular Services' },
      { id: 2, name: 'Laser Hair Removal (Full Legs) (45m)', price_jmd: 8500, duration_minutes: 45, category_name: 'Popular Services' },
      { id: 3, name: 'HydraFacial (60m)', price_jmd: 12000, duration_minutes: 60, category_name: 'Popular Services' },
      { id: 4, name: 'Microneedling (45m)', price_jmd: 10000, duration_minutes: 45, category_name: 'Popular Services' },
      { id: 5, name: 'Chemical Peel (30m)', price_jmd: 7500, duration_minutes: 30, category_name: 'Popular Services' }
    ];
  }

  filterServicesList() {
    let list = [...this.services];
    
    // Category filter
    if (this.selectedCategory !== 'All') {
      list = list.filter(s => s.category_name === this.selectedCategory);
    }
    
    // Search query filter
    const query = this.serviceSearchQuery.toLowerCase().trim();
    if (query) {
      list = list.filter(s => s.name.toLowerCase().includes(query) || (s.category_name && s.category_name.toLowerCase().includes(query)));
    }
    
    this.filteredServices = list;
  }

  selectService(s: any) {
    this.form.patchValue({ serviceId: s.id });
  }

  selectDefaultService() {
    if (this.services.length > 0) {
      const activeServiceId = this.form.value.serviceId;
      const found = this.services.find(s => s.id === activeServiceId);
      if (!found) {
        this.form.patchValue({ serviceId: this.services[0].id });
      }
    }
  }

  get selectedServiceObj(): any {
    const activeId = this.form.value.serviceId;
    return this.services.find(s => s.id === activeId) || null;
  }

  get totalJmd(): number {
    const s = this.selectedServiceObj;
    if (!s) return 0;
    return s.price_jmd * 1.15; // 15% GCT
  }

  selectTimeSlot(slot: string) {
    this.form.patchValue({ time: this.convertTo24h(slot) });
  }

  convertTo24h(timeStr: string): string {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours.padStart(2, '0')}:${minutes}`;
  }

  searchCustomer() {
    const query = this.customerSearchQuery.trim();
    if (query.length < 3) {
      this.searchedCustomers = [];
      return;
    }
    const headers = { Authorization: `Bearer ${this.authState.token()}` };
    this.http.get<any>(`${environment.apiUrl}/admin/customers?search=${query}`, { headers }).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.searchedCustomers = res.data;
        } else {
          this.searchedCustomers = [];
        }
      },
      error: () => {
        this.searchedCustomers = [];
      }
    });
  }

  selectCustomer(c: any) {
    this.form.patchValue({
      phone: c.phone || '',
      firstName: c.first_name || '',
      lastName: c.last_name || '',
      email: c.email || ''
    });
    this.searchedCustomers = [];
    this.customerSearchQuery = `${c.first_name} ${c.last_name}`;
  }

  startNewCustomer() {
    this.form.patchValue({
      phone: '',
      firstName: '',
      lastName: '',
      email: ''
    });
    this.customerSearchQuery = '';
    this.searchedCustomers = [];
  }

  loadDraft() {
    const saved = localStorage.getItem(this.DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Object.keys(parsed).length > 0) {
          const hasData = !!(parsed.phone || parsed.firstName || parsed.lastName || parsed.notes);
          if (hasData) {
            this.tempDraftData = parsed;
            this.showResumePrompt = true;
          }
        }
      } catch (e) {
        this.clearDraft();
      }
    }
  }

  resumeDraft() {
    if (this.tempDraftData) {
      this.form.patchValue(this.tempDraftData);
    }
    this.showResumePrompt = false;
  }

  startNewBooking() {
    this.clearDraft();
    this.showResumePrompt = false;
  }

  clearDraft() {
    localStorage.removeItem(this.DRAFT_KEY);
    const today = new Date().toISOString().split('T')[0];
    this.form.reset({
      locationId: 1,
      serviceId: this.services[0]?.id || 1,
      employeeId: 1,
      date: today,
      time: '10:11',
      paymentMethod: 'pay_in_store',
      phone: '',
      firstName: '',
      lastName: '',
      email: '',
      notes: ''
    });
    this.customerSearchQuery = '';
    this.searchedCustomers = [];
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    const payload = {
      customer_info: {
        first_name: this.form.value.firstName,
        last_name: this.form.value.lastName,
        phone: this.form.value.phone,
        email: this.form.value.email || null
      },
      serviceIds: [Number(this.form.value.serviceId)],
      date: this.form.value.date,
      time: this.form.value.time,
      locationId: Number(this.form.value.locationId),
      employeeId: Number(this.form.value.employeeId),
      notes: this.form.value.notes,
      payment_option: this.form.value.paymentMethod
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
        error: (err: any) => {
          this.loading = false;
          this.error = err.error?.message || 'Server error creating booking';
        }
      });
  }
}
