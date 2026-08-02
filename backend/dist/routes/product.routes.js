"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', product_controller_1.productController.getAllProducts);
router.get('/categories', product_controller_1.productController.getCategories);
router.get('/:slug', product_controller_1.productController.getProductBySlug);
// Admin routes
router.use(auth_middleware_1.authenticate);
router.use((0, rbac_middleware_1.requireRole)('admin', 'owner'));
router.post('/', product_controller_1.productController.createProduct);
router.put('/:id', product_controller_1.productController.updateProduct);
router.delete('/:id', product_controller_1.productController.deleteProduct);
exports.default = router;
//# sourceMappingURL=product.routes.js.map