import os

base_path = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\shared\components"

# --- Add Note Modal ---
add_note_dir = os.path.join(base_path, "add-note-modal")
os.makedirs(add_note_dir, exist_ok=True)

add_note_ts = """import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-note-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 class="text-lg font-extrabold text-slate-800">Add Note</h2>
            <p class="text-xs text-slate-500 font-medium">For {{ patientName }}</p>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-700 bg-white shadow-sm p-1.5 rounded-lg border border-slate-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6">
          <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Treatment Note</label>
          <textarea [(ngModel)]="noteText" rows="5" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-[#b8924f] focus:ring-1 focus:ring-[#b8924f] transition-all resize-none placeholder-slate-400" placeholder="Type your notes here..."></textarea>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button (click)="close.emit()" class="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
          <button (click)="saveNote()" [disabled]="isSaving || !noteText.trim()" class="px-5 py-2.5 rounded-lg text-sm font-bold bg-slate-900 text-white hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <span *ngIf="isSaving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Save Note
          </button>
        </div>
      </div>
    </div>
  `
})
export class AddNoteModalComponent {
  @Input() bookingId!: string;
  @Input() patientName!: string;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  noteText = '';
  isSaving = false;

  private http = inject(HttpClient);
  private authState = inject(AuthStateService);
  private snackBar = inject(MatSnackBar);

  saveNote() {
    if (!this.noteText.trim()) return;
    this.isSaving = true;
    
    const headers = { Authorization: `Bearer ${this.authState.token()}` };
    this.http.post(`${environment.apiUrl}/admin/bookings/${this.bookingId}/notes`, { note: this.noteText }, { headers }).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open('Note saved successfully', 'Close', { duration: 3000, panelClass: ['bg-black', 'text-white', 'text-lg', 'p-4'] });
        this.saved.emit();
      },
      error: () => {
        this.isSaving = false;
        this.snackBar.open('Failed to save note', 'Close', { duration: 3000 });
      }
    });
  }
}
"""
with open(os.path.join(add_note_dir, "add-note-modal.component.ts"), "w", encoding="utf-8") as f:
    f.write(add_note_ts)


# --- Invoice Modal ---
invoice_dir = os.path.join(base_path, "invoice-modal")
os.makedirs(invoice_dir, exist_ok=True)

invoice_ts = """import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-invoice-modal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
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

          <div class="mt-6 flex justify-end">
            <div class="w-1/2">
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
export class InvoiceModalComponent {
  @Input() eventData: any;
  @Output() close = new EventEmitter<void>();
}
"""
with open(os.path.join(invoice_dir, "invoice-modal.component.ts"), "w", encoding="utf-8") as f:
    f.write(invoice_ts)

print("Modals generated successfully!")
