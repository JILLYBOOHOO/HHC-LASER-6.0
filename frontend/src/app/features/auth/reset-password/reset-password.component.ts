import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  if (!password || !confirm) return null;
  return password === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-white">
      <div class="fixed inset-0 pointer-events-none opacity-40"
           style="background-image: radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px); background-size: 40px 40px;">
      </div>

      <div class="relative w-full max-w-md animate-fade-up">
        <div class="text-center mb-10">
          <a routerLink="/" class="inline-block">
            <div class="font-heading text-4xl text-neutral-900 mb-1">HHC LASER</div>
            <div class="text-neutral-700 text-xs tracking-widest uppercase font-semibold">Jamaica's Premier MedSpa</div>
          </a>
        </div>

        <div class="bg-black rounded-2xl p-8 md:p-10 shadow-2xl border border-white/10 text-white">
          <h2 class="text-white text-2xl font-heading font-medium mb-2">Reset Password</h2>
          <p class="text-neutral-400 text-sm mb-8">Choose a new password for your account.</p>

          @if (!token()) {
            <div class="bg-red-900/30 border border-red-500/40 rounded-lg px-4 py-3 mb-6">
              <p class="text-red-300 text-sm">This reset link is missing or invalid. Please request a new one.</p>
            </div>
            <a routerLink="/auth/forgot-password" class="btn-primary w-full text-base py-3 inline-flex justify-center">
              Request new link
            </a>
          } @else {
            <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>New Password</mat-label>
                <input matInput [type]="showPassword() ? 'text' : 'password'"
                       formControlName="password" autocomplete="new-password">
                <mat-icon matPrefix class="text-gold-400 !text-sm mr-2">lock</mat-icon>
                <button mat-icon-button matSuffix type="button" class="!text-neutral-400"
                        (click)="showPassword.set(!showPassword())">
                  <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (form.get('password')?.invalid && form.get('password')?.touched) {
                  <mat-error>Min 8 chars with upper, lower, and a number.</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Confirm Password</mat-label>
                <input matInput [type]="showPassword() ? 'text' : 'password'"
                       formControlName="confirmPassword" autocomplete="new-password">
                <mat-icon matPrefix class="text-gold-400 !text-sm mr-2">lock</mat-icon>
                @if (form.hasError('mismatch') && form.get('confirmPassword')?.touched) {
                  <mat-error>Passwords do not match.</mat-error>
                }
              </mat-form-field>

              <button type="submit" class="btn-primary w-full text-base py-3" [disabled]="isLoading() || form.invalid">
                @if (isLoading()) {
                  <mat-spinner diameter="20" color="warn"></mat-spinner>
                } @else {
                  Update Password
                }
              </button>
            </form>
          }

          <div class="mt-8 text-center border-t border-white/10 pt-6">
            <a routerLink="/auth/login" class="text-gold-400 hover:text-white font-semibold transition-colors flex items-center justify-center gap-1">
              <mat-icon class="!text-sm">arrow_back</mat-icon> Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__leading,
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__notch,
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__trailing {
      border-color: rgba(255,255,255,0.2) !important;
    }
    ::ng-deep .mdc-notched-outline__leading { border-right: none !important; }
    ::ng-deep .mdc-notched-outline__notch { border-left: none !important; border-right: none !important; }
    ::ng-deep .mdc-notched-outline__trailing { border-left: none !important; }

    ::ng-deep .mat-mdc-form-field label { color: rgba(255,255,255,0.7) !important; }
    ::ng-deep .mat-mdc-form-field input { color: #ffffff !important; }
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #d6b36a !important;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  token = signal('');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/),
      ]],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordMatchValidator });
  }

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token') || '';
    this.token.set(token);
  }

  submit() {
    if (!this.token() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.authService.resetPassword(this.token(), this.form.value.password).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.snackBar.open(res.message || 'Password updated. You can sign in now.', 'Close', { duration: 5000 });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const message =
          err?.error?.message ||
          'Unable to reset password. The link may have expired.';
        this.snackBar.open(message, 'Close', { duration: 6000 });
      },
    });
  }
}
