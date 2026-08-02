import { Router, Request, Response, NextFunction } from 'express';
import { executeQuery, executeUpdate } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { successResponse, errorResponse } from '../models/types';

const router = Router();

// GET /api/developer/oauth
router.get(
  '/',
  authenticate,
  requireRole('developer', 'owner'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const keys = [
        'google_oauth_client_id', 
        'google_oauth_client_secret',
        'google_oauth_status', 
        'google_oauth_mode',
        'google_oauth_redirect_urls',
        'google_oauth_allowed_domains'
      ];
      const placeholders = keys.map(() => '?').join(',');
      const rows = await executeQuery<{ setting_key: string; setting_value: any }>(
        `SELECT setting_key, setting_value FROM business_settings WHERE setting_key IN (${placeholders})`,
        keys
      );

      const settings: any = {
        google_oauth_client_id: '',
        google_oauth_client_secret: '',
        google_oauth_status: 'disabled',
        google_oauth_mode: 'testing',
        google_oauth_redirect_urls: 'http://localhost:3000/api/auth/google/callback',
        google_oauth_allowed_domains: '',
      };

      for (const row of rows) {
        settings[row.setting_key] = row.setting_value;
      }

      res.json(successResponse(settings));
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/developer/oauth
router.put(
  '/',
  authenticate,
  requireRole('developer', 'owner'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        google_oauth_client_id, 
        google_oauth_client_secret,
        google_oauth_status, 
        google_oauth_mode,
        google_oauth_redirect_urls,
        google_oauth_allowed_domains
      } = req.body;

      const updates = [
        { key: 'google_oauth_client_id', value: google_oauth_client_id || '' },
        { key: 'google_oauth_client_secret', value: google_oauth_client_secret || '' },
        { key: 'google_oauth_status', value: google_oauth_status || 'disabled' },
        { key: 'google_oauth_mode', value: google_oauth_mode || 'testing' },
        { key: 'google_oauth_redirect_urls', value: google_oauth_redirect_urls || 'http://localhost:3000/api/auth/google/callback' },
        { key: 'google_oauth_allowed_domains', value: google_oauth_allowed_domains || '' },
      ];

      for (const { key, value } of updates) {
        await executeUpdate(
          `INSERT INTO business_settings (setting_key, setting_value) 
           VALUES (?, ?) 
           ON DUPLICATE KEY UPDATE setting_value = ?`,
          [key, JSON.stringify(value), JSON.stringify(value)]
        );
      }

      res.json(successResponse(null, 'Authentication settings updated successfully.'));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
