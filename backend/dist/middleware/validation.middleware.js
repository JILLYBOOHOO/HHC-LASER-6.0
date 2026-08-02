"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
const express_validator_1 = require("express-validator");
const types_1 = require("../models/types");
function validateRequest(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const formattedErrors = {};
        errors.array().forEach(err => {
            const field = err.path || 'general';
            if (!formattedErrors[field]) {
                formattedErrors[field] = [];
            }
            formattedErrors[field].push(err.msg);
        });
        res.status(422).json((0, types_1.errorResponse)('Validation failed. Please correct the highlighted fields.', formattedErrors));
        return;
    }
    next();
}
//# sourceMappingURL=validation.middleware.js.map