"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
/**
 * Typed Express async route handler wrapper.
 * Allows clean async/await in route callbacks without implicit any.
 */
const handler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.handler = handler;
//# sourceMappingURL=handler.js.map