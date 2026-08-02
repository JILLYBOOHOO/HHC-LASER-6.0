import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  private apiBase = '/api/services'; // adjust as needed

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  /** Load all services from backend */
  loadAll(): void {
    this.http.get<TreatmentItem[]>(this.apiBase).subscribe({
      next: data => this.servicesSubject.next(data),
      error: err => console.error('Failed to load services', err)
    });
  }

  /** Refresh the list after mutations */
  refresh(): void {
    this.loadAll();
  }

  /** Add a new service, optionally with image file */
  addService(service: Partial<TreatmentItem>, imageFile?: File): Observable<any> {
    const form = new FormData();
    form.append('data', JSON.stringify(service));
    if (imageFile) {
      form.append('image', imageFile);
    }
    return this.http.post(this.apiBase, form);
  }

  /** Update existing service */
  updateService(id: number, service: Partial<TreatmentItem>, imageFile?: File): Observable<any> {
    const form = new FormData();
    form.append('data', JSON.stringify(service));
    if (imageFile) {
      form.append('image', imageFile);
    }
    return this.http.put(`${this.apiBase}/${id}`, form);
  }

  /** Delete a service */
  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.apiBase}/${id}`);
  }
}
