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
};

export const pastDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  const [year, month, day] = control.value.split('-').map(Number);
  const selectedDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate >= today) {
    return { futureDate: true };
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
    <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-white relative"
         style="background-image: radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px); background-size: 40px 40px;">
      
      <!-- Back to site -->
      <a routerLink="/" class="absolute top-6 left-6 flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 transition-colors">
        <mat-icon class="!text-sm !w-4 !h-4 flex items-center justify-center">arrow_back</mat-icon>
        <span class="text-xs font-semibold tracking-widest uppercase">Back to Website</span>
      </a>

      <div class="w-full max-w-lg mt-8 mb-4 animate-fade-up">
        <!-- Brand Header -->
        <div class="text-center mb-10">
          <a routerLink="/" class="inline-block">
            <div class="font-heading text-4xl text-neutral-900 mb-1">HHC LASER</div>
            <div class="text-neutral-700 text-xs tracking-widest uppercase font-semibold">Jamaica's Trusted MedSpa</div>
          </a>
        </div>

        <!-- Register Card -->
        <div class="bg-black border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl text-white">
          <h2 class="text-white text-2xl font-heading font-medium mb-2">Create Account</h2>
          <p class="text-neutral-400 text-sm mb-8">Register to book treatments and manage your appointments.</p>

          @if (showFormError()) {
            <div class="bg-red-900/30 border border-red-500/40 rounded-lg px-4 py-3 mb-6">
              <p class="text-red-300 text-sm">Please correct the highlighted fields below before creating your account.</p>
            </div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            
            <!-- First & Last Name side-by-side -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div class="relative flex items-center border border-white/20 rounded-xl bg-transparent focus-within:border-gold transition-all px-4 py-3">
                  <mat-icon class="text-gold-400 mr-2 !text-sm !w-5 !h-5">person</mat-icon>
                  <input type="text" formControlName="firstName" placeholder="First Name*" 
                         class="bg-transparent border-none text-white text-sm font-medium placeholder-neutral-500 outline-none w-full">
                </div>
                <p class="text-red-300 text-xs mt-1 text-left" *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
                  Please enter your first name.
                </p>
              </div>

              <div>
                <div class="relative flex items-center border border-white/20 rounded-xl bg-transparent focus-within:border-gold transition-all px-4 py-3">
                  <mat-icon class="text-gold-400 mr-2 !text-sm !w-5 !h-5">person</mat-icon>
                  <input type="text" formControlName="lastName" placeholder="Last Name*" 
                         class="bg-transparent border-none text-white text-sm font-medium placeholder-neutral-500 outline-none w-full">
                </div>
                <p class="text-red-300 text-xs mt-1 text-left" *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
                  Please enter your last name.
                </p>
              </div>
            </div>

            <!-- Email Address -->
            <div>
              <div class="relative flex items-center border border-white/20 rounded-xl bg-transparent focus-within:border-gold transition-all px-4 py-3">
                <mat-icon class="text-gold-400 mr-2 !text-sm !w-5 !h-5">email</mat-icon>
                <input type="email" formControlName="email" placeholder="Email Address*" 
                       class="bg-transparent border-none text-white text-sm font-medium placeholder-neutral-500 outline-none w-full">
              </div>
              <p class="text-red-300 text-xs mt-1 text-left" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                <span *ngIf="registerForm.get('email')?.hasError('required')">Please enter your email address.</span>
                <span *ngIf="registerForm.get('email')?.hasError('email')">Please enter a valid email address.</span>
              </p>
            </div>

            <!-- Phone Number -->
            <div>
              <div class="relative flex items-center border border-white/20 rounded-xl bg-transparent focus-within:border-gold transition-all px-4 py-3">
                <mat-icon class="text-gold-400 mr-2 !text-sm !w-5 !h-5">phone</mat-icon>
                <input type="tel" formControlName="phone" placeholder="Phone Number*" (input)="onPhoneInput()"
                       class="bg-transparent border-none text-white text-sm font-medium placeholder-neutral-500 outline-none w-full">
              </div>
              <p class="text-red-300 text-xs mt-1 text-left" *ngIf="registerForm.get('phone')?.invalid && registerForm.get('phone')?.touched">
                Please enter your phone number.
              </p>
            </div>

            <!-- Date of Birth (D.O.B) -->
            <div>
              <div class="relative flex items-center border border-white/20 rounded-xl bg-transparent focus-within:border-gold transition-all px-4 py-3">
                <mat-icon class="text-gold-400 mr-3 !text-sm !w-5 !h-5">calendar_today</mat-icon>
                <span class="text-neutral-400 text-sm font-medium mr-auto">Date of Birth*</span>
                <input type="date" formControlName="dateOfBirth" [max]="maxDate"
                       class="bg-transparent border-none text-white text-sm font-medium outline-none cursor-pointer w-32 text-right">
              </div>
              <p class="text-red-300 text-xs mt-1 text-left" *ngIf="registerForm.get('dateOfBirth')?.invalid && registerForm.get('dateOfBirth')?.touched">
                <span *ngIf="registerForm.get('dateOfBirth')?.hasError('required')">Please enter your date of birth.</span>
                <span *ngIf="registerForm.get('dateOfBirth')?.hasError('futureDate')">Date of birth must be in the past.</span>
              </p>
            </div>

            <!-- Password -->
            <div>
              <div class="relative flex items-center border border-white/20 rounded-xl bg-transparent focus-within:border-gold transition-all px-4 py-3">
                <mat-icon class="text-gold-400 mr-2 !text-sm !w-5 !h-5">lock</mat-icon>
                <input [type]="hidePassword() ? 'password' : 'text'" formControlName="password" placeholder="Password*" 
                       class="bg-transparent border-none text-white text-sm font-medium placeholder-neutral-500 outline-none w-full pr-10">
                <button type="button" (click)="hidePassword.set(!hidePassword())" class="absolute right-4 text-neutral-400 hover:text-white transition-colors">
                  <mat-icon class="!text-lg flex items-center justify-center">{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              <p class="text-red-300 text-xs mt-1 text-left" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                <span *ngIf="registerForm.get('password')?.hasError('required')">Please create a password.</span>
                <span *ngIf="registerForm.get('password')?.hasError('minlength')">Password must be at least 8 characters.</span>
                <span *ngIf="registerForm.get('password')?.hasError('pattern')">Use uppercase, lowercase, and a number.</span>
              </p>
            </div>

            <!-- Confirm Password -->
            <div>
              <div class="relative flex items-center border border-white/20 rounded-xl bg-transparent focus-within:border-gold transition-all px-4 py-3">
                <mat-icon class="text-gold-400 mr-2 !text-sm !w-5 !h-5">lock</mat-icon>
                <input [type]="hideConfirmPassword() ? 'password' : 'text'" formControlName="confirmPassword" placeholder="Confirm Password*" 
                       class="bg-transparent border-none text-white text-sm font-medium placeholder-neutral-500 outline-none w-full pr-10">
                <button type="button" (click)="hideConfirmPassword.set(!hideConfirmPassword())" class="absolute right-4 text-neutral-400 hover:text-white transition-colors">
                  <mat-icon class="!text-lg flex items-center justify-center">{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              <p class="text-red-300 text-xs mt-1 text-left" *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
                <span *ngIf="registerForm.get('confirmPassword')?.hasError('required')">Please confirm your password.</span>
                <span *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">Your passwords do not match. Please try again.</span>
              </p>
            </div>

            <!-- Register Button -->
            <button type="submit" 
                    class="btn-primary w-full text-base py-3 mt-2"
                    [disabled]="isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="20" color="warn"></mat-spinner>
              } @else {
                Create Account
              }
            </button>
          </form>

          <!-- Footer switch -->
          <p class="text-center text-neutral-400 text-sm mt-8">
            Already have an account?
            <a routerLink="/auth/login" class="text-gold-400 hover:text-gold-300 font-semibold ml-1">Login here</a>
          </p>
        </div>

        <p class="text-center text-neutral-600 text-xs mt-8">
          By registering, you agree to our
          <a routerLink="/privacy" class="text-neutral-900 underline font-medium hover:text-black">Privacy Policy</a>
          and
          <a routerLink="/terms-of-service" class="text-neutral-900 underline font-medium hover:text-black">Terms of Service</a>.
        </p>
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
  hasAutoScrolled = false;
  maxDate: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public settingsService: SettingsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    this.maxDate = today.toISOString().split('T')[0];

    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dateOfBirth: ['', [Validators.required, pastDateValidator]],
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

  onPhoneInput(): void {
    const phoneVal = this.registerForm.get('phone')?.value;
    if (phoneVal && phoneVal.length >= 10 && !this.hasAutoScrolled) {
      this.hasAutoScrolled = true;
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
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
