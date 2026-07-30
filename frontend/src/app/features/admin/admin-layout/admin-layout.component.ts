import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, MatIconModule],
  template: `
    <div class="flex h-screen overflow-hidden bg-cream-100">
      <aside class="hidden md:flex flex-col w-64 flex-shrink-0 border-r border-charcoal-100"
             style="background: #111111">
        <div class="px-6 py-5 border-b border-white/10">
          <div class="font-heading text-xl text-white">HHC LASER</div>
          <div class="text-gold-400 text-xs tracking-widest">Admin Portal</div>
        </div>
        <nav class="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path" routerLinkActive="bg-gold-500/15 text-gold-400"
               [routerLinkActiveOptions]="{exact: false}"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-cream-300
                      hover:text-gold-400 hover:bg-white/5 transition-all text-sm font-medium">
              <mat-icon class="!text-base">{{ link.icon }}</mat-icon> {{ link.label }}
            </a>
          }
        </nav>
        <div class="px-3 pb-4 border-t border-white/10 pt-4">
          <a routerLink="/" class="flex items-center gap-2 px-3 py-2 text-cream-400 hover:text-gold-400 transition-colors text-sm mb-1">
            <mat-icon class="!text-base">public</mat-icon> View Website
          </a>
          <button (click)="logout()"
                  class="flex items-center gap-2 px-3 py-2 text-cream-400 hover:text-red-400 transition-colors text-sm w-full">
            <mat-icon class="!text-base">logout</mat-icon> Sign Out
          </button>
        </div>
      </aside>
      <main class="flex-1 overflow-y-auto"><router-outlet></router-outlet></main>
    </div>
  `,
})
export class AdminLayoutComponent {
  navLinks = [
    { path: '/admin/dashboard',  icon: 'dashboard',          label: 'Dashboard' },
    { path: '/admin/bookings',   icon: 'calendar_month',     label: 'Bookings' },
    { path: '/admin/customers',  icon: 'people',             label: 'Customers' },
    { path: '/admin/staff',      icon: 'badge',              label: 'Staff' },
    { path: '/admin/services',   icon: 'spa',                label: 'Services' },
    { path: '/admin/products',   icon: 'inventory_2',        label: 'Products' },
    { path: '/admin/homepage',   icon: 'view_quilt',         label: 'Homepage Builder' },
    { path: '/admin/media',      icon: 'collections',        label: 'Media Library' },
    { path: '/admin/settings',   icon: 'settings',           label: 'Settings' },
    { path: '/admin/reports',    icon: 'analytics',          label: 'Reports' },
  ];
  constructor(private authService: AuthService) {}
  logout(): void { this.authService.logout().subscribe(); }
}
