import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="p-8 max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-heading text-white mb-2">Business Settings</h1>
        <p class="text-charcoal-500">Update your company information, contact details, and social links.</p>
      </div>

      <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()" class="space-y-8">
        
        <!-- Brand Info -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-cream-200">
          <h2 class="text-xl font-heading text-gray-50 mb-6 border-b border-cream-100 pb-2">Brand Identity</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Business Name</mat-label>
              <input matInput formControlName="business_name" placeholder="HHC Laser & Co" />
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Logo URL</mat-label>
              <input matInput formControlName="logo_url" placeholder="https://..." />
            </mat-form-field>
          </div>
          
          <mat-form-field appearance="outline" class="w-full mt-4">
            <mat-label>Tagline</mat-label>
            <input matInput formControlName="tagline" placeholder="Jamaica's premier destination for advanced laser treatments..." />
          </mat-form-field>
        </div>

        <!-- Contact Info -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-cream-200">
          <h2 class="text-xl font-heading text-gray-50 mb-6 border-b border-cream-100 pb-2">Contact Details</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Primary Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="info@hhclaser.com" />
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Primary Phone</mat-label>
              <input matInput formControlName="phone" placeholder="(876) 555-0199" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>WhatsApp Number</mat-label>
              <input matInput formControlName="whatsapp" placeholder="(876) 555-0199" />
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Main Address</mat-label>
              <input matInput formControlName="address" placeholder="123 Luxury Ave, Kingston" />
            </mat-form-field>
          </div>
        </div>

        <!-- Social Links -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-cream-200">
          <h2 class="text-xl font-heading text-gray-50 mb-6 border-b border-cream-100 pb-2">Social Media Links</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Instagram URL</mat-label>
              <input matInput formControlName="instagram_url" placeholder="https://instagram.com/..." />
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Facebook URL</mat-label>
              <input matInput formControlName="facebook_url" placeholder="https://facebook.com/..." />
            </mat-form-field>
          </div>
        </div>
        
        <div class="flex justify-end pt-4">
          <button type="submit" mat-flat-button class="!bg-gold-500 !text-black !px-8 !py-6 text-lg hover:!bg-gold-600 transition-colors" [disabled]="saving()">
            {{ saving() ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>

      </form>
    </div>
  `
})
export class AdminSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  settingsForm: FormGroup;
  saving = signal(false);

  constructor() {
    this.settingsForm = this.fb.group({
      business_name: [''],
      logo_url: [''],
      tagline: [''],
      email: [''],
      phone: [''],
      whatsapp: [''],
      address: [''],
      instagram_url: [''],
      facebook_url: ['']
    });
  }

  ngOnInit() {
    this.http.get<{success: boolean, data: any}>(`${environment.apiUrl}/settings/business`)
      .subscribe(res => {
        if (res.success && res.data) {
          this.settingsForm.patchValue(res.data);
        }
      });
  }

  onSubmit() {
    this.saving.set(true);
    this.http.put(`${environment.apiUrl}/settings/business`, this.settingsForm.value)
      .subscribe({
        next: () => {
          this.saving.set(false);
          // could show a toast here
        },
        error: () => this.saving.set(false)
      });
  }
}
