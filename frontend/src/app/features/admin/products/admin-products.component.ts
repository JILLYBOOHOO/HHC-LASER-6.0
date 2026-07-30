import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ProductService } from '../../../core/services/product.service';
import { Product, ProductCategory } from '../../../core/models/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, 
    MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatSlideToggleModule
  ],
  template: `
    <div class="p-8 max-w-7xl mx-auto">
      
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-heading text-charcoal-900 mb-2">Product Management</h1>
          <p class="text-charcoal-500">Manage your skincare catalog and inventory.</p>
        </div>
        <button mat-flat-button class="!bg-gold-500 !text-white hover:!bg-gold-600" (click)="openAddForm()">
          <mat-icon>add</mat-icon> Add Product
        </button>
      </div>

      <!-- Form Area -->
      @if (showForm()) {
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 mb-8">
          <h2 class="text-xl font-heading text-charcoal-800 mb-6">{{ isEditing() ? 'Edit Product' : 'New Product' }}</h2>
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Product Name</mat-label>
                <input matInput formControlName="name" placeholder="Lemon Acne Cleanser" />
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Slug (URL)</mat-label>
                <input matInput formControlName="slug" placeholder="lemon-acne-cleanser" />
              </mat-form-field>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category_id">
                  @for (cat of productService.categories(); track cat.id) {
                    <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Image URL</mat-label>
                <input matInput formControlName="image_url" placeholder="https://..." />
              </mat-form-field>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Price (JMD)</mat-label>
                <input matInput type="number" formControlName="price_jmd" placeholder="1500" />
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Stock Quantity</mat-label>
                <input matInput type="number" formControlName="stock_quantity" placeholder="200" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" placeholder="Product details..."></textarea>
            </mat-form-field>

            <div class="flex gap-8 mb-6">
              <mat-slide-toggle formControlName="is_featured" color="primary">Featured on Homepage</mat-slide-toggle>
              <mat-slide-toggle formControlName="is_active" color="primary">Active</mat-slide-toggle>
            </div>

            <div class="flex justify-end gap-3">
              <button type="button" mat-stroked-button (click)="closeForm()">Cancel</button>
              <button type="submit" mat-flat-button class="!bg-charcoal-900 !text-white" [disabled]="productForm.invalid">
                Save Product
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
        <table mat-table [dataSource]="productService.products()" class="w-full">
          
          <ng-container matColumnDef="image">
            <th mat-header-cell *matHeaderCellDef class="w-16"></th>
            <td mat-cell *matCellDef="let p">
              <img [src]="p.image_url" class="w-10 h-10 rounded-lg object-cover bg-charcoal-50" />
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Product</th>
            <td mat-cell *matCellDef="let p">
              <div class="font-medium text-charcoal-900">{{ p.name }}</div>
              <div class="text-xs text-charcoal-400">{{ p.category_name }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef>Price</th>
            <td mat-cell *matCellDef="let p" class="text-charcoal-600">J$ {{ p.price_jmd | number:'1.2-2' }}</td>
          </ng-container>

          <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef>Stock</th>
            <td mat-cell *matCellDef="let p">
              <span class="px-2 py-1 rounded-full text-xs font-medium" 
                    [ngClass]="p.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ p.stock_quantity }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let p">
              @if(p.is_featured) { <mat-icon class="!text-gold-500 !text-sm !w-4 !h-4" title="Featured">star</mat-icon> }
              @if(!p.is_active) { <span class="text-xs text-red-500 ml-1">Inactive</span> }
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
            <td mat-cell *matCellDef="let p" class="text-right">
              <button mat-icon-button class="!text-charcoal-400 hover:!text-gold-600" (click)="openEditForm(p)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button class="!text-charcoal-400 hover:!text-red-600" (click)="deleteProduct(p.id)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-cream-50 transition-colors"></tr>
        </table>
        
        @if (productService.products().length === 0 && !productService.loading()) {
          <div class="p-8 text-center text-charcoal-400">
            No products found. Click "Add Product" to create one.
          </div>
        }
      </div>

    </div>
  `
})
export class AdminProductsComponent implements OnInit {
  displayedColumns = ['image', 'name', 'price', 'stock', 'status', 'actions'];
  
  showForm = signal(false);
  isEditing = signal(false);
  currentProductId = signal<number | null>(null);
  
  productForm: FormGroup;

  constructor(
    public productService: ProductService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      category_id: ['', Validators.required],
      description: [''],
      price_jmd: ['', Validators.required],
      stock_quantity: [0, Validators.required],
      image_url: [''],
      is_featured: [false],
      is_active: [true]
    });
  }

  async ngOnInit() {
    await this.productService.loadCategories();
    await this.productService.loadProducts();
  }

  openAddForm() {
    this.isEditing.set(false);
    this.currentProductId.set(null);
    this.productForm.reset({ stock_quantity: 0, is_featured: false, is_active: true });
    this.showForm.set(true);
  }

  openEditForm(product: Product) {
    this.isEditing.set(true);
    this.currentProductId.set(product.id);
    this.productForm.patchValue(product);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  async onSubmit() {
    if (this.productForm.valid) {
      if (this.isEditing() && this.currentProductId()) {
        await this.productService.updateProduct(this.currentProductId()!, this.productForm.value);
      } else {
        await this.productService.createProduct(this.productForm.value);
      }
      this.closeForm();
      await this.productService.loadProducts();
    }
  }

  async deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      await this.productService.deleteProduct(id);
      await this.productService.loadProducts();
    }
  }
}
