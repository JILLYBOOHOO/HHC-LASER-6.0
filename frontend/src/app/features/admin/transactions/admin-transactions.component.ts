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
            <h1 class="text-3xl font-serif text-slate-900 tracking-tight">Transactions & Financial Log</h1>
            <span class="text-slate-400 font-light">|</span>
            <span class="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Location: All Clinics</span>
          </div>
          <p class="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
            Track all payments processed online through the website and paid at location in person.
          </p>
        </div>
        <button *ngIf="!hideKPIs" (click)="exportReport()" class="px-5 py-2.5 bg-[#B36A17] hover:bg-[#965713] text-white font-bold text-[10px] uppercase tracking-wider rounded shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto">
          <mat-icon class="!text-sm">download</mat-icon>
          <span>Export Financial Report</span>
        </button>
      </div>

      <!-- 4 Stat Cards Row (Hidden for staff) -->
      <div *ngIf="!hideKPIs" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Total Revenue -->
        <div class="p-4 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm rounded-xl flex flex-col justify-between relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100">Total Revenue</div>
            <div class="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center">
              <mat-icon class="!text-base text-emerald-100">account_balance_wallet</mat-icon>
            </div>
          </div>
          <div>
            <div class="text-2xl font-black mt-2 tracking-tight">{{ kpis().total_revenue | currency:'JMD':'symbol':'1.0-0' }}</div>
            <div class="text-[9px] font-bold uppercase tracking-wider text-emerald-100/80 flex items-center gap-1 mt-1">
              <mat-icon class="!text-[12px] !w-3 !h-3">trending_up</mat-icon>
              <span>Verified completed payments</span>
            </div>
          </div>
        </div>

        <!-- Paid Online (Website) -->
        <div class="p-4 bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-sm rounded-xl flex flex-col justify-between relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div class="text-[10px] font-extrabold uppercase tracking-wider text-indigo-100">Paid Online (Website)</div>
            <div class="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center">
              <mat-icon class="!text-base text-indigo-100">language</mat-icon>
            </div>
          </div>
          <div>
            <div class="text-2xl font-black mt-2 tracking-tight">{{ onlineTotal() | currency:'JMD':'symbol':'1.0-0' }}</div>
            <div class="text-[9px] font-bold uppercase tracking-wider text-indigo-100/80 flex items-center gap-1 mt-1">
              <mat-icon class="!text-[12px] !w-3 !h-3">credit_card</mat-icon>
              <span>Website booking deposits</span>
            </div>
          </div>
        </div>

        <!-- Paid at Location (In-Person) -->
        <div class="p-4 bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-sm rounded-xl flex flex-col justify-between relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div class="text-[10px] font-extrabold uppercase tracking-wider text-amber-100">Paid at Location</div>
            <div class="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center">
              <mat-icon class="!text-base text-amber-100">storefront</mat-icon>
            </div>
          </div>
          <div>
            <div class="text-2xl font-black mt-2 tracking-tight">{{ inPersonTotal() | currency:'JMD':'symbol':'1.0-0' }}</div>
            <div class="text-[9px] font-bold uppercase tracking-wider text-amber-100/80 flex items-center gap-1 mt-1">
              <mat-icon class="!text-[12px] !w-3 !h-3">payments</mat-icon>
              <span>In-store / took payment</span>
            </div>
          </div>
        </div>

        <!-- Total Transactions -->
        <div class="p-4 bg-slate-900 text-white shadow-sm rounded-xl flex flex-col justify-between relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Total Records</div>
            <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <mat-icon class="!text-base text-slate-300">receipt_long</mat-icon>
            </div>
          </div>
          <div>
            <div class="text-2xl font-black mt-2 tracking-tight">{{ kpis().total_transactions | number }}</div>
            <div class="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mt-1">
              <mat-icon class="!text-[12px] !w-3 !h-3">fact_check</mat-icon>
              <span>All payment channels</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Filter Controls Bar -->
      <div class="pt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div class="flex flex-row flex-wrap items-end gap-3">
          
          <div class="w-full sm:w-48">
            <label class="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Search Patient / Ref</label>
            <div class="relative">
              <input type="text"
                     [(ngModel)]="searchQuery"
                     (keyup.enter)="applyFilters()"
                     placeholder="Name, Email, or Ref #..."
                     class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-slate-800 text-slate-900">
            </div>
          </div>

          <div class="w-48">
            <label class="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Payment Method / Channel</label>
            <select [(ngModel)]="selectedChannel" (change)="applyFilters()" class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900 focus:outline-none">
              <option value="all">All Channels (Online + Location)</option>
              <option value="online">🌐 Paid Online (Website)</option>
              <option value="location">🏥 Paid at Location (In-Person)</option>
            </select>
          </div>

          <div class="w-32">
            <label class="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Status</label>
            <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900 focus:outline-none">
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div class="w-32">
            <label class="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">From</label>
            <input type="date" [(ngModel)]="fromDate" class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-bold focus:outline-none">
          </div>

          <div class="w-32">
            <label class="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">To</label>
            <input type="date" [(ngModel)]="toDate" class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-bold focus:outline-none">
          </div>

          <div class="flex items-center gap-2 mb-[1px]">
            <button (click)="applyFilters()" class="px-4 py-2 bg-black hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-wider rounded-lg transition-colors shadow-xs">
              Apply
            </button>
            <button (click)="clearFilters()" class="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-black text-[10px] uppercase tracking-wider rounded-lg transition-colors">
              Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Data Table Card -->
      <div class="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
        <table class="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <th class="py-3 px-4 font-black">Ref / Txn ID</th>
              <th class="py-3 px-4 font-black">Patient Name</th>
              <th class="py-3 px-4 font-black">Service Details</th>
              <th class="py-3 px-4 font-black">Payment Channel</th>
              <th class="py-3 px-4 font-black">Amount</th>
              <th class="py-3 px-4 font-black">Status</th>
              <th class="py-3 px-4 font-black">Date & Time</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs font-bold text-slate-800">
            
            <tr *ngFor="let tx of filteredTransactions()" class="hover:bg-slate-50/80 transition-colors">
              <td class="py-3 px-4 font-mono font-black text-slate-900">
                #{{ tx.fiserv_txn_id || tx.idempotency_key?.slice(0,8) || tx.id }}
              </td>
              <td class="py-3 px-4">
                <div class="font-black text-slate-900 text-sm">{{ tx.customer_first_name }} {{ tx.customer_last_name }}</div>
                <div class="text-[10px] text-slate-400 font-semibold">{{ tx.customer_email || 'Walk-in / In Clinic' }}</div>
              </td>
              <td class="py-3 px-4">
                <div class="font-extrabold text-slate-800">{{ tx.service_name || 'Clinic Treatment' }}</div>
                <div *ngIf="tx.notes" class="text-[10px] text-slate-500 italic mt-0.5">{{ tx.notes }}</div>
              </td>
              <td class="py-3 px-4">
                <span *ngIf="isOnlinePayment(tx.payment_method)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  🌐 Paid Online (Website)
                </span>
                <span *ngIf="!isOnlinePayment(tx.payment_method)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  🏥 Paid at Location (In Person)
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="font-black text-slate-900 text-sm">JMD {{ (tx.amount_jmd || 0) | number:'1.0-0' }}</span>
              </td>
              <td class="py-3 px-4">
                <span *ngIf="tx.status === 'completed'" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  <mat-icon class="!text-[12px] !w-3 !h-3">check_circle</mat-icon> Completed
                </span>
                <span *ngIf="tx.status === 'failed'" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider">
                  <mat-icon class="!text-[12px] !w-3 !h-3">cancel</mat-icon> Failed
                </span>
                <span *ngIf="tx.status === 'pending'" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                  <mat-icon class="!text-[12px] !w-3 !h-3">hourglass_empty</mat-icon> Pending
                </span>
              </td>
              <td class="py-3 px-4 text-slate-500 whitespace-nowrap">
                {{ tx.created_at | date:'MMM d, y, h:mm a' }}
              </td>
            </tr>

            <tr *ngIf="filteredTransactions().length === 0">
              <td colspan="7" class="text-center py-12 text-slate-400">
                <mat-icon class="!text-4xl text-slate-300 block mx-auto mb-2">receipt_long</mat-icon>
                <p class="text-sm font-bold">No transactions found matching your selected filters.</p>
                <button (click)="clearFilters()" class="mt-3 px-4 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  Reset Filters
                </button>
              </td>
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  `
})
export class AdminTransactionsComponent implements OnInit {
  hideKPIs = false;
  transactions = signal<any[]>([]);
  kpis = signal<any>({ total_revenue: 0, failed_payments: 0, pending_amount: 0, total_transactions: 0 });
  
  onlineTotal = signal<number>(0);
  inPersonTotal = signal<number>(0);

  searchQuery = '';
  selectedChannel = 'all';
  selectedStatus = 'all';
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

    this.apiService.getAdminTransactions(this.currentPage, 50, searchQuery, statusQuery, fromQuery, toQuery).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.transactions.set(res.data);
          this.totalTransactions = res.meta?.total || res.data.length;
          
          if (res.meta?.kpis) {
            this.kpis.set(res.meta.kpis);
          } else {
            const rev = res.data.filter((t: any) => t.status === 'completed').reduce((sum: number, t: any) => sum + Number(t.amount_jmd || 0), 0);
            this.kpis.set({
              total_revenue: rev,
              total_transactions: res.data.length
            });
          }

          // Calculate Online vs In-Person breakdown totals
          let onlineSum = 0;
          let inPersonSum = 0;
          res.data.forEach((t: any) => {
            if (t.status === 'completed') {
              if (this.isOnlinePayment(t.payment_method)) {
                onlineSum += Number(t.amount_jmd || 0);
              } else {
                inPersonSum += Number(t.amount_jmd || 0);
              }
            }
          });
          this.onlineTotal.set(onlineSum);
          this.inPersonTotal.set(inPersonSum);
        }
      }
    });
  }

  filteredTransactions(): any[] {
    return this.transactions().filter(tx => {
      const isOnline = this.isOnlinePayment(tx.payment_method);
      if (this.selectedChannel === 'online' && !isOnline) return false;
      if (this.selectedChannel === 'location' && isOnline) return false;
      return true;
    });
  }

  isOnlinePayment(method: string | null): boolean {
    if (!method) return false;
    const m = method.toLowerCase();
    return m.includes('online') || m.includes('fiserv') || m.includes('card') || m.includes('website') || m.includes('hpp') || m.includes('stripe');
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadTransactions();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedChannel = 'all';
    this.selectedStatus = 'all';
    this.fromDate = '';
    this.toDate = '';
    this.currentPage = 1;
    this.loadTransactions();
  }

  exportReport() {
    let csv = 'Transaction ID,Patient,Service,Channel,Amount JMD,Status,Date\n';
    this.filteredTransactions().forEach(tx => {
      const pName = '"' + (tx.customer_first_name || '') + ' ' + (tx.customer_last_name || '') + '"';
      const sName = '"' + (tx.service_name || 'Clinic Service') + '"';
      const channel = this.isOnlinePayment(tx.payment_method) ? 'Paid Online (Website)' : 'Paid at Location (In Person)';
      const date = new Date(tx.created_at).toLocaleString();
      csv += (tx.fiserv_txn_id || tx.id) + ',' + pName + ',' + sName + ',' + channel + ',' + tx.amount_jmd + ',' + tx.status + ',' + date + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hhc_laser_transactions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
