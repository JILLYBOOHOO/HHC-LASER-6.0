import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-4 max-w-7xl mx-auto space-y-4 font-sans bg-white min-h-screen">
      
      <!-- Top Header & Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-2">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-3xl font-serif text-slate-900 tracking-tight">Transactions</h1>
            <span class="text-slate-400 font-light">|</span>
            <span class="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Location: Constant Spring Road</span>
          </div>
          <p class="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
            Track and manage all payment transactions, refunds, and financial activities for the clinic.
          </p>
        </div>
        <button (click)="exportReport()" class="px-5 py-2.5 bg-[#d4b982] hover:bg-[#c2a66b] text-white font-bold text-[10px] uppercase tracking-wider rounded shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto">
          <mat-icon class="!text-sm">download</mat-icon>
          <span>Export Report</span>
        </button>
      </div>

      <!-- 4 Stat Cards Row (Hidden for staff) -->
      <div *ngIf="!hideKPIs" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Total Revenue -->
        <div class="p-4 bg-[#4CA771] text-white shadow-sm flex flex-col justify-between relative overflow-hidden ">
          <div class="flex justify-between items-start">
            <div class="text-[10px] font-bold uppercase tracking-wider opacity-90">Total Revenue</div>
            <div class="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
              <mat-icon class="!text-sm">account_balance_wallet</mat-icon>
            </div>
          </div>
          <div>
            <div class="text-3xl font-bold mt-2 tracking-tight">{{ kpis().total_revenue | currency:'JMD':'symbol':'1.0-0' }}</div>
            <div class="text-[9px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1 mt-1">
              <mat-icon class="!text-[12px] !w-3 !h-3">trending_up</mat-icon>
              <span>Selected period</span>
            </div>
          </div>
        </div>

        <!-- Pending Amount -->
        <div class="p-4 bg-[#D8C7AB] text-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden ">
          <div class="flex justify-between items-start">
            <div class="text-[10px] font-bold uppercase tracking-wider opacity-90">Pending Amount</div>
            <div class="w-8 h-8 rounded bg-white/40 flex items-center justify-center">
              <mat-icon class="!text-sm">schedule</mat-icon>
            </div>
          </div>
          <div>
            <div class="text-3xl font-bold mt-2 tracking-tight">{{ kpis().pending_amount | currency:'JMD':'symbol':'1.0-0' }}</div>
            <div class="text-[9px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1 mt-1">
              <mat-icon class="!text-[12px] !w-3 !h-3">hourglass_empty</mat-icon>
              <span>Awaiting payment</span>
            </div>
          </div>
        </div>

        <!-- Failed Transactions -->
        <div class="p-4 bg-[#E85C71] text-white shadow-sm flex flex-col justify-between relative overflow-hidden ">
          <div class="flex justify-between items-start">
            <div class="text-[10px] font-bold uppercase tracking-wider opacity-90">Failed Transactions</div>
            <div class="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
              <mat-icon class="!text-sm">cancel</mat-icon>
            </div>
          </div>
          <div>
            <div class="text-3xl font-bold mt-2 tracking-tight">{{ kpis().failed_payments | currency:'JMD':'symbol':'1.0-0' }}</div>
            <div class="text-[9px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1 mt-1">
              <mat-icon class="!text-[12px] !w-3 !h-3">warning</mat-icon>
              <span>Requires attention</span>
            </div>
          </div>
        </div>

        <!-- Total Transactions -->
        <div class="p-4 bg-[#333333] text-white shadow-sm flex flex-col justify-between relative overflow-hidden ">
          <div class="flex justify-between items-start">
            <div class="text-[10px] font-bold uppercase tracking-wider opacity-90">Total Transactions</div>
            <div class="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
              <mat-icon class="!text-sm">receipt_long</mat-icon>
            </div>
          </div>
          <div>
            <div class="text-3xl font-bold mt-2 tracking-tight">{{ kpis().total_transactions | number }}</div>
            <div class="text-[9px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1 mt-1">
              <mat-icon class="!text-[12px] !w-3 !h-3">fact_check</mat-icon>
              <span>All payments</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Filter Controls Bar -->
      <div class="pt-1">
        <div class="flex flex-row flex-wrap items-end gap-3">
          
          <div class="w-full sm:w-48">
            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Search</label>
            <div class="relative">
              <input type="text"
                     [(ngModel)]="searchQuery"
                     placeholder="Search transactions..."
                     class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-slate-400 text-slate-700">
            </div>
          </div>

          <div class="w-32">
            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
            <select [(ngModel)]="selectedStatus" class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none">
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div class="w-32">
            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">From</label>
            <div class="relative">
              <input type="date" [(ngModel)]="fromDate" class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none">
            </div>
          </div>

          <div class="w-32">
            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">To</label>
            <div class="relative">
              <input type="date" [(ngModel)]="toDate" class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none">
            </div>
          </div>

          <div class="flex items-center gap-2 mb-[1px]">
            <button (click)="applyFilters()" class="px-4 py-1.5 bg-[#d4b982] hover:bg-[#c2a66b] text-white font-bold text-[10px] uppercase tracking-wider rounded transition-colors">
              Apply
            </button>
            <button (click)="clearFilters()" class="px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 font-bold text-[10px] uppercase tracking-wider rounded transition-colors">
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Data Table Card -->
      <div class="overflow-x-auto border-t border-slate-100 pt-2">
        <table class="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr class="border-b-2 border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <th class="py-2 px-2 font-bold">Transaction ID</th>
              <th class="py-2 px-2 font-bold">Patient</th>
              <th class="py-2 px-2 font-bold">Service</th>
              <th class="py-2 px-2 font-bold">Amount</th>
              <th class="py-2 px-2 font-bold">Status</th>
              <th class="py-2 px-2 font-bold">Date</th>
              <th class="py-2 px-2 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            
            <tr *ngFor="let tx of transactions()" class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
              <td class="py-2 px-2">
                <span class="text-xs font-bold text-slate-700">#{{ tx.fiserv_txn_id || tx.id }}</span>
              </td>
              <td class="py-2 px-2">
                <div class="text-xs font-semibold text-slate-800">{{ tx.customer_first_name }} {{ tx.customer_last_name }}</div>
                <div class="text-[10px] text-slate-400">{{ tx.customer_email || 'No email' }}</div>
              </td>
              <td class="py-2 px-2">
                <div class="text-xs text-slate-700">{{ tx.service_name || 'Generic Payment' }}</div>
                <div class="mt-1 flex flex-wrap gap-1">
                  <div class="text-[9px] font-bold text-slate-500 bg-slate-100 uppercase tracking-wider inline-block px-1.5 py-0.5 rounded">{{ tx.payment_method || 'Unknown' }}</div>
                  <div class="text-[9px] font-bold text-white uppercase tracking-wider inline-block px-1.5 py-0.5 rounded shadow-sm" [ngClass]="getPaymentType(tx.payment_method) === 'Online (Website)' ? 'bg-indigo-400' : 'bg-emerald-500'">
                    {{ getPaymentType(tx.payment_method) }}
                  </div>
                </div>
              </td>
              <td class="py-2 px-2">
                <span class="text-xs font-bold text-slate-700">{{ tx.amount_jmd | currency:'JMD':'symbol':'1.0-0' }}</span>
              </td>
              <td class="py-2 px-2">
                <span *ngIf="tx.status === 'completed'" class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#e8f6ef] text-[#4ca771] text-[9px] font-bold uppercase tracking-wider border border-[#bde4ce]">
                  <mat-icon class="!text-[12px] !w-3 !h-3">check_circle_outline</mat-icon> Completed
                </span>
                <span *ngIf="tx.status === 'failed'" class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#ffebeb] text-[#e85c71] text-[9px] font-bold uppercase tracking-wider border border-[#fac8c8]">
                  <mat-icon class="!text-[12px] !w-3 !h-3">cancel</mat-icon> Failed
                </span>
                <span *ngIf="tx.status === 'pending'" class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-orange-50 text-orange-500 text-[9px] font-bold uppercase tracking-wider border border-orange-200">
                  <mat-icon class="!text-[12px] !w-3 !h-3">hourglass_empty</mat-icon> Pending
                </span>
              </td>
              <td class="py-2 px-2">
                <span class="text-xs text-slate-500">{{ tx.created_at | date:'M/d/yyyy h:mm a' }}</span>
              </td>
              <td class="py-2 px-2 text-center">
                <button class="text-[#d4b982] hover:text-[#b09660] transition-colors p-1 rounded-full hover:bg-[#d4b982]/10" title="View Details" (click)="viewDetails(tx)">
                  <mat-icon class="!text-sm">visibility</mat-icon>
                </button>
              </td>
            </tr>

          </tbody>
        </table>
        
        <!-- Empty State -->
        <div *ngIf="transactions().length === 0" class="text-center py-12">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3">
            <mat-icon class="text-slate-300">receipt_long</mat-icon>
          </div>
          <p class="text-slate-500 text-sm font-medium">No transactions found matching your criteria</p>
          <button (click)="clearFilters()" class="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            Clear Filters
          </button>
        </div>

        <div class="py-4 flex justify-between items-center text-xs text-slate-400 font-medium border-t border-slate-100 mt-2">
          <div>Showing {{ (currentPage - 1) * 20 + 1 }} - {{ (currentPage - 1) * 20 + transactions().length }} of {{ totalTransactions }}</div>
          <div class="flex items-center gap-1">
            <button [disabled]="currentPage === 1" (click)="prevPage()" class="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-50 text-slate-500">
              <mat-icon class="!text-sm">chevron_left</mat-icon>
            </button>
            <button [disabled]="transactions().length < 20" (click)="nextPage()" class="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-50 text-slate-500">
              <mat-icon class="!text-sm">chevron_right</mat-icon>
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    input[type="date"]::-webkit-calendar-picker-indicator {
      color: #94a3b8;
      opacity: 0.5;
      cursor: pointer;
    }
    input[type="date"]::-webkit-calendar-picker-indicator:hover {
      opacity: 0.8;
    }
  `]
})
export class AdminTransactionsComponent implements OnInit {
  hideKPIs = false;
  transactions = signal<any[]>([]);
  kpis = signal<any>({ total_revenue: 0, failed_payments: 0, pending_amount: 0, total_transactions: 0 });
  searchQuery = '';
  selectedStatus = ''; // empty means all
  fromDate = '';
  toDate = '';

  currentPage = 1;
  totalTransactions = 0;

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.hideKPIs = this.route.snapshot.data['hideKPIs'] || false;
    this.loadTransactions();
  }

  loadTransactions() {
    const statusQuery = this.selectedStatus === 'all' || this.selectedStatus === '' ? undefined : this.selectedStatus;
    const fromQuery = this.fromDate || undefined;
    const toQuery = this.toDate || undefined;
    const searchQuery = this.searchQuery || undefined;

    this.apiService.getAdminTransactions(this.currentPage, 20, searchQuery, statusQuery, fromQuery, toQuery).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.transactions.set(res.data);
          this.totalTransactions = res.meta?.total || 0;
          if (res.meta?.kpi) {
            this.kpis.set(res.meta.kpi);
          }
        }
      }
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadTransactions();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.fromDate = '';
    this.toDate = '';
    this.currentPage = 1;
    this.loadTransactions();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTransactions();
    }
  }

  nextPage() {
    this.currentPage++;
    this.loadTransactions();
  }

  viewDetails(tx: any) {
    if (tx.notes || tx.idempotency_key) {
      alert(`Transaction #${tx.id}\nNotes: ${tx.notes || 'None'}\nIdempotency Key: ${tx.idempotency_key || 'None'}`);
    }
  }

  exportReport() {
    // Generate simple CSV
    let csv = 'Transaction ID,Patient,Service,Amount,Status,Date\n';
    this.transactions().forEach(tx => {
      const pName = '"' + tx.customer_first_name + ' ' + tx.customer_last_name + '"';
      const sName = '"' + (tx.service_name || 'Generic Payment') + '"';
      const date = new Date(tx.created_at).toLocaleDateString();
      csv += (tx.fiserv_txn_id || tx.id) + ',' + pName + ',' + sName + ',' + tx.amount_jmd + ',' + tx.status + ',' + date + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  getPaymentType(method: string | null): string {
    if (!method) return 'Unknown';
    const m = method.toLowerCase();
    if (m === 'fiserv' || m === 'card' || m === 'online' || m.includes('stripe')) {
      return 'Online (Website)';
    }
    return 'In-Person';
  }
}
