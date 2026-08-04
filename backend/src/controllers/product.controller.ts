import { Request, Response } from 'express';
import { executeQuery, executeUpdate } from '../config/database';

export const productController = {
  // Public - Get all products
  async getAllProducts(req: Request, res: Response) {
    try {
      const rows = await executeQuery(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         JOIN product_categories c ON p.category_id = c.id
         WHERE p.is_active = 1
         ORDER BY p.created_at DESC`
      );
      res.json(rows);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  },

  // Public - Get single product by slug
  async getProductBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const rows = await executeQuery(
        `SELECT p.*, c.name as category_name
         FROM products p
         JOIN product_categories c ON p.category_id = c.id
         WHERE p.slug = ? AND p.is_active = 1`,
        [slug]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(rows[0]);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Failed to fetch product' });
    }
  },

  // Public - Get categories
  async getCategories(req: Request, res: Response) {
    try {
      const rows = await executeQuery(
        `SELECT * FROM product_categories WHERE is_active = 1 ORDER BY sort_order ASC`
      );
      res.json(rows);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  },

  // Admin - Create Product
  async createProduct(req: Request, res: Response) {
    try {
      const { category_id, name, slug, description, price_jmd, stock_quantity, image_url, is_featured } = req.body;

      const result = await executeUpdate(
        `INSERT INTO products (category_id, name, slug, description, price_jmd, stock_quantity, image_url, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [category_id, name, slug, description, price_jmd, stock_quantity, image_url, is_featured]
      );

      res.status(201).json({ id: result.insertId, message: 'Product created successfully' });
    } catch (error: any) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Failed to create product' });
    }
  },

  // Admin - Update Product
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { category_id, name, slug, description, price_jmd, stock_quantity, image_url, is_featured, is_active } = req.body;

      await executeUpdate(
        `UPDATE products SET
         category_id = ?, name = ?, slug = ?, description = ?,
         price_jmd = ?, stock_quantity = ?, image_url = ?, is_featured = ?, is_active = ?
         WHERE id = ?`,
        [category_id, name, slug, description, price_jmd, stock_quantity, image_url, is_featured, is_active, id]
      );

      res.json({ message: 'Product updated successfully' });
    } catch (error: any) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Failed to update product' });
    }
  },

  // Admin - Delete Product (Soft delete)
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await executeUpdate(`UPDATE products SET is_active = 0 WHERE id = ?`, [id]);
      res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Failed to delete product' });
    }
  }
};
