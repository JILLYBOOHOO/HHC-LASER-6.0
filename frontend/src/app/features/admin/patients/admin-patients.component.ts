import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-[#00f0ff] tracking-tight">Patients</h1>
          <p class="text-slate-400 text-sm mt-1">All registered customers and their visit history.</p>
        </div>
        <div class="relative">
          <mat-icon class="absolute left-3 top-2.5 !text-lg text-slate-500">search</mat-icon>
          <input type="text" [(ngModel)]="search" (keyup.enter)="load()" placeholder="Search patients..."
                 class="pl-10 pr-4 py-2 bg-[#141716] border border-[#1e2522] rounded-lg text-sm text-slate-200 w-64 focus:outline-none focus:border-[#00f0ff]" />
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <div class="bg-[#141716] border border-[#1e2522] rounded-xl overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-[#1e2522] text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th class="text-left px-5 py-3">Patient</th>
                <th class="text-left px-5 py-3">Contact</th>
                <th class="text-left px-5 py-3">Appointments</th>
                <th class="text-left px-5 py-3">Lifetime Value</th>
                <th class="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1e2522]">
              @for (p of patients(); track p.id) {
                <tr class="hover:bg-[#1e2522]/50">
                  <td class="px-5 py-4">
                    <div class="font-semibold text-slate-200">{{ p.first_name }} {{ p.last_name }}</div>
                    <div class="text-xs text-slate-500">Since {{ p.created_at | date:'mediumDate' }}</div>
                  </td>
                  <td class="px-5 py-4 text-slate-400">
                    <div>{{ p.email }}</div>
                    <div class="text-xs">{{ p.phone || '—' }}</div>
                  </td>
                  <td class="px-5 py-4 text-slate-300">{{ p.total_appointments || 0 }}</td>
                  <td class="px-5 py-4 text-[#00f0ff] font-semibold">J$ {{ p.lifetime_value | number:'1.0-0' }}</td>
                  <td class="px-5 py-4">
                    <span class="text-xs px-2 py-1 rounded-full"
                          [ngClass]="p.is_active ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'">
                      {{ p.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-5 py-12 text-center text-slate-500">No patients found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class AdminPatientsComponent implements OnInit {
  private api = inject(ApiService);

  patients = signal<any[]>([]);
  loading = signal(true);
  search = '';

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getAdminCustomers(1, 50, this.search || undefined).subscribe({
      next: res => {
        this.patients.set((res as any).data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
