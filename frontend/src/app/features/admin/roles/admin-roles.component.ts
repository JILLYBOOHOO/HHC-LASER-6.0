import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api.service';
import { UserRole } from '../../../core/models/models';

const ROLE_DEFINITIONS: { role: UserRole; label: string; description: string }[] = [
  { role: 'owner', label: 'Owner', description: 'Full business ownership access including reports and user management.' },
  { role: 'admin', label: 'Admin', description: 'Manage bookings, services, staff, settings, and reports.' },
  { role: 'manager', label: 'Manager', description: 'Oversee daily operations, bookings, and provider schedules.' },
  { role: 'specialist', label: 'Specialist', description: 'View schedule, clients, treatment notes, and photo vault.' },
  { role: 'staff', label: 'Staff', description: 'General staff access for front-desk and support tasks.' },
  { role: 'customer', label: 'Customer', description: 'Book appointments, view history, and manage profile.' },
  { role: 'developer', label: 'Developer', description: 'System diagnostics, error logs, and auth configuration.' },
];

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 class="text-2xl font-black text-[#00f0ff] tracking-tight">Roles & Permissions</h1>
        <p class="text-slate-400 text-sm mt-1">Role definitions and user role assignments.</p>
      </div>

      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (def of roleDefinitions; track def.role) {
          <div class="bg-[#141716] border border-[#1e2522] rounded-xl p-5">
            <div class="flex items-center gap-2 mb-2">
              <mat-icon class="!text-[#00f0ff]">shield</mat-icon>
              <h3 class="font-bold text-slate-200">{{ def.label }}</h3>
            </div>
            <p class="text-xs text-slate-400">{{ def.description }}</p>
            <div class="mt-3 text-xs text-[#00f0ff] font-semibold">{{ countByRole(def.role) }} user(s)</div>
          </div>
        }
      </section>

      <section class="space-y-4">
        <h2 class="text-lg font-bold text-slate-200">Assign Role to User</h2>
        @if (loading()) {
          <mat-spinner diameter="32"></mat-spinner>
        } @else {
          <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <label class="text-sm flex-1">
              <span class="text-slate-400 block mb-1">User</span>
              <select [(ngModel)]="selectedUserId" class="w-full bg-[#141716] border border-[#1e2522] rounded-lg px-3 py-2 text-slate-200">
                <option [ngValue]="null">Select user...</option>
                @for (u of users(); track u.id) {
                  <option [ngValue]="u.id">{{ u.first_name }} {{ u.last_name }} ({{ u.email }})</option>
                }
              </select>
            </label>
            <label class="text-sm">
              <span class="text-slate-400 block mb-1">Role</span>
              <select [(ngModel)]="selectedRole" class="bg-[#141716] border border-[#1e2522] rounded-lg px-3 py-2 text-slate-200">
                @for (def of assignableRoles; track def.role) {
                  <option [value]="def.role">{{ def.label }}</option>
                }
              </select>
            </label>
            <button mat-flat-button class="!bg-[#00f0ff] !text-black" (click)="assignRole()" [disabled]="!selectedUserId">Assign</button>
          </div>
          @if (message()) {
            <p class="text-sm text-emerald-400">{{ message() }}</p>
          }
        }
      </section>
    </div>
  `
})
export class AdminRolesComponent implements OnInit {
  private api = inject(ApiService);

  roleDefinitions = ROLE_DEFINITIONS;
  assignableRoles = ROLE_DEFINITIONS.filter(r => r.role !== 'developer');
  users = signal<any[]>([]);
  loading = signal(true);
  selectedUserId: number | null = null;
  selectedRole = 'staff';
  message = signal('');

  ngOnInit() {
    this.api.getAdminUsers(1, 100).subscribe({
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

  countByRole(role: string): number {
    return this.users().filter(u => this.getRoles(u).includes(role)).length;
  }

  assignRole() {
    if (!this.selectedUserId) return;
    this.api.assignUserRole(this.selectedUserId, this.selectedRole).subscribe({
      next: () => {
        this.message.set('Role assigned successfully.');
        this.ngOnInit();
      },
      error: () => this.message.set('Failed to assign role.')
    });
  }
}
