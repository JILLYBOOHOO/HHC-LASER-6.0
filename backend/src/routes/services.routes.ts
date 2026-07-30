import { Router } from 'express';
import { executeQuery, executeQueryOne, executeUpdate } from '../config/database';
import { successResponse } from '../models/types';

const router = Router();

// GET /api/services  — public service catalog
router.get('/', async (req, res, next) => {
  try {
    const categoryId = req.query['category_id'];
    const isFeatured = req.query['is_featured'];
    let sql = `
      SELECT s.*, sc.name as category_name, sc.slug as category_slug
      FROM services s
      JOIN service_categories sc ON sc.id = s.category_id
      WHERE s.is_active = 1
    `;
    const params: any[] = [];
    
    if (categoryId) {
      sql += ' AND s.category_id = ?';
      params.push(categoryId);
    }
    if (isFeatured === 'true') {
      sql += ' AND s.is_featured = 1';
    }
    
    sql += ' ORDER BY sc.sort_order ASC, s.sort_order ASC';
    
    const services = await executeQuery(sql, params);
    res.json(successResponse(services));
  } catch (e) { next(e); }
});

// Admin Routes for CRUD

router.post('/', async (req, res, next) => {
  try {
    // In a real app we'd verify admin role here
    const { category_id, name, slug, description, price_jmd, duration_minutes, thumbnail_url, is_featured, is_active } = req.body;
    const insertId = await executeUpdate(
      `INSERT INTO services (category_id, name, slug, description, price_jmd, duration_minutes, thumbnail_url, is_featured, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, name, slug, description, price_jmd, duration_minutes, thumbnail_url, is_featured ? 1 : 0, is_active ? 1 : 0]
    );
    res.json(successResponse({ id: insertId, message: 'Service created successfully' }));
  } catch(e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { category_id, name, slug, description, price_jmd, duration_minutes, thumbnail_url, is_featured, is_active } = req.body;
    await executeUpdate(
      `UPDATE services SET category_id=?, name=?, slug=?, description=?, price_jmd=?, duration_minutes=?, thumbnail_url=?, is_featured=?, is_active=?
       WHERE id=?`,
      [category_id, name, slug, description, price_jmd, duration_minutes, thumbnail_url, is_featured ? 1 : 0, is_active ? 1 : 0, req.params['id']]
    );
    res.json(successResponse({ message: 'Service updated successfully' }));
  } catch(e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await executeUpdate(`DELETE FROM services WHERE id=?`, [req.params['id']]);
    res.json(successResponse({ message: 'Service deleted successfully' }));
  } catch(e) { next(e); }
});

// GET /api/services/categories  — list categories
router.get('/categories', async (_req, res, next) => {
  try {
    const categories = await executeQuery(
      'SELECT * FROM service_categories WHERE is_active = 1 ORDER BY sort_order ASC'
    );
    res.json(successResponse(categories));
  } catch (e) { next(e); }
});

// GET /api/services/:slug  — service detail by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const service = await executeQueryOne(
      `SELECT s.*, sc.name as category_name
       FROM services s
       JOIN service_categories sc ON sc.id = s.category_id
       WHERE s.slug = ? AND s.is_active = 1`,
      [req.params['slug']]
    );
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found.' });
      return;
    }
    res.json(successResponse(service));
  } catch (e) { next(e); }
});

export default router;
