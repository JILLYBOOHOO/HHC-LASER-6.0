import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { AuthStateService } from '../../../core/store/auth-state.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule, MatTabsModule, MatChipsModule],
  template: `
    <div class="p-4 md:p-8 max-w-7xl mx-auto">
      
      <!-- Welcome Header -->
      <div class="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-heading text-charcoal-800">Welcome back, {{ authState.user()?.first_name }}!</h1>
          <p class="text-charcoal-500">Manage your appointments, view treatment history, and access resources.</p>
        </div>
        <a routerLink="/customer/book" class="btn-primary whitespace-nowrap">
          <mat-icon class="!text-base mr-1">add</mat-icon> New Booking
        </a>
      </div>

      <mat-tab-group animationDuration="0ms" class="luxury-tabs">
        
        <!-- Dashboard Overview Tab -->
        <mat-tab label="Overview">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
            
            <!-- Left Col: Upcoming & Recent -->
            <div class="lg:col-span-2 space-y-6">
              
              <!-- Upcoming Appointment -->
              <div class="card p-6 border-l-4 border-l-gold-500">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-heading text-lg">Next Appointment</h3>
                  <span class="badge-gold">Upcoming</span>
                </div>
                
                <div class="flex flex-col md:flex-row md:items-center gap-6">
                  <div class="bg-cream-100 p-4 rounded-xl text-center min-w-[120px]">
                    <div class="text-charcoal-500 text-sm font-semibold uppercase">Aug</div>
                    <div class="text-3xl font-heading font-bold text-gold-600">15</div>
                    <div class="text-charcoal-600 text-sm mt-1">10:00 AM</div>
                  </div>
                  
                  <div class="flex-1">
                    <h4 class="font-semibold text-charcoal-800 text-lg mb-1">Signature Gold Facial</h4>
                    <p class="text-charcoal-500 text-sm mb-2 flex items-center gap-1">
                      <mat-icon class="!text-sm">location_on</mat-icon> Kingston Flagship
                    </p>
                    <p class="text-charcoal-500 text-sm flex items-center gap-1">
                      <mat-icon class="!text-sm">person</mat-icon> with Dr. Sarah Jenkins
                    </p>
                  </div>
                  
                  <div class="flex flex-col gap-2">
                    <button class="btn-secondary text-sm py-1.5" (click)="reschedule()">Reschedule</button>
                    <button class="text-red-500 hover:text-red-600 text-sm font-medium transition-colors" (click)="cancel()">Cancel</button>
                  </div>
                </div>
              </div>

              <!-- Quick Links -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <a routerLink="/customer/medical" class="card p-4 text-center hover:shadow-gold transition-all group cursor-pointer border border-cream-200">
                  <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2 text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <mat-icon>medical_information</mat-icon>
                  </div>
                  <div class="font-medium text-xs text-charcoal-700">Medical Info</div>
                </a>
                <a routerLink="/customer/memberships" class="card p-4 text-center hover:shadow-gold transition-all group cursor-pointer border border-cream-200">
                  <div class="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center mx-auto mb-2 text-gold-600 group-hover:bg-gold-100 transition-colors">
                    <mat-icon>card_membership</mat-icon>
                  </div>
                  <div class="font-medium text-xs text-charcoal-700">Memberships</div>
                </a>
                <div class="card p-4 text-center hover:shadow-gold transition-all group cursor-pointer border border-cream-200">
                  <div class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-2 text-purple-600 group-hover:bg-purple-100 transition-colors">
                    <mat-icon>receipt_long</mat-icon>
                  </div>
                  <div class="font-medium text-xs text-charcoal-700">Payments</div>
                </div>
                <div class="card p-4 text-center hover:shadow-gold transition-all group cursor-pointer border border-cream-200">
                  <div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2 text-green-600 group-hover:bg-green-100 transition-colors">
                    <mat-icon>folder_shared</mat-icon>
                  </div>
                  <div class="font-medium text-xs text-charcoal-700">Documents</div>
                </div>
              </div>
            </div>

            <!-- Right Col: Resources -->
            <div class="space-y-6">
              
              <div class="card p-5">
                <h3 class="font-heading text-lg border-b border-cream-200 pb-2 mb-4">Preparation Videos</h3>
                <div class="space-y-4">
                  <div class="flex items-start gap-3 cursor-pointer group">
                    <div class="w-20 h-12 bg-charcoal-800 rounded flex items-center justify-center relative overflow-hidden flex-shrink-0">
                      <mat-icon class="text-white z-10 opacity-80 group-hover:opacity-100 transition-opacity">play_circle</mat-icon>
                      <img src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=200&q=80" class="absolute inset-0 w-full h-full object-cover opacity-50">
                    </div>
                    <div>
                      <div class="text-sm font-medium text-charcoal-800 group-hover:text-gold-600 transition-colors">Pre-Laser Care</div>
                      <div class="text-xs text-charcoal-400">2:45 min</div>
                    </div>
                  </div>
                  <div class="flex items-start gap-3 cursor-pointer group">
                    <div class="w-20 h-12 bg-charcoal-800 rounded flex items-center justify-center relative overflow-hidden flex-shrink-0">
                      <mat-icon class="text-white z-10 opacity-80 group-hover:opacity-100 transition-opacity">play_circle</mat-icon>
                      <img src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=200&q=80" class="absolute inset-0 w-full h-full object-cover opacity-50">
                    </div>
                    <div>
                      <div class="text-sm font-medium text-charcoal-800 group-hover:text-gold-600 transition-colors">Chemical Peel Prep</div>
                      <div class="text-xs text-charcoal-400">4:10 min</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-gold-50 rounded-xl p-5 border border-gold-200 text-center">
                <mat-icon class="text-gold-500 mb-2 !text-3xl">loyalty</mat-icon>
                <h4 class="font-heading font-semibold text-charcoal-800">VIP Membership</h4>
                <p class="text-sm text-charcoal-600 mt-1 mb-3">Upgrade to VIP for 15% off all treatments and priority booking.</p>
                <button class="btn-primary w-full text-sm py-1.5">View Plans</button>
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
                    <td class="py-3 px-4 font-medium text-charcoal-800">Full Legs Laser Hair Removal</td>
                    <td class="py-3 px-4">Dr. Sarah Jenkins</td>
                    <td class="py-3 px-4"><span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Completed</span></td>
                    <td class="py-3 px-4 text-right">
                      <button mat-icon-button class="text-charcoal-400 hover:text-gold-600"><mat-icon>receipt</mat-icon></button>
                    </td>
                  </tr>
                  <tr class="hover:bg-cream-50 transition-colors">
                    <td class="py-3 px-4">Jun 05, 2026</td>
                    <td class="py-3 px-4 font-medium text-charcoal-800">HydraFacial</td>
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
      border-bottom: 1px solid var(--color-cream-300);
    }
    ::ng-deep .luxury-tabs .mat-mdc-tab {
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-charcoal-400);
    }
    ::ng-deep .luxury-tabs .mat-mdc-tab.mdc-tab--active {
      color: var(--color-gold-600);
    }
    ::ng-deep .luxury-tabs .mdc-tab-indicator__content--underline {
      border-color: var(--color-gold-500) !important;
      border-width: 2px !important;
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
