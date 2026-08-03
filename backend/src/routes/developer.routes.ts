import { Router, Request, Response } from 'express';
import { executeQuery, executeQueryOne, executeUpdate } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// Ensure all routes require 'developer' or 'owner'
router.use(authenticate, requireRole('developer', 'owner'));

// GET /api/developer/system-status
router.get('/system-status', async (req: Request, res: Response): Promise<void> => {
  try {
    const userRow = await executeQueryOne<{ usercount: string }>('SELECT COUNT(*) as userCount FROM users');
    const apptRow = await executeQueryOne<{ apptcount: string }>('SELECT COUNT(*) as apptCount FROM appointments');
    const serviceRow = await executeQueryOne<{ servicecount: string }>('SELECT COUNT(*) as serviceCount FROM services');
    const productRow = await executeQueryOne<{ productcount: string }>('SELECT COUNT(*) as productCount FROM products');
    const errorRow = await executeQueryOne<{ errorcount: string }>(
      `SELECT COUNT(*) as errorCount FROM error_logs WHERE status = 'open'`
    );

    // DB Health check
    let dbStatus = 'Healthy';
    try {
      await executeQuery('SELECT 1');
    } catch {
      dbStatus = 'Unhealthy';
    }

    // pg lowercases unquoted aliases unless quoted; support both casings
    const countOf = (row: Record<string, any> | null, key: string) => {
      if (!row) return 0;
      const found = row[key] ?? row[key.toLowerCase()];
      return Number(found ?? 0);
    };

    res.json({
      success: true,
      data: {
        dbStatus,
        apiStatus: 'Healthy',
        users: countOf(userRow, 'userCount'),
        appointments: countOf(apptRow, 'apptCount'),
        services: countOf(serviceRow, 'serviceCount'),
        products: countOf(productRow, 'productCount'),
        openErrors: countOf(errorRow, 'errorCount'),
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
    const rows = await executeQuery(
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
    await executeUpdate(
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
