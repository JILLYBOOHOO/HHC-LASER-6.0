import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-error-monitoring',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-black">Error Logs</h1>
        <button (click)="loadData()" class="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 hover:text-black transition-colors text-sm">
          Refresh Logs
        </button>
      </div>

      @if (loading()) {
        <div class="text-gray-500 animate-pulse">Loading logs...</div>
      } @else {
        <div class="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-950 border-b border-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                <th class="px-4 py-3 font-medium">Timestamp</th>
                <th class="px-4 py-3 font-medium">Status</th>
                <th class="px-4 py-3 font-medium">Type</th>
                <th class="px-4 py-3 font-medium">Message & Endpoint</th>
                <th class="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              @for (log of logs(); track log.id) {
                <tr class="hover:bg-gray-800/50 transition-colors">
                  <td class="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">{{ log.created_at | date:'short' }}</td>
                  <td class="px-4 py-3 text-sm">
                    <span class="px-2 py-1 rounded text-xs font-medium" 
                          [ngClass]="{
                            'bg-red-500/20 text-red-400': log.status === 'open',
                            'bg-green-500/20 text-green-400': log.status === 'resolved',
                            'bg-gray-500/20 text-gray-400': log.status === 'ignored'
                          }">
                      {{ log.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-300">{{ log.error_type }}</td>
                  <td class="px-4 py-3 text-sm">
                    <div class="font-medium text-red-400">{{ log.message }}</div>
                    <div class="text-xs text-gray-500 mt-1">
                      <span class="font-mono bg-gray-800 px-1 py-0.5 rounded">{{ log.method }}</span> {{ log.endpoint }}
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-right space-x-2">
                    @if (log.status === 'open') {
                      <button (click)="updateStatus(log.id, 'resolved')" class="text-green-500 hover:text-green-400 underline">Resolve</button>
                      <button (click)="updateStatus(log.id, 'ignored')" class="text-gray-500 hover:text-gray-400 underline">Ignore</button>
                    }
                  </td>
                </tr>
              }
              
              @if (logs().length === 0) {
                <tr>
                  <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                    No error logs found. The system is healthy!
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class ErrorMonitoringComponent implements OnInit {
  private http = inject(HttpClient);
  
  loading = signal(true);
  logs = signal<any[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.http.get<{success: boolean, data: any[]}>(`${environment.apiUrl}/developer/error-logs`)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.logs.set(res.data);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  updateStatus(id: number, status: string) {
    this.http.put(`${environment.apiUrl}/developer/error-logs/${id}`, { status })
      .subscribe({
        next: () => this.loadData()
      });
  }
}
