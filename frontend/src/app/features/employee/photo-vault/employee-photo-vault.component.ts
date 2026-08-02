import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { Employee } from '../../../core/models/models';

@Component({
  selector: 'app-employee-photo-vault',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900">Photo Vault</h1>
        <p class="text-slate-600 text-sm mt-1">Before and after treatment photos for your clients.</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (error()) {
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800 text-sm">{{ error() }}</div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (photo of photos(); track photo.id) {
            <div class="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
              <div class="grid grid-cols-2 gap-1 bg-slate-100">
                <div class="aspect-square relative">
                  @if (photo.before_url) {
                    <img [src]="photo.before_url" alt="Before" class="w-full h-full object-cover" />
                  } @else {
                    <div class="w-full h-full flex items-center justify-center text-slate-400 text-xs">No before photo</div>
                  }
                  <span class="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">Before</span>
                </div>
                <div class="aspect-square relative">
                  @if (photo.after_url) {
                    <img [src]="photo.after_url" alt="After" class="w-full h-full object-cover" />
                  } @else {
                    <div class="w-full h-full flex items-center justify-center text-slate-400 text-xs">No after photo</div>
                  }
                  <span class="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">After</span>
                </div>
              </div>
              <div class="p-4">
                <div class="font-semibold text-slate-900 text-sm">{{ photo.customer_name || 'Client' }}</div>
                <div class="text-xs text-slate-500">{{ photo.body_area }} · {{ photo.created_at | date:'mediumDate' }}</div>
                @if (photo.notes) {
                  <p class="text-xs text-slate-600 mt-2">{{ photo.notes }}</p>
                }
              </div>
            </div>
          } @empty {
            <div class="col-span-full bg-white rounded-2xl border-2 border-slate-200 p-12 text-center text-slate-500">
              <mat-icon class="!text-5xl mb-3 text-slate-300">photo_library</mat-icon>
              <p>No photos uploaded yet.</p>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class EmployeePhotoVaultComponent implements OnInit {
  private api = inject(ApiService);
  private authState = inject(AuthStateService);

  photos = signal<any[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    const userId = this.authState.user()?.id;
    if (!userId) {
      this.error.set('You must be signed in to view the photo vault.');
      this.loading.set(false);
      return;
    }

    this.api.getEmployees().subscribe({
      next: res => {
        const employee = (res.data ?? []).find((e: Employee) => e.user_id === userId);
        if (!employee) {
          this.error.set('No employee profile linked to your account.');
          this.loading.set(false);
          return;
        }
        this.api.getEmployeePhotos(employee.id).subscribe({
          next: photoRes => {
            this.photos.set(photoRes.data ?? []);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Unable to load photos.');
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.error.set('Unable to load employee profile.');
        this.loading.set(false);
      }
    });
  }
}
