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
    <div class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center font-sans">
      
      <!-- SUCCESS TOAST -->
      <div *ngIf="success" class="absolute top-6 right-6 z-[110] bg-emerald-50 border border-emerald-200 shadow-2xl rounded-xl p-3 px-5 flex items-center gap-3 animate-fadeIn">
        <div class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
          <mat-icon class="!text-[16px] !w-[16px] !h-[16px] font-bold">check</mat-icon>
        </div>
        <span class="text-sm font-bold text-emerald-950">Appointment booked successfully.</span>
        <button (click)="success = false" class="ml-4 text-emerald-600 hover:text-emerald-950 transition-colors">
          <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">close</mat-icon>
        </button>
      </div>

      <div class="rounded-2xl shadow-2xl w-full max-w-[1400px] h-[94vh] flex flex-col text-neutral-800 relative bg-[#fafafa] overflow-hidden border border-neutral-200">
        
        <!-- COMPACT SINGLE-ROW HEADER -->
        <div class="px-6 py-3 bg-white border-b border-neutral-200 flex items-center justify-between shrink-0 z-20 shadow-sm gap-4">
          <!-- Left Title -->
          <h1 class="text-xl font-extrabold font-serif text-black tracking-tight shrink-0">New Appointment</h1>

          <!-- Center/Right Progress Tracker -->
          <div class="flex items-center gap-2.5 shrink-0">
            <!-- Step 1 -->
            <div class="flex items-center gap-1.5" [class.opacity-100]="expandedStep >= 1" [class.opacity-40]="expandedStep < 1">
               <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors" [class.bg-black]="expandedStep >= 1" [class.text-white]="expandedStep >= 1" [class.bg-white]="expandedStep < 1" [class.text-neutral-500]="expandedStep < 1" [class.border]="expandedStep < 1" [class.border-neutral-300]="expandedStep < 1">1</div>
               <span class="text-xs font-bold text-neutral-900">Client</span>
            </div>
            <div class="w-5 border-t-2 border-dotted" [class.border-black]="expandedStep >= 2" [class.border-neutral-300]="expandedStep < 2"></div>
            
            <!-- Step 2 -->
            <div class="flex items-center gap-1.5" [class.opacity-100]="expandedStep >= 2" [class.opacity-40]="expandedStep < 2">
               <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors" [class.bg-black]="expandedStep >= 2" [class.text-white]="expandedStep >= 2" [class.bg-white]="expandedStep < 2" [class.text-neutral-500]="expandedStep < 2" [class.border]="expandedStep < 2" [class.border-neutral-300]="expandedStep < 2">2</div>
               <span class="text-xs font-bold text-neutral-900">Services</span>
            </div>
            <div class="w-5 border-t-2 border-dotted" [class.border-black]="expandedStep >= 3" [class.border-neutral-300]="expandedStep < 3"></div>
            
            <!-- Step 3 -->
            <div class="flex items-center gap-1.5" [class.opacity-100]="expandedStep >= 3" [class.opacity-40]="expandedStep < 3">
               <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors" [class.bg-black]="expandedStep >= 3" [class.text-white]="expandedStep >= 3" [class.bg-white]="expandedStep < 3" [class.text-neutral-500]="expandedStep < 3" [class.border]="expandedStep < 3" [class.border-neutral-300]="expandedStep < 3">3</div>
               <span class="text-xs font-bold text-neutral-900">Location</span>
            </div>
            <div class="w-5 border-t-2 border-dotted" [class.border-black]="expandedStep >= 4" [class.border-neutral-300]="expandedStep < 4"></div>
            
            <!-- Step 4 -->
            <div class="flex items-center gap-1.5" [class.opacity-100]="expandedStep >= 4" [class.opacity-40]="expandedStep < 4">
               <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors" [class.bg-black]="expandedStep >= 4" [class.text-white]="expandedStep >= 4" [class.bg-white]="expandedStep < 4" [class.text-neutral-500]="expandedStep < 4" [class.border]="expandedStep < 4" [class.border-neutral-300]="expandedStep < 4">4</div>
               <span class="text-xs font-bold text-neutral-900">Date</span>
            </div>
            <div class="w-5 border-t-2 border-dotted" [class.border-black]="expandedStep >= 5" [class.border-neutral-300]="expandedStep < 5"></div>
            
            <!-- Step 5 -->
            <div class="flex items-center gap-1.5" [class.opacity-100]="expandedStep >= 5" [class.opacity-40]="expandedStep < 5">
               <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors" [class.bg-black]="expandedStep >= 5" [class.text-white]="expandedStep >= 5" [class.bg-white]="expandedStep < 5" [class.text-neutral-500]="expandedStep < 5" [class.border]="expandedStep < 5" [class.border-neutral-300]="expandedStep < 5">5</div>
               <span class="text-xs font-bold text-neutral-900">Time</span>
            </div>
            <div class="w-5 border-t-2 border-dotted" [class.border-black]="expandedStep >= 6" [class.border-neutral-300]="expandedStep < 6"></div>
            
            <!-- Step 6 -->
            <div class="flex items-center gap-1.5" [class.opacity-100]="expandedStep >= 6" [class.opacity-40]="expandedStep < 6">
               <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors" [class.bg-black]="expandedStep >= 6" [class.text-white]="expandedStep >= 6" [class.bg-white]="expandedStep < 6" [class.text-neutral-500]="expandedStep < 6" [class.border]="expandedStep < 6" [class.border-neutral-300]="expandedStep < 6">6</div>
               <span class="text-xs font-bold text-neutral-900">Summary</span>
            </div>
          </div>

          <!-- Right Action -->
          <button type="button" (click)="close.emit()" class="px-3.5 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg text-xs font-bold flex items-center gap-1.5 text-black shadow-sm transition-all hover:shadow shrink-0">
            <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">close</mat-icon>
            Cancel Booking
          </button>
        </div>

        <!-- MAIN BODY CONTENT -->
        <div class="flex-1 flex overflow-hidden p-5 gap-5 items-stretch bg-dot-pattern min-h-0">
          
          <form [formGroup]="form" class="flex-1 flex flex-col overflow-hidden min-h-0">
            
            <div class="flex flex-1 gap-5 items-stretch min-h-0 h-full">
              
              <!-- LEFT: ACCORDION LIST -->
              <div class="flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar pr-1.5 min-h-0 pb-4">
                
                <!-- 1. Client -->
                <div class="bg-white border border-neutral-200/80 rounded-[12px] shadow-sm overflow-hidden transition-all shrink-0">
                  <!-- Header -->
                  <div class="p-3 px-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50/80 transition-colors" (click)="expandedStep = 1">
                    <div class="flex items-center gap-3">
                       <div class="w-9 h-9 bg-black rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                         <mat-icon class="text-white !text-[18px] !w-[18px] !h-[18px]">person_outline</mat-icon>
                       </div>
                       <div class="flex items-center gap-4">
                         <div class="flex items-center gap-2.5 shrink-0">
                           <div class="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">1</div>
                           <span class="text-xs font-extrabold text-neutral-900">Client</span>
                         </div>
                         <!-- Summary Data -->
                         <div *ngIf="expandedStep !== 1 && form.value.firstName" class="text-xs text-neutral-600 flex items-center gap-3 divide-x divide-neutral-300 font-medium">
                           <span class="pr-3 font-bold text-neutral-900">{{ form.value.firstName }} {{ form.value.lastName }}</span>
                           <span class="px-3 text-neutral-500">{{ form.value.phone }}</span>
                           <span class="pl-3 text-neutral-500">{{ form.value.email }}</span>
                         </div>
                       </div>
                    </div>
                    <div class="flex items-center gap-3" *ngIf="expandedStep !== 1">
                      <button type="button" class="px-3 py-1 border border-neutral-300 bg-white rounded-md text-[11px] font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors shadow-sm">Edit</button>
                      <mat-icon class="text-neutral-400 !text-[20px] !w-[20px] !h-[20px]">expand_more</mat-icon>
                    </div>
                    <div class="flex items-center gap-3" *ngIf="expandedStep === 1">
                      <mat-icon class="text-neutral-400 !text-[20px] !w-[20px] !h-[20px]">expand_less</mat-icon>
                    </div>
                  </div>
                  <!-- Content -->
                  <div *ngIf="expandedStep === 1" class="px-10 pb-5 pt-2 border-t border-neutral-100 bg-[#FAF9F7]">
                      <div class="relative mb-3 flex gap-2">
                        <div class="relative flex-1">
                          <mat-icon class="absolute left-3 top-2.5 !text-[18px] text-neutral-400">search</mat-icon>
                          <input type="text" [(ngModel)]="customerSearchQuery" [ngModelOptions]="{standalone: true}" (input)="searchCustomer()" placeholder="Search client by name or phone..." class="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none focus:border-[#B36A17] bg-white shadow-sm font-medium">
                          <div *ngIf="searchedCustomers.length > 0" class="absolute z-30 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-neutral-100">
                            <div *ngFor="let c of searchedCustomers" (click)="selectCustomer(c)" class="p-2.5 text-xs hover:bg-amber-50/50 cursor-pointer flex flex-col text-left">
                              <span class="font-bold text-neutral-900">{{ c.first_name }} {{ c.last_name }}</span>
                              <span class="text-[11px] text-neutral-500">{{ c.phone }} · {{ c.email || 'No email' }}</span>
                            </div>
                          </div>
                        </div>
                        <button type="button" (click)="startNewCustomer()" class="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm uppercase tracking-wider">New</button>
                      </div>
                      
                      <div class="grid grid-cols-2 gap-x-4 gap-y-2.5">
                        <div>
                          <label class="block text-[10px] font-bold text-neutral-500 mb-1 uppercase tracking-wider">First Name</label>
                          <input type="text" formControlName="firstName" class="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 outline-none focus:border-[#B36A17] bg-white shadow-sm">
                        </div>
                        <div>
                          <label class="block text-[10px] font-bold text-neutral-500 mb-1 uppercase tracking-wider">Last Name</label>
                          <input type="text" formControlName="lastName" class="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 outline-none focus:border-[#B36A17] bg-white shadow-sm">
                        </div>
                        <div>
                          <label class="block text-[10px] font-bold text-neutral-500 mb-1 uppercase tracking-wider">Phone</label>
                          <input type="text" formControlName="phone" class="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 outline-none focus:border-[#B36A17] bg-white shadow-sm">
                        </div>
                        <div>
                          <label class="block text-[10px] font-bold text-neutral-500 mb-1 uppercase tracking-wider">Email</label>
                          <input type="email" formControlName="email" class="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 outline-none focus:border-[#B36A17] bg-white shadow-sm">
                        </div>
                      </div>
                      
                      <div class="mt-4 flex justify-end">
                        <button type="button" (click)="expandedStep = 2; $event.stopPropagation()" [disabled]="!form.get('firstName')?.valid || !form.get('lastName')?.valid || !form.get('phone')?.valid" class="px-5 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition-colors shadow-md tracking-wider uppercase">Continue</button>
                      </div>
                  </div>
                </div>

                <!-- 2. Services -->
                <div class="bg-white border border-neutral-200/80 rounded-[12px] shadow-sm overflow-hidden transition-all shrink-0">
                  <div class="p-3 px-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50/80 transition-colors" (click)="expandedStep = 2">
                    <div class="flex items-center gap-3">
                       <div class="w-9 h-9 bg-black rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                         <mat-icon class="text-white !text-[18px] !w-[18px] !h-[18px]">star_border</mat-icon>
                       </div>
                       <div class="flex items-center gap-4">
                         <div class="flex items-center gap-2.5 shrink-0">
                           <div class="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">2</div>
                           <span class="text-xs font-extrabold text-neutral-900">Services</span>
                         </div>
                         <div *ngIf="expandedStep !== 2 && selectedServiceObj" class="text-xs text-neutral-600 flex items-center gap-3 divide-x divide-neutral-300 font-medium">
                           <span class="pr-3 font-bold text-neutral-900">{{ selectedServiceObj?.name }}</span>
                           <span class="px-3 flex items-center gap-1"><mat-icon class="!text-[14px] !w-[14px] !h-[14px] text-neutral-400">schedule</mat-icon>{{ selectedServiceObj?.duration_minutes }} min</span>
                           <span class="pl-3 flex items-center gap-1"><mat-icon class="!text-[14px] !w-[14px] !h-[14px] text-neutral-400">sell</mat-icon>JMD $ {{ selectedServiceObj?.price_jmd | number:'1.0-0' }}</span>
                         </div>
                       </div>
                    </div>
                    <div class="flex items-center gap-3" *ngIf="expandedStep !== 2">
                      <button type="button" class="px-3 py-1 border border-neutral-300 bg-white rounded-md text-[11px] font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors shadow-sm">Edit</button>
                      <mat-icon class="text-neutral-400 !text-[20px] !w-[20px] !h-[20px]">expand_more</mat-icon>
                    </div>
                    <div class="flex items-center gap-3" *ngIf="expandedStep === 2">
                      <mat-icon class="text-neutral-400 !text-[20px] !w-[20px] !h-[20px]">expand_less</mat-icon>
                    </div>
                  </div>
                  <div *ngIf="expandedStep === 2" class="px-10 pb-5 pt-2 border-t border-neutral-100 bg-[#FAF9F7]">
                      <div class="relative mb-2.5">
                        <mat-icon class="absolute left-3 top-2 !text-[18px] text-neutral-400">search</mat-icon>
                        <input type="text" [(ngModel)]="serviceSearchQuery" [ngModelOptions]="{standalone: true}" (input)="filterServicesList()" placeholder="Search available services..." class="w-full pl-9 pr-3 py-1.5 border border-neutral-300 rounded-lg text-xs outline-none focus:border-[#B36A17] bg-white shadow-sm">
                      </div>
                      <div class="rounded-lg flex flex-col gap-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1.5">
                        <div *ngFor="let s of filteredServices" (click)="form.patchValue({serviceId: s.id})" [class.border-[#B36A17]]="form.value.serviceId === s.id" [class.border-neutral-200]="form.value.serviceId !== s.id" class="bg-white px-3.5 py-2.5 border rounded-lg flex items-center justify-between cursor-pointer hover:border-[#B36A17] transition-all shadow-sm">
                          <div class="flex items-center gap-2.5 w-1/2">
                            <div class="w-4 h-4 rounded-full text-white flex items-center justify-center shrink-0 shadow-sm" [class.bg-black]="form.value.serviceId === s.id" [class.text-[#B36A17]]="form.value.serviceId === s.id" [class.bg-neutral-200]="form.value.serviceId !== s.id">
                              <mat-icon class="!text-[10px] !w-[10px] !h-[10px]">star</mat-icon>
                            </div>
                            <div class="text-[12px] font-bold text-neutral-900 truncate">{{ s.name }}</div>
                          </div>
                          <div class="text-[11px] font-bold text-neutral-500 w-14 text-center">{{ s.duration_minutes }}m</div>
                          <div class="text-[12px] font-black text-neutral-900 flex-1 text-right mr-2">JMD $ {{ s.price_jmd | number:'1.0-0' }}</div>
                        </div>
                      </div>
                      <div class="mt-4 flex justify-end">
                        <button type="button" (click)="expandedStep = 3; $event.stopPropagation()" [disabled]="!form.value.serviceId" class="px-5 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition-colors shadow-md tracking-wider uppercase">Continue</button>
                      </div>
                  </div>
                </div>

                <!-- 3. Location -->
                <div class="bg-white border border-neutral-200/80 rounded-[12px] shadow-sm overflow-hidden transition-all shrink-0">
                  <div class="p-3 px-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50/80 transition-colors" (click)="expandedStep = 3">
                    <div class="flex items-center gap-3">
                       <div class="w-9 h-9 bg-black rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                         <mat-icon class="text-white !text-[18px] !w-[18px] !h-[18px]">location_on</mat-icon>
                       </div>
                       <div class="flex items-center gap-4">
                         <div class="flex items-center gap-2.5 shrink-0">
                           <div class="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">3</div>
                           <span class="text-xs font-extrabold text-neutral-900">Location</span>
                         </div>
                         <div *ngIf="expandedStep !== 3 && form.value.locationId" class="text-xs text-neutral-600 font-medium">
                           <span class="font-bold text-neutral-900">{{ form.value.locationId === 2 ? 'Constant Spring' : 'Mannings Hill' }}</span>
                         </div>
                       </div>
                    </div>
                    <div class="flex items-center gap-3" *ngIf="expandedStep !== 3">
                      <button type="button" class="px-3 py-1 border border-neutral-300 bg-white rounded-md text-[11px] font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors shadow-sm">Edit</button>
                      <mat-icon class="text-neutral-400 !text-[20px] !w-[20px] !h-[20px]">expand_more</mat-icon>
                    </div>
                    <div class="flex items-center gap-3" *ngIf="expandedStep === 3">
                      <mat-icon class="text-neutral-400 !text-[20px] !w-[20px] !h-[20px]">expand_less</mat-icon>
                    </div>
                  </div>
                  <div *ngIf="expandedStep === 3" class="px-10 pb-5 pt-2 border-t border-neutral-100 bg-[#FAF9F7]">
                      <div class="flex flex-col gap-2.5">
                        <div (click)="form.patchValue({locationId: 2})" class="bg-white border hover:border-[#B36A17] rounded-xl p-3 cursor-pointer flex gap-3 items-center transition-all shadow-sm" [class.border-[#B36A17]]="form.value.locationId === 2" [class.border-neutral-200]="form.value.locationId !== 2">
                          <div class="w-4 h-4 rounded-full flex items-center justify-center shrink-0 border" [class.border-[5px]]="form.value.locationId === 2" [class.border-black]="form.value.locationId === 2" [class.border-neutral-300]="form.value.locationId !== 2"></div>
                          <div>
                            <div class="text-[12px] font-black text-neutral-900">Constant Spring</div>
                            <div class="text-[10px] text-neutral-500 mt-0.5">48 Constant Spring Road, Kingston, Jamaica</div>
                          </div>
                        </div>
                        <div (click)="form.patchValue({locationId: 1})" class="bg-white border hover:border-[#B36A17] rounded-xl p-3 cursor-pointer flex gap-3 items-center transition-all shadow-sm" [class.border-[#B36A17]]="form.value.locationId === 1" [class.border-neutral-200]="form.value.locationId !== 1">
                          <div class="w-4 h-4 rounded-full flex items-center justify-center shrink-0 border" [class.border-[5px]]="form.value.locationId === 1" [class.border-black]="form.value.locationId === 1" [class.border-neutral-300]="form.value.locationId !== 1"></div>
                          <div>
                            <div class="text-[12px] font-black text-neutral-900">Mannings Hill</div>
                            <div class="text-[10px] text-neutral-500 mt-0.5">63 Mannings Hill Rd, Kingston, Jamaica</div>
                          </div>
                        </div>
                      </div>
                      <div class="mt-4 flex justify-end">
                        <button type="button" (click)="expandedStep = 4; $event.stopPropagation()" [disabled]="!form.value.locationId" class="px-5 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition-colors shadow-md tracking-wider uppercase">Continue</button>
                      </div>
                  </div>
                </div>

                <!-- 4. Date -->
                <div class="bg-white border border-neutral-200/80 rounded-[12px] shadow-sm overflow-hidden transition-all shrink-0">
                  <div class="p-3 px-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50/80 transition-colors" (click)="expandedStep = 4">
                    <div class="flex items-center gap-3">
                       <div class="w-9 h-9 bg-black rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                         <mat-icon class="text-white !text-[18px] !w-[18px] !h-[18px]">calendar_today</mat-icon>
                       </div>
                       <div class="flex items-center gap-4">
                         <div class="flex items-center gap-2.5 shrink-0">
                           <div class="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">4</div>
                           <span class="text-xs font-extrabold text-neutral-900">Date</span>
                         </div>
                         <div *ngIf="expandedStep !== 4 && expandedStep !== 5 && form.value.date" class="text-xs text-neutral-600 font-medium">
                           <span class="font-bold text-neutral-900">{{ form.value.date | date:'longDate' }}</span> <span class="text-neutral-500">({{ form.value.date | date:'EEEE' }})</span>
                         </div>
                       </div>
                    </div>
                    <div class="flex items-center gap-3" *ngIf="expandedStep !== 4 && expandedStep !== 5">
                      <button type="button" class="px-3 py-1 border border-neutral-300 bg-white rounded-md text-[11px] font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors shadow-sm">Edit</button>
                      <mat-icon class="text-neutral-400 !text-[20px] !w-[20px] !h-[20px]">expand_more</mat-icon>
                    </div>
                    <div class="flex items-center gap-3" *ngIf="expandedStep === 4 || expandedStep === 5">
                      <mat-icon class="text-neutral-400 !text-[20px] !w-[20px] !h-[20px]">expand_less</mat-icon>
                    </div>
                  </div>
                </div>

                <!-- 5. Time (Contains both Date and Time pickers when expanded) -->
                <div class="bg-white border border-neutral-200/80 rounded-[12px] shadow-sm overflow-hidden transition-all shrink-0" [class.-mt-2]="expandedStep === 4 || expandedStep === 5" [class.z-10]="expandedStep === 4 || expandedStep === 5" [class.relative]="expandedStep === 4 || expandedStep === 5">
                  <div class="p-3 px-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50/80 transition-colors" (click)="expandedStep = 5" *ngIf="expandedStep !== 4 && expandedStep !== 5">
                    <div class="flex items-center gap-3">
                       <div class="w-9 h-9 bg-black rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                         <mat-icon class="text-white !text-[18px] !w-[18px] !h-[18px]">schedule</mat-icon>
                       </div>
                       <div class="flex items-center gap-4">
                         <div class="flex items-center gap-2.5 shrink-0">
                           <div class="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">5</div>
                           <span class="text-xs font-extrabold text-neutral-900">Time</span>
                         </div>
                         <div *ngIf="form.value.time" class="text-xs text-neutral-600 font-medium">
                           <span class="font-bold text-neutral-900">Select an available time</span>
                         </div>
                       </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <mat-icon class="text-neutral-400 !text-[20px] !w-[20px] !h-[20px]">expand_more</mat-icon>
                    </div>
                  </div>
                  
                  <div *ngIf="expandedStep === 4 || expandedStep === 5" class="px-6 pb-6 pt-3 bg-[#FAF9F7]">
                      
                      <!-- SIDE BY SIDE DATE AND TIME -->
                      <div class="flex flex-col xl:flex-row gap-6 items-start mt-1">
                        
                        <!-- CALENDAR -->
                        <div class="w-full xl:w-[290px] shrink-0 flex flex-col">
                           <div class="bg-[#18181b] text-white rounded-[14px] p-4 shadow-xl flex flex-col border border-black">
                            <div class="flex items-center justify-between mb-3">
                              <button type="button" (click)="prevMonth()" class="text-[#B36A17] hover:text-white transition-colors">
                                <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">chevron_left</mat-icon>
                              </button>
                              <div class="text-xs font-bold tracking-wide">{{ currentMonthName }}</div>
                              <button type="button" (click)="nextMonth()" class="text-[#B36A17] hover:text-white transition-colors">
                                <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">chevron_right</mat-icon>
                              </button>
                            </div>
                            
                            <div class="grid grid-cols-7 gap-1 mb-2">
                              <div *ngFor="let day of weekDays" class="text-[10px] font-bold text-neutral-400 text-center">{{ day }}</div>
                            </div>
                            
                            <div class="grid grid-cols-7 gap-y-2 gap-x-1 content-start">
                              <button type="button" *ngFor="let day of calendarDays" 
                                      (click)="selectDate(day.fullDate); expandedStep = 5"
                                      [class.opacity-40]="!day.isCurrentMonth"
                                      [class.bg-[#B36A17]]="form.value.date === day.fullDate"
                                      [class.text-white]="form.value.date === day.fullDate"
                                      [class.font-black]="form.value.date === day.fullDate"
                                      [class.shadow-md]="form.value.date === day.fullDate"
                                      [class.text-neutral-300]="form.value.date !== day.fullDate"
                                      class="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold hover:bg-neutral-800 transition-colors mx-auto">
                                {{ day.date }}
                              </button>
                            </div>
                          </div>
                        </div>

                        <!-- TIME SLOTS -->
                        <div class="flex-1 w-full flex flex-col" [class.opacity-40]="expandedStep === 4" [class.pointer-events-none]="expandedStep === 4">
                           <div class="flex justify-between items-end mb-3">
                             <div class="text-[12px] font-black text-neutral-900 tracking-wide">Available Times <span class="text-neutral-500 font-medium text-[10px] normal-case tracking-normal ml-1">(15 min intervals)</span></div>
                           </div>
                           
                           <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[260px] overflow-y-auto custom-scrollbar pr-1.5 pb-2">
                             <button type="button" *ngFor="let slot of timeSlots" (click)="selectTimeSlot(slot); expandedStep = 6"
                                     [class.bg-black]="form.value.time === convertTo24h(slot)" 
                                     [class.text-[#B36A17]]="form.value.time === convertTo24h(slot)" 
                                     [class.border-2]="form.value.time === convertTo24h(slot)"
                                     [class.border-[#B36A17]]="form.value.time === convertTo24h(slot)"
                                     [class.shadow-md]="form.value.time === convertTo24h(slot)"
                                     [class.bg-white]="form.value.time !== convertTo24h(slot)" 
                                     [class.border-neutral-200]="form.value.time !== convertTo24h(slot)" 
                                     [class.text-neutral-700]="form.value.time !== convertTo24h(slot)"
                                     class="py-2 px-1.5 border rounded-lg text-[11px] font-bold hover:border-[#B36A17]/60 transition-all text-center flex items-center justify-center gap-1 shadow-sm">
                               {{ slot }}
                               <mat-icon *ngIf="form.value.time === convertTo24h(slot)" class="!text-[10px] !w-[10px] !h-[10px] bg-[#B36A17] text-black rounded-full p-[1px]">check</mat-icon>
                             </button>
                           </div>
                        </div>

                      </div>
                  </div>
                </div>

                <!-- 6. Summary & Book -->
                <div class="bg-white border border-neutral-200/80 rounded-[12px] shadow-sm overflow-hidden transition-all mt-2 mb-4 shrink-0">
                  <div class="p-3 px-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50/80 transition-colors" (click)="expandedStep = 6">
                    <div class="flex items-center gap-3">
                       <div class="w-9 h-9 bg-black rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                         <mat-icon class="text-white !text-[18px] !w-[18px] !h-[18px]">assignment</mat-icon>
                       </div>
                       <div class="flex items-center gap-4">
                         <div class="flex items-center gap-2.5 shrink-0">
                           <div class="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">6</div>
                           <span class="text-xs font-extrabold text-neutral-900">Summary & Book</span>
                         </div>
                         <div class="text-xs text-neutral-500 font-medium ml-4">
                           Review and confirm appointment
                         </div>
                       </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <mat-icon class="text-neutral-400 !text-[20px] !w-[20px] !h-[20px]">expand_more</mat-icon>
                    </div>
                  </div>
                </div>

              </div>

              <!-- RIGHT SIDE: BOOKING SUMMARY PANEL -->
              <div class="w-[360px] shrink-0 bg-[#FAF8F5] flex flex-col rounded-2xl relative shadow-lg z-10 overflow-hidden border border-amber-200/50 h-full min-h-0">
                
                <div class="flex-1 overflow-y-auto custom-scrollbar p-5 pb-3">
                  <h3 class="text-[#B36A17] font-serif text-sm font-bold tracking-[0.15em] mb-5 uppercase text-center">Booking Summary</h3>
                  
                  <div class="space-y-4">
                    
                    <!-- Client -->
                    <div class="flex items-start gap-3 pb-3 border-b border-neutral-200/70">
                      <mat-icon class="text-neutral-500 !text-[18px] !w-[18px] !h-[18px] mt-0.5 shrink-0">person_outline</mat-icon>
                      <div class="flex-1">
                        <div class="text-[10px] text-neutral-500 font-bold tracking-widest uppercase mb-0.5">Client</div>
                        <div class="text-xs font-black text-neutral-900">{{ form.value.firstName || '—' }} {{ form.value.lastName }}</div>
                      </div>
                    </div>

                    <!-- Services -->
                    <div class="flex items-start gap-3 pb-3 border-b border-neutral-200/70">
                      <mat-icon class="text-neutral-500 !text-[18px] !w-[18px] !h-[18px] mt-0.5 shrink-0">star_border</mat-icon>
                      <div class="flex-1 w-full">
                        <div class="text-[10px] text-neutral-500 font-bold tracking-widest uppercase mb-1">Services (1)</div>
                        <div class="flex justify-between items-start mb-0.5 w-full">
                          <div class="text-xs font-bold text-neutral-900 truncate pr-2 w-3/4">{{ selectedServiceObj?.name || '—' }}</div>
                          <div class="text-[11px] font-bold text-neutral-600 shrink-0">{{ selectedServiceObj?.duration_minutes || 0 }} min</div>
                        </div>
                        <div class="text-xs font-bold text-[#B36A17] text-right mt-1">JMD $ {{ (selectedServiceObj?.price_jmd || 0) | number:'1.0-0' }}</div>
                      </div>
                    </div>

                    <!-- Location -->
                    <div class="flex items-start gap-3 pb-3 border-b border-neutral-200/70">
                      <mat-icon class="text-neutral-500 !text-[18px] !w-[18px] !h-[18px] mt-0.5 shrink-0">location_on</mat-icon>
                      <div class="flex-1">
                        <div class="text-[10px] text-neutral-500 font-bold tracking-widest uppercase mb-0.5">Location</div>
                        <div class="text-xs font-black text-neutral-900">{{ form.value.locationId === 2 ? 'Constant Spring' : (form.value.locationId === 1 ? 'Mannings Hill' : '—') }}</div>
                      </div>
                    </div>

                    <!-- Date -->
                    <div class="flex items-start gap-3 pb-3 border-b border-neutral-200/70">
                      <mat-icon class="text-neutral-500 !text-[18px] !w-[18px] !h-[18px] mt-0.5 shrink-0">calendar_today</mat-icon>
                      <div class="flex-1">
                        <div class="text-[10px] text-neutral-500 font-bold tracking-widest uppercase mb-0.5">Date</div>
                        <div class="text-xs font-black text-neutral-900">{{ form.value.date ? (form.value.date | date:'EEEE, MMMM d, y') : '—' }}</div>
                      </div>
                    </div>

                    <!-- Time -->
                    <div class="flex items-start gap-3 pb-3 border-b border-neutral-200/70">
                      <mat-icon class="text-neutral-500 !text-[18px] !w-[18px] !h-[18px] mt-0.5 shrink-0">schedule</mat-icon>
                      <div class="flex-1">
                        <div class="text-[10px] text-neutral-500 font-bold tracking-widest uppercase mb-0.5">Time</div>
                        <div class="text-xs font-black text-[#B36A17]">{{ form.value.time ? formattedTime : '—' }}</div>
                      </div>
                    </div>

                    <!-- Totals -->
                    <div class="pt-0.5">
                       <div class="flex items-center justify-between mb-2">
                         <div class="text-[10px] font-black text-neutral-900 uppercase">Duration</div>
                         <div class="text-[11px] font-bold text-neutral-600">{{ selectedServiceObj?.duration_minutes || 0 }} min</div>
                       </div>
                       <div class="flex items-center justify-between">
                         <div class="text-xs font-black text-neutral-900 uppercase tracking-wider">Total</div>
                         <div class="text-base font-black text-[#B36A17]">JMD $ {{ (selectedServiceObj?.price_jmd || 0) | number:'1.0-0' }}</div>
                       </div>
                    </div>

                  </div>
                </div>

                <div class="p-4 pt-2 bg-[#FAF8F5] flex flex-col gap-2 shrink-0 border-t border-neutral-200/50">
                  <button type="button" (click)="submit()" [disabled]="form.invalid || loading" 
                          class="w-full py-3 bg-black hover:bg-neutral-800 text-white font-black text-xs rounded-xl transition-all tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 uppercase">
                    <mat-icon *ngIf="loading" class="animate-spin !text-[16px] !w-[16px] !h-[16px]">refresh</mat-icon>
                    <mat-icon *ngIf="!loading" class="!text-[16px] !w-[16px] !h-[16px]">event_available</mat-icon>
                    BOOK NOW
                  </button>
                  <div class="flex items-center justify-center gap-1 mt-0.5">
                    <mat-icon class="!text-[11px] !w-[11px] !h-[11px] text-neutral-400">lock</mat-icon>
                    <span class="text-[10px] font-medium text-neutral-500">Your booking is secure and encrypted</span>
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  `,

styles: [
    '.scrollbar-none::-webkit-scrollbar { display: none; }',
    '.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }',
    '.custom-scrollbar::-webkit-scrollbar { width: 4px; }',
    '.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }',
    '.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 4px; }',
    '.bg-dot-pattern { background-image: radial-gradient(#f0f0f0 1px, transparent 1px); background-size: 24px 24px; background-color: #fafafa; }'
  ]
})
export class InternalBookingModalComponent implements OnInit {
  expandedStep = 1;
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
  timeSlots = ['09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM', '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM', '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM', '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM', '1:00 PM', '1:15 PM', '1:30 PM', '1:45 PM', '2:00 PM', '2:15 PM', '2:30 PM', '2:45 PM', '3:00 PM', '3:15 PM', '3:30 PM', '3:45 PM', '4:00 PM', '4:15 PM', '4:30 PM'];
  
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
      time: ['09:00', Validators.required],
      employeeId: [1, Validators.required],
      notes: [''],
      paymentMethod: ['pay_at_appointment', Validators.required]
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

  get formattedTime(): string {
    const time24 = this.form.value.time;
    if (!time24) return 'Select time';
    
    let [hours, minutes] = time24.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; 
    return `${h}:${minutes} ${ampm}`;
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
            this.form.patchValue(parsed);
          }
        }
      } catch (e) {
        this.clearDraft();
      }
    }
    this.showResumePrompt = false;
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
      paymentMethod: 'pay_at_appointment',
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
      paymentMethod: this.form.value.paymentMethod
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

