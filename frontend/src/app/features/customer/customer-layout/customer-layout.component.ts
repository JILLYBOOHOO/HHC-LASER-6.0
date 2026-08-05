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
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, MatSidenavModule, MatListModule, MatIconModule, MatToolbarModule, NavbarComponent],
  template: `
    <div class="customer-portal flex h-screen overflow-hidden pt-[54px] bg-white">
      <app-navbar></app-navbar>

      <aside class="hidden md:flex flex-col w-64 flex-shrink-0 border-r border-neutral-200 bg-[#fafafa]">
        <div class="px-6 py-5 border-b border-neutral-200">
          <div class="font-heading text-xl text-black">HHC LASER</div>
          <div class="text-[#a5813f] text-xs tracking-widest uppercase mt-0.5">Member Portal</div>
        </div>
        <nav class="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path" routerLinkActive="bg-[#d6b36a]/15 text-[#8a6a2e]"
               [routerLinkActiveOptions]="{exact: false}"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-700
                      hover:text-black hover:bg-neutral-100 transition-all text-sm font-medium">
              <mat-icon class="!text-base">{{ link.icon }}</mat-icon>
              {{ link.label }}
            </a>
          }
        </nav>
        <div class="px-3 pb-4 border-t border-neutral-200 pt-4">
          <div class="px-3 mb-3">
            <div class="text-black text-sm font-medium">{{ authState.userFullName() }}</div>
            <div class="text-neutral-500 text-xs">{{ authState.user()?.email }}</div>
          </div>
          <button (click)="logout()"
                  class="flex items-center gap-2 px-3 py-2 text-neutral-600 hover:text-red-600 transition-colors text-sm w-full">
            <mat-icon class="!text-base">logout</mat-icon> Sign Out
          </button>
        </div>
      </aside>

      <div class="flex-1 flex flex-col overflow-hidden bg-white">
        <main class="flex-1 overflow-y-auto bg-white">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; background: #fff; }
    :host ::ng-deep .card {
      background: #ffffff !important;
      border: 1px solid rgba(0, 0, 0, 0.08) !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
      color: #171717;
    }
    :host ::ng-deep .card:hover {
      border-color: rgba(214, 179, 106, 0.35) !important;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08) !important;
      transform: translateY(-2px);
    }
  `],
})
export class CustomerLayoutComponent {
  mobileMenu = false;

  navLinks = [
    { path: '/customer/dashboard',  icon: 'home',              label: 'Dashboard' },
    { path: '/services',            icon: 'add_circle',        label: 'Book Appointment' },
    { path: '/customer/bookings',   icon: 'calendar_month',    label: 'My Appointments' },
    { path: '/customer/profile',    icon: 'manage_accounts',   label: 'My Profile' },
  ];

  constructor(public authState: AuthStateService, private authService: AuthService) {}
  logout(): void { this.authService.logout().subscribe(); }
}
