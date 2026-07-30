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
    <div class="flex h-screen overflow-hidden bg-cream-100">
      <aside class="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-charcoal-100"
             style="background: #1a1a1a">
        <div class="px-5 py-4 border-b border-white/10">
          <div class="font-heading text-lg text-white">HHC LASER</div>
          <div class="text-gold-400 text-xs tracking-widest">Specialist Portal</div>
        </div>
        <nav class="flex-1 py-4 space-y-1 px-3">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path" routerLinkActive="bg-gold-500/15 text-gold-400"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-cream-300
                      hover:text-gold-400 hover:bg-white/5 transition-all text-sm">
              <mat-icon class="!text-base">{{ link.icon }}</mat-icon> {{ link.label }}
            </a>
          }
        </nav>
        <div class="px-3 pb-4 border-t border-white/10 pt-4">
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
export class EmployeeLayoutComponent {
  navLinks = [
    { path: '/employee/schedule',   icon: 'calendar_today',     label: 'My Schedule' },
    { path: '/employee/clients',    icon: 'people',             label: 'My Clients' },
    { path: '/employee/photo-vault', icon: 'photo_library',     label: 'Photo Vault' },
  ];
  constructor(private authService: AuthService) {}
  logout(): void { this.authService.logout().subscribe(); }
}
