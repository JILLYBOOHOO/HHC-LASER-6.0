import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api.service';
import { CustomerMembership, MembershipPlan } from '../../../core/models/models';

@Component({
  selector: 'app-customer-memberships',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 class="text-3xl font-heading text-black">Memberships & Packages</h1>
        <p class="text-neutral-600 mt-1">Manage your active plans and explore available memberships.</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <section class="space-y-4">
          <h2 class="text-lg font-bold text-black">My Active Memberships</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (m of memberships(); track m.id) {
              <div class="card p-6">
                <div class="flex justify-between items-start mb-3">
                  <h3 class="font-bold text-black">{{ m.plan_name }}</h3>
                  <span class="text-xs px-2 py-1 rounded-full font-medium"
                        [ngClass]="m.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'">
                    {{ m.status | titlecase }}
                  </span>
                </div>
                <p class="text-sm text-charcoal-500 mb-2">{{ m.plan_type | titlecase }} plan · J$ {{ m.price_jmd | number }}</p>
                <p class="text-sm text-charcoal-600">{{ m.sessions_remaining }} sessions remaining</p>
                <p class="text-xs text-charcoal-400 mt-2">Valid until {{ m.end_date | date:'mediumDate' }}</p>
                @if (m.status === 'active') {
                  <button mat-stroked-button class="mt-4 !text-red-600" (click)="cancelMembership(m.id)">Cancel Membership</button>
                }
              </div>
            } @empty {
              <div class="col-span-full card p-8 text-center text-charcoal-500">
                <mat-icon class="!text-4xl mb-2 text-charcoal-300">card_membership</mat-icon>
                <p>You don't have an active membership yet.</p>
              </div>
            }
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-lg font-bold text-black">Available Plans</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @for (plan of plans(); track plan.id) {
              <div class="card p-6 flex flex-col">
                <h3 class="font-bold text-black mb-1">{{ plan.name }}</h3>
                <div class="text-2xl font-bold text-gold-600 mb-3">J$ {{ plan.price_jmd | number }}</div>
                <p class="text-sm text-charcoal-600 flex-1">{{ plan.description }}</p>
                <p class="text-xs text-charcoal-400 mt-2">{{ plan.sessions_per_cycle }} sessions per cycle</p>
                <button mat-flat-button class="mt-4 !bg-black !text-white" (click)="subscribe(plan.id)">Subscribe</button>
              </div>
            } @empty {
              <p class="text-charcoal-500 text-sm">No membership plans are currently available.</p>
            }
          </div>
        </section>
      }
    </div>
  `
})
export class CustomerMembershipsComponent implements OnInit {
  private api = inject(ApiService);

  memberships = signal<CustomerMembership[]>([]);
  plans = signal<MembershipPlan[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.api.getMyMemberships().subscribe({
      next: res => this.memberships.set(res.data ?? []),
      error: () => this.memberships.set([])
    });
    this.api.getMembershipPlans().subscribe({
      next: res => {
        this.plans.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  subscribe(planId: number) {
    this.api.subscribeMembership(planId).subscribe({
      next: () => this.ngOnInit()
    });
  }

  cancelMembership(id: number) {
    this.api.cancelMembership(id).subscribe({
      next: () => this.ngOnInit()
    });
  }
}
