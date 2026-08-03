import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '../utils/logger';

class SocketService {
  private io!: SocketIOServer;

  initialize(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
      }
    });

    this.io.on('connection', (socket) => {
      logger.info(`[SocketService] Client connected: ${socket.id}`);
      
      socket.on('join_location', (locationId: number) => {
        socket.join(`location_${locationId}`);
        logger.info(`[SocketService] Socket ${socket.id} joined location_${locationId}`);
      });

      socket.on('join_admin', () => {
        socket.join('admin_room');
        logger.info(`[SocketService] Socket ${socket.id} joined admin_room`);
      });

      socket.on('disconnect', () => {
        logger.info(`[SocketService] Client disconnected: ${socket.id}`);
      });
    });
  }

  emitBookingEvent(eventType: string, data: any) {
    if (this.io) {
      this.io.emit(eventType, data);
    } else {
      logger.warn('[SocketService] emitBookingEvent called but io is not initialized.');
    }
  }
}

export const socketService = new SocketService();
