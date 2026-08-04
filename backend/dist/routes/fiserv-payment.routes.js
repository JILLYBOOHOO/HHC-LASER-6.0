"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fiserv_client_1 = require("../payments/fiserv/fiserv.client");
const types_1 = require("../models/types");
const error_middleware_1 = require("../middleware/error.middleware");
const express_validator_1 = require("express-validator");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
// POST /api/create-fiserv-payment
router.post('/create-fiserv-payment', [
    (0, express_validator_1.body)('amount').isNumeric().withMessage('amount must be a number'),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('order_ref').optional().isString(),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new error_middleware_1.AppError('Invalid request payload', 400);
        }
        const amount = Number(req.body.amount);
        const description = req.body.description || 'HHC LASER Payment';
        const orderRef = req.body.order_ref;
        const session = fiserv_client_1.fiservClient.buildPaymentSession(orderRef || crypto_1.default.randomBytes(16).toString('hex'), amount, description);
        // Return gateway URL and form fields for the frontend to auto‑submit
        res.json((0, types_1.successResponse)({
            gatewayUrl: session.redirectUrl,
            params: session.formFields,
        }));
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=fiserv-payment.routes.js.map