import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Product, ProductCategory } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  products = signal<Product[]>([]);
  categories = signal<ProductCategory[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  private http = inject(HttpClient);
  private base = environment.apiUrl;

  async loadProducts() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await lastValueFrom(this.http.get<Product[]>(`${this.base}/products`));
      this.products.set(data);
    } catch (e: any) {
      this.error.set('Failed to load products');
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  async loadCategories() {
    try {
      const data = await lastValueFrom(this.http.get<ProductCategory[]>(`${this.base}/products/categories`));
      this.categories.set(data);
    } catch (e: any) {
      console.error('Failed to load categories', e);
    }
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      return await lastValueFrom(this.http.get<Product>(`${this.base}/products/${slug}`));
    } catch (e: any) {
      console.error('Failed to load product', e);
      return null;
    }
  }

  async createProduct(product: Partial<Product>) {
    return lastValueFrom(this.http.post<{id: number, message: string}>(`${this.base}/products`, product));
  }

  async updateProduct(id: number, product: Partial<Product>) {
    return lastValueFrom(this.http.put<{message: string}>(`${this.base}/products/${id}`, product));
  }

  async deleteProduct(id: number) {
    return lastValueFrom(this.http.delete<{message: string}>(`${this.base}/products/${id}`));
  }
}
