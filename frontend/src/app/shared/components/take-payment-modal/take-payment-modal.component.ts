import { Component, Input, Output, EventEmitter, OnInit, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../../environments/environment';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { CalendarEvent } from '../weekly-calendar/weekly-calendar.component';

export interface PaymentLine {
  method: string;
  amount: number;
  notes?: string;
}

@Component({
  selector: 'app-take-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './take-payment-modal.component.html'
})
export class TakePaymentModalComponent implements OnInit {
  @Input() appointment!: CalendarEvent;
  @Output() close = new EventEmitter<void>();
  @Output() paymentSuccess = new EventEmitter<void>();

  step = signal<number>(1);
  loading = signal<boolean>(false);
  success = signal<boolean>(false);
  errorMessage = signal<string>('');

  paymentMethods = ['Cash', 'Card (POS)', 'Bank Transfer', 'Gift Card / Voucher', 'Other'];
  isSplitPayment = signal<boolean>(false);
  
  totalAmount = signal<number>(0);
  paidSoFar = signal<number>(0);
  
  payments = signal<PaymentLine[]>([]);

  currentMethod = signal<string>('');
  currentAmount = signal<number>(0);
  currentNotes = signal<string>('');

  remainingBalance = computed(() => {
    const sumOfNewPayments = this.payments().reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, this.totalAmount() - this.paidSoFar() - sumOfNewPayments);
  });

  constructor(private http: HttpClient, private authState: AuthStateService) {}

  ngOnInit() {
    this.totalAmount.set(Number(this.appointment?.data?.total_amount_jmd) || 0);
    this.paidSoFar.set(Number(this.appointment?.data?.total_paid) || 0);
    this.currentAmount.set(this.remainingBalance());
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (this.step() < 5 && !this.loading()) {
      this.closeModal();
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnterHandler(event: KeyboardEvent) {
    // Prevent enter from triggering if we are on a textarea or button
    if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'BUTTON') return;
    if (this.step() === 1 && (this.currentMethod() || this.isSplitPayment())) this.nextStep();
    else if (this.step() === 2 && this.currentAmount() > 0) this.nextStep();
    else if (this.step() === 3) this.nextStep();
    else if (this.step() === 4) this.recordPayment();
  }

  selectMethod(method: string) {
    this.isSplitPayment.set(false);
    this.currentMethod.set(method);
  }

  selectSplitPayment() {
    this.isSplitPayment.set(true);
    this.currentMethod.set('');
  }

  nextStep() {
    if (this.step() === 1) {
      if (!this.currentMethod() && !this.isSplitPayment()) {
        this.errorMessage.set('Please select a payment method.');
        return;
      }
      this.errorMessage.set('');
      if (this.isSplitPayment()) {
        // If split payment, jump to the split payment management step (which acts as a loop)
        this.step.set(5); // Step 5 is the Split Payment Hub
      } else {
        this.currentAmount.set(this.remainingBalance());
        this.step.set(2);
      }
    } else if (this.step() === 2) {
      if (this.currentAmount() <= 0) {
        this.errorMessage.set('Please enter a valid amount.');
        return;
      }
      this.errorMessage.set('');
      if (this.currentMethod() === 'Cash') {
        // Skip details for cash
        this.addCurrentPayment();
        this.step.set(4);
      } else {
        this.step.set(3);
      }
    } else if (this.step() === 3) {
      this.addCurrentPayment();
      this.step.set(4);
    }
  }

  prevStep() {
    this.errorMessage.set('');
    if (this.step() === 2) this.step.set(1);
    else if (this.step() === 3) this.step.set(2);
    else if (this.step() === 4) {
      if (this.isSplitPayment()) this.step.set(5);
      else {
        // Remove the single payment we added so we can edit
        this.payments.set([]);
        if (this.currentMethod() === 'Cash') this.step.set(2);
        else this.step.set(3);
      }
    }
    else if (this.step() === 5) this.step.set(1);
  }

  addCurrentPayment() {
    const p = this.payments();
    p.push({
      method: this.currentMethod(),
      amount: this.currentAmount(),
      notes: this.currentNotes()
    });
    this.payments.set(p);
  }

  // Split Payment Hub functions
  startSplitLine(method: string) {
    this.currentMethod.set(method);
    this.currentAmount.set(this.remainingBalance());
    this.currentNotes.set('');
    this.step.set(2); // Jump into the normal flow (Amount -> Details), but when it hits 4 it should know it's split...
    // Wait, the flow needs to return to step 5.
    // Let's adjust addCurrentPayment to return to step 5 if isSplitPayment is true.
  }

  overrideNextStepForSplit() {
    if (this.step() === 2) {
      if (this.currentMethod() === 'Cash') {
        this.addCurrentPayment();
        this.step.set(5); // back to hub
      } else {
        this.step.set(3);
      }
    } else if (this.step() === 3) {
      this.addCurrentPayment();
      this.step.set(5); // back to hub
    }
  }

  // Hook into nextStep to handle split correctly
  nextStepHandled() {
    if (this.isSplitPayment() && (this.step() === 2 || this.step() === 3)) {
      this.overrideNextStepForSplit();
    } else {
      this.nextStep();
    }
  }

  removePayment(index: number) {
    const p = this.payments();
    p.splice(index, 1);
    this.payments.set(p);
  }

  recordPayment() {
    if (this.payments().length === 0) return;
    this.loading.set(true);
    this.errorMessage.set('');

    const headers = { Authorization: `Bearer ${this.authState.token()}` };
    const payload = { payments: this.payments().map(p => ({ amount: p.amount, payment_method: p.method.toLowerCase().replace(/[^a-z0-9]/g, '_'), notes: p.notes })) };

    this.http.post(`${environment.apiUrl}/admin/bookings/${this.appointment.id}/record-payment`, payload, { headers })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
          setTimeout(() => {
            this.paymentSuccess.emit();
          }, 2000);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to record payment.');
        }
      });
  }

  closeModal() {
    this.close.emit();
  }

  getInitials(name: string) {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C';
  }
}
