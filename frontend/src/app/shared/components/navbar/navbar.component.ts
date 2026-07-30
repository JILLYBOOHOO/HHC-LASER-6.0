import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule,
  ],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
         [class.navbar-scrolled]="isScrolled()"
         [class.navbar-top]="!isScrolled()">
      <div class="container-luxury flex items-center justify-between transition-all duration-500 px-6"
           [class.h-[90px]]="!isScrolled()"
           [class.h-[72px]]="isScrolled()">

        <!-- Logo -->
        <a routerLink="/" class="flex items-center group">
          <img src="/HCClogo.jpg" alt="HHC Laser Logo" class="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
        </a>

        <!-- Desktop Nav -->
        <div class="hidden lg:flex items-center gap-8">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: link.exact ?? false}"
               class="nav-link text-xs text-text-muted hover:text-white tracking-[0.15em] transition-all duration-300
                      font-semibold uppercase relative py-2">
              {{ link.label }}
            </a>
          }
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-4">
          @if (!authState.isAuthenticated()) {
            <a routerLink="/auth/login"
               class="hidden sm:inline-flex items-center gap-2 text-xs text-text-muted hover:text-white transition-colors font-semibold uppercase tracking-[0.1em]">
              <mat-icon class="!text-sm">person</mat-icon>
              Login
            </a>
            <a routerLink="/customer/book" class="btn-primary text-[10px] tracking-[0.15em] py-2 px-6">
              Book Now
            </a>
          } @else {
            <!-- Authenticated user menu -->
            <button mat-icon-button [matMenuTriggerFor]="userMenu"
                    class="!text-text-muted hover:!text-white">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu>
              <div class="px-4 py-3 border-b border-white/5">
                <div class="font-semibold text-sm text-white">{{ authState.userFullName() }}</div>
                <div class="text-xs text-text-muted">{{ authState.user()?.email }}</div>
              </div>
              @if (authState.isStaff()) {
                <a mat-menu-item routerLink="/employee">
                  <mat-icon>dashboard</mat-icon> My Schedule
                </a>
              }
              @if (authState.isAdmin()) {
                <a mat-menu-item routerLink="/admin">
                  <mat-icon>admin_panel_settings</mat-icon> Admin Dashboard
                </a>
              }
              <a mat-menu-item routerLink="/customer/dashboard">
                <mat-icon>home</mat-icon> My Portal
              </a>
              <a mat-menu-item routerLink="/customer/book">
                <mat-icon>calendar_today</mat-icon> Book Appointment
              </a>
              <mat-divider class="!border-white/5"></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon> Logout
              </button>
            </mat-menu>
          }

          <!-- Mobile menu -->
          <button mat-icon-button class="lg:hidden !text-text-muted hover:!text-white" (click)="toggleMobile()">
            <mat-icon>{{ mobileOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Mobile Drawer -->
      @if (mobileOpen()) {
        <div class="lg:hidden glass-dark border-t border-white/5 px-6 py-8 space-y-5 animate-fade-in">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path" (click)="mobileOpen.set(false)"
               class="block text-text-muted hover:text-gold transition-colors py-2.5 text-xs uppercase tracking-[0.2em] font-semibold">
              {{ link.label }}
            </a>
          }
          <div class="pt-5 border-t border-white/5 flex flex-col gap-3">
            @if (!authState.isAuthenticated()) {
              <a routerLink="/auth/login" (click)="mobileOpen.set(false)" class="btn-secondary text-center text-xs">Login</a>
              <a routerLink="/customer/book" (click)="mobileOpen.set(false)" class="btn-primary text-center text-xs">Book Now</a>
            } @else {
              <a routerLink="/customer/dashboard" (click)="mobileOpen.set(false)" class="btn-secondary text-center text-xs">My Portal</a>
              <button (click)="logout()" class="btn-secondary text-center w-full text-xs">Logout</button>
            }
          </div>
        </div>
      }
    </nav>
  `,
  styles: [`
    .navbar-top {
      background: rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .navbar-scrolled {
      background: rgba(0, 0, 0, 0.20);
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }
    .nav-link {
      position: relative;
      transition: color var(--transition-fast);
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 1px;
      background: var(--gold);
      transition: all var(--transition-base);
      transform: translateX(-50%);
    }
    .nav-link.active {
      color: var(--gold) !important;
    }
    .nav-link.active::after {
      width: 100%;
    }
    .nav-link:hover {
      color: #ffffff;
    }
    .nav-link:hover::after {
      width: 50%;
    }
  `],
  host: {
    '(window:scroll)': 'onScroll()',
  },
})
export class NavbarComponent {
  isScrolled  = signal(false);
  mobileOpen  = signal(false);

  navLinks = [
    { path: '/',           label: 'Home',       exact: true },
    { path: '/services',   label: 'Services' },
    { path: '/gallery',    label: 'Gallery' },
    { path: '/about',      label: 'About' },
    { path: '/contact',    label: 'Contact' },
  ];

  constructor(
    public authState: AuthStateService,
    private authService: AuthService,
  ) {}

  onScroll(): void {
    this.isScrolled.set(window.scrollY > 60);
  }

  toggleMobile(): void {
    this.mobileOpen.update(v => !v);
  }

  logout(): void {
    this.mobileOpen.set(false);
    this.authService.logout().subscribe();
  }
}
