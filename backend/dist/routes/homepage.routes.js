"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const router = (0, express_1.Router)();
// GET /api/homepage
router.get('/', async (req, res) => {
    try {
        const rows = await (0, database_1.executeQuery)('SELECT id, section_type, display_order, is_active, config_json FROM homepage_sections WHERE is_active = 1 ORDER BY display_order ASC');
        res.json({ success: true, data: rows });
    }
    catch (error) {
        console.error('Error fetching homepage sections:', error);
        res.status(500).json({ success: false, message: 'Server error fetching homepage sections' });
    }
});
// GET /api/homepage/all (Admin)
router.get('/all', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'owner', 'developer'), async (req, res) => {
    try {
        const rows = await (0, database_1.executeQuery)('SELECT id, section_type, display_order, is_active, config_json FROM homepage_sections ORDER BY display_order ASC');
        res.json({ success: true, data: rows });
    }
    catch (error) {
        console.error('Error fetching all homepage sections:', error);
        res.status(500).json({ success: false, message: 'Server error fetching all homepage sections' });
    }
});
// PUT /api/homepage/reorder (Admin)
router.put('/reorder', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'owner', 'developer'), async (req, res) => {
    const { items } = req.body; // Array of { id, display_order }
    try {
        await (0, database_1.withTransaction)(async (conn) => {
            for (const item of items) {
                await conn.execute('UPDATE homepage_sections SET display_order = ? WHERE id = ?', [item.display_order, item.id]);
            }
        });
        res.json({ success: true, message: 'Sections reordered successfully' });
    }
    catch (error) {
        console.error('Error reordering homepage sections:', error);
        res.status(500).json({ success: false, message: 'Server error reordering homepage sections' });
    }
});
// POST /api/homepage (Admin)
router.post('/', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'owner', 'developer'), async (req, res) => {
    const { section_type, display_order, is_active, config_json } = req.body;
    try {
        const result = await (0, database_1.executeUpdate)('INSERT INTO homepage_sections (section_type, display_order, is_active, config_json) VALUES (?, ?, ?, ?)', [section_type, display_order, is_active, JSON.stringify(config_json || {})]);
        res.status(201).json({ success: true, data: { id: result.insertId } });
    }
    catch (error) {
        console.error('Error creating homepage section:', error);
        res.status(500).json({ success: false, message: 'Server error creating homepage section' });
    }
});
// PUT /api/homepage/:id (Admin)
router.put('/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'owner', 'developer'), async (req, res) => {
    const { id } = req.params;
    const { section_type, display_order, is_active, config_json } = req.body;
    try {
        await (0, database_1.executeUpdate)('UPDATE homepage_sections SET section_type = ?, display_order = ?, is_active = ?, config_json = ? WHERE id = ?', [section_type, display_order, is_active, JSON.stringify(config_json || {}), id]);
        res.json({ success: true, message: 'Section updated successfully' });
    }
    catch (error) {
        console.error('Error updating homepage section:', error);
        res.status(500).json({ success: false, message: 'Server error updating homepage section' });
    }
});
// DELETE /api/homepage/:id (Admin)
router.delete('/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'owner', 'developer'), async (req, res) => {
    const { id } = req.params;
    try {
        await (0, database_1.executeUpdate)('DELETE FROM homepage_sections WHERE id = ?', [id]);
        res.json({ success: true, message: 'Section deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting homepage section:', error);
        res.status(500).json({ success: false, message: 'Server error deleting homepage section' });
    }
});
exports.default = router;
//# sourceMappingURL=homepage.routes.js.map