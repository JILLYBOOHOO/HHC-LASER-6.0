import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthStateService } from '../../../core/store/auth-state.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="max-w-3xl mx-auto py-8 px-4 md:px-8">
      <div class="mb-8">
        <h1 class="text-3xl font-heading text-black mb-2">My Profile</h1>
        <p class="text-neutral-500 text-sm">Update your personal information and contact details.</p>
      </div>

      <div class="bg-white border border-neutral-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <div class="px-6 md:px-8 py-5 border-b border-neutral-100 bg-[#fafafa]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#d6b36a]/20 text-[#8a6a2e] flex items-center justify-center">
              <mat-icon class="!text-xl">person</mat-icon>
            </div>
            <div>
              <div class="text-sm font-semibold text-black">Personal details</div>
              <div class="text-xs text-neutral-500">These details appear on your bookings and invoices.</div>
            </div>
          </div>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="p-6 md:p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label class="block space-y-1.5">
              <span class="text-xs font-semibold tracking-wide uppercase text-neutral-500">First name</span>
              <input
                type="text"
                formControlName="firstName"
                class="profile-input"
                placeholder="First name"
              />
            </label>

            <label class="block space-y-1.5">
              <span class="text-xs font-semibold tracking-wide uppercase text-neutral-500">Last name</span>
              <input
                type="text"
                formControlName="lastName"
                class="profile-input"
                placeholder="Last name"
              />
            </label>
          </div>

          <label class="block space-y-1.5">
            <span class="text-xs font-semibold tracking-wide uppercase text-neutral-500">Email address</span>
            <input
              type="email"
              formControlName="email"
              class="profile-input profile-input--readonly"
              readonly
            />
            <span class="text-[11px] text-neutral-400">Contact support to change your email address.</span>
          </label>

          <label class="block space-y-1.5">
            <span class="text-xs font-semibold tracking-wide uppercase text-neutral-500">Phone number</span>
            <input
              type="tel"
              formControlName="phone"
              class="profile-input"
              placeholder="(876) 000-0000"
            />
          </label>

          <div class="flex justify-end pt-2 border-t border-neutral-100">
            <button
              type="submit"
              class="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style="background: linear-gradient(135deg, #f1d89a 0%, #d6b36a 55%, #a5813f 100%);"
              [disabled]="profileForm.invalid || profileForm.pristine"
            >
              <mat-icon class="!text-base !w-4 !h-4">save</mat-icon>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-input {
      width: 100%;
      display: block;
      border: 1px solid #e5e5e5;
      background: #ffffff;
      color: #171717;
      border-radius: 10px;
      padding: 0.75rem 0.9rem;
      font-size: 0.925rem;
      line-height: 1.4;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .profile-input:hover {
      border-color: #d4d4d4;
    }
    .profile-input:focus {
      border-color: #d6b36a;
      box-shadow: 0 0 0 3px rgba(214, 179, 106, 0.18);
    }
    .profile-input--readonly {
      background: #f7f7f7;
      color: #737373;
      cursor: not-allowed;
    }
    .profile-input--readonly:focus {
      border-color: #e5e5e5;
      box-shadow: none;
    }
  `],
})
export class CustomerProfileComponent {
  public authState = inject(AuthStateService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  profileForm: FormGroup;

  constructor() {
    const user = this.authState.user() as any;
    this.profileForm = this.fb.group({
      firstName: [user?.first_name || '', Validators.required],
      lastName: [user?.last_name || '', Validators.required],
      email: [user?.email || ''],
      phone: [user?.phone || ''],
    });
  }

  saveProfile() {
    if (this.profileForm.valid) {
      this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
      this.profileForm.markAsPristine();
    }
  }
}
