import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { InternalBookingModalComponent } from '../../../shared/components/internal-booking-modal/internal-booking-modal.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, MatIconModule, InternalBookingModalComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-[#f8fafc] font-sans text-slate-800 selection:bg-[#b8924f] selection:text-white">
      
      <!-- Sidebar Navigation (Light Theme) -->
      <aside class="hidden md:flex flex-col w-64 flex-shrink-0 bg-white border-r border-slate-200 z-20 shadow-sm">
        
        <!-- Logo Header -->
        <div class="px-6 py-8 flex flex-col gap-1">
          <div class="font-bold text-2xl tracking-tight text-slate-900">HHC Laser</div>
          <div class="text-[10px] font-black tracking-[0.2em] text-[#b8924f] uppercase">ADMIN TERMINAL</div>
        </div>
 
        <!-- Navigation Links -->
        <nav class="flex-1 py-4 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          @for (link of navLinks; track link.label) {
            <ng-container *ngIf="link.action === 'modal'; else routerLinkTpl">
              <button (click)="openBookingModal()"
                 class="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-slate-500 hover:text-[#b8924f] hover:bg-slate-50 transition-all text-xs font-semibold group text-left">
                <mat-icon class="!text-lg transition-colors">{{ link.icon }}</mat-icon>
                <span class="tracking-wide">{{ link.label }}</span>
              </button>
            </ng-container>
            <ng-template #routerLinkTpl>
              <a [routerLink]="link.path"
                 routerLinkActive="active-nav-link"
                 [routerLinkActiveOptions]="{exact: link.exact || false}"
                 class="flex items-center gap-4 px-4 py-3 rounded-lg text-slate-500 hover:text-[#b8924f] hover:bg-slate-50 transition-all text-xs font-semibold group">
                 
                <mat-icon class="!text-lg transition-colors">{{ link.icon }}</mat-icon>
                <span class="tracking-wide">{{ link.label }}</span>
              </a>
            </ng-template>
          }
        </nav>
 
        <!-- Admin Profile Bottom (matching image) -->
        <div class="p-4 mx-4 mb-4 border-t border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-900 text-amber-400 border border-slate-800 font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
              AD
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900">Admin User</div>
              <div class="text-[9px] font-medium text-slate-500 uppercase tracking-widest">TERMINAL 04</div>
            </div>
          </div>
          <button (click)="logout()" title="Log Out" class="text-slate-400 hover:text-[#b8924f] transition-colors p-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-center">
            <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">logout</mat-icon>
          </button>
        </div>
      </aside>
 
      <!-- Main Body Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc]">
        
        <!-- Top Navigation Header Bar is REMOVED from layout, moved into components per the design -->
        
        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto relative">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
    
    <app-internal-booking-modal *ngIf="showBookingModal" (close)="closeBookingModal()"></app-internal-booking-modal>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #b8924f; }
    a.active-nav-link {
      background-color: #b8924f;
      font-weight: 900;
      color: #ffffff !important;
      box-shadow: 0 4px 14px rgba(184,146,79,0.3);
    }
    a.active-nav-link mat-icon {
      color: #ffffff !important;
    }
  `]
})
export class AdminLayoutComponent {
  showBookingModal = false;

  navLinks = [
    { path: '/admin',                       icon: 'dashboard',              label: 'Dashboard', exact: true },
    { action: 'modal', path: 'none',        icon: 'add_circle',             label: 'Make Appointment' },
    { path: '/admin/bookings',              icon: 'calendar_month',         label: 'Appointments' },
    { path: '/admin/check-in',              icon: 'how_to_reg',             label: 'Check-in Queue' },
    { path: '/admin/patients',              icon: 'people',                 label: 'Patients' },
    { path: '/admin/staff',                 icon: 'badge',                  label: 'Staff' },
    { path: '/admin/services',              icon: 'spa',                    label: 'Services' },
    { path: '/admin/gallery',               icon: 'collections',            label: 'Gallery' },
    { path: '/admin/transactions',          icon: 'receipt_long',           label: 'Transactions' },
    { path: '/admin/reports',               icon: 'bar_chart',              label: 'Reports' },
    { path: '/admin/settings',              icon: 'settings',               label: 'Settings' }
  ];

  constructor(public authService: AuthService) {}

  openBookingModal() {
    this.showBookingModal = true;
  }

  closeBookingModal() {
    this.showBookingModal = false;
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
