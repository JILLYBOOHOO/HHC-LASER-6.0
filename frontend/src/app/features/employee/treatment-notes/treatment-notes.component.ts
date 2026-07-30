import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-treatment-notes',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatSliderModule
  ],
  template: `
    <div class="p-4 md:p-8 max-w-4xl mx-auto">
      
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button mat-icon-button (click)="goBack()" class="bg-white border border-cream-200 shadow-sm">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="text-2xl font-heading text-charcoal-800">Treatment Notes</h1>
          <p class="text-charcoal-500">Appointment #{{ appointmentId }} | Client: Olivia Rhoden</p>
        </div>
      </div>

      <div class="card p-6 md:p-8">
        <form [formGroup]="notesForm" (ngSubmit)="onSubmit()" class="space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Treatment Provided</mat-label>
              <input matInput formControlName="treatment" readonly>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Skin Type / Condition</mat-label>
              <mat-select formControlName="skinType">
                <mat-option value="normal">Normal</mat-option>
                <mat-option value="dry">Dry</mat-option>
                <mat-option value="oily">Oily</mat-option>
                <mat-option value="combination">Combination</mat-option>
                <mat-option value="sensitive">Sensitive</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div>
            <label class="block text-sm font-medium text-charcoal-700 mb-2">Pain Level / Discomfort (0-10)</label>
            <div class="flex items-center gap-4">
              <span class="text-sm font-bold w-4 text-center">{{ notesForm.get('painLevel')?.value }}</span>
              <mat-slider min="0" max="10" step="1" discrete class="flex-1">
                <input matSliderThumb formControlName="painLevel">
              </mat-slider>
            </div>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Clinical Observations</mat-label>
            <textarea matInput rows="4" formControlName="observations" placeholder="E.g., Mild erythema observed post-treatment..."></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Post-Treatment Instructions Provided</mat-label>
            <textarea matInput rows="3" formControlName="instructions" placeholder="E.g., Advised to avoid sun exposure for 48 hours..."></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Internal Notes (Not visible to client)</mat-label>
            <textarea matInput rows="2" formControlName="internalNotes"></textarea>
          </mat-form-field>

          <div class="flex justify-end gap-4 pt-4 border-t border-cream-200">
            <button type="button" class="btn-secondary" (click)="goBack()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="notesForm.invalid">Save Notes</button>
          </div>

        </form>
      </div>

    </div>
  `
})
export class TreatmentNotesComponent {
  notesForm: FormGroup;
  appointmentId: string | null = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.appointmentId = this.route.snapshot.paramMap.get('appointmentId');
    
    this.notesForm = this.fb.group({
      treatment: ['Laser Hair Removal - Full Legs'],
      skinType: ['normal'],
      painLevel: [2],
      observations: ['', Validators.required],
      instructions: [''],
      internalNotes: ['']
    });
  }

  goBack() {
    this.location.back();
  }

  onSubmit() {
    if (this.notesForm.valid) {
      alert('Treatment notes saved successfully! (Demo)');
      this.goBack();
    }
  }
}
