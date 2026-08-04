"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const storage_service_1 = require("../services/storage.service");
const router = (0, express_1.Router)();
// GET /api/media (Admin)
router.get('/', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'owner', 'developer'), async (req, res) => {
    try {
        const rows = await (0, database_1.executeQuery)('SELECT id, file_name, file_url, file_type, mime_type, size_bytes, created_at FROM media ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    }
    catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({ success: false, message: 'Server error fetching media' });
    }
});
// POST /api/media/upload (Admin) — uploads to Supabase Storage (or S3 fallback)
router.post('/upload', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'owner', 'developer'), upload_middleware_1.uploadAny.single('file'), async (req, res) => {
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
        const fileUrl = await storage_service_1.storageService.uploadMediaAsset(file.buffer, file.originalname, file.mimetype);
        const result = await (0, database_1.executeUpdate)(`INSERT INTO media (file_name, file_url, file_type, mime_type, size_bytes, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?)`, [file.originalname, fileUrl, fileType, file.mimetype, file.size, userId]);
        res.status(201).json({
            success: true,
            data: {
                id: result.insertId,
                file_name: file.originalname,
                file_url: fileUrl,
                file_type: fileType,
            },
        });
    }
    catch (error) {
        console.error('Error saving media record:', error);
        res.status(500).json({
            success: false,
            message: error?.message || 'Server error saving media record',
        });
    }
});
// DELETE /api/media/:id (Admin)
router.delete('/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'owner', 'developer'), async (req, res) => {
    const { id } = req.params;
    try {
        const row = await (0, database_1.executeQueryOne)('SELECT file_url FROM media WHERE id = ?', [id]);
        if (row?.file_url) {
            try {
                await storage_service_1.storageService.deleteFile(row.file_url);
            }
            catch (err) {
                console.warn('Storage delete warning:', err);
            }
        }
        await (0, database_1.executeUpdate)('DELETE FROM media WHERE id = ?', [id]);
        res.json({ success: true, message: 'Media deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting media:', error);
        res.status(500).json({ success: false, message: 'Server error deleting media' });
    }
});
exports.default = router;
//# sourceMappingURL=media.routes.js.map