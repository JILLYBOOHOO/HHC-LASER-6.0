import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsService } from '../../../core/services/settings.service';
import { environment } from '../../../../environments/environment';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    if (confirmPassword?.hasError('passwordMismatch')) {
      const errors = { ...confirmPassword.errors };
      delete errors['passwordMismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }
  }
  return null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12"
         style="background: linear-gradient(135deg, #111111 0%, #1a1a1a 60%, #0d0d0d 100%)">
      
      <!-- Back to site -->
      <a routerLink="/" class="absolute top-6 left-6 flex items-center gap-2 text-cream-400 hover:text-gold-400 transition-colors">
        <mat-icon>arrow_back</mat-icon>
        <span class="text-sm font-medium tracking-widest uppercase">Back to Website</span>
      </a>

      <div class="w-full max-w-md">
        <!-- Brand Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-900/30 border border-gold-500/30 mb-4">
            <mat-icon class="!text-3xl text-gold-400">spa</mat-icon>
          </div>
          <h1 class="font-heading text-3xl text-white tracking-wide">HHC LASER</h1>
          <p class="text-gold-500 text-sm tracking-widest mt-2 uppercase">Member Registration</p>
        </div>

        <!-- Register Card -->
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 class="text-2xl font-heading text-white mb-6 text-center">REGISTER</h2>



          @if (showFormError()) {
            <div class="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-6 text-center animate-pulse transition-all duration-300">
              Please correct the highlighted fields below before creating your account.
            </div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full form-field-dark">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" name="firstName" autocomplete="given-name">
                @if (registerForm.get('firstName')?.hasError('required')) {
                  <mat-error>Please enter your first name.</mat-error>
                }
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full form-field-dark">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" name="lastName" autocomplete="family-name">
                @if (registerForm.get('lastName')?.hasError('required')) {
                  <mat-error>Please enter your last name.</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="w-full form-field-dark">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" name="email" autocomplete="email">
              <mat-icon matPrefix class="text-cream-400 mr-2">email</mat-icon>
              @if (registerForm.get('email')?.hasError('required')) {
                <mat-error>Please enter your email address.</mat-error>
              } @else if (registerForm.get('email')?.hasError('email')) {
                <mat-error>Please enter a valid email address.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full form-field-dark">
              <mat-label>Phone Number</mat-label>
              <input matInput type="tel" formControlName="phone" name="phone" autocomplete="tel">
              <mat-icon matPrefix class="text-cream-400 mr-2">phone</mat-icon>
              @if (registerForm.get('phone')?.hasError('required')) {
                <mat-error>Please enter your phone number.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full form-field-dark">
              <mat-label>Age</mat-label>
              <input matInput type="number" formControlName="age" name="age">
              <mat-icon matPrefix class="text-cream-400 mr-2">cake</mat-icon>
              @if (registerForm.get('age')?.hasError('required')) {
                <mat-error>Please enter your age.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full form-field-dark">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password" name="password" autocomplete="new-password">
              <mat-icon matPrefix class="text-cream-400 mr-2">lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())" class="text-cream-400">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (registerForm.get('password')?.hasError('required')) {
                <mat-error>Please create a password.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full form-field-dark">
              <mat-label>Confirm Password</mat-label>
              <input matInput [type]="hideConfirmPassword() ? 'password' : 'text'" formControlName="confirmPassword" name="confirmPassword" autocomplete="new-password">
              <mat-icon matPrefix class="text-cream-400 mr-2">lock_outline</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hideConfirmPassword.set(!hideConfirmPassword())" class="text-cream-400">
                <mat-icon>{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (registerForm.get('confirmPassword')?.hasError('required')) {
                <mat-error>Please confirm your password.</mat-error>
              } @else if (registerForm.get('confirmPassword')?.hasError('passwordMismatch')) {
                <mat-error>Your passwords do not match. Please try again.</mat-error>
              }
            </mat-form-field>

            <button type="submit" 
                    class="w-full h-12 bg-gold-600 hover:bg-gold-500 text-white rounded-lg font-medium tracking-wide transition-colors mt-2 flex items-center justify-center"
                    [disabled]="isLoading()">
              @if (isLoading()) {
                <span class="flex items-center justify-center gap-2">
                  <mat-spinner diameter="24" class="mr-2"></mat-spinner>
                  Creating Account...
                </span>
              } @else {
                Create Account
              }
            </button>
          </form>

          <div class="mt-8 text-center border-t border-white/10 pt-6">
            <p class="text-cream-500 text-sm">
              Already have an account? 
              <a routerLink="/auth/login" class="text-gold-400 hover:text-gold-300 font-medium transition-colors">Sign in here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Dark theme overrides for form fields in login/register */
    ::ng-deep .form-field-dark .mdc-text-field--outlined {
      --mdc-outlined-text-field-container-color: rgba(0,0,0,0.2) !important;
      --mdc-outlined-text-field-outline-color: rgba(255,255,255,0.1) !important;
      --mdc-outlined-text-field-hover-outline-color: rgba(201,169,110,0.5) !important;
      --mdc-outlined-text-field-focus-outline-color: #c9a96e !important;
      --mdc-outlined-text-field-input-text-color: #fff !important;
      --mdc-outlined-text-field-label-text-color: #999 !important;
      --mdc-outlined-text-field-focus-label-text-color: #c9a96e !important;
      --mdc-outlined-text-field-error-outline-color: #f87171 !important;
      --mdc-outlined-text-field-error-label-text-color: #f87171 !important;
      caret-color: #c9a96e !important;
    }
    
    ::ng-deep .form-field-dark .mdc-notched-outline__leading {
      border-right: none !important;
    }
    ::ng-deep .form-field-dark .mdc-notched-outline__notch {
      border-left: none !important;
      border-right: none !important;
    }
    ::ng-deep .form-field-dark .mdc-notched-outline__trailing {
      border-left: none !important;
    }
    
    ::ng-deep .mat-mdc-form-field-error {
      color: #f87171 !important;
      font-size: 0.75rem !important;
      margin-top: 4px;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  isLoading = signal(false);
  showFormError = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public settingsService: SettingsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      age: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordMatchValidator });
    
    // Clear the form-level error message when the form status becomes valid
    this.registerForm.statusChanges.subscribe(status => {
      if (status === 'VALID' && this.showFormError()) {
        this.showFormError.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.showFormError.set(true);
      
      // Focus on the first invalid field
      setTimeout(() => {
        const firstInvalidControl = document.querySelector('input.ng-invalid, select.ng-invalid') as HTMLElement;
        if (firstInvalidControl) {
          firstInvalidControl.focus();
        }
      }, 0);
      return;
    }

    this.showFormError.set(false);
    this.isLoading.set(true);
    
    const { firstName, lastName, email, phone, password, age } = this.registerForm.value;
    const formattedEmail = email.trim().toLowerCase();

    this.authService.register({
      first_name: firstName,
      last_name: lastName,
      email: formattedEmail,
      phone,
      password,
      age
    } as any).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.snackBar.open('Your account has been created successfully.', 'OK', { duration: 3000 });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        
        let msg = 'Something went wrong while processing your request. Please try again.';
        if (err.status === 0) {
          msg = "We're unable to connect to our servers right now. Please check your internet connection or try again in a few moments.";
        } else if (err.status >= 500) {
          msg = "Our services are temporarily unavailable. Please try again shortly.";
        } else if (err.status === 409) {
          msg = "An account with this email address already exists.";
        } else if (err.error?.message) {
          msg = err.error.message;
        }
        
        this.snackBar.open(msg, 'OK', { duration: 4000 });
      }
    });
  }

  googleLogin(): void {
    const settings = this.settingsService.settings();
    const clientId = settings.google_oauth_client_id;
    const isEnabled = settings.google_oauth_status === 'enabled';

    if (!clientId || !isEnabled) {
      this.snackBar.open('Google sign-in is temporarily unavailable. Please try again later or register using email.', 'OK', { duration: 4000 });
      return;
    }

    // Redirect to backend OAuth endpoint
    window.location.href = `${environment.apiUrl}/auth/google?action=register`;
  }
}
