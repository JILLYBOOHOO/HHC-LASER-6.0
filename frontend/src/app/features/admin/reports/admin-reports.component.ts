import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-black text-[#00f0ff] tracking-tight">Reports & Analytics</h1>
        <p class="text-slate-400 text-sm mt-1">Revenue breakdown by service and specialist.</p>
      </div>

      <div class="flex flex-wrap gap-4 items-end bg-[#141716] border border-[#1e2522] rounded-xl p-4">
        <label class="text-sm">
          <span class="text-slate-400 block mb-1">From</span>
          <input type="date" [(ngModel)]="fromDate" class="bg-[#111312] border border-[#1e2522] rounded-lg px-3 py-2 text-slate-200" />
        </label>
        <label class="text-sm">
          <span class="text-slate-400 block mb-1">To</span>
          <input type="date" [(ngModel)]="toDate" class="bg-[#111312] border border-[#1e2522] rounded-lg px-3 py-2 text-slate-200" />
        </label>
        <button mat-flat-button class="!bg-[#00f0ff] !text-black" (click)="load()">Generate Report</button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (report()) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-[#141716] border border-[#1e2522] rounded-xl overflow-hidden">
            <div class="px-5 py-4 border-b border-[#1e2522] font-bold text-slate-200">Revenue by Service</div>
            <table class="w-full text-sm">
              <thead class="text-slate-500 text-xs uppercase">
                <tr>
                  <th class="text-left px-5 py-2">Service</th>
                  <th class="text-right px-5 py-2">Sessions</th>
                  <th class="text-right px-5 py-2">Revenue</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1e2522]">
                @for (row of report()!.revenueByService; track row.name) {
                  <tr>
                    <td class="px-5 py-3 text-slate-300">{{ row.name }}</td>
                    <td class="px-5 py-3 text-right text-slate-400">{{ row.sessions }}</td>
                    <td class="px-5 py-3 text-right text-[#00f0ff] font-semibold">J$ {{ row.revenue | number:'1.0-0' }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="3" class="px-5 py-8 text-center text-slate-500">No data for this period.</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="bg-[#141716] border border-[#1e2522] rounded-xl overflow-hidden">
            <div class="px-5 py-4 border-b border-[#1e2522] font-bold text-slate-200">Revenue by Specialist</div>
            <table class="w-full text-sm">
              <thead class="text-slate-500 text-xs uppercase">
                <tr>
                  <th class="text-left px-5 py-2">Specialist</th>
                  <th class="text-right px-5 py-2">Sessions</th>
                  <th class="text-right px-5 py-2">Revenue</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1e2522]">
                @for (row of report()!.revenueByEmployee; track row.name) {
                  <tr>
                    <td class="px-5 py-3 text-slate-300">{{ row.name }}</td>
                    <td class="px-5 py-3 text-right text-slate-400">{{ row.sessions }}</td>
                    <td class="px-5 py-3 text-right text-[#00f0ff] font-semibold">J$ {{ row.revenue | number:'1.0-0' }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="3" class="px-5 py-8 text-center text-slate-500">No data for this period.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminReportsComponent implements OnInit {
  private api = inject(ApiService);

  report = signal<{ revenueByService: any[]; revenueByEmployee: any[] } | null>(null);
  loading = signal(false);
  fromDate = '';
  toDate = '';

  ngOnInit() {
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    this.toDate = now.toISOString().split('T')[0];
    this.fromDate = monthAgo.toISOString().split('T')[0];
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getRevenueReport(this.fromDate || undefined, this.toDate || undefined).subscribe({
      next: res => {
        this.report.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.report.set(null);
        this.loading.set(false);
      }
    });
  }
}
