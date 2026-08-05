import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule,
  ],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex items-center py-2"
         [class.navbar-scrolled]="isScrolled() && isHome()"
         [class.navbar-top]="!isScrolled() && isHome()"
         [class.navbar-light]="!isHome()">
      <div class="w-full max-w-[1600px] mx-auto flex items-center justify-between transition-all duration-300 px-4 md:px-6 lg:px-8 xl:px-12 py-2"
           [class.h-[66px]]="!isScrolled() && isHome()"
           [class.h-[54px]]="isScrolled() || !isHome()">

        <!-- Logo -->
        <div class="flex justify-start lg:flex-1 flex-shrink-0">
          <a routerLink="/" class="flex items-center self-center group">
            <img loading="lazy" src="/HCClogo.jpg" alt="HHC Laser Logo" class="h-8 md:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          </a>
        </div>

        <!-- Desktop Nav -->
        <div class="hidden lg:flex items-center justify-center gap-5 xl:gap-8 flex-none">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: link.exact ?? false}"
               class="nav-link text-xs font-semibold uppercase relative py-1 tracking-[0.15em] transition-all duration-300 flex items-center"
               [ngClass]="isHome() ? 'text-white/80 hover:text-gold' : 'text-neutral-600 hover:text-black'">
              {{ link.label }}
            </a>
          }
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 xl:gap-4 lg:flex-1">
          @if (!authState.isAuthenticated()) {
            <a routerLink="/auth/login"
               [queryParams]="{ returnUrl: '/customer/book' }"
               class="inline-flex items-center justify-center h-9 px-4 xl:px-5 rounded-full bg-gold-500 text-white text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-gold-600 transition-all shadow-sm">
              Login to Book
            </a>
          } @else {
            <!-- Authenticated user menu -->
            <a routerLink="/customer/dashboard" class="hidden sm:inline-flex items-center justify-center h-9 px-4 xl:px-5 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-[0.15em] border border-black/10 hover:bg-neutral-100 transition-all shadow-sm">
              Dashboard
            </a>
            <button type="button"
                    [matMenuTriggerFor]="userMenu"
                    class="inline-flex items-center justify-center h-9 w-9 flex-shrink-0 rounded-full p-0 border-0 bg-transparent cursor-pointer align-middle transition-transform hover:scale-105"
                    aria-label="Account menu">
              <span class="user-menu-avatar"
                    [ngClass]="isHome() ? 'user-menu-avatar--on-dark' : 'user-menu-avatar--on-light'">
                {{ userInitial() }}
              </span>
            </button>
            <mat-menu #userMenu="matMenu" xPosition="before" yPosition="below" panelClass="hhc-user-menu">
              <div class="hhc-user-menu__header" (click)="$event.stopPropagation()">
                <div class="hhc-user-menu__avatar">{{ userInitial() }}</div>
                <div class="hhc-user-menu__identity min-w-0">
                  <div class="hhc-user-menu__name truncate">{{ authState.userFullName() || 'Account' }}</div>
                  <div class="hhc-user-menu__email truncate">{{ authState.user()?.email }}</div>
                </div>
              </div>
              <div class="hhc-user-menu__divider"></div>
              @if (authState.isStaff()) {
                <a mat-menu-item routerLink="/employee" class="hhc-user-menu__item">
                  <mat-icon>calendar_month</mat-icon>
                  <span>My Schedule</span>
                </a>
              }
              @if (authState.isAdmin()) {
                <a mat-menu-item routerLink="/admin" class="hhc-user-menu__item">
                  <mat-icon>admin_panel_settings</mat-icon>
                  <span>Admin Dashboard</span>
                </a>
              }
              <a mat-menu-item routerLink="/customer/dashboard" class="hhc-user-menu__item">
                <mat-icon>dashboard</mat-icon>
                <span>Dashboard</span>
              </a>
              <a mat-menu-item routerLink="/customer/book" class="hhc-user-menu__item">
                <mat-icon>event_available</mat-icon>
                <span>Book Appointment</span>
              </a>
              <div class="hhc-user-menu__divider"></div>
              <button mat-menu-item (click)="logout()" class="hhc-user-menu__item hhc-user-menu__item--logout">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          }

          <!-- Mobile menu (visible on mobile/tablet/small screens, hidden on desktop/large screens) -->
          <button type="button"
                  class="inline-flex lg:!hidden items-center justify-center h-9 w-9 flex-shrink-0 rounded-full p-0 border-0 bg-transparent cursor-pointer transition-colors"
                  [ngClass]="isHome() ? 'text-white/80 hover:text-white' : 'text-black'"
                  (click)="toggleMobile()"
                  aria-label="Toggle menu">
            <mat-icon class="!text-[22px] !w-[22px] !h-[22px]">{{ mobileOpen() ? 'close' : 'menu' }}</mat-icon>
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
              <a routerLink="/auth/login"
                 [queryParams]="{ returnUrl: '/customer/book' }"
                 (click)="mobileOpen.set(false)"
                 class="btn-primary text-center text-xs">Login to Book</a>
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

    .user-menu-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 9999px;
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      line-height: 1;
    }
    .user-menu-avatar--on-dark {
      color: #0B0B0D;
      background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 55%, var(--gold-dark) 100%);
      box-shadow: 0 0 0 1px rgba(214, 179, 106, 0.45), 0 4px 14px rgba(0, 0, 0, 0.25);
    }
    .user-menu-avatar--on-light {
      color: #0B0B0D;
      background: linear-gradient(135deg, #F1D89A 0%, #D6B36A 100%);
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

  userInitial(): string {
    const name = (this.authState.userFullName() || '').trim();
    if (name) return name.charAt(0).toUpperCase();
    const email = this.authState.user()?.email || '';
    return email ? email.charAt(0).toUpperCase() : 'A';
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
