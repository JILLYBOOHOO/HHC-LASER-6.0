import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, 
    MatIconModule, MatButtonModule, MatFormFieldModule, 
    MatInputModule, MatTabsModule
  ],
  template: `
    <div class="p-4 md:p-8 max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-heading text-charcoal-800">Admin Dashboard</h1>
        <p class="text-charcoal-500">Manage website content and business settings.</p>
      </div>

      <mat-tab-group animationDuration="0ms" class="luxury-tabs">
        
        <!-- Business Info Tab -->
        <mat-tab label="Business Information">
          <div class="pt-6">
            <div class="card p-6 md:p-8 max-w-3xl">
              <h2 class="text-xl font-heading text-charcoal-800 mb-6">Contact & Location Settings</h2>
              
              <form [formGroup]="businessForm" (ngSubmit)="saveBusinessInfo()" class="space-y-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Business Name</mat-label>
                  <input matInput formControlName="name">
                </mat-form-field>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="phone">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>WhatsApp Number</mat-label>
                    <input matInput formControlName="whatsapp">
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Address</mat-label>
                  <textarea matInput rows="2" formControlName="address"></textarea>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Opening Hours</mat-label>
                  <textarea matInput rows="3" formControlName="hours"></textarea>
                </mat-form-field>

                <div class="flex justify-end pt-4">
                  <button type="submit" class="btn-primary" [disabled]="businessForm.invalid">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </mat-tab>

        <!-- Homepage CMS Tab -->
        <mat-tab label="Homepage Content">
          <div class="pt-6">
            <div class="card p-6 md:p-8 max-w-3xl">
              <h2 class="text-xl font-heading text-charcoal-800 mb-6">Hero Section & Promotions</h2>
              
              <form [formGroup]="homeForm" (ngSubmit)="saveHomeInfo()" class="space-y-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Hero Headline</mat-label>
                  <input matInput formControlName="heroHeadline">
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Hero Subtitle</mat-label>
                  <input matInput formControlName="heroSubtitle">
                </mat-form-field>

                <div class="p-4 bg-cream-50 border border-cream-200 rounded-lg">
                  <h3 class="text-sm font-semibold text-charcoal-800 mb-2">Active Promotion Banner</h3>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Promotion Text</mat-label>
                    <input matInput formControlName="promoText">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="w-full mb-0">
                    <mat-label>Promotion Link (Optional)</mat-label>
                    <input matInput formControlName="promoLink">
                  </mat-form-field>
                </div>

                <div class="flex justify-end pt-4">
                  <button type="submit" class="btn-primary" [disabled]="homeForm.invalid">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </mat-tab>

        <!-- Media Uploads Tab -->
        <mat-tab label="Media Management">
          <div class="pt-6">
            <div class="card p-6 md:p-8">
              <h2 class="text-xl font-heading text-charcoal-800 mb-6">Gallery & Assets</h2>
              
              <div class="border-2 border-dashed border-cream-300 bg-cream-50 rounded-xl p-12 text-center cursor-pointer hover:bg-cream-100 transition-colors">
                <mat-icon class="!text-4xl text-gold-500 mb-2">cloud_upload</mat-icon>
                <h3 class="font-semibold text-charcoal-800">Drag & Drop Images/Videos Here</h3>
                <p class="text-sm text-charcoal-500 mt-1">Supports JPG, PNG, MP4 up to 50MB.</p>
                <button class="btn-secondary mt-4">Browse Files</button>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div class="h-32 bg-charcoal-800 rounded-lg overflow-hidden relative group">
                  <img src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&q=80" class="w-full h-full object-cover">
                  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button mat-icon-button class="text-white"><mat-icon>visibility</mat-icon></button>
                    <button mat-icon-button class="text-red-400"><mat-icon>delete</mat-icon></button>
                  </div>
                </div>
              </div>
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
export class AdminDashboardComponent {
  businessForm: FormGroup;
  homeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.businessForm = this.fb.group({
      name: ['HHC LASER', Validators.required],
      phone: ['+1 (876) 319-6241', Validators.required],
      whatsapp: ['18763196241', Validators.required],
      address: ['123 Luxury Avenue, Kingston 5\nJamaica, W.I.', Validators.required],
      hours: ['Mon - Fri: 9:00 AM - 6:00 PM\nSat: 10:00 AM - 4:00 PM\nSun: Closed', Validators.required]
    });

    this.homeForm = this.fb.group({
      heroHeadline: ["Jamaica's Premier MedSpa", Validators.required],
      heroSubtitle: ['Elevate your aesthetic with luxury treatments.', Validators.required],
      promoText: ['Summer Special: 20% off all Laser Hair Removal packages!', Validators.required],
      promoLink: ['/services']
    });
  }

  saveBusinessInfo() {
    alert('Business Information saved successfully! (Demo)');
  }

  saveHomeInfo() {
    alert('Homepage Content saved successfully! (Demo)');
  }
}
