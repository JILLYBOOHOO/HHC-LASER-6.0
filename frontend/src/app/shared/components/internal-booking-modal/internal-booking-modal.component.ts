import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
    <div class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-[1200px] mx-auto my-8 flex flex-col text-neutral-800 animate-fadeIn relative">
        
        <!-- Header & Top Bar -->
        <div class="px-8 py-5 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
          <h2 class="text-xl font-bold text-neutral-900 tracking-tight">New Appointment</h2>
          <button type="button" (click)="close.emit()" class="text-neutral-500 hover:text-black transition-colors">
            <mat-icon class="!text-3xl !w-8 !h-8">close</mat-icon>
          </button>
        </div>

        <div class="flex-1 flex overflow-hidden">
          
          <!-- LEFT SIDE (75%) Form Area -->
          <div class="w-[70%] flex flex-col relative bg-white border-r border-neutral-200">
            
            <!-- Success/Error Messages -->
            <div *ngIf="error" class="m-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100">
              {{ error }}
            </div>
            <div *ngIf="success" class="m-6 p-4 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold border border-emerald-100 flex items-center gap-2">
              <mat-icon>check_circle</mat-icon>
              Booking created successfully!
            </div>

            <!-- Stepper -->
            <div class="px-10 pt-6 pb-4 flex items-center justify-between shrink-0">
              <!-- 1. Client -->
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-[#cc8a23] text-white flex items-center justify-center text-xs font-bold">1</div>
                <span class="text-sm font-bold text-neutral-900">Client</span>
              </div>
              <div class="flex-1 border-t-4 border-dotted border-[#cc8a23] mx-4 opacity-50"></div>
              <!-- 2. Service -->
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-[#cc8a23] text-white flex items-center justify-center text-xs font-bold">2</div>
                <span class="text-sm font-bold text-neutral-900">Service</span>
              </div>
              <div class="flex-1 border-t-4 border-dotted border-[#cc8a23] mx-4 opacity-50"></div>
              <!-- 3. Location -->
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-[#cc8a23] text-white flex items-center justify-center text-xs font-bold">3</div>
                <span class="text-sm font-bold text-neutral-900">Location</span>
              </div>
              <div class="flex-1 border-t-4 border-dotted border-neutral-300 mx-4"></div>
              <!-- 4. Date & Time -->
              <div class="flex items-center gap-2 opacity-60">
                <div class="w-6 h-6 rounded-full bg-neutral-500 text-white flex items-center justify-center text-xs font-bold">4</div>
                <span class="text-sm font-bold text-neutral-900">Date & Time</span>
              </div>
            </div>

            <form *ngIf="!success && !showResumePrompt" [formGroup]="form" class="flex flex-col px-10 pb-6">
              
              <!-- 1. Client Details -->
              <div class="mt-4 mb-5">
                <h3 class="text-lg font-black text-neutral-900 mb-4">1. Client Details</h3>
                <div class="grid grid-cols-2 gap-x-8 gap-y-4">
                  <!-- Name row -->
                  <div>
                    <label class="block text-xs font-bold text-neutral-600 mb-1">First Name</label>
                    <input type="text" formControlName="firstName" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm font-bold text-neutral-900 outline-none focus:border-[#cc8a23]">
                  </div>
                  <div class="flex gap-4 items-end">
                    <div class="flex-1">
                      <label class="block text-xs font-bold text-neutral-600 mb-1">Last Name</label>
                      <input type="text" formControlName="lastName" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm font-bold text-neutral-900 outline-none focus:border-[#cc8a23]">
                    </div>
                    <!-- Search inside grid row -->
                    <div class="flex-1 relative">
                      <label class="block text-xs text-neutral-600 mb-1">Search or add customer</label>
                      <div class="flex gap-2">
                        <div class="relative flex-1">
                          <input type="text" [(ngModel)]="customerSearchQuery" [ngModelOptions]="{standalone: true}" (input)="searchCustomer()"
                                 placeholder="Search or add customer"
                                 class="w-full pl-3 pr-3 py-2 border border-neutral-300 rounded-md text-sm outline-none focus:border-[#cc8a23]">
                          
                          <div *ngIf="searchedCustomers.length > 0" class="absolute z-20 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-neutral-100">
                            <div *ngFor="let c of searchedCustomers" (click)="selectCustomer(c)" 
                                 class="p-3 text-sm hover:bg-neutral-50 cursor-pointer flex flex-col text-left">
                              <span class="font-bold text-neutral-900">{{ c.first_name }} {{ c.last_name }}</span>
                              <span class="text-xs text-neutral-500">{{ c.phone }} · {{ c.email || 'No email' }}</span>
                            </div>
                          </div>
                        </div>
                        <button type="button" (click)="startNewCustomer()" class="px-4 py-2 bg-[#cc8a23] hover:bg-[#b57a1e] text-white text-sm font-bold rounded-md transition-colors">
                          New
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Contact row -->
                  <div>
                    <label class="block text-xs font-bold text-neutral-600 mb-1">Phone</label>
                    <input type="text" formControlName="phone" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm font-bold text-neutral-900 outline-none focus:border-[#cc8a23]">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-neutral-600 mb-1">Email</label>
                    <input type="email" formControlName="email" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm font-bold text-neutral-900 outline-none focus:border-[#cc8a23]">
                  </div>
                </div>
              </div>

              <!-- 2. Select Service -->
              <div class="mb-5">
                <h3 class="text-lg font-black text-neutral-900 mb-4">2. Select Service</h3>
                
                <div class="relative mb-4 max-w-sm">
                  <mat-icon class="absolute left-3 top-2 !text-xl text-neutral-400">search</mat-icon>
                  <input type="text" [(ngModel)]="serviceSearchQuery" [ngModelOptions]="{standalone: true}" (input)="filterServicesList()"
                         placeholder="Search services..."
                         class="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md text-sm outline-none focus:border-[#cc8a23]">
                </div>

                <div class="flex flex-wrap gap-2 mb-4">
                  <button type="button" *ngFor="let cat of categories" (click)="selectedCategory = cat; filterServicesList()"
                          [class.bg-[#cc8a23]]="selectedCategory === cat" [class.text-white]="selectedCategory === cat"
                          [class.border-transparent]="selectedCategory === cat"
                          [class.bg-white]="selectedCategory !== cat" [class.text-neutral-700]="selectedCategory !== cat"
                          class="px-4 py-1.5 border border-neutral-300 rounded-full text-xs font-bold transition-colors">
                    {{ cat }}
                  </button>
                </div>

                <div class="border border-neutral-200 rounded-lg overflow-hidden divide-y divide-neutral-100 max-h-[300px] overflow-y-auto custom-scrollbar">
                  <div *ngFor="let s of filteredServices" (click)="selectService(s)"
                       [class.bg-neutral-200]="form.value.serviceId === s.id"
                       class="px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-neutral-100 transition-colors">
                    <div class="text-sm font-bold text-neutral-900 w-1/2">{{ s.name }}</div>
                    <div class="text-sm font-bold text-neutral-600 w-1/4 text-center">{{ s.duration_minutes }}m</div>
                    <div class="font-bold text-neutral-900 w-1/4 text-right">JMD $ {{ s.price_jmd | number:'1.0-0' }}</div>
                  </div>
                </div>
              </div>

              <!-- 3. Choose Location -->
              <div class="mb-5">
                <h3 class="text-lg font-black text-neutral-900 mb-1">3. Choose Location</h3>
                <p class="text-sm text-neutral-600 mb-4">Select the location where this appointment will take place.</p>
                
                <div class="grid grid-cols-2 gap-4">
                  <!-- Location 1 -->
                  <div (click)="form.patchValue({locationId: 2})" [class.border-[#cc8a23]]="form.value.locationId === 2" class="border rounded-lg p-4 cursor-pointer flex gap-4 items-start transition-all">
                    <div class="mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0" [class.border-[#cc8a23]]="form.value.locationId === 2" [class.border-neutral-300]="form.value.locationId !== 2">
                      <div *ngIf="form.value.locationId === 2" class="w-2.5 h-2.5 bg-[#cc8a23] rounded-full"></div>
                    </div>
                    <div>
                      <div class="text-sm font-bold text-neutral-900">Constant Spring</div>
                      <div class="text-xs text-neutral-500 mt-1">48 Constant Spring Road<br>Kingston, Jamaica</div>
                    </div>
                  </div>
                  <!-- Location 2 -->
                  <div (click)="form.patchValue({locationId: 1})" [class.border-[#cc8a23]]="form.value.locationId === 1" class="border rounded-lg p-4 cursor-pointer flex gap-4 items-start transition-all">
                    <div class="mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0" [class.border-[#cc8a23]]="form.value.locationId === 1" [class.border-neutral-300]="form.value.locationId !== 1">
                      <div *ngIf="form.value.locationId === 1" class="w-2.5 h-2.5 bg-[#cc8a23] rounded-full"></div>
                    </div>
                    <div>
                      <div class="text-sm font-bold text-neutral-900">Mannings Hill</div>
                      <div class="text-xs text-neutral-500 mt-1">63 Mannings Hill Rd<br>Kingston, Jamaica</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 4. Date & Time -->
              <div class="mb-5">
                <h3 class="text-lg font-black text-neutral-900 mb-4">4. Date & Time</h3>
                
                <div class="flex gap-8">
                  <!-- Date Picker Placeholder -->
                  <div class="w-64 shrink-0">
                    <h4 class="text-sm font-bold text-neutral-900 mb-2">1. Select Date</h4>
                    <div class="bg-[#141716] text-white rounded-lg p-4 font-sans shadow-lg">
                      <input type="date" formControlName="date" class="w-full bg-transparent text-white border-b border-neutral-700 pb-2 outline-none mb-4 font-bold [color-scheme:dark]">
                      <div class="text-xs text-neutral-400 text-center mb-2">Use the input above to pick a date</div>
                      <div class="flex justify-center mt-4 border-t border-neutral-700 pt-3 text-xs gap-4">
                        <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-full bg-[#cc8a23]"></div> Selected</div>
                        <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-full border border-white"></div> Available</div>
                        <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-full bg-neutral-500"></div> Booked</div>
                      </div>
                    </div>
                  </div>

                  <!-- Time Picker & Payment -->
                  <div class="flex-1">
                    <h4 class="text-sm font-bold text-neutral-900 mb-2">2. Select Time</h4>
                    <div class="grid grid-cols-4 gap-3 mb-6">
                      <button type="button" *ngFor="let slot of timeSlots" (click)="selectTimeSlot(slot)"
                              [class.bg-[#cc8a23]]="form.value.time === convertTo24h(slot)" [class.text-white]="form.value.time === convertTo24h(slot)" [class.border-transparent]="form.value.time === convertTo24h(slot)"
                              [class.bg-white]="form.value.time !== convertTo24h(slot)" [class.border-neutral-300]="form.value.time !== convertTo24h(slot)" [class.text-neutral-900]="form.value.time !== convertTo24h(slot)"
                              class="py-2 border rounded-md text-sm font-bold transition-all text-center">
                        {{ slot }}
                      </button>
                    </div>

                    <h4 class="text-sm font-bold text-neutral-900 mb-2">Payment Method</h4>
                    <div class="border border-[#cc8a23] rounded-md p-4 flex items-center gap-3">
                      <div class="w-4 h-4 rounded-full border-[3px] border-[#cc8a23] flex items-center justify-center">
                        <div class="w-1.5 h-1.5 bg-[#cc8a23] rounded-full"></div>
                      </div>
                      <mat-icon class="text-neutral-700 !text-xl">storefront</mat-icon>
                      <span class="text-sm font-bold text-neutral-900">Pay in Person at Location</span>
                    </div>
                  </div>
                </div>
              </div>

            </form>

            <!-- Bottom Action Footer (Static) -->
            <div *ngIf="!success && !showResumePrompt" class="bg-white px-10 py-4 border-t border-neutral-200 flex items-center justify-between mt-auto">
              <div class="text-sm text-neutral-400 font-bold">
                Auto-Saved
              </div>
              <div class="flex gap-4">
                <button type="button" (click)="close.emit()" class="px-8 py-3 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-600 font-bold text-sm rounded-md transition-colors tracking-wide">
                  CANCEL
                </button>
                <button type="button" (click)="submit()" [disabled]="form.invalid || loading" class="px-10 py-3 bg-[#cc8a23] hover:bg-[#b57a1e] text-white font-bold text-sm rounded-md transition-colors tracking-wide disabled:opacity-50 flex items-center gap-2">
                  <mat-icon *ngIf="loading" class="animate-spin !text-sm">refresh</mat-icon>
                  BOOK NOW
                </button>
              </div>
            </div>

            <!-- Resume Draft Overlay -->
            <div *ngIf="showResumePrompt" class="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-8">
              <div class="text-center bg-white p-8 rounded-2xl shadow-2xl border border-neutral-200 max-w-md w-full">
                <div class="w-20 h-20 rounded-full bg-amber-50 mx-auto mb-6 flex items-center justify-center text-[#cc8a23]">
                  <mat-icon class="!text-4xl">bookmark_added</mat-icon>
                </div>
                <h3 class="text-2xl font-black text-neutral-900 mb-2">Unsaved Draft</h3>
                <p class="text-sm font-bold text-neutral-500 mb-8">
                  We found an unsaved draft from your last session. Would you like to resume it?
                </p>
                <div class="flex flex-col gap-3">
                  <button type="button" (click)="resumeDraft()" class="w-full py-4 bg-[#cc8a23] hover:bg-[#b57a1e] text-white font-black text-sm rounded-xl transition-all tracking-wider">
                    RESUME DRAFT
                  </button>
                  <button type="button" (click)="startNewBooking()" class="w-full py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm rounded-xl transition-all tracking-wider">
                    START NEW
                  </button>
                </div>
              </div>
            </div>

          </div>

          <!-- RIGHT SIDE (25%) Appointment Summary -->
          <div class="w-[30%] bg-[#0a0a0a] text-white p-10 flex flex-col justify-between">
            <div>
              <h3 class="text-[#cc8a23] text-sm font-bold tracking-wider mb-10">APPOINTMENT SUMMARY</h3>
              
              <div class="space-y-8">
                <!-- Treatment -->
                <div>
                  <div class="text-[10px] text-neutral-400 font-bold tracking-widest uppercase mb-2">Treatment</div>
                  <div class="text-lg font-bold mb-2 uppercase">{{ selectedServiceObj?.name || 'Select a service' }}</div>
                  <div class="flex items-center gap-4 text-sm font-bold mb-4">
                    <div class="flex items-center gap-1.5">
                      <mat-icon class="!text-base !w-4 !h-4 text-neutral-400">schedule</mat-icon>
                      {{ selectedServiceObj?.duration_minutes || 0 }} min
                    </div>
                    <div class="text-xs text-neutral-400 mt-0.5 ml-auto">JMD $ {{ selectedServiceObj?.price_jmd || 0 | number:'1.0-0' }}</div>
                  </div>
                  <p class="text-xs text-neutral-400 leading-relaxed pb-6 border-b border-neutral-800">
                    {{ selectedServiceObj?.description || 'Improves Blood Circulation, Reduces Cellulites While Promoting Lymphatic Drainage to Flush Toxins.' }}
                  </p>
                </div>

                <!-- Location -->
                <div class="pb-6 border-b border-neutral-800">
                  <div class="text-[10px] text-[#cc8a23] font-bold tracking-widest uppercase mb-2">Location</div>
                  <div class="text-sm font-bold mb-1">
                    {{ form.value.locationId === 2 ? 'Constant Spring' : 'Mannings Hill' }}
                  </div>
                  <div class="text-xs text-neutral-400 leading-relaxed">
                    {{ form.value.locationId === 2 ? '48 Constant Spring Road' : '63 Mannings Hill Rd' }}<br>Kingston, Jamaica
                  </div>
                </div>

                <!-- Guest Info -->
                <div>
                  <div class="text-[10px] text-[#cc8a23] font-bold tracking-widest uppercase mb-2">Guest Info</div>
                  <div class="text-sm font-bold mb-1">
                    {{ form.value.firstName || 'HHC' }} {{ form.value.lastName || 'Admin' }}
                  </div>
                  <div class="text-xs text-neutral-400">
                    {{ form.value.email || 'admin@hhclaser.com' }}
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-end justify-between border-t border-neutral-800 pt-6 mt-6">
              <span class="text-sm text-neutral-300 font-bold">Total Amount Due</span>
              <span class="text-xl font-bold text-[#cc8a23]">JMD $ {{ totalJmd | number:'1.0-0' }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-none::-webkit-scrollbar { display: none; }
    .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 6px; }
  `]
})
export class InternalBookingModalComponent implements OnInit {
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
  selectedCategory = 'Popular Services';
  serviceSearchQuery = '';
  services: any[] = [];
  filteredServices: any[] = [];

  // Time navigation slots
  timeSlots = ['09:30 AM', '10:00 AM', '10:11 AM', '10:30 AM', '11:00 AM'];

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
    this.loadServices();
    this.loadDraft();
    
    // Auto-save draft on form changes
    this.form.valueChanges.subscribe(val => {
      if (!this.showResumePrompt) {
        localStorage.setItem(this.DRAFT_KEY, JSON.stringify(val));
      }
    });
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
