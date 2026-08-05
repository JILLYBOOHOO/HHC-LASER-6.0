import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, MatIconModule],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-100 font-sans">
      <aside class="hidden md:flex flex-col w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950 text-white shadow-xl">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-800 flex flex-col gap-1">
          <div class="font-serif font-black text-xl text-white tracking-tight">
            HHC LASER
          </div>
          <div class="text-amber-400 text-[10px] font-extrabold uppercase tracking-widest">Staff Dashboard</div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 py-6 space-y-1.5 px-4">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path" 
               routerLinkActive="bg-amber-500/20 text-amber-400 border-l-4 border-amber-400 font-black"
               class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-white hover:text-amber-300 hover:bg-white/10 transition-all text-sm font-bold">
              <mat-icon class="!text-lg text-amber-400">{{ link.icon }}</mat-icon> 
              <span class="text-white">{{ link.label }}</span>
            </a>
          }
        </nav>

        <!-- Sign Out Button -->
        <div class="px-4 pb-6 border-t border-slate-800 pt-4">
          <button (click)="logout()"
                  class="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-rose-500/20 rounded-xl transition-all text-sm font-bold w-full">
            <mat-icon class="!text-lg text-rose-400">logout</mat-icon> 
            <span class="text-white">Sign Out</span>
          </button>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto bg-slate-50"><router-outlet></router-outlet></main>
    </div>
  `,
})
export class EmployeeLayoutComponent {
  navLinks = [
    { path: '/employee/schedule',     icon: 'calendar_today', label: 'My Schedule' },
    { path: '/employee/book',         icon: 'add_circle',     label: 'Make Appointment' },
    { path: '/employee/patients',     icon: 'people',         label: 'Patients' },
    { path: '/employee/transactions', icon: 'receipt_long',   label: 'Transactions' },
  ];
  constructor(private authService: AuthService) {}
  logout(): void { this.authService.logout().subscribe(); }
}
