import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private socket: Socket;
  
  public bookingEvents$ = new Subject<any>();

  constructor() {
    this.socket = io(environment.apiUrl.replace('/api', ''), {
      autoConnect: true,
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('[RealtimeService] Connected to real-time server');
      this.socket.emit('join_admin');
    });

    this.socket.on('booking_created', (data) => {
      this.bookingEvents$.next({ type: 'created', data });
    });

    this.socket.on('booking_updated', (data) => {
      this.bookingEvents$.next({ type: 'updated', data });
    });

    this.socket.on('disconnect', () => {
      console.log('[RealtimeService] Disconnected from real-time server');
    });
  }

  joinLocation(locationId: number) {
    this.socket.emit('join_location', locationId);
  }
}
