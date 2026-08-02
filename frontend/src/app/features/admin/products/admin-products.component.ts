import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface ProductItem {
  id: number;
  name: string;
  category: string;
  price_jmd: number;
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  image_url: string;
  description: string;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      
      <!-- Top Title & Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Product Management</h1>
          <p class="text-xs font-bold text-slate-500 mt-1">Manage your skincare catalog and inventory.</p>
        </div>
        <button (click)="openAddForm()" class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto border border-amber-400">
          <mat-icon class="!text-lg">add_circle</mat-icon>
          <span>+ Add Product</span>
        </button>
      </div>

      <!-- Add / Edit Product Interactive Card Form -->
      @if (showForm()) {
        <div class="bg-white rounded-3xl border-2 border-slate-300 p-6 md:p-8 shadow-xl space-y-6 animate-fade-up">
          <div class="flex items-center justify-between border-b-2 border-slate-100 pb-4">
            <h2 class="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <mat-icon class="text-amber-500">inventory_2</mat-icon>
              <span>{{ isEditing() ? 'Edit Product' : 'New Product' }}</span>
            </h2>
            <button (click)="closeForm()" class="p-1 hover:bg-slate-100 rounded-full text-slate-500"><mat-icon>close</mat-icon></button>
          </div>

          <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-4">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-1">Product Name *</label>
                <input type="text" formControlName="name" placeholder="Lemon Acne Cleanser" class="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800">
              </div>
              
              <div>
                <label class="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-1">Category *</label>
                <select formControlName="category" class="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800">
                  <option value="Cleanser">Cleanser</option>
                  <option value="Serum">Serum</option>
                  <option value="Moisturizer">Moisturizer</option>
                  <option value="Sunscreen">Sunscreen</option>
                  <option value="Facial Oil">Facial Oil</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-1">Price (JMD J$) *</label>
                <input type="number" formControlName="price_jmd" placeholder="3500" class="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800">
              </div>
              
              <div>
                <label class="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-1">Stock Quantity *</label>
                <input type="number" formControlName="stock_quantity" placeholder="50" class="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800">
              </div>

              <div>
                <label class="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-1">Image URL</label>
                <input type="text" formControlName="image_url" placeholder="https://..." class="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800">
              </div>
            </div>

            <div>
              <label class="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-1">Description</label>
              <textarea formControlName="description" rows="3" placeholder="Enter product description and active ingredients..." class="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"></textarea>
            </div>

            <div class="flex items-center gap-6 pt-2">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-900">
                <input type="checkbox" formControlName="is_featured" class="w-4 h-4 rounded border-slate-400 text-amber-600 focus:ring-0">
                <span>Featured on Homepage</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-900">
                <input type="checkbox" formControlName="is_active" class="w-4 h-4 rounded border-slate-400 text-amber-600 focus:ring-0">
                <span>Active Status</span>
              </label>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
              <button type="button" (click)="closeForm()" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">Cancel</button>
              <button type="submit" [disabled]="productForm.invalid" class="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50">
                Save Product
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Products Data Table Card -->
      <div class="bg-white rounded-3xl border-2 border-slate-200 shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="border-b-2 border-slate-200 text-xs font-black text-slate-900 uppercase tracking-wider bg-slate-100/80">
                <th class="py-4 px-4 w-16 text-center">Image</th>
                <th class="py-4 px-6">Product</th>
                <th class="py-4 px-6">Price</th>
                <th class="py-4 px-6">Stock</th>
                <th class="py-4 px-6">Status</th>
                <th class="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y border-slate-100 text-xs font-medium text-slate-800">
              @for (p of products; track p.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="py-3 px-4 text-center">
                    <img loading="lazy" [src]="p.image_url" class="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs mx-auto">
                  </td>
                  <td class="py-3 px-6">
                    <div class="font-black text-slate-900 text-sm">{{ p.name }}</div>
                    <div class="text-xs font-bold text-slate-500 mt-0.5">{{ p.category }}</div>
                  </td>
                  <td class="py-3 px-6 font-black text-slate-900 text-sm">J$ {{ p.price_jmd | number:'1.2-2' }}</td>
                  <td class="py-3 px-6">
                    <span class="px-2.5 py-1 rounded-full text-xs font-extrabold border"
                          [ngClass]="p.stock_quantity > 0 ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300'">
                      {{ p.stock_quantity > 0 ? p.stock_quantity + ' in stock' : 'Out of stock' }}
                    </span>
                  </td>
                  <td class="py-3 px-6">
                    <div class="flex items-center gap-1.5">
                      @if (p.is_featured) {
                        <span class="px-2 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-[10px] rounded-full border border-amber-300 flex items-center gap-0.5">
                          <mat-icon class="!text-[11px]">star</mat-icon>
                          <span>Featured</span>
                        </span>
                      }
                      @if (p.is_active) {
                        <span class="px-2 py-0.5 bg-teal-100 text-teal-900 font-extrabold text-[10px] rounded-full border border-teal-300">Active</span>
                      } @else {
                        <span class="px-2 py-0.5 bg-slate-100 text-slate-600 font-extrabold text-[10px] rounded-full border border-slate-300">Inactive</span>
                      }
                    </div>
                  </td>
                  <td class="py-3 px-6 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button (click)="openEditForm(p)" title="Edit Product" class="p-1.5 hover:bg-slate-100 rounded-lg text-blue-600">
                        <mat-icon class="!text-lg">edit</mat-icon>
                      </button>
                      <button (click)="deleteProduct(p.id)" title="Delete Product" class="p-1.5 hover:bg-slate-100 rounded-lg text-rose-600">
                        <mat-icon class="!text-lg">delete_outline</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class AdminProductsComponent {
  showForm = signal(false);
  isEditing = signal(false);
  currentProductId = signal<number | null>(null);

  productForm: FormGroup;

  products: ProductItem[] = [
    {
      id: 1,
      name: 'Lemon Acne Cleanser',
      category: 'Cleanser',
      price_jmd: 3500,
      stock_quantity: 45,
      is_featured: true,
      is_active: true,
      image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
      description: 'Refreshing citrus deep pore cleanser for acne-prone skin.'
    },
    {
      id: 2,
      name: 'Signature Skincare Oil',
      category: 'Facial Oil',
      price_jmd: 5200,
      stock_quantity: 20,
      is_featured: true,
      is_active: true,
      image_url: 'https://images.unsplash.com/photo-1608248597263-0057e57b4524?w=400&q=80',
      description: 'Nourishing organic botanical facial glow oil.'
    },
    {
      id: 3,
      name: 'Aloe Healing Gel',
      category: 'Moisturizer',
      price_jmd: 2800,
      stock_quantity: 60,
      is_featured: false,
      is_active: true,
      image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80',
      description: 'Pure Jamaican aloe vera soothing post-treatment gel.'
    },
    {
      id: 4,
      name: 'Daily Defense Sunscreen SPF 50',
      category: 'Sunscreen',
      price_jmd: 4800,
      stock_quantity: 35,
      is_featured: true,
      is_active: true,
      image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80',
      description: 'Broad spectrum non-greasy clear shield sunscreen.'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      category: ['Cleanser', Validators.required],
      price_jmd: [3500, Validators.required],
      stock_quantity: [25, Validators.required],
      image_url: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80'],
      description: [''],
      is_featured: [true],
      is_active: [true]
    });
  }

  openAddForm(): void {
    this.isEditing.set(false);
    this.currentProductId.set(null);
    this.productForm.reset({
      category: 'Cleanser',
      price_jmd: 3500,
      stock_quantity: 25,
      image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
      is_featured: true,
      is_active: true
    });
    this.showForm.set(true);
  }

  openEditForm(product: ProductItem): void {
    this.isEditing.set(true);
    this.currentProductId.set(product.id);
    this.productForm.patchValue(product);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      if (this.isEditing() && this.currentProductId() !== null) {
        const idx = this.products.findIndex(p => p.id === this.currentProductId());
        if (idx !== -1) {
          this.products[idx] = { id: this.currentProductId()!, ...this.productForm.value };
        }
      } else {
        const newProduct: ProductItem = {
          id: Date.now(),
          ...this.productForm.value
        };
        this.products.unshift(newProduct);
      }
      this.closeForm();
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.products = this.products.filter(p => p.id !== id);
    }
  }
}

