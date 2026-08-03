import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
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
    <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
         [class.navbar-scrolled]="isScrolled() && isHome()"
         [class.navbar-top]="!isScrolled() && isHome()"
         [class.navbar-light]="!isHome()">
      <div class="container-luxury flex items-center justify-between transition-all duration-300 px-6"
           [class.h-[66px]]="!isScrolled() && isHome()"
           [class.h-[54px]]="isScrolled() || !isHome()">

        <!-- Logo -->
        <a routerLink="/" class="flex items-center group">
          <img loading="lazy" src="/HCClogo.jpg" alt="HHC Laser Logo" class="h-8 md:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
        </a>

        <!-- Desktop Nav -->
        <div class="hidden lg:flex items-center gap-6">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: link.exact ?? false}"
               class="nav-link text-xs font-semibold uppercase relative py-1 tracking-[0.15em] transition-all duration-300"
               [ngClass]="isHome() ? 'text-white/80 hover:text-gold' : 'text-neutral-600 hover:text-black'">
              {{ link.label }}
            </a>
          }
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-4">
          @if (!authState.isAuthenticated()) {
            <a routerLink="/auth/login"
               class="hidden sm:inline-flex items-center justify-center gap-1.5 h-9 px-5 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-[0.15em] border border-black/10 hover:bg-neutral-100 transition-all shadow-sm">
              <mat-icon class="!text-[14px] !w-[14px] !h-[14px]">person</mat-icon>
              Login
            </a>
            <a routerLink="/customer/book" 
               class="inline-flex items-center justify-center h-9 px-5 rounded-full bg-gold-500 text-white text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-gold-600 transition-all shadow-sm">
              Book Now
            </a>
          } @else {
            <!-- Authenticated user menu -->
            <a routerLink="/customer/dashboard" class="hidden sm:inline-flex items-center justify-center h-9 px-5 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-[0.15em] border border-black/10 hover:bg-neutral-100 transition-all shadow-sm">
              Dashboard
            </a>
            <button mat-icon-button [matMenuTriggerFor]="userMenu"
                    class="transition-colors"
                    [ngClass]="isHome() ? '!text-text-muted hover:!text-white' : '!text-neutral-600 hover:!text-black'">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu>
              <div class="mt-8 text-center border-t border-black/10 pt-4">
                <div class="font-semibold text-sm text-black">{{ authState.userFullName() }}</div>
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
                <mat-icon>home</mat-icon> Dashboard
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

          <!-- Mobile menu (visible on mobile/tablet/small screens, hidden on desktop/large screens) -->
          <button mat-icon-button class="block lg:!hidden transition-colors" [ngClass]="isHome() ? '!text-text-muted hover:!text-white' : '!text-black'" (click)="toggleMobile()">
            <mat-icon>{{ mobileOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Mobile Drawer -->
      @if (mobileOpen()) {
        <div class="lg:hidden px-6 py-8 space-y-5 animate-fade-in border-t"
             [ngClass]="isHome() ? 'glass-dark border-white/5' : 'bg-white border-black/10'">
          <div class="w-28 flex-shrink-0 pt-4">
            @for (link of navLinks; track link.path) {
              <a [routerLink]="link.path"
                 (click)="mobileOpen.set(false)"
                 class="block transition-colors py-2.5 text-sm uppercase tracking-[0.2em] font-semibold"
                 [ngClass]="isHome() ? 'text-white/80 hover:text-gold' : 'text-neutral-700 hover:text-black'">
              {{ link.label }}
            </a>
            }
          </div>
          <div class="pt-4 border-t flex flex-col gap-3" [ngClass]="isHome() ? 'border-white/5' : 'border-black/10'">
            @if (!authState.isAuthenticated()) {
              <a routerLink="/auth/login" (click)="mobileOpen.set(false)" class="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-[0.1em] border border-black/10 hover:bg-neutral-200 transition-all text-center">Login</a>
              <a routerLink="/customer/book" (click)="mobileOpen.set(false)" class="btn-primary text-center text-xs">Book Now</a>
            } @else {
              <a routerLink="/customer/dashboard" (click)="mobileOpen.set(false)" class="btn-secondary text-center text-xs">Dashboard</a>
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
    .navbar-light {
      background: #FFFFFF;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
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
      color: #D6B36A;
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
  isHome      = signal(true);

  navLinks = [
    { path: '/',           label: 'Home',       exact: true },
    { path: '/services',   label: 'Services' },
    { path: '/products',   label: 'Products' },
    { path: '/gallery',    label: 'Gallery' },
    { path: '/about',      label: 'About' },
    { path: '/contact',    label: 'Contact' },
  ];

  constructor(
    public authState: AuthStateService,
    private authService: AuthService,
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isHome.set(event.urlAfterRedirects === '/' || event.urlAfterRedirects === '/home');
      }
    });
  }

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
