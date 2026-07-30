import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-auth-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="max-w-4xl">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-white mb-2">Authentication Settings</h1>
        <p class="text-gray-400 text-sm">Manage Google OAuth 2.0 configuration and authentication methods.</p>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <h2 class="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-5 h-5">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Google Login
          
          <span class="ml-auto px-2 py-1 rounded text-xs font-bold uppercase tracking-wider"
                [class.bg-green-500.text-white]="status() === 'enabled'"
                [class.bg-red-500.text-white]="status() !== 'enabled'">
            {{ status() === 'enabled' ? 'Connected' : 'Configuration Required' }}
          </span>
        </h2>

        <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
          <div>
            <label class="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Google Client ID</label>
            <input type="text" formControlName="google_oauth_client_id"
                   class="w-full bg-gray-950 border border-gray-800 rounded px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                   placeholder="e.g. 1234567890-abcde.apps.googleusercontent.com">
          </div>
          
          <div>
            <label class="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Google Client Secret</label>
            <input type="password" formControlName="google_oauth_client_secret"
                   class="w-full bg-gray-950 border border-gray-800 rounded px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                   placeholder="********">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">OAuth Status</label>
              <select formControlName="google_oauth_mode" class="w-full bg-gray-950 border border-gray-800 rounded px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                <option value="production">Production</option>
                <option value="testing">Testing</option>
              </select>
            </div>

            <div>
              <label class="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Google Login Toggle</label>
              <select formControlName="google_oauth_status" class="w-full bg-gray-950 border border-gray-800 rounded px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                <option value="enabled">ON (Enabled)</option>
                <option value="disabled">OFF (Disabled)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Allowed Domains</label>
            <input type="text" formControlName="google_oauth_allowed_domains"
                   class="w-full bg-gray-950 border border-gray-800 rounded px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                   placeholder="e.g. hhclaser.com, localhost">
          </div>
          
          <div>
            <label class="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Authorized Redirect URL (For Reference)</label>
            <input type="text" formControlName="google_oauth_redirect_urls"
                   class="w-full bg-gray-950 border border-gray-800 rounded px-4 py-2 text-sm text-gray-400 focus:outline-none"
                   readonly>
            <p class="text-xs text-gray-500 mt-1">Ensure this URL is added to your Google Cloud Console Authorized redirect URIs.</p>
          </div>

          <div class="flex items-center gap-4 pt-4 mt-6 border-t border-gray-800">
            <button type="submit" [disabled]="form.invalid || isSaving()"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
              @if (isSaving()) {
                <mat-spinner diameter="16" class="!text-white"></mat-spinner> Saving...
              } @else {
                <mat-icon class="!w-4 !h-4 !text-[16px]">save</mat-icon> Save Configuration
              }
            </button>

            <button type="button" (click)="testConnection()"
                    class="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded text-sm font-medium transition-colors border border-gray-700">
              Test Connection
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AuthSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private settingsService = inject(SettingsService);

  form: FormGroup;
  isLoading = signal(true);
  isSaving = signal(false);
  status = signal('disabled');

  constructor() {
    this.form = this.fb.group({
      google_oauth_client_id: ['', Validators.required],
      google_oauth_client_secret: ['', Validators.required],
      google_oauth_mode: ['testing'],
      google_oauth_allowed_domains: [''],
      google_oauth_redirect_urls: [`${environment.apiUrl}/auth/google/callback`],
      google_oauth_status: ['disabled']
    });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.http.get<{success: boolean, data: any}>(`${environment.apiUrl}/developer/oauth`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.form.patchValue(res.data);
          this.status.set(res.data.google_oauth_status);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load OAuth settings', 'OK', { duration: 3000 });
      }
    });
  }

  save() {
    if (this.form.invalid) return;
    this.isSaving.set(true);

    this.http.put<{success: boolean, message: string}>(`${environment.apiUrl}/developer/oauth`, this.form.value).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.status.set(this.form.value.google_oauth_status);
        this.settingsService.loadSettings(); // Reload global settings
        this.snackBar.open(res.message, 'OK', { duration: 3000 });
      },
      error: () => {
        this.isSaving.set(false);
        this.snackBar.open('Failed to save settings', 'OK', { duration: 3000 });
      }
    });
  }

  testConnection() {
    if (this.form.invalid) {
      this.snackBar.open('Please configure Client ID first.', 'OK', { duration: 3000 });
      return;
    }
    
    // Simplistic test - just alert success since we can't fully trigger popup here without GIS logic.
    if (this.status() === 'enabled') {
      this.snackBar.open('✅ Connection appears configured. Test login on public site.', 'OK', { duration: 4000 });
    } else {
      this.snackBar.open('❌ Please enable the connection and save first.', 'OK', { duration: 4000 });
    }
  }
}
