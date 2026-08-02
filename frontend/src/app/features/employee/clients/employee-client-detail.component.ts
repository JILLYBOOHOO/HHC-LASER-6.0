import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { TreatmentNote } from '../../../core/models/models';

@Component({
  selector: 'app-employee-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <a routerLink="/employee/clients" class="inline-flex items-center text-slate-500 hover:text-amber-600 text-sm font-medium">
        <mat-icon class="!text-sm !w-4 !h-4 mr-1">arrow_back</mat-icon> Back to Clients
      </a>

      @if (loading()) {
        <div class="flex justify-center py-12"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (client()) {
        <div class="bg-white rounded-2xl border-2 border-slate-200 p-6">
          <h1 class="text-2xl font-extrabold text-slate-900">{{ client()!.name }}</h1>
          <p class="text-sm text-slate-500 mt-1">{{ client()!.email }}</p>
          @if (client()!.phone) {
            <p class="text-sm text-slate-500">{{ client()!.phone }}</p>
          }
        </div>

        <section class="space-y-4">
          <h2 class="text-lg font-bold text-slate-900">Appointments</h2>
          @for (apt of appointments(); track apt.id) {
            <div class="bg-white rounded-xl border border-slate-200 p-4">
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-semibold text-slate-900">{{ apt.services }}</div>
                  <div class="text-sm text-slate-500">{{ apt.scheduled_date | date:'longDate' }} at {{ apt.start_time }}</div>
                </div>
                <span class="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{{ apt.status | titlecase }}</span>
              </div>
            </div>
          } @empty {
            <p class="text-slate-500 text-sm">No appointments on record.</p>
          }
        </section>

        <section class="space-y-4">
          <h2 class="text-lg font-bold text-slate-900">Treatment History</h2>
          @for (note of history(); track note.id) {
            <div class="bg-white rounded-xl border border-slate-200 p-4">
              <div class="font-semibold text-slate-900">{{ note.service_name }}</div>
              <div class="text-xs text-slate-400 mb-2">{{ note.created_at | date:'mediumDate' }}</div>
              <p class="text-sm text-slate-700">{{ note.notes }}</p>
            </div>
          } @empty {
            <p class="text-slate-500 text-sm">No treatment notes yet.</p>
          }
        </section>
      } @else {
        <div class="text-center py-16 text-slate-500">
          <mat-icon class="!text-5xl mb-3">person_off</mat-icon>
          <p>Client not found.</p>
        </div>
      }
    </div>
  `
})
export class EmployeeClientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  client = signal<{ name: string; email: string; phone?: string } | null>(null);
  appointments = signal<any[]>([]);
  history = signal<TreatmentNote[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const clientUserId = Number(params.get('id'));
      if (!clientUserId) {
        this.loading.set(false);
        return;
      }

      this.api.getTreatmentHistory(clientUserId).subscribe({
        next: res => this.history.set(res.data ?? []),
        error: () => this.history.set([])
      });

      this.api.getEmployees().subscribe({
        next: empRes => {
          const employees = empRes.data ?? [];
          this.api.getEmployeeBookings(employees[0]?.id ?? 0).subscribe({
            next: res => {
              const all = (res.data ?? []).filter((a: any) => a.customer_user_id === clientUserId);
              this.appointments.set(all);
              const first = all[0];
              if (first) {
                this.client.set({
                  name: first.customer_name,
                  email: first.customer_email,
                  phone: first.customer_phone,
                });
              }
              this.loading.set(false);
            },
            error: () => this.loading.set(false)
          });
        },
        error: () => this.loading.set(false)
      });
    });
  }
}
