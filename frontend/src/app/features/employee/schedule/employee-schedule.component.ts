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
    <div class="p-4 md:p-8 max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-heading text-charcoal-800">My Schedule</h1>
          <p class="text-charcoal-500">Welcome, {{ authState.user()?.first_name || 'Specialist' }}. Here is your schedule for today.</p>
        </div>
        <div class="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-cream-200">
          <button mat-icon-button class="text-charcoal-500"><mat-icon>chevron_left</mat-icon></button>
          <div class="font-medium text-charcoal-800 whitespace-nowrap">Today, Aug 15</div>
          <button mat-icon-button class="text-charcoal-500"><mat-icon>chevron_right</mat-icon></button>
        </div>
      </div>

      <!-- Schedule Timeline -->
      <div class="bg-white rounded-2xl shadow-sm border border-cream-200 p-6">
        <div class="space-y-6">
          
          @for (apt of appointments; track apt.id) {
            <div class="flex flex-col md:flex-row gap-4 group">
              <!-- Time -->
              <div class="w-24 flex-shrink-0 pt-1">
                <div class="text-sm font-semibold text-charcoal-800">{{ apt.time }}</div>
                <div class="text-xs text-charcoal-400">{{ apt.duration }}</div>
              </div>
              
              <!-- Card -->
              <div class="flex-1 card p-5 border-l-4 transition-all hover:shadow-md"
                   [ngClass]="{
                     'border-l-gold-500 bg-gold-50/30': apt.status === 'In Treatment',
                     'border-l-green-500 bg-white': apt.status === 'Completed',
                     'border-l-blue-500 bg-white': apt.status === 'Arrived',
                     'border-l-red-500 bg-cream-50 opacity-60': apt.status === 'No Show',
                     'border-l-charcoal-200 bg-white': apt.status === 'Confirmed'
                   }">
                
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div class="flex items-center gap-3 mb-1">
                      <h3 class="font-heading text-lg font-semibold text-charcoal-800">{{ apt.clientName }}</h3>
                      <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded"
                            [ngClass]="{
                              'bg-gold-100 text-gold-700': apt.status === 'In Treatment',
                              'bg-green-100 text-green-700': apt.status === 'Completed',
                              'bg-blue-100 text-blue-700': apt.status === 'Arrived',
                              'bg-red-100 text-red-700': apt.status === 'No Show',
                              'bg-charcoal-100 text-charcoal-600': apt.status === 'Confirmed'
                            }">
                        {{ apt.status }}
                      </span>
                    </div>
                    <p class="text-charcoal-600 font-medium text-sm mb-2">{{ apt.service }}</p>
                    <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs text-charcoal-500">
                      <span class="flex items-center gap-1"><mat-icon class="!text-sm">room</mat-icon> {{ apt.room }}</span>
                      <span class="flex items-center gap-1"><mat-icon class="!text-sm">info</mat-icon> {{ apt.notes || 'No specific notes.' }}</span>
                    </div>
                  </div>

                  <div class="flex sm:flex-col items-center sm:items-end gap-2">
                    <button mat-button [matMenuTriggerFor]="statusMenu" class="!bg-charcoal-50 text-charcoal-600 border border-charcoal-200 w-full sm:w-auto">
                      Update Status <mat-icon>arrow_drop_down</mat-icon>
                    </button>
                    <mat-menu #statusMenu="matMenu">
                      <button mat-menu-item (click)="updateStatus(apt, 'Arrived')">
                        <mat-icon class="text-blue-500">how_to_reg</mat-icon> Mark Arrived
                      </button>
                      <button mat-menu-item (click)="updateStatus(apt, 'In Treatment')">
                        <mat-icon class="text-gold-500">spa</mat-icon> In Treatment
                      </button>
                      <button mat-menu-item (click)="updateStatus(apt, 'Completed')">
                        <mat-icon class="text-green-500">check_circle</mat-icon> Completed
                      </button>
                      <button mat-menu-item (click)="updateStatus(apt, 'No Show')">
                        <mat-icon class="text-red-500">cancel</mat-icon> No Show
                      </button>
                    </mat-menu>
                    
                    <a [routerLink]="['/employee/treatment-notes', apt.id]" mat-icon-button class="text-charcoal-400 hover:text-gold-600" matTooltip="Add Treatment Notes">
                      <mat-icon>edit_document</mat-icon>
                    </a>
                  </div>
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
