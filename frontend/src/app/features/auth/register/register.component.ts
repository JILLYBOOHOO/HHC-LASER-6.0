import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
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
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-white relative font-sans"
         style="background-image: radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px); background-size: 24px 24px;">
      
      <!-- Back to site -->
      <a routerLink="/" class="absolute top-6 left-6 flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 transition-colors">
        <mat-icon class="!text-sm !w-4 !h-4 flex items-center justify-center">arrow_back</mat-icon>
        <span class="text-xs font-black tracking-widest uppercase">Back to Website</span>
      </a>

      <div class="w-full max-w-lg mt-8 mb-4">
        <!-- Brand Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#b8924f] text-white shadow-md mb-3">
            <mat-icon class="!text-2xl flex items-center justify-center">spa</mat-icon>
          </div>
          <h1 class="font-serif text-3xl text-black tracking-widest leading-none">HHC LASER</h1>
          <p class="text-[10px] font-black tracking-widest text-[#b8924f] mt-1.5 uppercase">Member Registration</p>
        </div>

        <!-- Register Card -->
        <div class="bg-[#111312] border border-white/10 rounded-3xl p-8 shadow-2xl text-white">
          <div class="flex flex-col items-center mb-6">
            <h2 class="text-xl font-bold font-serif uppercase tracking-widest text-center">Register</h2>
            <div class="w-10 h-0.5 bg-[#b8924f] mt-1.5 rounded-full"></div>
          </div>

          @if (showFormError()) {
            <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-xs font-bold mb-6 text-center animate-pulse">
              Please correct the highlighted fields below before creating your account.
            </div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            
            <!-- First & Last Name side-by-side -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div class="relative flex items-center border border-white/10 rounded-xl bg-transparent focus-within:border-[#b8924f] transition-all px-4 py-3">
                  <mat-icon class="text-neutral-500 mr-2 !text-lg !w-5 !h-5">person</mat-icon>
                  <input type="text" formControlName="firstName" placeholder="First Name*" 
                         class="bg-transparent border-none text-white text-xs font-bold placeholder-neutral-500 outline-none w-full">
                </div>
                <p class="text-red-400 text-[10px] font-bold mt-1 text-left" *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
                  Please enter your first name.
                </p>
              </div>

              <div>
                <div class="relative flex items-center border border-white/10 rounded-xl bg-transparent focus-within:border-[#b8924f] transition-all px-4 py-3">
                  <mat-icon class="text-neutral-500 mr-2 !text-lg !w-5 !h-5">person</mat-icon>
                  <input type="text" formControlName="lastName" placeholder="Last Name*" 
                         class="bg-transparent border-none text-white text-xs font-bold placeholder-neutral-500 outline-none w-full">
                </div>
                <p class="text-red-400 text-[10px] font-bold mt-1 text-left" *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
                  Please enter your last name.
                </p>
              </div>
            </div>

            <!-- Email Address -->
            <div>
              <div class="relative flex items-center border border-white/10 rounded-xl bg-transparent focus-within:border-[#b8924f] transition-all px-4 py-3">
                <mat-icon class="text-neutral-500 mr-2 !text-lg !w-5 !h-5">email</mat-icon>
                <input type="email" formControlName="email" placeholder="Email Address*" 
                       class="bg-transparent border-none text-white text-xs font-bold placeholder-neutral-500 outline-none w-full">
              </div>
              <p class="text-red-400 text-[10px] font-bold mt-1 text-left" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                <span *ngIf="registerForm.get('email')?.hasError('required')">Please enter your email address.</span>
                <span *ngIf="registerForm.get('email')?.hasError('email')">Please enter a valid email address.</span>
              </p>
            </div>

            <!-- Phone Number -->
            <div>
              <div class="relative flex items-center border border-white/10 rounded-xl bg-transparent focus-within:border-[#b8924f] transition-all px-4 py-3">
                <mat-icon class="text-neutral-500 mr-2 !text-lg !w-5 !h-5">phone</mat-icon>
                <input type="tel" formControlName="phone" placeholder="Phone Number*" 
                       class="bg-transparent border-none text-white text-xs font-bold placeholder-neutral-500 outline-none w-full">
              </div>
              <p class="text-red-400 text-[10px] font-bold mt-1 text-left" *ngIf="registerForm.get('phone')?.invalid && registerForm.get('phone')?.touched">
                Please enter your phone number.
              </p>
            </div>

            <!-- Date of Birth (D.O.B) -->
            <div>
              <div class="relative flex items-center border border-white/10 rounded-xl bg-transparent focus-within:border-[#b8924f] transition-all px-4 py-3">
                <mat-icon class="text-neutral-500 mr-3 !text-lg !w-5 !h-5">calendar_today</mat-icon>
                <span class="text-neutral-400 text-xs font-bold mr-auto">Date of Birth (D.O.B)*</span>
                <input type="date" formControlName="dateOfBirth" 
                       class="bg-transparent border-none text-white text-xs font-bold outline-none cursor-pointer w-32 text-right">
              </div>
              <p class="text-red-400 text-[10px] font-bold mt-1 text-left" *ngIf="registerForm.get('dateOfBirth')?.invalid && registerForm.get('dateOfBirth')?.touched">
                Please enter your date of birth.
              </p>
            </div>

            <!-- Password -->
            <div>
              <div class="relative flex items-center border border-white/10 rounded-xl bg-transparent focus-within:border-[#b8924f] transition-all px-4 py-3">
                <mat-icon class="text-neutral-500 mr-2 !text-lg !w-5 !h-5">lock</mat-icon>
                <input [type]="hidePassword() ? 'password' : 'text'" formControlName="password" placeholder="Password*" 
                       class="bg-transparent border-none text-white text-xs font-bold placeholder-neutral-500 outline-none w-full pr-10">
                <button type="button" (click)="hidePassword.set(!hidePassword())" class="absolute right-4 text-neutral-500 hover:text-white transition-colors">
                  <mat-icon class="!text-lg flex items-center justify-center">{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              <p class="text-red-400 text-[10px] font-bold mt-1 text-left" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                <span *ngIf="registerForm.get('password')?.hasError('required')">Please create a password.</span>
                <span *ngIf="registerForm.get('password')?.hasError('minlength')">Password must be at least 8 characters.</span>
                <span *ngIf="registerForm.get('password')?.hasError('pattern')">Use uppercase, lowercase, and a number.</span>
              </p>
            </div>

            <!-- Confirm Password -->
            <div>
              <div class="relative flex items-center border border-white/10 rounded-xl bg-transparent focus-within:border-[#b8924f] transition-all px-4 py-3">
                <mat-icon class="text-neutral-500 mr-2 !text-lg !w-5 !h-5">lock</mat-icon>
                <input [type]="hideConfirmPassword() ? 'password' : 'text'" formControlName="confirmPassword" placeholder="Confirm Password*" 
                       class="bg-transparent border-none text-white text-xs font-bold placeholder-neutral-500 outline-none w-full pr-10">
                <button type="button" (click)="hideConfirmPassword.set(!hideConfirmPassword())" class="absolute right-4 text-neutral-500 hover:text-white transition-colors">
                  <mat-icon class="!text-lg flex items-center justify-center">{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              <p class="text-red-400 text-[10px] font-bold mt-1 text-left" *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
                <span *ngIf="registerForm.get('confirmPassword')?.hasError('required')">Please confirm your password.</span>
                <span *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">Your passwords do not match. Please try again.</span>
              </p>
            </div>

            <!-- Register Button -->
            <button type="submit" 
                    class="w-full h-12 bg-[#b8924f] hover:bg-[#a6803b] disabled:opacity-50 text-white rounded-lg font-black tracking-wider transition-colors mt-6 uppercase text-xs flex items-center justify-center"
                    [disabled]="isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="20" class="custom-spinner"></mat-spinner>
              } @else {
                Register
              }
            </button>
          </form>

          <!-- Footer switch -->
          <div class="mt-8 text-center border-t border-white/10 pt-6">
            <p class="text-neutral-400 text-xs font-bold">
              Already have an account? 
              <a routerLink="/auth/login" class="text-[#b8924f] hover:text-[#a6803b] font-black transition-colors ml-1">Login here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .custom-spinner circle {
      stroke: white !important;
    }
    input[type="date"]::-webkit-calendar-picker-indicator {
      filter: invert(1);
      cursor: pointer;
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
      dateOfBirth: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
      ]],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordMatchValidator });
    
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
    
    const { firstName, lastName, email, phone, dateOfBirth, password } = this.registerForm.value;

    this.authService.register({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      date_of_birth: dateOfBirth,
      password,
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.snackBar.open('Registration successful!', 'OK', { duration: 3000 });
        this.router.navigate(['/customer']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const fieldErrors = err.error?.errors as Record<string, string[]> | undefined;
        const firstFieldMsg = fieldErrors
          ? Object.values(fieldErrors).flat()[0]
          : undefined;
        this.snackBar.open(
          firstFieldMsg || err.error?.message || 'Registration failed.',
          'OK',
          { duration: 5000 }
        );
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

    window.location.href = `${environment.apiUrl}/auth/google?action=register`;
  }
}
