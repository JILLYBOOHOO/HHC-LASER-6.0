import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { ServicesManagementService, TreatmentItem } from '../../../core/services/services-management.service';
import { ApiService } from '../../../core/services/api.service';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans text-slate-800 bg-[#f8fafc] min-h-screen">
      
      <!-- Header Title & Action (Matching screenshot) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-serif font-bold text-slate-900 leading-none">Services</h1>
          <p class="text-xs font-bold text-slate-500 mt-2">
            Manage your clinical offerings. Total Services: <span class="text-slate-800 font-extrabold">{{ services.length }}</span>
          </p>
        </div>
        <button (click)="openAddForm()" class="px-5 py-2.5 bg-[#b8924f] hover:bg-[#a6803b] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto">
          <mat-icon class="!text-lg">add_circle</mat-icon>
          <span>+ Add New Service</span>
        </button>
      </div>

      <!-- Search & Category Filters Row (Matching screenshot) -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <!-- Category Tabs -->
        <div class="flex flex-wrap gap-2">
          <button (click)="selectCategoryTab(null)"
                  [class.bg-black]="selectedCategoryId === null"
                  [class.text-white]="selectedCategoryId === null"
                  [class.bg-white]="selectedCategoryId !== null"
                  [class.text-slate-600]="selectedCategoryId !== null"
                  class="px-4 py-2 text-xs font-black rounded-lg border border-slate-200 transition-all uppercase tracking-wide">
            All Services
          </button>
          <button *ngFor="let cat of dbCategories" (click)="selectCategoryTab(cat.id)"
                  [class.bg-black]="selectedCategoryId === cat.id"
                  [class.text-white]="selectedCategoryId === cat.id"
                  [class.bg-white]="selectedCategoryId !== cat.id"
                  [class.text-slate-600]="selectedCategoryId !== cat.id"
                  class="px-4 py-2 text-xs font-black rounded-lg border border-slate-200 transition-all uppercase tracking-wide">
            {{ cat.name }}
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative max-w-xs w-full">
          <mat-icon class="absolute left-3 top-2.5 !text-sm text-slate-400">search</mat-icon>
          <input type="text" [(ngModel)]="searchQuery" (input)="filterServices()"
                 placeholder="Search services..."
                 class="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#b8924f]">
        </div>
      </div>

      <!-- Cards Grid View (Minimalist Luxury Card style) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
        <div *ngFor="let s of filteredServices" 
             class="group relative bg-white border border-black/80 rounded-lg flex flex-col h-full hover:shadow-lg transition-all duration-300 overflow-hidden">
          
          <!-- Image -->
          <div class="aspect-[16/11] w-full overflow-hidden relative bg-gray-50">
            <img loading="lazy" [src]="s.thumbnail_url" 
                 [alt]="s.name"
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                 (error)="handleImageError($event, s)">
                 
            <!-- Top Action icons -->
            <div class="absolute top-2 right-2 flex gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm z-10">
              <button (click)="openEditForm(s)" class="p-1 hover:bg-slate-100 rounded-md text-slate-600 hover:text-[#b8924f] transition-all">
                <mat-icon class="!text-sm !w-4 !h-4 flex items-center justify-center">edit</mat-icon>
              </button>
              <button (click)="deleteService(s.id)" class="p-1 hover:bg-slate-100 rounded-md text-slate-600 hover:text-red-500 transition-all">
                <mat-icon class="!text-sm !w-4 !h-4 flex items-center justify-center">delete_outline</mat-icon>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-3 md:p-3.5 flex flex-col flex-1 text-left">
            <!-- Title & Category -->
            <div class="flex justify-between items-start gap-2 mb-1">
              <h3 class="text-black font-extrabold text-xs md:text-sm uppercase tracking-wide line-clamp-1 group-hover:text-gold-500 transition-colors flex-1">
                {{ s.name }}
              </h3>
            </div>
            
            <!-- Price -->
            <div class="text-black font-extrabold text-sm md:text-base mb-1.5">
              JMD $ {{ s.price_jmd | number:'1.0-0' }}
            </div>

            <!-- Description -->
            <p class="text-neutral-600 text-[11px] font-normal leading-snug mb-2 flex-1 line-clamp-2">
              {{ s.short_description || s.description || 'No description provided.' }}
            </p>
            
            <!-- Duration & Status -->
            <div class="text-[10px] text-neutral-500 flex items-center justify-between mb-1 mt-auto">
              <div class="flex items-center gap-1">
                <mat-icon class="!text-[13px] !w-[13px] !h-[13px] text-[#b8924f]">schedule</mat-icon>
                <span>{{ s.duration_minutes }} mins</span>
              </div>
              
              <span [class]="s.is_active ? 'text-green-600' : 'text-red-500'" class="font-bold flex items-center gap-1 uppercase">
                <span class="w-1.5 h-1.5 rounded-full" [class.bg-green-500]="s.is_active" [class.bg-red-500]="!s.is_active"></span>
                {{ s.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Modal Overlay (Add / Edit) -->
      <div *ngIf="showForm()" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 class="text-xl font-bold font-serif text-slate-900 tracking-tight flex items-center gap-2">
              <mat-icon class="text-[#b8924f]">spa</mat-icon>
              <span>{{ isEditing() ? 'Edit Treatment' : 'New Treatment' }}</span>
            </h2>
            <button (click)="closeForm()" class="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-all">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <form [formGroup]="serviceForm" (ngSubmit)="onSubmit()" class="space-y-4 text-left">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Treatment Name *</label>
                <input type="text" formControlName="name" placeholder="Full Abdomen Laser" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#b8924f]">
              </div>
              
              <div>
                <label class="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Category *</label>
                <select formControlName="category_id" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#b8924f]">
                  <option *ngFor="let cat of dbCategories" [value]="cat.id">{{ cat.name }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Price (JMD J$) *</label>
                <input type="number" formControlName="price_jmd" placeholder="18000" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#b8924f]">
              </div>
              
              <div>
                <label class="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Duration (minutes) *</label>
                <input type="number" formControlName="duration_minutes" placeholder="30" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#b8924f]">
              </div>

              <div>
                 <label class="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Thumbnail Image</label>
                 <input type="file" (change)="onFileSelected($event)" accept="image/*" class="w-full text-xs font-bold text-slate-500">
                 <div *ngIf="uploadingImage" class="mt-2 text-xs font-bold text-[#b8924f] flex items-center gap-1.5">
                   <mat-spinner diameter="16"></mat-spinner>
                   <span>Uploading image...</span>
                 </div>
                 <div *ngIf="imagePreview && !uploadingImage" class="mt-2">
                   <img [src]="imagePreview" class="w-20 h-20 rounded-md object-cover border border-slate-200">
                 </div>
              </div>
            </div>

            <div>
              <label class="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Description</label>
              <textarea formControlName="description" rows="3" placeholder="Enter treatment procedure details and recommendations..." class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#b8924f] resize-none"></textarea>
            </div>

            <div class="flex items-center gap-6 pt-2">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-black text-slate-800">
                <input type="checkbox" formControlName="is_featured" class="w-4 h-4 rounded border-slate-300 text-[#b8924f] focus:ring-0">
                <span>Featured on Homepage</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer text-xs font-black text-slate-800">
                <input type="checkbox" formControlName="is_active" class="w-4 h-4 rounded border-slate-300 text-[#b8924f] focus:ring-0">
                <span>Active Status</span>
              </label>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" (click)="closeForm()" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">Cancel</button>
              <button type="submit" [disabled]="serviceForm.invalid || uploadingImage" class="px-6 py-2.5 bg-[#b8924f] hover:bg-[#a6803b] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50">
                Save Treatment
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class AdminServicesComponent implements OnInit {
  showForm = signal(false);
  isEditing = signal(false);
  uploadingImage = false;
  imagePreview: string | null = null;
  
  services: any[] = [];
  filteredServices: any[] = [];
  dbCategories: any[] = [];
  
  selectedCategoryId: number | null = null;
  searchQuery = '';
  currentServiceId = signal<number | null>(null);

  serviceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private servicesService: ServicesManagementService,
    private apiService: ApiService,
    private http: HttpClient,
    private authState: AuthStateService,
    private snackBar: MatSnackBar
  ) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      category_id: [1, Validators.required],
      price_jmd: [18000, Validators.required],
      duration_minutes: [30, Validators.required],
      thumbnail_url: [''],
      description: [''],
      is_featured: [true],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadServicesList();
  }

  loadCategories() {
    this.apiService.getServiceCategories().subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.dbCategories = res.data;
        }
      }
    });
  }

  loadServicesList() {
    this.servicesService.services$.subscribe({
      next: (data) => {
        this.services = data;
        this.filterServices();
      }
    });
    this.servicesService.loadAll();
  }

  filterServices() {
    let list = [...this.services];

    // Filter by Category Tab
    if (this.selectedCategoryId !== null) {
      list = list.filter(s => Number(s.category_id) === this.selectedCategoryId);
    }

    // Filter by Search Query
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      list = list.filter(s => 
        s.name.toLowerCase().includes(query) || 
        (s.description && s.description.toLowerCase().includes(query)) ||
        (s.category_name && s.category_name.toLowerCase().includes(query))
      );
    }

    this.filteredServices = list;
  }

  selectCategoryTab(catId: number | null) {
    this.selectedCategoryId = catId;
    this.filterServices();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.uploadingImage = true;
    const formData = new FormData();
    formData.append('file', file);

    const headers = { Authorization: `Bearer ${this.authState.token()}` };
    this.http.post<any>(`${environment.apiUrl}/media/upload`, formData, { headers }).subscribe({
      next: (res) => {
        this.uploadingImage = false;
        if (res.success && res.data?.file_url) {
          this.serviceForm.patchValue({ thumbnail_url: res.data.file_url });
          this.imagePreview = res.data.file_url;
          this.snackBar.open('Image uploaded successfully!', 'OK', { duration: 2000 });
        } else {
          this.snackBar.open('Upload failed.', 'OK', { duration: 3500 });
        }
      },
      error: () => {
        this.uploadingImage = false;
        this.snackBar.open('Failed to upload image.', 'OK', { duration: 3500 });
      }
    });
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  openAddForm(): void {
    this.isEditing.set(false);
    this.currentServiceId.set(null);
    this.imagePreview = null;
    this.serviceForm.reset({
      category_id: this.dbCategories[0]?.id || 1,
      price_jmd: 10000,
      duration_minutes: 30,
      thumbnail_url: '',
      is_featured: false,
      is_active: true,
      description: ''
    });
    this.showForm.set(true);
  }

  openEditForm(service: any): void {
    this.isEditing.set(true);
    this.currentServiceId.set(service.id);
    this.imagePreview = service.thumbnail_url;
    this.serviceForm.patchValue({
      name: service.name,
      category_id: service.category_id || 1,
      price_jmd: service.price_jmd,
      duration_minutes: service.duration_minutes,
      thumbnail_url: service.thumbnail_url || '',
      description: service.description || '',
      is_featured: service.is_featured === 1 || service.is_featured === true,
      is_active: service.is_active === 1 || service.is_active === true
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) return;

    const formValue = { ...this.serviceForm.value };
    formValue.slug = this.generateSlug(formValue.name);
    formValue.category_id = Number(formValue.category_id);

    if (this.isEditing() && this.currentServiceId() !== null) {
      this.servicesService.updateService(this.currentServiceId()!, formValue).subscribe({
        next: () => {
          this.servicesService.refresh();
          this.snackBar.open('Treatment updated successfully!', 'OK', { duration: 2500 });
        },
        error: err => console.error('Update failed', err)
      });
    } else {
      this.servicesService.addService(formValue).subscribe({
        next: () => {
          this.servicesService.refresh();
          this.snackBar.open('Treatment added successfully!', 'OK', { duration: 2500 });
        },
        error: err => console.error('Add failed', err)
      });
    }
    this.closeForm();
  }

  handleImageError(event: any, service?: any) {
    const name = service?.name || event.target.alt || '';
    const cat = service?.category_name || '';
    event.target.src = this.getSmartFallbackImage(name, cat);
  }

  getSmartFallbackImage(name: string = '', category: string = ''): string {
    const n = name.toLowerCase();
    // Return a generic local placeholder image for any missing thumbnail.
    // All images are stored under /hhclaser_img/hhclaser_images/.
    return '/hhclaser_img/hhclaser_images/Modern luxury clinic reception area.webp';
  }

  deleteService(id: number): void {
    if (confirm('Are you sure you want to delete this treatment?')) {
      this.servicesService.deleteService(id).subscribe({
        next: () => {
          this.servicesService.refresh();
          this.snackBar.open('Treatment deleted successfully!', 'OK', { duration: 2500 });
        },
        error: err => console.error('Delete failed', err)
      });
    }
  }
}
