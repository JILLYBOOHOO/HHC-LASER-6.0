import { Router, Request, Response } from 'express';
import { executeQuery, executeQueryOne, executeUpdate } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { uploadAny } from '../middleware/upload.middleware';
import { storageService } from '../services/storage.service';

const router = Router();

// GET /api/media (Admin)
router.get('/', authenticate, requireRole('admin', 'owner', 'developer'), async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await executeQuery(
      'SELECT id, file_name, file_url, file_type, mime_type, size_bytes, created_at FROM media ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ success: false, message: 'Server error fetching media' });
  }
});

// POST /api/media/upload (Admin) — uploads to Supabase Storage (or S3 fallback)
router.post(
  '/upload',
  authenticate,
  requireRole('admin', 'owner', 'developer'),
  uploadAny.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const file = req.file;
    const fileType = file.mimetype.startsWith('video')
      ? 'video'
      : file.mimetype === 'application/pdf'
        ? 'document'
        : 'image';
    const userId = req.user?.userId;

    try {
      const fileUrl = await storageService.uploadMediaAsset(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      const result = await executeUpdate(
        `INSERT INTO media (file_name, file_url, file_type, mime_type, size_bytes, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [file.originalname, fileUrl, fileType, file.mimetype, file.size, userId]
      );

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          file_name: file.originalname,
          file_url: fileUrl,
          file_type: fileType,
        },
      });
    } catch (error: any) {
      console.error('Error saving media record:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Server error saving media record',
      });
    }
  }
);

// DELETE /api/media/:id (Admin)
router.delete('/:id', authenticate, requireRole('admin', 'owner', 'developer'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const row = await executeQueryOne<{ file_url: string }>('SELECT file_url FROM media WHERE id = ?', [id]);
    if (row?.file_url) {
      try {
        await storageService.deleteFile(row.file_url);
      } catch (err) {
        console.warn('Storage delete warning:', err);
      }
    }

    await executeUpdate('DELETE FROM media WHERE id = ?', [id]);
    res.json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ success: false, message: 'Server error deleting media' });
  }
});

export default router;
