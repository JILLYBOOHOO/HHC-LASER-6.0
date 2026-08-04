import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { treatments } from '../data/services.data';

export interface TreatmentItem {
  id: number;
  name: string;
  category: string;
  price_jmd: number;
  duration_minutes: number;
  is_featured: boolean;
  is_active: boolean;
  thumbnail_url: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class ServicesManagementService {
  private servicesSubject = new BehaviorSubject<TreatmentItem[]>([]);
  services$ = this.servicesSubject.asObservable();

  private apiBase = environment.apiUrl + '/services'; // adjust as needed

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  /** Load all services from backend */
  loadAll(): void {
    this.http.get<any>(`${this.apiBase}?include_inactive=true`).subscribe({
      next: res => {
        let list = res && res.success && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        if (list.length === 0) {
          list = treatments as TreatmentItem[];
        }
        this.servicesSubject.next(list);
      },
      error: err => {
        console.error('Failed to load services', err);
        this.servicesSubject.next(treatments as TreatmentItem[]);
      }
    });
  }

  /** Refresh the list after mutations */
  refresh(): void {
    this.loadAll();
  }

  /** Add a new service */
  addService(service: Partial<TreatmentItem>): Observable<any> {
    return this.http.post(this.apiBase, service);
  }

  /** Update existing service */
  updateService(id: number, service: Partial<TreatmentItem>): Observable<any> {
    return this.http.put(`${this.apiBase}/${id}`, service);
  }

  /** Delete a service */
  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.apiBase}/${id}`);
  }
}
