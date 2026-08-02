import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-[#00f0ff] tracking-tight">Staff & Users</h1>
          <p class="text-slate-400 text-sm mt-1">Manage all system users and their access.</p>
        </div>
        <div class="relative">
          <mat-icon class="absolute left-3 top-2.5 !text-lg text-slate-500">search</mat-icon>
          <input type="text" [(ngModel)]="search" (keyup.enter)="load()" placeholder="Search users..."
                 class="pl-10 pr-4 py-2 bg-[#141716] border border-[#1e2522] rounded-lg text-sm text-slate-200 w-64 focus:outline-none focus:border-[#00f0ff]" />
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <div class="bg-[#141716] border border-[#1e2522] rounded-xl overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-[#1e2522] text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th class="text-left px-5 py-3">User</th>
                <th class="text-left px-5 py-3">Roles</th>
                <th class="text-left px-5 py-3">Status</th>
                <th class="text-left px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1e2522]">
              @for (u of users(); track u.id) {
                <tr class="hover:bg-[#1e2522]/50">
                  <td class="px-5 py-4">
                    <div class="font-semibold text-slate-200">{{ u.first_name }} {{ u.last_name }}</div>
                    <div class="text-xs text-slate-500">{{ u.email }}</div>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex flex-wrap gap-1">
                      @for (role of getRoles(u); track role) {
                        <span class="text-[10px] px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] uppercase font-bold">{{ role }}</span>
                      }
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    <span class="text-xs px-2 py-1 rounded-full"
                          [ngClass]="u.is_active ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'">
                      {{ u.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <button mat-stroked-button class="!text-xs !min-w-0 !px-2 !py-1 !border-slate-600 !text-slate-300"
                            (click)="toggleStatus(u)">
                      {{ u.is_active ? 'Deactivate' : 'Activate' }}
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="px-5 py-12 text-center text-slate-500">No users found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private api = inject(ApiService);

  users = signal<any[]>([]);
  loading = signal(true);
  search = '';

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getAdminUsers(1, 50, this.search || undefined).subscribe({
      next: res => {
        this.users.set((res as any).data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getRoles(user: any): string[] {
    if (!user.roles) return [];
    return typeof user.roles === 'string' ? user.roles.split(',').filter(Boolean) : user.roles;
  }

  toggleStatus(user: any) {
    this.api.updateUserStatus(user.id, !user.is_active).subscribe({
      next: () => this.load()
    });
  }
}
