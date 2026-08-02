import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      
      <!-- Top Header & Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Transactions</h1>
          <p class="text-xs text-slate-500 mt-0.5">Track and manage all payment transactions</p>
        </div>
        <button (click)="exportReport()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-black font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto">
          <mat-icon class="!text-base">download</mat-icon>
          <span>Export Report</span>
        </button>
      </div>

      <!-- 4 Stat Cards Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- Total Revenue -->
        <div class="p-5 rounded-2xl bg-indigo-100/70 border border-indigo-200/60 shadow-sm flex items-start justify-between">
          <div>
            <div class="text-xs font-semibold text-slate-600">Total Revenue</div>
            <div class="text-2xl font-black text-slate-900 mt-1 tracking-tight">$2,516,120.00 $</div>
            <div class="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mt-3">
              <mat-icon class="!text-xs text-slate-700">insights</mat-icon>
              <span>All time</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-white/70 backdrop-blur border border-indigo-200/50 flex items-center justify-center text-slate-700">
            <mat-icon class="!text-xl">attach_money</mat-icon>
          </div>
        </div>

        <!-- Pending Amount -->
        <div class="p-5 rounded-2xl bg-slate-200/70 border border-slate-300/60 shadow-sm flex items-start justify-between">
          <div>
            <div class="text-xs font-semibold text-slate-600">Pending Amount</div>
            <div class="text-2xl font-black text-slate-900 mt-1 tracking-tight">$197,000.00</div>
            <div class="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mt-3">
              <mat-icon class="!text-xs text-slate-700">schedule</mat-icon>
              <span>Awaiting payment</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-white/70 backdrop-blur border border-slate-300/50 flex items-center justify-center text-slate-700">
            <mat-icon class="!text-xl">schedule</mat-icon>
          </div>
        </div>

        <!-- Failed Transactions -->
        <div class="p-5 rounded-2xl bg-rose-100/70 border border-rose-200/60 shadow-sm flex items-start justify-between">
          <div>
            <div class="text-xs font-semibold text-slate-600">Failed Transactions</div>
            <div class="text-2xl font-black text-slate-900 mt-1 tracking-tight">66</div>
            <div class="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mt-3">
              <mat-icon class="!text-xs text-slate-700">cancel</mat-icon>
              <span>Requires attention</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-white/70 backdrop-blur border border-rose-200/50 flex items-center justify-center text-slate-700">
            <mat-icon class="!text-xl">highlight_off</mat-icon>
          </div>
        </div>

        <!-- Total Transactions -->
        <div class="p-5 rounded-2xl bg-blue-100/70 border border-blue-200/60 shadow-sm flex items-start justify-between">
          <div>
            <div class="text-xs font-semibold text-slate-600">Total Transactions</div>
            <div class="text-2xl font-black text-slate-900 mt-1 tracking-tight">411</div>
            <div class="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mt-3">
              <mat-icon class="!text-xs text-slate-700">credit_card</mat-icon>
              <span>All payments</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-white/70 backdrop-blur border border-blue-200/50 flex items-center justify-center text-slate-700">
            <mat-icon class="!text-xl">credit_card</mat-icon>
          </div>
        </div>

      </div>

      <!-- Filter Controls Bar -->
      <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Search</label>
            <div class="relative">
              <mat-icon class="absolute left-3 top-2.5 !text-base text-slate-400">search</mat-icon>
              <input type="text"
                     [(ngModel)]="searchQuery"
                     placeholder="Search transactions..."
                     class="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-700">
            </div>
          </div>

          <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Payment Status</label>
            <select [(ngModel)]="selectedStatus" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none">
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">From Date</label>
            <input type="text" [(ngModel)]="fromDate" placeholder="mm/dd/yyyy" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none">
          </div>

          <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">To Date</label>
            <input type="text" [(ngModel)]="toDate" placeholder="mm/dd/yyyy" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none">
          </div>

        </div>

        <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button (click)="applyFilters()" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-black font-semibold text-xs rounded-lg transition-colors flex items-center gap-1">
            <mat-icon class="!text-sm">filter_alt</mat-icon>
            <span>Apply Filters</span>
          </button>
          <button (click)="clearFilters()" class="px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-semibold text-xs rounded-lg transition-colors">
            Clear
          </button>
        </div>
      </div>

      <!-- Data Table Card -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr class="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                <th class="py-3 px-4">Transaction ID</th>
                <th class="py-3 px-4">Patient</th>
                <th class="py-3 px-4">Service</th>
                <th class="py-3 px-4">Amount</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Date</th>
                <th class="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
              <tr *ngIf="loading()">
                <td colspan="7" class="py-4 text-center text-slate-500">Loading transactions...</td>
              </tr>
              <tr *ngIf="!loading() && filteredTransactions().length === 0">
                <td colspan="7" class="py-4 text-center text-slate-500">No transactions found.</td>
              </tr>
              @for (txn of filteredTransactions(); track txn.id) {
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="py-3.5 px-4 font-bold text-slate-900">{{ txn.idempotency_key | slice:0:8 }}...</td>
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-slate-800">{{ txn.patient_first_name }} {{ txn.patient_last_name }}</div>
                    <div class="text-[11px] text-slate-400">{{ txn.patient_email }}</div>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="font-medium text-slate-800">Appointment #{{ txn.appointment_id }}</div>
                    <div class="text-[11px] text-slate-400">{{ txn.payment_method || 'online' }}</div>
                  </td>
                  <td class="py-3.5 px-4 font-bold text-slate-900">\${{ (txn.amount_jmd * 1).toLocaleString('en-US', {minimumFractionDigits: 2}) }}</td>
                  <td class="py-3.5 px-4">
                    @if (txn.status === 'completed') {
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                        <mat-icon class="!text-[11px]">check_circle</mat-icon>
                        <span>completed</span>
                      </span>
                    } @else if (txn.status === 'failed') {
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
                        <mat-icon class="!text-[11px]">cancel</mat-icon>
                        <span>failed</span>
                      </span>
                    } @else {
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                        <mat-icon class="!text-[11px]">schedule</mat-icon>
                        <span>{{ txn.status }}</span>
                      </span>
                    }
                  </td>
                  <td class="py-3.5 px-4 font-medium text-slate-500">{{ txn.created_at | date:'shortDate' }}</td>
                  <td class="py-3.5 px-4 text-center">
                    <button class="p-1 hover:bg-slate-100 rounded text-blue-600 transition-colors">
                      <mat-icon class="!text-base">visibility</mat-icon>
                    </button>
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
export class AdminTransactionsComponent implements OnInit {
  searchQuery: string = '';
  selectedStatus: string = 'all';
  fromDate: string = '';
  toDate: string = '';

  transactions = signal<any[]>([]);
  loading = signal(true);

  constructor(private http: HttpClient, private authState: AuthStateService) {}

  ngOnInit() {
    this.fetchTransactions();
  }

  fetchTransactions() {
    this.loading.set(true);
    const headers = { Authorization: `Bearer ${this.authState.token()}` };
    this.http.get<any>(`${environment.apiUrl}/payments/all`, { headers })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.transactions.set(res.data.transactions || []);
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.loading.set(false);
        }
      });
  }

  filteredTransactions() {
    return this.transactions().filter(t => {
      const query = this.searchQuery.toLowerCase();
      const matchesSearch = !query ||
        String(t.idempotency_key).toLowerCase().includes(query) ||
        String(t.patient_first_name).toLowerCase().includes(query) ||
        String(t.patient_last_name).toLowerCase().includes(query) ||
        String(t.patient_email).toLowerCase().includes(query);
      const matchesStatus = this.selectedStatus === 'all' || t.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  exportReport(): void {
    alert('Exporting CSV/PDF Transaction Report... (Demo)');
  }

  applyFilters(): void {
    // Triggers recalculation
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'all';
    this.fromDate = '';
    this.toDate = '';
  }
}
