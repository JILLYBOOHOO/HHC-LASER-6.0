import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// Ensure all routes require 'developer' or 'owner'
router.use(authenticate, requireRole('developer', 'owner'));

// GET /api/developer/system-status
router.get('/system-status', async (req: Request, res: Response): Promise<void> => {
  try {
    const [[{ userCount }]] = await pool.query<any[]>('SELECT COUNT(*) as userCount FROM users');
    const [[{ apptCount }]] = await pool.query<any[]>('SELECT COUNT(*) as apptCount FROM appointments');
    const [[{ serviceCount }]] = await pool.query<any[]>('SELECT COUNT(*) as serviceCount FROM services');
    const [[{ productCount }]] = await pool.query<any[]>('SELECT COUNT(*) as productCount FROM products');
    const [[{ errorCount }]] = await pool.query<any[]>('SELECT COUNT(*) as errorCount FROM error_logs WHERE status = "open"');
    
    // DB Health check
    let dbStatus = 'Healthy';
    try {
      await pool.query('SELECT 1');
    } catch {
      dbStatus = 'Unhealthy';
    }

    res.json({
      success: true,
      data: {
        dbStatus,
        apiStatus: 'Healthy',
        users: userCount,
        appointments: apptCount,
        services: serviceCount,
        products: productCount,
        openErrors: errorCount,
        memoryUsage: process.memoryUsage().heapUsed,
        uptime: process.uptime()
      }
    });
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({ success: false, message: 'Server error fetching system status' });
  }
});

// GET /api/developer/error-logs
router.get('/error-logs', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, error_type, message, stack_trace, user_id, endpoint, method, status, created_at, resolved_at FROM error_logs ORDER BY created_at DESC LIMIT 100'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching error logs:', error);
    res.status(500).json({ success: false, message: 'Server error fetching error logs' });
  }
});

// PUT /api/developer/error-logs/:id
router.put('/error-logs/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    await pool.query(
      'UPDATE error_logs SET status = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    res.json({ success: true, message: 'Error log updated successfully' });
  } catch (error) {
    console.error('Error updating error log:', error);
    res.status(500).json({ success: false, message: 'Server error updating error log' });
  }
});

export default router;
