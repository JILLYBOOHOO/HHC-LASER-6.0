import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthStateService } from '../../../core/store/auth-state.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-sm w-full text-center shadow-2xl">
        
        @if (errorCode() === 'ACCOUNT_NOT_FOUND') {
          <h2 class="text-xl font-medium text-black mb-4">Account Not Found</h2>
          <p class="text-sm text-gray-400 mb-6">Welcome! We don't have an account for this email yet. Would you like to create your account?</p>
          
          <div class="flex flex-col gap-3">
            <button (click)="registerWithGoogle()" 
                    class="w-full bg-blue-600 hover:bg-blue-700 text-black rounded py-3 font-medium transition-colors flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-5 h-5 bg-white rounded-full p-1">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              REGISTER WITH GOOGLE
            </button>
            <a routerLink="/auth/register" 
               class="w-full bg-gray-800 hover:bg-gray-700 text-black rounded py-3 font-medium transition-colors inline-block border border-gray-700">
              USE EMAIL REGISTRATION
            </a>
          </div>
          <div class="mt-6">
            <a routerLink="/auth/login" class="text-sm text-gray-500 hover:text-black transition-colors underline">Return to Login</a>
          </div>
        } @else {
          <h2 class="text-xl font-medium text-black mb-6">Authenticating...</h2>
          <mat-spinner diameter="40" class="mx-auto mb-4" *ngIf="!errorMsg()"></mat-spinner>
          <p class="text-sm text-gray-400" *ngIf="!errorMsg()">Please wait while we complete your sign-in securely.</p>
          
          @if (errorMsg()) {
            <div class="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded text-red-400 text-sm">
              {{ errorMsg() }}
              <div class="mt-4">
                <a routerLink="/auth/login" class="text-black hover:text-blue-400 transition-colors underline">Return to Login</a>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class OauthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private authState = inject(AuthStateService);
  private snackBar = inject(MatSnackBar);

  errorMsg = signal('');
  errorCode = signal('');

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];
      const errCode = params['errorCode'];

      if (errCode) {
        this.errorCode.set(errCode);
      }

      if (error) {
        if (errCode !== 'ACCOUNT_NOT_FOUND') {
          // Fallback generic friendly message for other errors
          this.errorMsg.set('Something went wrong. Please try again later.');
        }
        return;
      }

      if (token) {
        // Fetch user data with the token
        this.authState.setTokenOnly(token);
        this.authService.me().subscribe({
          next: (user) => {
            this.handleSuccessfulLogin(user);
          },
          error: () => {
            this.errorMsg.set('Failed to load user profile.');
            this.authService.logout().subscribe();
          }
        });
      } else {
        this.errorMsg.set('No authentication token received.');
      }
    });
  }

  private handleSuccessfulLogin(user: any): void {
    if (user.roles.some((r: string) => ['owner','admin','manager'].includes(r))) {
      this.router.navigate(['/admin']);
    } else if (user.roles.includes('specialist')) {
      this.router.navigate(['/employee']);
    } else {
      this.router.navigate(['/customer']);
    }
  }

  registerWithGoogle() {
    window.location.href = `${environment.apiUrl}/auth/google?action=register`;
  }
}
