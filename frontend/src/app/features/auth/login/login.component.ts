import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsService } from '../../../core/services/settings.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, MatCheckboxModule,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12"
         style="background: linear-gradient(135deg, #111111 0%, #1a1a1a 60%, #0d0d0d 100%)">

      <!-- Background Texture -->
      <div class="fixed inset-0 pointer-events-none"
           style="background-image: radial-gradient(circle, rgba(201,169,110,0.05) 1px, transparent 1px);
                  background-size: 40px 40px;">
      </div>

      <div class="relative w-full max-w-md animate-fade-up">
        <!-- Logo -->
        <div class="text-center mb-10">
          <a routerLink="/" class="inline-block">
            <div class="font-heading text-4xl text-white mb-1">HHC LASER</div>
            <div class="text-gold-500 text-xs tracking-widest uppercase">Jamaica's Premier MedSpa</div>
          </a>
        </div>

        <!-- Card -->
        <div class="glass rounded-2xl p-8 md:p-10">
          <h2 class="text-white text-2xl font-heading font-light mb-2">Welcome Back</h2>
          <p class="text-cream-400 text-sm mb-8">Sign in to your account to manage bookings and more.</p>



          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" name="email"
                     placeholder="your@email.com">
              <mat-icon matPrefix class="text-gold-500 !text-sm mr-2">email</mat-icon>
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <mat-error>Please enter a valid email address.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <input matInput [type]="showPassword() ? 'text' : 'password'"
                     formControlName="password" autocomplete="current-password" name="password">
              <mat-icon matPrefix class="text-gold-500 !text-sm mr-2">lock</mat-icon>
              <button mat-icon-button matSuffix type="button"
                      (click)="showPassword.set(!showPassword())">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <mat-error>Please enter your password.</mat-error>
              }
            </mat-form-field>

            @if (errorMessage()) {
              <div class="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p class="text-red-400 text-sm">{{ errorMessage() }}</p>
              </div>
            }

            <div class="flex items-center justify-end">
              <a routerLink="/auth/forgot-password"
                 class="text-xs text-gold-400 hover:text-gold-300 transition-colors font-medium">
                Forgot password?
              </a>
            </div>

            <button type="submit" class="btn-primary w-full text-base py-3"
                    [disabled]="isLoading() || form.invalid">
              @if (isLoading()) {
                <span class="flex items-center justify-center gap-2">
                  <mat-spinner diameter="20" color="warn"></mat-spinner>
                  Signing In...
                </span>
              } @else {
                Sign In
              }
            </button>
          </form>

          <p class="text-center text-cream-400 text-sm mt-8">
            New customer?
            <a routerLink="/auth/register" class="text-gold-400 hover:text-gold-300 font-medium ml-1">
              Register here
            </a>
          </p>
        </div>

        <p class="text-center text-cream-600 text-xs mt-8">
          By signing in, you agree to our
          <a routerLink="/privacy" class="text-gold-500 hover:underline">Privacy Policy</a>
          and
          <a routerLink="/terms-of-service" class="text-gold-500 hover:underline">Terms of Service</a>.
        </p>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__leading,
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__notch,
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__trailing {
      border-color: rgba(255,255,255,0.15) !important;
    }
    ::ng-deep .mdc-notched-outline__leading { border-right: none !important; }
    ::ng-deep .mdc-notched-outline__notch { border-left: none !important; border-right: none !important; }
    ::ng-deep .mdc-notched-outline__trailing { border-left: none !important; }

    ::ng-deep .mat-mdc-form-field label { color: rgba(248,245,240,0.6); }
    ::ng-deep .mat-mdc-form-field input { color: white; }
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #c9a96e !important;
    }
  `],
})
export class LoginComponent {
  form: FormGroup;
  isLoading    = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public settingsService: SettingsService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.errorMessage.set('');

    const value = { ...this.form.value };
    value.email = value.email.trim().toLowerCase();

    this.authService.login(value).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        this.snackBar.open('Welcome back!', 'OK', { duration: 3000 });
        this.handleSuccessfulLogin(user);
      },
      error: (err) => {
        this.isLoading.set(false);
        
        let msg = 'Something went wrong while processing your request. Please try again.';
        if (err.status === 0) {
          msg = "We're unable to connect to our servers right now. Please check your internet connection or try again in a few moments.";
        } else if (err.status >= 500) {
          msg = "Our services are temporarily unavailable. Please try again shortly.";
        } else if (err.status === 401) {
          msg = "The email address or password you entered is incorrect.";
        } else if (err.status === 404) {
          msg = "We couldn't find an account with that email address.";
        } else if (err.error?.message) {
          msg = err.error.message;
        }
        
        this.errorMessage.set(msg);
      },
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
    window.location.href = `${environment.apiUrl}/auth/google?action=login`;
  }

  private handleSuccessfulLogin(user: any): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else if (user.roles.some((r: string) => ['owner','admin','manager'].includes(r))) {
      this.router.navigate(['/admin']);
    } else if (user.roles.includes('specialist')) {
      this.router.navigate(['/employee']);
    } else {
      this.router.navigate(['/customer']);
    }
  }
}
