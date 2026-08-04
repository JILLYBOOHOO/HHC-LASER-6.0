import os

file_path = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\shared\components\invoice-modal\invoice-modal.component.ts"

new_content = """import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-invoice-modal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h2 class="text-lg font-extrabold tracking-wide">Booking Summary</h2>
              <p class="text-[11px] text-slate-300 font-medium uppercase tracking-wider">Ref: #{{ eventData?.id?.substring(0,8) || 'N/A' }}</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6">
          <div class="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Billed To</p>
              <p class="text-sm font-extrabold text-slate-800">{{ eventData?.patient }}</p>
              <p class="text-xs font-medium text-slate-500 mt-0.5">{{ eventData?.data?.customer_phone || 'No Phone' }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Date & Time</p>
              <p class="text-sm font-extrabold text-slate-800">{{ eventData?.date }}</p>
              <p class="text-xs font-medium text-slate-500 mt-0.5">{{ eventData?.startTime }}</p>
            </div>
          </div>

          <div class="border border-slate-200 rounded-xl overflow-hidden">
            <div class="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-200">
              <span class="text-xs font-bold text-slate-600 uppercase tracking-wide">Service Detail</span>
              <span class="text-xs font-bold text-slate-600 uppercase tracking-wide">Amount</span>
            </div>
            <div class="p-4 flex justify-between items-start">
              <div>
                <p class="font-extrabold text-slate-800">{{ eventData?.title }}</p>
                <p class="text-xs text-slate-500 font-medium mt-1">{{ eventData?.durationMinutes }} Minutes • {{ eventData?.room || 'Standard Room' }}</p>
              </div>
              <p class="font-bold text-slate-800">{{ (eventData?.data?.service_price || 0) | currency:'JMD':'symbol':'1.2-2' }}</p>
            </div>
          </div>

          <div class="mt-6 flex justify-between items-end">
            <!-- Payment Status -->
            <div class="w-1/2 pr-4">
              <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Payment Status</p>
              <div class="inline-block px-3 py-1.5 rounded-lg text-sm font-bold"
                   [ngClass]="{
                     'bg-green-100 text-green-800': paymentStatus === 'paid_online' || paymentStatus === 'paid_in_store',
                     'bg-yellow-100 text-yellow-800': paymentStatus === 'unpaid' || paymentStatus === 'pending_payment'
                   }">
                {{ formatPaymentStatus(paymentStatus) }}
              </div>
              
              <div *ngIf="transactionId" class="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                TXN: {{ transactionId }}
              </div>
              
              <div *ngIf="isPending() && !showPaymentForm" class="mt-3">
                <button (click)="showPaymentForm = true" class="text-xs font-bold text-[#b8924f] hover:text-[#8c6225] flex items-center gap-1 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Confirm In-Store Payment
                </button>
              </div>

              <!-- Payment Form -->
              <div *ngIf="showPaymentForm" class="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label class="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">POS Transaction ID (Optional)</label>
                <input [(ngModel)]="formTxnId" type="text" placeholder="e.g. TXN-12345" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#b8924f] mb-2" />
                <div class="flex gap-2">
                  <button (click)="showPaymentForm = false" class="flex-1 px-3 py-1.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                  <button (click)="confirmPayment()" [disabled]="isSaving" class="flex-1 px-3 py-1.5 text-xs font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex justify-center items-center">
                    <span *ngIf="isSaving" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                    Confirm
                  </button>
                </div>
              </div>
            </div>

            <!-- Totals -->
            <div class="w-1/2 pl-4">
              <div class="flex justify-between items-center py-2 border-b border-slate-100">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Subtotal</span>
                <span class="text-sm font-bold text-slate-800">{{ (eventData?.data?.service_price || 0) | currency:'JMD':'symbol':'1.2-2' }}</span>
              </div>
              <div class="flex justify-between items-center py-3">
                <span class="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Total Due</span>
                <span class="text-lg font-black text-[#b8924f]">{{ (eventData?.data?.service_price || 0) | currency:'JMD':'symbol':'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button (click)="close.emit()" class="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">Close</button>
          <button class="px-5 py-2.5 rounded-lg text-sm font-bold bg-[#b8924f] text-white hover:bg-[#8c6225] transition-colors shadow-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print Summary
          </button>
        </div>
      </div>
    </div>
  `
})
export class InvoiceModalComponent implements OnInit {
  @Input() eventData: any;
  @Output() close = new EventEmitter<void>();
  @Output() paymentUpdated = new EventEmitter<void>();

  paymentStatus = 'unpaid';
  transactionId = '';
  
  showPaymentForm = false;
  formTxnId = '';
  isSaving = false;

  private http = inject(HttpClient);
  private authState = inject(AuthStateService);
  private snackBar = inject(MatSnackBar);

  ngOnInit() {
    this.paymentStatus = this.eventData?.data?.payment_status || 'unpaid';
    this.transactionId = this.eventData?.data?.transaction_id || '';
  }

  isPending() {
    return this.paymentStatus === 'unpaid' || this.paymentStatus === 'pending_payment';
  }

  formatPaymentStatus(status: string) {
    if (!status) return 'Balance Due';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  confirmPayment() {
    this.isSaving = true;
    
    const headers = { Authorization: `Bearer ${this.authState.token()}` };
    const payload = {
      payment_status: 'paid_in_store',
      transaction_id: this.formTxnId.trim()
    };
    
    this.http.patch(`${environment.apiUrl}/admin/bookings/${this.eventData.id}/payment`, payload, { headers }).subscribe({
      next: () => {
        this.isSaving = false;
        this.paymentStatus = 'paid_in_store';
        this.transactionId = this.formTxnId.trim();
        this.showPaymentForm = false;
        this.snackBar.open('In-store payment confirmed', 'Close', { duration: 3000, panelClass: ['bg-black', 'text-white'] });
        this.paymentUpdated.emit();
      },
      error: () => {
        this.isSaving = false;
        this.snackBar.open('Failed to update payment status', 'Close', { duration: 3000, panelClass: ['bg-black', 'text-white'] });
      }
    });
  }
}
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("InvoiceModalComponent updated successfully!")
