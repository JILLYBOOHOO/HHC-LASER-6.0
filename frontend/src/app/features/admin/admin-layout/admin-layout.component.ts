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
    <div class="flex h-screen overflow-hidden bg-[#111312] font-sans text-slate-200 selection:bg-cyan-500 selection:text-black">
      
      <!-- Sidebar Navigation (Dark Theme) -->
      <aside class="hidden md:flex flex-col w-64 flex-shrink-0 bg-[#141716] border-r border-[#1e2522] z-20">
        
        <!-- Logo Header -->
        <div class="px-6 py-8 flex flex-col gap-1">
          <div class="font-bold text-2xl tracking-tight text-[#00f0ff]">HHC Laser</div>
          <div class="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">ADMIN TERMINAL</div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 py-4 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path"
               routerLinkActive="active-nav-link"
               [routerLinkActiveOptions]="{exact: link.exact || false}"
               class="flex items-center gap-4 px-4 py-3 rounded-lg text-slate-400 hover:text-black hover:bg-[#1e2522] transition-all text-xs font-semibold group">
               
              <mat-icon class="!text-lg transition-colors">{{ link.icon }}</mat-icon>
              <span class="tracking-wide">{{ link.label }}</span>
            </a>
          }
        </nav>

        <!-- Admin Profile Bottom (matching image) -->
        <div class="p-4 mx-4 mb-4 border-t border-[#1e2522] flex items-center gap-3">
          <img loading="lazy" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&q=80" class="w-10 h-10 rounded-full object-cover border border-[#2c3632]">
          <div>
            <div class="text-xs font-bold text-black">Admin User</div>
            <div class="text-[9px] font-medium text-slate-500 uppercase tracking-widest">TERMINAL 04</div>
          </div>
        </div>
      </aside>

      <!-- Main Body Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#111312]">
        
        <!-- Top Navigation Header Bar is REMOVED from layout, moved into components per the design -->
        
        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto relative">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #2c3632; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #00f0ff; }
    a.active-nav-link {
      background-color: #00f0ff;
      font-weight: 900;
      color: #000000 !important;
      box-shadow: 0 0 15px rgba(0,240,255,0.3);
    }
    a.active-nav-link mat-icon {
      color: #000000 !important;
    }
  `]
})
export class AdminLayoutComponent {
  navLinks = [
    { path: '/admin',                       icon: 'dashboard',              label: 'Dashboard', exact: true },
    { path: '/booking',                     icon: 'add_circle',             label: 'Make Appointment' },
    { path: '/admin/bookings',              icon: 'calendar_month',         label: 'Appointments' },
    { path: '/admin/check-in',              icon: 'how_to_reg',             label: 'Check-in Queue' },
    { path: '/admin/patients',              icon: 'people',                 label: 'Patients' },
    { path: '/admin/staff',                 icon: 'badge',                  label: 'Staff' },
    { path: '/admin/reports',               icon: 'bar_chart',              label: 'Reports' },
    { path: '/admin/settings',              icon: 'settings',               label: 'Settings' }
  ];

  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout().subscribe();
  }
}
