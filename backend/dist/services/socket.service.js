"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = require("../utils/logger");
class SocketService {
    initialize(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
            }
        });
        this.io.on('connection', (socket) => {
            logger_1.logger.info(`[SocketService] Client connected: ${socket.id}`);
            socket.on('join_location', (locationId) => {
                socket.join(`location_${locationId}`);
                logger_1.logger.info(`[SocketService] Socket ${socket.id} joined location_${locationId}`);
            });
            socket.on('join_admin', () => {
                socket.join('admin_room');
                logger_1.logger.info(`[SocketService] Socket ${socket.id} joined admin_room`);
            });
            socket.on('disconnect', () => {
                logger_1.logger.info(`[SocketService] Client disconnected: ${socket.id}`);
            });
        });
    }
    emitBookingEvent(eventType, data) {
        if (this.io) {
            this.io.emit(eventType, data);
        }
        else {
            logger_1.logger.warn('[SocketService] emitBookingEvent called but io is not initialized.');
        }
    }
}
exports.socketService = new SocketService();
//# sourceMappingURL=socket.service.js.map