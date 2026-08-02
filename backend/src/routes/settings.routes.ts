import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// GET /api/settings/business
router.get('/business', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT setting_key, setting_value FROM business_settings'
    );
    
    // Transform rows into a single object mapping
    const settings = rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});
    
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching business settings:', error);
    res.status(500).json({ success: false, message: 'Server error fetching business settings' });
  }
});

// PUT /api/settings/business (Admin only)
router.put('/business', authenticate, requireRole('admin', 'owner', 'developer'), async (req: Request, res: Response): Promise<void> => {
  const settings = req.body;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    for (const [key, value] of Object.entries(settings)) {
      await connection.query(
        `INSERT INTO business_settings (setting_key, setting_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [key, JSON.stringify(value), JSON.stringify(value)]
      );
    }
    
    await connection.commit();
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating business settings:', error);
    res.status(500).json({ success: false, message: 'Server error updating business settings' });
  } finally {
    connection.release();
  }
});

export default router;
