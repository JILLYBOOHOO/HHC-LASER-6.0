import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApiService } from '../../../core/services/api.service';
import { Service, ServiceCategory } from '../../../core/models/models';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, 
    MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatSlideToggleModule
  ],
  template: `
    <div class="p-8 max-w-7xl mx-auto">
      
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-heading text-charcoal-900 mb-2">Manage Services</h1>
          <p class="text-charcoal-500">Add, edit, or remove treatments and manage featured items.</p>
        </div>
        <button mat-flat-button class="!bg-gold-500 !text-white hover:!bg-gold-600" (click)="openAddForm()">
          <mat-icon>add</mat-icon> Add Treatment
        </button>
      </div>

      <!-- Form Area -->
      @if (showForm()) {
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 mb-8">
          <h2 class="text-xl font-heading text-charcoal-800 mb-6">{{ isEditing() ? 'Edit Treatment' : 'New Treatment' }}</h2>
          <form [formGroup]="serviceForm" (ngSubmit)="onSubmit()">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Treatment Name</mat-label>
                <input matInput formControlName="name" placeholder="Full Abdomen" />
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Slug (URL)</mat-label>
                <input matInput formControlName="slug" placeholder="full-abdomen" />
              </mat-form-field>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category_id">
                  @for (cat of categories(); track cat.id) {
                    <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Image URL</mat-label>
                <input matInput formControlName="thumbnail_url" placeholder="https://..." />
              </mat-form-field>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Price (JMD)</mat-label>
                <input matInput type="number" formControlName="price_jmd" placeholder="18000" />
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Duration (mins)</mat-label>
                <input matInput type="number" formControlName="duration_minutes" placeholder="15" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" placeholder="Treatment details..."></textarea>
            </mat-form-field>

            <div class="flex gap-8 mb-6">
              <mat-slide-toggle formControlName="is_featured" color="primary">Featured on Homepage</mat-slide-toggle>
              <mat-slide-toggle formControlName="is_active" color="primary">Active</mat-slide-toggle>
            </div>

            <div class="flex justify-end gap-3">
              <button type="button" mat-stroked-button (click)="closeForm()">Cancel</button>
              <button type="submit" mat-flat-button class="!bg-charcoal-900 !text-white" [disabled]="serviceForm.invalid">
                Save Treatment
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
        <table mat-table [dataSource]="services()" class="w-full">
          
          <ng-container matColumnDef="image">
            <th mat-header-cell *matHeaderCellDef class="w-16"></th>
            <td mat-cell *matCellDef="let s">
              <img [src]="s.thumbnail_url || 'https://source.unsplash.com/800x600/?spa'" class="w-10 h-10 rounded-lg object-cover bg-charcoal-50" />
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Treatment</th>
            <td mat-cell *matCellDef="let s">
              <div class="font-medium text-charcoal-900">{{ s.name }}</div>
              <div class="text-xs text-charcoal-400">{{ s.category_name }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef>Price</th>
            <td mat-cell *matCellDef="let s" class="text-charcoal-600">J$ {{ s.price_jmd | number:'1.2-2' }}</td>
          </ng-container>

          <ng-container matColumnDef="duration">
            <th mat-header-cell *matHeaderCellDef>Duration</th>
            <td mat-cell *matCellDef="let s" class="text-charcoal-600">{{ s.duration_minutes }} mins</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let s">
              @if(s.is_featured) { <mat-icon class="!text-gold-500 !text-sm !w-4 !h-4" title="Featured">star</mat-icon> }
              @if(!s.is_active) { <span class="text-xs text-red-500 ml-1">Inactive</span> }
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
            <td mat-cell *matCellDef="let s" class="text-right">
              <button mat-icon-button class="!text-charcoal-400 hover:!text-gold-600" (click)="openEditForm(s)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button class="!text-charcoal-400 hover:!text-red-600" (click)="deleteService(s.id)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-cream-50 transition-colors"></tr>
        </table>
        
        @if (services().length === 0 && !loading()) {
          <div class="p-8 text-center text-charcoal-400">
            No treatments found. Click "Add Treatment" to create one.
          </div>
        }
      </div>

    </div>
  `
})
export class AdminServicesComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  displayedColumns = ['image', 'name', 'price', 'duration', 'status', 'actions'];
  
  services = signal<Service[]>([]);
  categories = signal<ServiceCategory[]>([]);
  
  showForm = signal(false);
  isEditing = signal(false);
  currentServiceId = signal<number | null>(null);
  loading = signal(true);
  
  serviceForm: FormGroup;

  constructor() {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      category_id: ['', Validators.required],
      description: [''],
      price_jmd: ['', Validators.required],
      duration_minutes: [15, Validators.required],
      thumbnail_url: [''],
      is_featured: [false],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    
    this.api.getServiceCategories().subscribe({
      next: (res) => { if (res.success && res.data) this.categories.set(res.data); }
    });

    this.api.getServices().subscribe({
      next: (res) => {
        if (res.success && res.data) this.services.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openAddForm() {
    this.isEditing.set(false);
    this.currentServiceId.set(null);
    this.serviceForm.reset({ duration_minutes: 15, is_featured: false, is_active: true });
    this.showForm.set(true);
  }

  openEditForm(service: Service) {
    this.isEditing.set(true);
    this.currentServiceId.set(service.id);
    this.serviceForm.patchValue(service);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  onSubmit() {
    if (this.serviceForm.valid) {
      if (this.isEditing() && this.currentServiceId()) {
        this.api.updateService(this.currentServiceId()!, this.serviceForm.value).subscribe({
          next: () => {
            this.closeForm();
            this.loadData();
          }
        });
      } else {
        this.api.createService(this.serviceForm.value).subscribe({
          next: () => {
            this.closeForm();
            this.loadData();
          }
        });
      }
    }
  }

  deleteService(id: number) {
    if (confirm('Are you sure you want to delete this treatment?')) {
      this.api.deleteService(id).subscribe({
        next: () => this.loadData()
      });
    }
  }
}
