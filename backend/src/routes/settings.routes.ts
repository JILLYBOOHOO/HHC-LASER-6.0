import { Router, Request, Response } from 'express';
import { executeQuery, withTransaction, executeUpdate } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// GET /api/settings/business
router.get('/business', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await executeQuery<any>(
      'SELECT setting_key, setting_value FROM business_settings'
    );
    
    // Transform rows into a single object mapping
    const settings = rows.reduce((acc: any, row: any) => {
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
  
  try {
    await withTransaction(async (conn) => {
      for (const [key, value] of Object.entries(settings)) {
        await conn.execute(
          `INSERT INTO business_settings (setting_key, setting_value) 
           VALUES (?, ?) 
           ON CONFLICT(setting_key) DO UPDATE SET setting_value = ?`,
          [key, JSON.stringify(value), JSON.stringify(value)]
        );
      }
    });
    
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating business settings:', error);
    res.status(500).json({ success: false, message: 'Server error updating business settings' });
  }
});

export default router;
