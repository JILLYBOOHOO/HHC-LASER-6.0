import os
import re

file_path = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\features\admin\transactions\admin-transactions.component.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_content = """import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-8 max-w-7xl mx-auto space-y-8 font-sans bg-white min-h-screen">
      
      <!-- Top Header & Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-3xl font-serif text-slate-900 tracking-tight">Transactions</h1>
            <span class="text-slate-400 font-light">|</span>
            <span class="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Location: Constant Spring Road</span>
          </div>
          <p class="text-xs text-slate-500 mt-2 max-w-md leading-relaxed">
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
        <div class="p-6 bg-[#4CA771] text-white shadow-sm flex flex-col justify-between relative overflow-hidden h-[140px]">
          <div class="flex justify-between items-start">
            <div class="text-[10px] font-bold uppercase tracking-wider opacity-90">Total Revenue</div>
            <div class="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
              <mat-icon class="!text-sm">account_balance_wallet</mat-icon>
            </div>
          </div>
          <div>
            <div class="text-3xl font-bold mt-2 tracking-tight">$2,516,120.00</div>
            <div class="text-[9px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1 mt-1">
              <mat-icon class="!text-[12px] !w-3 !h-3">trending_up</mat-icon>
              <span>All time</span>
            </div>
          </div>
        </div>

        <!-- Pending Amount -->
        <div class="p-6 bg-[#D8C7AB] text-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden h-[140px]">
          <div class="flex justify-between items-start">
            <div class="text-[10px] font-bold uppercase tracking-wider opacity-90">Pending Amount</div>
            <div class="w-8 h-8 rounded bg-white/40 flex items-center justify-center">
              <mat-icon class="!text-sm">schedule</mat-icon>
            </div>
          </div>
          <div>
            <div class="text-3xl font-bold mt-2 tracking-tight">$197,000.00</div>
            <div class="text-[9px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1 mt-1">
              <mat-icon class="!text-[12px] !w-3 !h-3">hourglass_empty</mat-icon>
              <span>Awaiting payment</span>
            </div>
          </div>
        </div>

        <!-- Failed Transactions -->
        <div class="p-6 bg-[#E85C71] text-white shadow-sm flex flex-col justify-between relative overflow-hidden h-[140px]">
          <div class="flex justify-between items-start">
            <div class="text-[10px] font-bold uppercase tracking-wider opacity-90">Failed Transactions</div>
            <div class="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
              <mat-icon class="!text-sm">cancel</mat-icon>
            </div>
          </div>
          <div>
            <div class="text-3xl font-bold mt-2 tracking-tight">66</div>
            <div class="text-[9px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1 mt-1">
              <mat-icon class="!text-[12px] !w-3 !h-3">warning</mat-icon>
              <span>Requires attention</span>
            </div>
          </div>
        </div>

        <!-- Total Transactions -->
        <div class="p-6 bg-[#333333] text-white shadow-sm flex flex-col justify-between relative overflow-hidden h-[140px]">
          <div class="flex justify-between items-start">
            <div class="text-[10px] font-bold uppercase tracking-wider opacity-90">Total Transactions</div>
            <div class="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
              <mat-icon class="!text-sm">receipt_long</mat-icon>
            </div>
          </div>
          <div>
            <div class="text-3xl font-bold mt-2 tracking-tight">411</div>
            <div class="text-[9px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1 mt-1">
              <mat-icon class="!text-[12px] !w-3 !h-3">fact_check</mat-icon>
              <span>All payments</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Filter Controls Bar -->
      <div class="space-y-4 pt-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          
          <div class="md:col-span-2">
            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Search</label>
            <div class="relative">
              <input type="text"
                     [(ngModel)]="searchQuery"
                     placeholder="Search transactions..."
                     class="w-full px-4 py-2 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-slate-400 text-slate-700">
            </div>
          </div>

          <div>
            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Payment Status</label>
            <select [(ngModel)]="selectedStatus" class="w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none">
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">From Date</label>
            <div class="relative">
              <input type="date" [(ngModel)]="fromDate" class="w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none">
            </div>
          </div>

          <div>
            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">To Date</label>
            <div class="relative">
              <input type="date" [(ngModel)]="toDate" class="w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none">
            </div>
          </div>

        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button (click)="applyFilters()" class="px-6 py-2 bg-[#d4b982] hover:bg-[#c2a66b] text-white font-bold text-[10px] uppercase tracking-wider rounded transition-colors">
            Apply
          </button>
          <button (click)="clearFilters()" class="px-6 py-2 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 font-bold text-[10px] uppercase tracking-wider rounded transition-colors">
            Clear
          </button>
        </div>
      </div>

      <!-- Data Table Card -->
      <div class="overflow-x-auto border-t border-slate-100 pt-6">
        <table class="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr class="border-b-2 border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <th class="py-3 px-2 font-bold">Transaction ID</th>
              <th class="py-3 px-2 font-bold">Patient</th>
              <th class="py-3 px-2 font-bold">Service</th>
              <th class="py-3 px-2 font-bold">Amount</th>
              <th class="py-3 px-2 font-bold">Status</th>
              <th class="py-3 px-2 font-bold">Date</th>
              <th class="py-3 px-2 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            
            <tr *ngFor="let tx of filteredTransactions()" class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
              <td class="py-4 px-2">
                <span class="text-xs font-bold text-slate-700">#{{ tx.id }}</span>
              </td>
              <td class="py-4 px-2">
                <div class="text-xs font-semibold text-slate-800">{{ tx.patientName }}</div>
                <div class="text-[10px] text-slate-400">{{ tx.patientEmail }}</div>
              </td>
              <td class="py-4 px-2">
                <div class="text-xs text-slate-700">{{ tx.serviceName }}</div>
                <div class="text-[10px] text-[#a496db] bg-indigo-50 inline-block px-1 rounded">{{ tx.location }}</div>
              </td>
              <td class="py-4 px-2">
                <span class="text-xs font-bold text-slate-700">{{ tx.amount | currency:'USD':'symbol':'1.2-2' }}</span>
              </td>
              <td class="py-4 px-2">
                <span *ngIf="tx.status === 'completed'" class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#e8f6ef] text-[#4ca771] text-[9px] font-bold uppercase tracking-wider border border-[#bde4ce]">
                  <mat-icon class="!text-[12px] !w-3 !h-3">check_circle_outline</mat-icon> Completed
                </span>
                <span *ngIf="tx.status === 'expired'" class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 text-slate-500 text-[9px] font-bold uppercase tracking-wider border border-slate-200">
                  <mat-icon class="!text-[12px] !w-3 !h-3">schedule</mat-icon> Expired
                </span>
                <span *ngIf="tx.status === 'pending'" class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-orange-50 text-orange-500 text-[9px] font-bold uppercase tracking-wider border border-orange-200">
                  <mat-icon class="!text-[12px] !w-3 !h-3">hourglass_empty</mat-icon> Pending
                </span>
              </td>
              <td class="py-4 px-2">
                <span class="text-xs text-slate-500">{{ tx.date | date:'M/d/yyyy' }}</span>
              </td>
              <td class="py-4 px-2 text-center">
                <button class="text-[#d4b982] hover:text-[#b09660] transition-colors p-1 rounded-full hover:bg-[#d4b982]/10" title="View Details">
                  <mat-icon class="!text-sm">visibility</mat-icon>
                </button>
              </td>
            </tr>

          </tbody>
        </table>
        
        <!-- Empty State -->
        <div *ngIf="filteredTransactions().length === 0" class="text-center py-12">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3">
            <mat-icon class="text-slate-300">receipt_long</mat-icon>
          </div>
          <p class="text-slate-500 text-sm font-medium">No transactions found matching your criteria</p>
          <button (click)="clearFilters()" class="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            Clear Filters
          </button>
        </div>

        <div class="py-4 flex justify-between items-center text-xs text-slate-400 font-medium border-t border-slate-100 mt-2">
          <div>Showing 1-{{ filteredTransactions().length }} of 411</div>
          <div class="flex items-center gap-1">
            <button class="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-50 text-slate-500">
              <mat-icon class="!text-sm">chevron_left</mat-icon>
            </button>
            <button class="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-50 text-slate-500">
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
  searchQuery = '';
  selectedStatus = 'all';
  fromDate = '';
  toDate = '';

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.hideKPIs = this.route.snapshot.data['hideKPIs'] || false;
    this.loadTransactions();
  }

  loadTransactions() {
    // Mock data matching the screenshot
    this.transactions.set([
      { id: '5346688759', patientName: 'Khadene Chatrie', patientEmail: 'khadenechatrie@gmail.com', serviceName: 'Pubic, Armpit and Brazilian (S...', location: 'Constant Spring Road Clinic', amount: 16000, status: 'completed', date: new Date('2026-07-30') },
      { id: 'TXN-1552', patientName: 'Keelie-Ann Brown', patientEmail: 'keelieannbrown8@gmail.com', serviceName: 'Brazilian Only', location: 'Constant Spring Road Clinic', amount: 12000, status: 'expired', date: new Date('2026-07-29') },
      { id: 'TXN-1551', patientName: 'Kiana Shim', patientEmail: 'kianashim03@gmail.com', serviceName: 'Brazilian Only', location: 'Constant Spring Road Clinic', amount: 12000, status: 'expired', date: new Date('2026-07-28') },
      { id: '5340369271', patientName: 'Kandice Francis', patientEmail: 'kandicefrancis@yahoo.com', serviceName: 'Pubic, Armpit and Brazilian (S...', location: 'Constant Spring Road Clinic', amount: 16000, status: 'completed', date: new Date('2026-07-28') },
      { id: 'TXN-1544', patientName: 'Khadene Chatrie', patientEmail: 'khadenechatrie@gmail.com', serviceName: 'Pubic, Armpit and Brazilian (S...', location: 'Constant Spring Road Clinic', amount: 16000, status: 'expired', date: new Date('2026-07-28') },
    ]);
  }

  filteredTransactions() {
    let result = this.transactions();

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(t => 
        t.patientName.toLowerCase().includes(q) || 
        t.id.toLowerCase().includes(q) ||
        t.patientEmail.toLowerCase().includes(q)
      );
    }

    if (this.selectedStatus !== 'all') {
      result = result.filter(t => t.status === this.selectedStatus);
    }

    return result;
  }

  applyFilters() {
    // Already reactive via filteredTransactions()
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedStatus = 'all';
    this.fromDate = '';
    this.toDate = '';
  }

  exportReport() {
    console.log('Exporting report...');
  }
}
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)
