import { Server as HttpServer } from 'http';
declare class SocketService {
    private io;
    initialize(server: HttpServer): void;
    emitBookingEvent(eventType: string, data: any): void;
}
export declare const socketService: SocketService;
export {};
//# sourceMappingURL=socket.service.d.ts.map