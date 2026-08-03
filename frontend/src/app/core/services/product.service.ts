import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, timeout } from 'rxjs';
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

  private fallbackProducts: Product[] = [
    {
      id: 1,
      category_id: 1,
      category_name: 'Skincare',
      name: 'Lemon Wash',
      slug: 'lemon-wash',
      description: 'Lemon Acne Cleanser',
      price_jmd: 1500,
      stock_quantity: 500,
      image_url: 'https://hhclaserco.sfo3.digitaloceanspaces.com/products/8f3cb1bf-03af-42ee-9c68-10a435a9cbb2.webp',
      is_featured: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      category_id: 1,
      category_name: 'Skincare',
      name: 'Bikini & Body Cream',
      slug: 'bikini-body-cream',
      description: 'A luxurious cream specifically formulated for sensitive areas.',
      price_jmd: 4500,
      stock_quantity: 200,
      image_url: 'https://hhclaserco.sfo3.digitaloceanspaces.com/products/5f4fedb5-d201-4fff-978c-56c54d2d57b3.webp',
      is_featured: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      category_id: 1,
      category_name: 'Skincare',
      name: 'Coco Bean & Coconut Cleanser & Moisturizer',
      slug: 'coco-bean-coconut-cleanser-moisturizer',
      description: 'SKIN SUPPLEMENT Coco Bean & Coconut Cleanser & Moisturizer for deep hydration.',
      price_jmd: 4500,
      stock_quantity: 200,
      image_url: 'https://hhclaserco.sfo3.digitaloceanspaces.com/products/e59724c7-a244-443e-b6a8-6f297dc95d2d.webp',
      is_featured: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      category_id: 1,
      category_name: 'Skincare',
      name: 'Toner & Collagen Moisturizer Set',
      slug: 'toner-collagen-moisturizer-set',
      description: 'Best Combination for Clear & Smooth Skin',
      price_jmd: 5000,
      stock_quantity: 200,
      image_url: 'https://hhclaserco.sfo3.digitaloceanspaces.com/products/249cd5fb-a647-49bf-8020-c4a07f3d28a3.webp',
      is_featured: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  async loadProducts() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await lastValueFrom(this.http.get<Product[]>(`${this.base}/products`).pipe(timeout(1000)));
      if (data && data.length > 0) {
        this.products.set(data);
      } else {
        // Fallback if backend returns empty
        this.products.set(this.fallbackProducts);
      }
    } catch (e: any) {
      console.warn('Backend failed to load products, using fallback data.', e);
      this.products.set(this.fallbackProducts);
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
      const product = await lastValueFrom(this.http.get<Product>(`${this.base}/products/${slug}`).pipe(timeout(1000)));
      if (product) return product;
    } catch (e: any) {
      console.warn('Backend failed to load product by slug, using fallback data.', e);
    }
    // Fallback
    const fallback = this.fallbackProducts.find(p => p.slug === slug);
    return fallback || null;
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
