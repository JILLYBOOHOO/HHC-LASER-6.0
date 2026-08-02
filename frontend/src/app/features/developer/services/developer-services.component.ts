import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ServicesManagementService, TreatmentItem } from '../../../core/services/services-management.service';

@Component({
  selector: 'app-developer-services',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <!-- Top Title & Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Services & Treatments (Developer)</h1>
          <p class="text-xs font-bold text-slate-500 mt-1">Add, edit, or remove treatments and manage featured items.</p>
        </div>
        <button (click)="openAddForm()" class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto border border-amber-400">
          <mat-icon class="!text-lg">add_circle</mat-icon>
          <span>+ Add Treatment</span>
        </button>
      </div>

      <!-- Add / Edit Treatment Form -->
      @if (showForm()) {
        <div class="bg-white rounded-3xl border-2 border-slate-300 p-6 md:p-8 shadow-xl space-y-6 animate-fade-up">
          <div class="flex items-center justify-between border-b-2 border-slate-100 pb-4">
            <h2 class="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <mat-icon class="text-amber-500">spa</mat-icon>
              <span>{{ isEditing() ? 'Edit Treatment' : 'New Treatment' }}</span>
            </h2>
            <button (click)="closeForm()" class="p-1 hover:bg-slate-100 rounded-full text-slate-500">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <form [formGroup]="serviceForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-1">Treatment Name *</label>
                <input type="text" formControlName="name" placeholder="Full Abdomen Laser" class="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800" />
              </div>
              <div>
                <label class="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-1">Category *</label>
                <select formControlName="category" class="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800">
                  <option value="Laser Hair Removal">Laser Hair Removal</option>
                  <option value="Facial Treatments">Facial Treatments</option>
                  <option value="Chemical Peels">Chemical Peels</option>
                  <option value="Body Contouring">Body Contouring</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-1">Price (JMD J$) *</label>
                <input type="number" formControlName="price_jmd" placeholder="18000" class="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800" />
              </div>
              <div>
                <label class="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-1">Duration (minutes) *</label>
                <input type="number" formControlName="duration_minutes" placeholder="30" class="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800" />
              </div>
              <div>
                <label class="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-1">Thumbnail Image</label>
                <input type="file" (change)="onFileSelected($event)" accept="image/*" class="w-full" />
                <div *ngIf="imagePreview" class="mt-2"><img [src]="imagePreview" alt="Preview" class="w-20 h-20 rounded-md object-cover" /></div>
              </div>
            </div>

            <div>
              <label class="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-1">Description</label>
              <textarea formControlName="description" rows="3" placeholder="Enter treatment procedure details and recommendations..." class="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"></textarea>
            </div>

            <div class="flex items-center gap-6 pt-2">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-900">
                <input type="checkbox" formControlName="is_featured" class="w-4 h-4 rounded border-slate-400 text-amber-600 focus:ring-0" />
                <span>Featured on Homepage</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-900">
                <input type="checkbox" formControlName="is_active" class="w-4 h-4 rounded border-slate-400 text-amber-600 focus:ring-0" />
                <span>Active Status</span>
              </label>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
              <button type="button" (click)="closeForm()" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">Cancel</button>
              <button type="submit" [disabled]="serviceForm.invalid" class="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50">Save Treatment</button>
            </div>
          </form>
        </div>
      }

      <!-- Services Data Table Card -->
      <div class="bg-white rounded-3xl border-2 border-slate-200 shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="border-b-2 border-slate-200 text-xs font-black text-slate-900 uppercase tracking-wider bg-slate-100/80">
                <th class="py-4 px-4 w-16 text-center">Image</th>
                <th class="py-4 px-6">Treatment</th>
                <th class="py-4 px-6">Price</th>
                <th class="py-4 px-6">Duration</th>
                <th class="py-4 px-6">Status</th>
                <th class="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y border-slate-100 text-xs font-medium text-slate-800">
              @for (s of services$ | async; track s.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="py-3 px-4 text-center"><img loading="lazy" [src]="s.thumbnail_url" class="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs mx-auto" /></td>
                  <td class="py-3 px-6">
                    <div class="font-black text-slate-900 text-sm">{{ s.name }}</div>
                    <div class="text-xs font-bold text-slate-500 mt-0.5">{{ s.category }}</div>
                  </td>
                  <td class="py-3 px-6 font-black text-slate-900 text-sm">J$ {{ s.price_jmd | number:'1.2-2' }}</td>
                  <td class="py-3 px-6 font-black text-slate-900 text-sm">{{ s.duration_minutes }} mins</td>
                  <td class="py-3 px-6">
                    <div class="flex items-center gap-1.5">
                      @if (s.is_featured) {
                        <span class="px-2 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-[10px] rounded-full border border-amber-300 flex items-center gap-0.5">
                          <mat-icon class="!text-[11px]">star</mat-icon>
                          <span>Featured</span>
                        </span>
                      }
                      @if (s.is_active) {
                        <span class="px-2 py-0.5 bg-teal-100 text-teal-900 font-extrabold text-[10px] rounded-full border border-teal-300">Active</span>
                      } @else {
                        <span class="px-2 py-0.5 bg-slate-100 text-slate-600 font-extrabold text-[10px] rounded-full border border-slate-300">Inactive</span>
                      }
                    </div>
                  </td>
                  <td class="py-3 px-6 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button (click)="openEditForm(s)" title="Edit Treatment" class="p-1.5 hover:bg-slate-100 rounded-lg text-blue-600"><mat-icon class="!text-lg">edit</mat-icon></button>
                      <button (click)="deleteService(s.id)" title="Delete Treatment" class="p-1.5 hover:bg-slate-100 rounded-lg text-rose-600"><mat-icon class="!text-lg">delete_outline</mat-icon></button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styleUrls: []
})
export class DeveloperServicesComponent {
  showForm = signal(false);
  isEditing = signal(false);
  imagePreview: string | null = null;
  services$ = this.servicesService.services$;
  currentServiceId = signal<number | null>(null);

  serviceForm: FormGroup;

  constructor(private fb: FormBuilder, private servicesService: ServicesManagementService) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      category: ['Laser Hair Removal', Validators.required],
      price_jmd: [18000, Validators.required],
      duration_minutes: [30, Validators.required],
      thumbnail_url: [''],
      thumbnail_file: [null],
      description: [''],
      is_featured: [true],
      is_active: [true]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.serviceForm.patchValue({ thumbnail_file: file });
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.serviceForm.patchValue({ thumbnail_url: this.imagePreview });
      };
      reader.readAsDataURL(file);
    }
  }

  openAddForm(): void {
    this.isEditing.set(false);
    this.currentServiceId.set(null);
    this.imagePreview = null;
    this.serviceForm.reset({
      category: 'Laser Hair Removal',
      price_jmd: 18000,
      duration_minutes: 30,
      thumbnail_url: '',
      thumbnail_file: null,
      is_featured: true,
      is_active: true
    });
    this.showForm.set(true);
  }

  openEditForm(service: TreatmentItem): void {
    this.isEditing.set(true);
    this.currentServiceId.set(service.id);
    this.imagePreview = service.thumbnail_url;
    this.serviceForm.patchValue({
      ...service,
      thumbnail_file: null,
      thumbnail_url: service.thumbnail_url
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  onSubmit(): void {
    if (this.serviceForm.valid) {
      const formValue = { ...this.serviceForm.value } as any;
      const imageFile = this.serviceForm.get('thumbnail_file')?.value as File | null;
      if (this.isEditing() && this.currentServiceId() !== null) {
        this.servicesService.updateService(this.currentServiceId()!, formValue, imageFile).subscribe({
          next: () => this.servicesService.refresh(),
          error: err => console.error('Update failed', err)
        });
      } else {
        this.servicesService.addService(formValue, imageFile).subscribe({
          next: () => this.servicesService.refresh(),
          error: err => console.error('Add failed', err)
        });
      }
      this.closeForm();
    }
  }

  deleteService(id: number): void {
    if (confirm('Are you sure you want to delete this treatment?')) {
      this.servicesService.deleteService(id).subscribe({
        next: () => this.servicesService.refresh(),
        error: err => console.error('Delete failed', err)
      });
    }
  }
}
