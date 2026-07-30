import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatTableModule, MatMenuModule
  ],
  template: `
    <div class="p-4 md:p-8 max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-heading text-charcoal-800">Booking Management</h1>
          <p class="text-charcoal-500">View and manage all customer appointments.</p>
        </div>
        <button class="btn-primary">
          <mat-icon class="mr-1">add</mat-icon> Create Booking
        </button>
      </div>

      <div class="card p-0 overflow-hidden">
        
        <!-- Filters -->
        <div class="p-4 border-b border-cream-200 bg-cream-50 flex flex-wrap gap-4 items-center">
          <mat-form-field appearance="outline" class="w-full md:w-64 mb-[-1.25em]">
            <mat-label>Search Customer or ID</mat-label>
            <input matInput placeholder="e.g. John Doe">
            <mat-icon matPrefix class="text-charcoal-400 mr-2">search</mat-icon>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="w-full md:w-48 mb-[-1.25em]">
            <mat-label>Status</mat-label>
            <mat-select value="all">
              <mat-option value="all">All Statuses</mat-option>
              <mat-option value="Pending">Pending</mat-option>
              <mat-option value="Confirmed">Confirmed</mat-option>
              <mat-option value="Completed">Completed</mat-option>
              <mat-option value="Cancelled">Cancelled</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full md:w-48 mb-[-1.25em]">
            <mat-label>Date</mat-label>
            <input matInput type="date">
          </mat-form-field>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-white border-b border-cream-200 text-charcoal-500">
              <tr>
                <th class="py-4 px-6 font-semibold">ID</th>
                <th class="py-4 px-6 font-semibold">Customer</th>
                <th class="py-4 px-6 font-semibold">Service</th>
                <th class="py-4 px-6 font-semibold">Date & Time</th>
                <th class="py-4 px-6 font-semibold">Specialist</th>
                <th class="py-4 px-6 font-semibold">Status</th>
                <th class="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-cream-100 bg-white">
              @for (apt of appointments; track apt.id) {
                <tr class="hover:bg-cream-50 transition-colors">
                  <td class="py-4 px-6 text-charcoal-400 font-medium">#{{ apt.id }}</td>
                  <td class="py-4 px-6">
                    <div class="font-semibold text-charcoal-800">{{ apt.customerName }}</div>
                    <div class="text-xs text-charcoal-400">{{ apt.phone }}</div>
                  </td>
                  <td class="py-4 px-6 font-medium text-charcoal-800">{{ apt.service }}</td>
                  <td class="py-4 px-6">
                    <div class="text-charcoal-800">{{ apt.date }}</div>
                    <div class="text-xs text-charcoal-400">{{ apt.time }}</div>
                  </td>
                  <td class="py-4 px-6 text-charcoal-600">{{ apt.specialist }}</td>
                  <td class="py-4 px-6">
                    <span class="px-2 py-1 text-xs rounded-full font-medium"
                          [ngClass]="{
                            'bg-gold-100 text-gold-700': apt.status === 'Pending',
                            'bg-blue-100 text-blue-700': apt.status === 'Confirmed',
                            'bg-green-100 text-green-700': apt.status === 'Completed',
                            'bg-red-100 text-red-700': apt.status === 'Cancelled'
                          }">
                      {{ apt.status }}
                    </span>
                  </td>
                  <td class="py-4 px-6 text-right">
                    <button mat-icon-button [matMenuTriggerFor]="actionMenu" class="text-charcoal-400 hover:text-gold-600">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #actionMenu="matMenu">
                      <button mat-menu-item>
                        <mat-icon>visibility</mat-icon> View Details
                      </button>
                      <button mat-menu-item>
                        <mat-icon>edit_calendar</mat-icon> Reschedule
                      </button>
                      <button mat-menu-item (click)="apt.status = 'Confirmed'">
                        <mat-icon class="text-blue-500">check_circle</mat-icon> Confirm
                      </button>
                      <button mat-menu-item (click)="apt.status = 'Cancelled'">
                        <mat-icon class="text-red-500">cancel</mat-icon> Cancel
                      </button>
                    </mat-menu>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminBookingsComponent {
  appointments = [
    { id: '1042', customerName: 'Olivia Rhoden', phone: '876-555-0192', service: 'Laser Hair Removal', date: 'Aug 15, 2026', time: '09:00 AM', specialist: 'Dr. Sarah Jenkins', status: 'Confirmed' },
    { id: '1043', customerName: 'Marcus Garvey', phone: '876-555-8832', service: 'Chemical Peel', date: 'Aug 15, 2026', time: '10:30 AM', specialist: 'Emma Watson', status: 'Pending' },
    { id: '1044', customerName: 'Jessica Smith', phone: '876-555-1234', service: 'Signature Gold Facial', date: 'Aug 15, 2026', time: '11:30 AM', specialist: 'Dr. Sarah Jenkins', status: 'Confirmed' },
    { id: '1030', customerName: 'Amanda Lewis', phone: '876-555-9988', service: 'HydraFacial', date: 'Aug 12, 2026', time: '02:00 PM', specialist: 'Emma Watson', status: 'Completed' },
    { id: '1029', customerName: 'John Doe', phone: '876-555-7777', service: 'CoolSculpting', date: 'Aug 12, 2026', time: '10:00 AM', specialist: 'Dr. Sarah Jenkins', status: 'Cancelled' },
  ];
}
