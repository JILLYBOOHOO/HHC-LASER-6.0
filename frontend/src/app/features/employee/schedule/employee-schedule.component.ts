import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-schedule',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatMenuModule, RouterModule],
  template: `
    <div class="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-[#fcfbfa] min-h-screen">
      
      <!-- Header -->
      <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">My Schedule</h1>
          <p class="text-slate-600 font-medium text-sm mt-1">Welcome, <span class="font-bold text-slate-900">{{ authState.user()?.first_name || 'Specialist' }}</span>. Here is your schedule for today.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <a routerLink="/booking" class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2">
            <mat-icon class="!text-base">add_circle</mat-icon>
            <span class="uppercase tracking-wider">+ Make Appointment for Customer</span>
          </a>
          <div class="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            <button mat-icon-button class="text-slate-600 hover:text-slate-900"><mat-icon>chevron_left</mat-icon></button>
            <div class="font-extrabold text-slate-900 text-sm whitespace-nowrap">Today, Aug 15</div>
            <button mat-icon-button class="text-slate-600 hover:text-slate-900"><mat-icon>chevron_right</mat-icon></button>
          </div>
        </div>
      </div>

      <!-- Schedule Timeline -->
      <div class="bg-white rounded-3xl shadow-sm border-2 border-slate-200 p-6 md:p-8">
        <div class="space-y-6">
          
          @for (apt of appointments; track apt.id) {
            <div class="flex flex-col md:flex-row gap-4 group">
              <!-- Time Column -->
              <div class="w-28 flex-shrink-0 pt-2">
                <div class="text-base font-black text-slate-900 tracking-tight">{{ apt.time }}</div>
                <div class="text-xs font-bold text-amber-700 mt-0.5">{{ apt.duration }}</div>
              </div>
              
              <!-- Appointment Card Box -->
              <div class="flex-1 bg-white rounded-2xl p-6 border-2 border-slate-200 border-l-8 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                   [ngClass]="{
                     'border-l-emerald-500 bg-emerald-50/20': apt.status === 'Completed',
                     'border-l-amber-500 bg-amber-50/30': apt.status === 'In Treatment',
                     'border-l-blue-500 bg-blue-50/20': apt.status === 'Arrived',
                     'border-l-rose-500 bg-rose-50/20 opacity-70': apt.status === 'No Show',
                     'border-l-slate-400 bg-slate-50/40': apt.status === 'Confirmed'
                   }">
                
                <div class="space-y-2">
                  <div class="flex items-center gap-3">
                    <h3 class="text-xl font-black text-slate-900 tracking-tight">{{ apt.clientName }}</h3>
                    <span class="px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-full"
                          [ngClass]="{
                            'bg-amber-100 text-amber-800 border border-amber-300': apt.status === 'In Treatment',
                            'bg-emerald-100 text-emerald-800 border border-emerald-300': apt.status === 'Completed',
                            'bg-blue-100 text-blue-800 border border-blue-300': apt.status === 'Arrived',
                            'bg-rose-100 text-rose-800 border border-rose-300': apt.status === 'No Show',
                            'bg-slate-200 text-slate-800 border border-slate-300': apt.status === 'Confirmed'
                          }">
                      {{ apt.status }}
                    </span>
                  </div>
                  
                  <p class="text-slate-800 font-extrabold text-sm">{{ apt.service }}</p>
                  
                  <div class="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 pt-1">
                    <span class="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      <mat-icon class="!text-sm text-amber-600">room</mat-icon> {{ apt.room }}
                    </span>
                    <span class="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      <mat-icon class="!text-sm text-slate-500">info</mat-icon> {{ apt.notes || 'No specific notes.' }}
                    </span>
                  </div>
                </div>

                <!-- Action Controls -->
                <div class="flex items-center gap-3 self-start sm:self-center">
                  <button [matMenuTriggerFor]="statusMenu" 
                          class="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-black font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2">
                    <span>Update Status</span>
                    <mat-icon class="!text-base text-amber-400">arrow_drop_down</mat-icon>
                  </button>
                  <mat-menu #statusMenu="matMenu">
                    <button mat-menu-item (click)="updateStatus(apt, 'Arrived')">
                      <mat-icon class="text-blue-500">how_to_reg</mat-icon> Mark Arrived
                    </button>
                    <button mat-menu-item (click)="updateStatus(apt, 'In Treatment')">
                      <mat-icon class="text-amber-500">spa</mat-icon> In Treatment
                    </button>
                    <button mat-menu-item (click)="updateStatus(apt, 'Completed')">
                      <mat-icon class="text-emerald-500">check_circle</mat-icon> Completed
                    </button>
                    <button mat-menu-item (click)="updateStatus(apt, 'No Show')">
                      <mat-icon class="text-rose-500">cancel</mat-icon> No Show
                    </button>
                  </mat-menu>
                  
                  <a [routerLink]="['/employee/treatment-notes', apt.id]" 
                     class="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-amber-600 hover:bg-slate-200 transition-all shadow-xs" 
                     title="Add Treatment Notes">
                    <mat-icon class="!text-lg">edit_document</mat-icon>
                  </a>
                </div>

              </div>
            </div>
          }
          
        </div>
      </div>
    </div>
  `,
})
export class EmployeeScheduleComponent {
  appointments = [
    { id: 101, time: '09:00 AM', duration: '60 min', clientName: 'Olivia Rhoden', service: 'Laser Hair Removal - Full Legs', room: 'Room 1', status: 'Completed', notes: 'First session' },
    { id: 102, time: '10:30 AM', duration: '45 min', clientName: 'Marcus Garvey', service: 'Chemical Peel', room: 'Room 2', status: 'In Treatment', notes: 'Sensitive skin' },
    { id: 103, time: '11:30 AM', duration: '60 min', clientName: 'Jessica Smith', service: 'Signature Gold Facial', room: 'Room 1', status: 'Arrived', notes: '' },
    { id: 104, time: '02:00 PM', duration: '45 min', clientName: 'Amanda Lewis', service: 'HydraFacial', room: 'Room 3', status: 'Confirmed', notes: 'VIP Member' },
  ];

  constructor(public authState: AuthStateService) {}

  updateStatus(apt: any, status: string) {
    apt.status = status;
    // In a real app, this would call api.updateAppointmentStatus(apt.id, status)
  }
}
