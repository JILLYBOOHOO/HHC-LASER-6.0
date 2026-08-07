import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { CustomerBookingsComponent } from '../bookings/customer-bookings.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule, MatTabsModule, MatChipsModule, CustomerBookingsComponent],
  template: `
    <div class="p-4 md:p-8 max-w-7xl mx-auto">
      
      <!-- Welcome Header -->
      <div class="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-heading text-black">Welcome back, {{ authState.user()?.first_name }}!</h1>
          <p class="text-neutral-600">Manage your appointments, view treatment history, and access resources.</p>
        </div>
      </div>

      <mat-tab-group animationDuration="0ms" class="luxury-tabs">
        
        <!-- Dashboard Overview Tab -->
        <mat-tab label="Overview">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
            
            <!-- Left Col: Upcoming & Recent -->
            <div class="lg:col-span-2 space-y-6">
              <app-customer-bookings></app-customer-bookings>
            </div>

            <!-- Right Col: Resources -->
            <div class="space-y-6">
              <div class="card p-5">
                <h3 class="font-heading text-lg border-b border-neutral-200 pb-2 mb-4 text-black">Preparation Videos</h3>
                <div class="space-y-4">
                  <div class="flex items-start gap-3 cursor-pointer group">
                    <div class="w-20 h-12 bg-gray-50 rounded flex items-center justify-center relative overflow-hidden flex-shrink-0">
                      <mat-icon class="text-black z-10 opacity-80 group-hover:opacity-100 transition-opacity">play_circle</mat-icon>
                      <img loading="lazy" src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=200&q=80" class="absolute inset-0 w-full h-full object-cover opacity-50">
                    </div>
                    <div>
                      <div class="text-sm font-medium text-neutral-800 group-hover:text-[#a5813f] transition-colors">Pre-Laser Care</div>
                      <div class="text-xs text-neutral-500">2:45 min</div>
                    </div>
                  </div>
                  <div class="flex items-start gap-3 cursor-pointer group">
                    <div class="w-20 h-12 bg-gray-50 rounded flex items-center justify-center relative overflow-hidden flex-shrink-0">
                      <mat-icon class="text-black z-10 opacity-80 group-hover:opacity-100 transition-opacity">play_circle</mat-icon>
                      <img loading="lazy" src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=200&q=80" class="absolute inset-0 w-full h-full object-cover opacity-50">
                    </div>
                    <div>
                      <div class="text-sm font-medium text-neutral-800 group-hover:text-[#a5813f] transition-colors">Chemical Peel Prep</div>
                      <div class="text-xs text-neutral-500">4:10 min</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>
        
        <!-- History Tab -->
        <mat-tab label="Treatment History">
          <div class="pt-6">
            <div class="card overflow-hidden">
              <table class="w-full text-left text-sm">
                <thead class="bg-cream-100 border-b border-cream-200 text-charcoal-600">
                  <tr>
                    <th class="py-3 px-4 font-semibold">Date</th>
                    <th class="py-3 px-4 font-semibold">Service</th>
                    <th class="py-3 px-4 font-semibold">Specialist</th>
                    <th class="py-3 px-4 font-semibold">Status</th>
                    <th class="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-cream-100">
                  <tr class="hover:bg-cream-50 transition-colors">
                    <td class="py-3 px-4">Jul 12, 2026</td>
                    <td class="py-3 px-4 font-medium text-neutral-800">Full Legs Laser Hair Removal</td>
                    <td class="py-3 px-4">Dr. Sarah Jenkins</td>
                    <td class="py-3 px-4"><span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Completed</span></td>
                    <td class="py-3 px-4 text-right">
                      <button mat-icon-button class="text-charcoal-400 hover:text-gold-600"><mat-icon>receipt</mat-icon></button>
                    </td>
                  </tr>
                  <tr class="hover:bg-cream-50 transition-colors">
                    <td class="py-3 px-4">Jun 05, 2026</td>
                    <td class="py-3 px-4 font-medium text-neutral-800">HydraFacial</td>
                    <td class="py-3 px-4">Emma Watson</td>
                    <td class="py-3 px-4"><span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Completed</span></td>
                    <td class="py-3 px-4 text-right">
                      <button mat-icon-button class="text-charcoal-400 hover:text-gold-600"><mat-icon>receipt</mat-icon></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    ::ng-deep .luxury-tabs .mat-mdc-tab-labels {
      background: transparent;
      border-bottom: 1px solid #e5e5e5;
    }
    ::ng-deep .luxury-tabs .mat-mdc-tab {
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-size: 0.75rem;
      font-weight: 600;
      color: #737373;
      transition: color 0.3s ease;
    }
    ::ng-deep .luxury-tabs .mat-mdc-tab:hover {
      color: #000000;
    }
    ::ng-deep .luxury-tabs .mat-mdc-tab.mdc-tab--active {
      color: #a5813f;
    }
    ::ng-deep .luxury-tabs .mdc-tab-indicator__content--underline {
      border-color: #d6b36a !important;
      border-width: 2px !important;
    }
    ::ng-deep .luxury-tabs .mat-mdc-tab .mdc-tab__text-label {
      color: inherit;
    }
  `]
})
export class CustomerDashboardComponent {
  constructor(public authState: AuthStateService) {}

  reschedule() {
    alert('Reschedule functionality triggered (Demo)');
  }
  
  cancel() {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      alert('Appointment cancelled successfully (Demo)');
    }
  }
}
