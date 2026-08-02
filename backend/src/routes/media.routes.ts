import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import multer from 'multer';
import path from 'path';

const router = Router();

// Temporarily store locally until S3 is set up
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // In a real app this would go to S3 or a robust local directory
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// GET /api/media (Admin)
router.get('/', authenticate, requireRole('admin', 'owner', 'developer'), async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, file_name, file_url, file_type, mime_type, size_bytes, created_at FROM media ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ success: false, message: 'Server error fetching media' });
  }
});

// POST /api/media/upload (Admin)
router.post('/upload', authenticate, requireRole('admin', 'owner', 'developer'), upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }
  
  const file = req.file;
  const fileUrl = `/uploads/${file.filename}`; // Mock local URL
  const fileType = file.mimetype.startsWith('video') ? 'video' : 'image';
  const userId = req.user?.userId;
  
  try {
    const [result] = await pool.query<any>(
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
        file_type: fileType
      } 
    });
  } catch (error) {
    console.error('Error saving media record:', error);
    res.status(500).json({ success: false, message: 'Server error saving media record' });
  }
});

// DELETE /api/media/:id (Admin)
router.delete('/:id', authenticate, requireRole('admin', 'owner', 'developer'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM media WHERE id = ?', [id]);
    // Note: Local file should also be deleted using fs.unlink
    res.json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ success: false, message: 'Server error deleting media' });
  }
});

export default router;
