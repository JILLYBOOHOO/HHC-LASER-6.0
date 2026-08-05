"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// POST /api/fiserv/create-fiserv-payment
// Disabled: customer payments must go through appointment booking + /api/payments/create-checkout.
router.post('/create-fiserv-payment', auth_middleware_1.authenticate, (_req, res) => {
    res.status(410).json({
        success: false,
        message: 'Standalone Fiserv checkout is disabled. Use the normal booking payment flow.',
    });
});
exports.default = router;
//# sourceMappingURL=fiserv-payment.routes.js.map