"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Temporarily store locally until S3 is set up
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        // In a real app this would go to S3 or a robust local directory
        cb(null, path_1.default.join(__dirname, '../../uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
// GET /api/media (Admin)
router.get('/', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'owner', 'developer'), async (req, res) => {
    try {
        const [rows] = await database_1.default.query('SELECT id, file_name, file_url, file_type, mime_type, size_bytes, created_at FROM media ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    }
    catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({ success: false, message: 'Server error fetching media' });
    }
});
// POST /api/media/upload (Admin)
router.post('/upload', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'owner', 'developer'), upload.single('file'), async (req, res) => {
    if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
    }
    const file = req.file;
    const fileUrl = `/uploads/${file.filename}`; // Mock local URL
    const fileType = file.mimetype.startsWith('video') ? 'video' : 'image';
    const userId = req.user?.userId;
    try {
        const [result] = await database_1.default.query(`INSERT INTO media (file_name, file_url, file_type, mime_type, size_bytes, uploaded_by) 
       VALUES (?, ?, ?, ?, ?, ?)`, [file.originalname, fileUrl, fileType, file.mimetype, file.size, userId]);
        res.status(201).json({
            success: true,
            data: {
                id: result.insertId,
                file_name: file.originalname,
                file_url: fileUrl,
                file_type: fileType
            }
        });
    }
    catch (error) {
        console.error('Error saving media record:', error);
        res.status(500).json({ success: false, message: 'Server error saving media record' });
    }
});
// DELETE /api/media/:id (Admin)
router.delete('/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'owner', 'developer'), async (req, res) => {
    const { id } = req.params;
    try {
        await database_1.default.query('DELETE FROM media WHERE id = ?', [id]);
        // Note: Local file should also be deleted using fs.unlink
        res.json({ success: true, message: 'Media deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting media:', error);
        res.status(500).json({ success: false, message: 'Server error deleting media' });
    }
});
exports.default = router;
//# sourceMappingURL=media.routes.js.map