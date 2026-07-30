import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-developer-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="min-h-screen p-4 md:p-8" style="background: #0f172a; color: #e2e8f0; font-family: monospace;">
      <div class="max-w-6xl mx-auto">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-700 pb-4 mb-8">
          <div>
            <h1 class="text-2xl text-emerald-400 font-bold flex items-center gap-2">
              <mat-icon>terminal</mat-icon> Developer Dashboard
            </h1>
            <p class="text-slate-400 text-sm mt-1">System diagnostics and maintenance.</p>
          </div>
          <div class="text-right text-xs text-slate-500">
            <div>v1.0.0-beta</div>
            <div>Env: Development</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Health Checks -->
          <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-xl">
            <h2 class="text-lg text-slate-200 border-b border-slate-700 pb-2 mb-4">System Status</h2>
            
            <div class="space-y-4">
              
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <mat-icon class="text-emerald-400">api</mat-icon>
                  <span>API Connection</span>
                </div>
                @if (apiStatus() === 'checking') {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else if (apiStatus() === 'online') {
                  <span class="px-2 py-1 bg-emerald-900 text-emerald-400 text-xs rounded border border-emerald-700">ONLINE</span>
                } @else {
                  <span class="px-2 py-1 bg-red-900 text-red-400 text-xs rounded border border-red-700">OFFLINE</span>
                }
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <mat-icon class="text-emerald-400">storage</mat-icon>
                  <span>Database Connection</span>
                </div>
                @if (dbStatus() === 'checking') {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else if (dbStatus() === 'online') {
                  <span class="px-2 py-1 bg-emerald-900 text-emerald-400 text-xs rounded border border-emerald-700">ONLINE</span>
                } @else {
                  <span class="px-2 py-1 bg-red-900 text-red-400 text-xs rounded border border-red-700">OFFLINE</span>
                }
              </div>

            </div>

            <div class="mt-6 pt-4 border-t border-slate-700 text-right">
              <button mat-button class="text-emerald-400 hover:bg-slate-700" (click)="checkHealth()">
                <mat-icon>refresh</mat-icon> Refresh Status
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-xl">
            <h2 class="text-lg text-slate-200 border-b border-slate-700 pb-2 mb-4">Maintenance Actions</h2>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-700">
                <div>
                  <div class="font-medium">Clear Application Cache</div>
                  <div class="text-xs text-slate-500">Purges local storage and Angular cache.</div>
                </div>
                <button mat-flat-button class="!bg-rose-900 !text-rose-200 border border-rose-700" (click)="clearCache()">Clear</button>
              </div>

              <div class="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-700">
                <div>
                  <div class="font-medium">Reset Demo Data</div>
                  <div class="text-xs text-slate-500">Restores default appointments & services.</div>
                </div>
                <button mat-flat-button class="!bg-amber-900 !text-amber-200 border border-amber-700" (click)="resetData()">Reset</button>
              </div>
            </div>
          </div>
          
          <!-- Logs Placeholder -->
          <div class="md:col-span-2 bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-xl">
            <h2 class="text-sm text-slate-400 mb-2">Error Logs (Tail)</h2>
            <div class="text-xs text-emerald-500 space-y-1">
              <div>> System initialized successfully.</div>
              <div>> Listening on port 4200...</div>
              <div>> [WARN] Fiserv credentials not found. Payment mocked.</div>
              <div class="text-rose-400">> [ERROR] Failed to fetch live currency rates (timeout).</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class DeveloperDashboardComponent {
  apiStatus = signal<'checking' | 'online' | 'offline'>('checking');
  dbStatus = signal<'checking' | 'online' | 'offline'>('checking');

  constructor(private api: ApiService, private snackBar: MatSnackBar) {
    this.checkHealth();
  }

  checkHealth() {
    this.apiStatus.set('checking');
    this.dbStatus.set('checking');
    
    // Simulate check
    setTimeout(() => {
      this.apiStatus.set('online');
      this.dbStatus.set('online');
    }, 1500);
  }

  clearCache() {
    localStorage.clear();
    sessionStorage.clear();
    this.snackBar.open('Cache cleared successfully.', 'OK', { duration: 3000 });
  }

  resetData() {
    this.snackBar.open('Triggering data reset script...', 'OK', { duration: 3000 });
    // In reality, calls an API endpoint
  }
}
