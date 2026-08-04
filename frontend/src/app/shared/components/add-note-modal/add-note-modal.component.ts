import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
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
