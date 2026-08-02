import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookingDraft } from '../../../core/models/models';
import { DraftService } from '../../../core/services/draft.service';

/** Step label map for human-readable display */
const STEP_LABELS: Record<string, string> = {
  'select-service':  'Selecting services',
  'choose-employee': 'Choosing a specialist',
  'choose-date':     'Picking a date',
  'choose-time':     'Choosing a time',
  'enter-info':      'Entering your details',
  'review':          'Reviewing your booking',
};

@Component({
  selector: 'app-resume-draft-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="resume-dialog-wrapper">

      <!-- Header -->
      <div class="resume-dialog-header">
        <div class="resume-icon-wrap">
          <mat-icon class="resume-icon">bookmark_added</mat-icon>
        </div>
        <button mat-icon-button (click)="dismiss()" class="close-btn" aria-label="Dismiss">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Body -->
      <mat-dialog-content class="resume-dialog-body">
        <h2 class="resume-title">You left off mid-booking</h2>
        <p class="resume-subtitle">
          You were <strong>{{ stepLabel }}</strong> when you left. Pick up right where you stopped!
        </p>

        <div class="resume-summary" *ngIf="hasDetails">
          <div class="summary-row" *ngIf="data.draft.service_ids?.length">
            <mat-icon class="summary-icon">spa</mat-icon>
            <span>{{ data.draft.service_ids.length }} service{{ data.draft.service_ids.length > 1 ? 's' : '' }} selected</span>
          </div>
          <div class="summary-row" *ngIf="data.draft.scheduled_date">
            <mat-icon class="summary-icon">event</mat-icon>
            <span>{{ data.draft.scheduled_date | date:'mediumDate' }}</span>
          </div>
          <div class="summary-row" *ngIf="data.draft.start_time">
            <mat-icon class="summary-icon">schedule</mat-icon>
            <span>{{ data.draft.start_time }}</span>
          </div>
        </div>
      </mat-dialog-content>

      <!-- Actions -->
      <mat-dialog-actions class="resume-dialog-actions">
        <button mat-stroked-button class="btn-dismiss" (click)="dismiss()">
          Start fresh
        </button>
        <button mat-flat-button class="btn-resume" (click)="resume()">
          <mat-icon>arrow_forward</mat-icon>
          Resume booking
        </button>
      </mat-dialog-actions>

    </div>
  `,
  styles: [`
    .resume-dialog-wrapper {
      background: var(--color-cream, #faf8f5);
      border-radius: 16px;
      overflow: hidden;
      min-width: 360px;
      max-width: 440px;
    }

    .resume-dialog-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 24px 20px 0;
    }

    .resume-icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c6a047, #e8c96a);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .resume-icon {
      color: #1a1a1a;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .close-btn {
      color: #888;
    }

    .resume-dialog-body {
      padding: 16px 24px 8px !important;
    }

    .resume-title {
      font-family: var(--font-heading, 'Cormorant Garamond', serif);
      font-size: 1.6rem;
      color: #1a1a1a;
      margin: 12px 0 8px;
      line-height: 1.2;
    }

    .resume-subtitle {
      color: #555;
      font-size: 0.92rem;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .resume-summary {
      background: #fff;
      border: 1px solid #e8dfc8;
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .summary-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.88rem;
      color: #444;
    }

    .summary-icon {
      font-size: 17px;
      width: 17px;
      height: 17px;
      color: #c6a047;
    }

    .resume-dialog-actions {
      padding: 16px 24px 24px !important;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn-dismiss {
      border-color: #ccc !important;
      color: #555 !important;
      border-radius: 8px !important;
    }

    .btn-resume {
      background: linear-gradient(135deg, #c6a047, #e8c96a) !important;
      color: #1a1a1a !important;
      font-weight: 600 !important;
      border-radius: 8px !important;
      gap: 4px;
    }

    .btn-resume mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class ResumeDraftDialogComponent {
  get stepLabel(): string {
    return STEP_LABELS[this.data.draft.current_step] ?? this.data.draft.current_step;
  }

  get hasDetails(): boolean {
    const d = this.data.draft;
    return !!(d.service_ids?.length || d.scheduled_date || d.start_time);
  }

  constructor(
    public dialogRef: MatDialogRef<ResumeDraftDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { draft: BookingDraft },
    private draftService: DraftService,
    private router: Router,
  ) {}

  resume(): void {
    this.dialogRef.close('resume');
    this.router.navigate(['/customer/book']);
  }

  dismiss(): void {
    this.draftService.dismissPrompt().subscribe();
    this.dialogRef.close('dismiss');
  }
}
