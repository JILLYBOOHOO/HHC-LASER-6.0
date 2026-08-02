import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { Employee } from '../../../core/models/models';

interface ClientSummary {
  userId: number;
  name: string;
  email: string;
  phone?: string;
  lastVisit?: string;
  totalAppointments: number;
}

@Component({
  selector: 'app-employee-clients',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900">My Clients</h1>
        <p class="text-slate-600 text-sm mt-1">Patients you've treated or have upcoming appointments with.</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (error()) {
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800 text-sm">{{ error() }}</div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (client of clients(); track client.userId) {
            <a [routerLink]="['/employee/clients', client.userId]"
               class="bg-white rounded-2xl border-2 border-slate-200 p-5 hover:shadow-md hover:border-amber-400 transition-all block">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center">
                  {{ client.name.charAt(0) }}
                </div>
                <div>
                  <div class="font-bold text-slate-900">{{ client.name }}</div>
                  <div class="text-xs text-slate-500">{{ client.email }}</div>
                </div>
              </div>
              <div class="text-xs text-slate-600 space-y-1">
                <div>{{ client.totalAppointments }} appointment(s)</div>
                @if (client.lastVisit) {
                  <div>Last visit: {{ client.lastVisit | date:'mediumDate' }}</div>
                }
              </div>
            </a>
          } @empty {
            <div class="col-span-full bg-white rounded-2xl border-2 border-slate-200 p-12 text-center text-slate-500">
              <mat-icon class="!text-5xl mb-3 text-slate-300">people</mat-icon>
              <p>No clients found yet.</p>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class EmployeeClientsComponent implements OnInit {
  private api = inject(ApiService);
  private authState = inject(AuthStateService);

  clients = signal<ClientSummary[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    const userId = this.authState.user()?.id;
    if (!userId) {
      this.error.set('You must be signed in to view clients.');
      this.loading.set(false);
      return;
    }

    this.api.getEmployees().subscribe({
      next: res => {
        const employees = res.data ?? [];
        const employee = employees.find((e: Employee) => e.user_id === userId);
        if (!employee) {
          this.error.set('No employee profile linked to your account.');
          this.loading.set(false);
          return;
        }
        this.loadClients(employee.id);
      },
      error: () => {
        this.error.set('Unable to load employee profile.');
        this.loading.set(false);
      }
    });
  }

  private loadClients(employeeId: number) {
    this.api.getEmployeeBookings(employeeId).subscribe({
      next: res => {
        const appointments = res.data ?? [];
        const map = new Map<number, ClientSummary>();

        for (const apt of appointments) {
          const userId = apt.customer_user_id;
          const existing = map.get(userId);
          if (existing) {
            existing.totalAppointments++;
            if (!existing.lastVisit || apt.scheduled_date > existing.lastVisit) {
              existing.lastVisit = apt.scheduled_date;
            }
          } else {
            map.set(userId, {
              userId,
              name: apt.customer_name || 'Unknown Client',
              email: apt.customer_email || '',
              phone: apt.customer_phone,
              lastVisit: apt.scheduled_date,
              totalAppointments: 1,
            });
          }
        }

        this.clients.set(Array.from(map.values()).sort((a, b) => (b.lastVisit || '').localeCompare(a.lastVisit || '')));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load client list.');
        this.loading.set(false);
      }
    });
  }
}
