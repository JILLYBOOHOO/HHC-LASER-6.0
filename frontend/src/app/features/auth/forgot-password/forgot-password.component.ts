import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12"
         style="background: linear-gradient(135deg, #111111 0%, #1a1a1a 60%, #0d0d0d 100%)">
      <div class="fixed inset-0 pointer-events-none"
           style="background-image: radial-gradient(circle, rgba(201,169,110,0.05) 1px, transparent 1px); background-size: 40px 40px;">
      </div>

      <div class="relative w-full max-w-md animate-fade-up">
        <div class="text-center mb-10">
          <a routerLink="/" class="inline-block">
            <div class="font-heading text-4xl text-black mb-1">HHC LASER</div>
            <div class="text-gold-500 text-xs tracking-widest uppercase">Jamaica's Premier MedSpa</div>
          </a>
        </div>

        <div class="glass rounded-2xl p-8 md:p-10">
          <h2 class="text-black text-2xl font-heading font-light mb-2">Forgot Password?</h2>
          <p class="text-neutral-600 text-sm mb-8">Enter your email address and we will send you a link to reset your password.</p>

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <mat-form-field appearance="outline" class="w-full form-field-dark">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" name="email" placeholder="your@email.com">
              <mat-icon matPrefix class="text-gold-500 !text-sm mr-2">email</mat-icon>
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <mat-error>Please enter a valid email address.</mat-error>
              }
            </mat-form-field>

            <button type="submit" class="btn-primary w-full text-base py-3" [disabled]="isLoading() || form.invalid">
              @if (isLoading()) {
                <mat-spinner diameter="20" color="warn"></mat-spinner>
              } @else {
                Send Reset Link
              }
            </button>
          </form>

          <div class="mt-8 text-center border-t border-black/10 pt-6">
            <a routerLink="/auth/login" class="text-gold-400 hover:text-gold-300 font-medium transition-colors flex items-center justify-center gap-1">
              <mat-icon class="!text-sm">arrow_back</mat-icon> Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .form-field-dark .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__leading,
    ::ng-deep .form-field-dark .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__notch,
    ::ng-deep .form-field-dark .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__trailing {
      border-color: rgba(0,0,0,0.15) !important;
    }
    ::ng-deep .mat-mdc-form-field label { color: rgba(248,245,240,0.6); }
    ::ng-deep .mat-mdc-form-field input { color: white; }
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #c9a96e !important;
    }
  `]
})
export class ForgotPasswordComponent {
  form: FormGroup;
  isLoading = signal(false);

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    // Simulate API call
    setTimeout(() => {
      this.isLoading.set(false);
      this.snackBar.open('If an account exists, a reset link will be sent to your email.', 'Close', { duration: 5000 });
      this.form.reset();
    }, 1500);
  }
}
