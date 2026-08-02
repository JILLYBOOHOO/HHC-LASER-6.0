import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthStateService } from '../../../core/store/auth-state.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="max-w-3xl mx-auto py-8 px-4">
      <h1 class="text-3xl font-heading text-white mb-2">My Profile</h1>
      <p class="text-charcoal-500 mb-8">Update your personal information.</p>
      
      <div class="card p-8">
        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName">
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName">
            </mat-form-field>
          </div>
          
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email Address</mat-label>
            <input matInput formControlName="email" type="email" readonly>
            <mat-hint>Contact support to change your email address.</mat-hint>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phone" type="tel">
          </mat-form-field>
          
          <div class="flex justify-end pt-4">
            <button type="submit" class="btn-primary" [disabled]="profileForm.invalid || profileForm.pristine">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CustomerProfileComponent {
  public authState = inject(AuthStateService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  profileForm: FormGroup;

  constructor() {
    const user = this.authState.user() as any;
    this.profileForm = this.fb.group({
      firstName: [user?.first_name || '', Validators.required],
      lastName: [user?.last_name || '', Validators.required],
      email: [user?.email || ''], // Readonly in template
      phone: [user?.phone || '']
    });
  }

  saveProfile() {
    if (this.profileForm.valid) {
      // Logic to update profile on backend would go here
      // For now we just show a success message
      this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
      this.profileForm.markAsPristine();
    }
  }
}
