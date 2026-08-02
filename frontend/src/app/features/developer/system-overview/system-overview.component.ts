import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-system-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-black mb-6">System Overview</h1>

      @if (loading()) {
        <div class="text-gray-500 animate-pulse">Initializing diagnostics...</div>
      } @else {
        <!-- Status Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <div class="text-gray-500 text-xs uppercase tracking-wider mb-2">API Status</div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full" [ngClass]="status()?.apiStatus === 'Healthy' ? 'bg-green-500' : 'bg-red-500'"></div>
              <span class="text-xl text-black font-medium">{{ status()?.apiStatus || 'Unknown' }}</span>
            </div>
          </div>

          <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <div class="text-gray-500 text-xs uppercase tracking-wider mb-2">Database Status</div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full" [ngClass]="status()?.dbStatus === 'Healthy' ? 'bg-green-500' : 'bg-red-500'"></div>
              <span class="text-xl text-black font-medium">{{ status()?.dbStatus || 'Unknown' }}</span>
            </div>
          </div>

          <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <div class="text-gray-500 text-xs uppercase tracking-wider mb-2">Open Errors</div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full" [ngClass]="(status()?.openErrors || 0) === 0 ? 'bg-green-500' : 'bg-yellow-500'"></div>
              <span class="text-xl text-black font-medium">{{ status()?.openErrors || 0 }}</span>
            </div>
          </div>

          <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <div class="text-gray-500 text-xs uppercase tracking-wider mb-2">Uptime (s)</div>
            <div class="flex items-center gap-2">
              <span class="text-xl text-black font-medium">{{ status()?.uptime | number:'1.0-0' }}</span>
            </div>
          </div>

        </div>

        <!-- Entity Counts -->
        <h2 class="text-lg font-bold text-black mt-8 mb-4">Entity Statistics</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <div class="text-3xl text-blue-400 font-light mb-1">{{ status()?.users || 0 }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-widest">Users</div>
          </div>
          <div class="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <div class="text-3xl text-purple-400 font-light mb-1">{{ status()?.appointments || 0 }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-widest">Appointments</div>
          </div>
          <div class="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <div class="text-3xl text-emerald-400 font-light mb-1">{{ status()?.services || 0 }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-widest">Treatments</div>
          </div>
          <div class="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <div class="text-3xl text-amber-400 font-light mb-1">{{ status()?.products || 0 }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-widest">Products</div>
          </div>
        </div>
      }
    </div>
  `
})
export class SystemOverviewComponent implements OnInit {
  private http = inject(HttpClient);
  
  loading = signal(true);
  status = signal<any>(null);

  ngOnInit() {
    this.http.get<{success: boolean, data: any}>(`${environment.apiUrl}/developer/system-status`)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.status.set(res.data);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }
}
