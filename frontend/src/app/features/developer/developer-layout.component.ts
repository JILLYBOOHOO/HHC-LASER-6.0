import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-developer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gray-950 text-gray-300 font-mono flex">
      
      <!-- Sidebar -->
      <aside class="w-64 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex">
        <div class="p-6 border-b border-gray-800">
          <div class="flex items-center gap-2 text-green-500 font-bold tracking-widest text-sm">
            <mat-icon class="!w-5 !h-5 !text-[20px]">terminal</mat-icon>
            DEV CONSOLE
          </div>
        </div>

        <nav class="flex-1 py-4 flex flex-col gap-1 px-3">
          <a routerLink="/developer/overview" routerLinkActive="bg-gray-800 text-white" 
             class="flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-gray-800 hover:text-white transition-colors">
            <mat-icon class="!w-4 !h-4 !text-[16px]">dashboard</mat-icon>
            System Overview
          </a>
          
          <a routerLink="/developer/errors" routerLinkActive="bg-gray-800 text-white" 
             class="flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-gray-800 hover:text-white transition-colors">
            <mat-icon class="!w-4 !h-4 !text-[16px] text-red-500">bug_report</mat-icon>
            Error Logs
          </a>

          <a routerLink="/developer/auth-settings" routerLinkActive="bg-gray-800 text-white" 
             class="flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-gray-800 hover:text-white transition-colors">
            <mat-icon class="!w-4 !h-4 !text-[16px] text-blue-400">security</mat-icon>
            Auth Settings
          </a>
        </nav>

        <div class="p-4 border-t border-gray-800">
          <button (click)="logout()" class="flex items-center gap-2 text-sm text-gray-500 hover:text-white w-full px-3 py-2 transition-colors">
            <mat-icon class="!w-4 !h-4 !text-[16px]">logout</mat-icon>
            Exit Console
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <!-- Topbar -->
        <header class="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
          <div class="text-xs text-gray-500">Platform: HHC LASER v1.0.0</div>
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1 text-xs">
              <span class="w-2 h-2 rounded-full bg-green-500"></span> API Online
            </span>
          </div>
        </header>

        <!-- Dynamic Content -->
        <div class="flex-1 overflow-auto p-6">
          <router-outlet></router-outlet>
        </div>
      </main>

    </div>
  `
})
export class DeveloperLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout().subscribe();
    this.router.navigate(['/login']);
  }
}
