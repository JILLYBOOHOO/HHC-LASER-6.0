import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, MatSidenavModule, MatListModule, MatIconModule, MatToolbarModule],
  template: `
    <div class="flex h-screen overflow-hidden" style="background: var(--color-cream)">
      <!-- Sidebar -->
      <aside class="hidden md:flex flex-col w-64 flex-shrink-0 border-r border-charcoal-100"
             style="background: var(--color-dark)">
        <div class="px-6 py-5 border-b border-white/10">
          <div class="font-heading text-xl text-white">HHC LASER</div>
          <div class="text-gold-400 text-xs tracking-widest">Member Portal</div>
        </div>
        <nav class="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path" routerLinkActive="bg-gold-500/15 text-gold-400"
               [routerLinkActiveOptions]="{exact: false}"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-cream-300
                      hover:text-gold-400 hover:bg-white/5 transition-all text-sm font-medium">
              <mat-icon class="!text-base">{{ link.icon }}</mat-icon>
              {{ link.label }}
            </a>
          }
        </nav>
        <div class="px-3 pb-4 border-t border-white/10 pt-4">
          <div class="px-3 mb-3">
            <div class="text-white text-sm font-medium">{{ authState.userFullName() }}</div>
            <div class="text-cream-500 text-xs">{{ authState.user()?.email }}</div>
          </div>
          <button (click)="logout()"
                  class="flex items-center gap-2 px-3 py-2 text-cream-400 hover:text-red-400 transition-colors text-sm w-full">
            <mat-icon class="!text-base">logout</mat-icon> Sign Out
          </button>
        </div>
      </aside>

      <!-- Main -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Mobile header -->
        <header class="md:hidden flex items-center justify-between px-4 h-14 border-b border-charcoal-100"
                style="background: var(--color-dark)">
          <div class="font-heading text-lg text-white">HHC LASER</div>
          <button (click)="mobileMenu = !mobileMenu" class="text-cream-300">
            <mat-icon>menu</mat-icon>
          </button>
        </header>

        <main class="flex-1 overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class CustomerLayoutComponent {
  mobileMenu = false;

  navLinks = [
    { path: '/customer/dashboard',  icon: 'home',              label: 'Dashboard' },
    { path: '/customer/book',       icon: 'add_circle',        label: 'Book Appointment' },
    { path: '/customer/bookings',   icon: 'calendar_month',    label: 'My Appointments' },
    { path: '/customer/memberships', icon: 'card_membership', label: 'Memberships' },
    { path: '/customer/medical',    icon: 'medical_information', label: 'Medical Info' },
    { path: '/customer/profile',    icon: 'manage_accounts',   label: 'My Profile' },
  ];

  constructor(public authState: AuthStateService, private authService: AuthService) {}
  logout(): void { this.authService.logout().subscribe(); }
}
