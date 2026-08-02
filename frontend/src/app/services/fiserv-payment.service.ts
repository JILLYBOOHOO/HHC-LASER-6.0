import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface FiservPaymentPayload {
  amount: number;
  description?: string;
  order_ref?: string;
}

export interface FiservPaymentResponse {
  gatewayUrl: string;
  params: Record<string, string>;
}

@Injectable({
  providedIn: 'root',
})
export class FiservPaymentService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Calls the backend endpoint to create a Fiserv payment session.
   * Returns the gateway URL and required form parameters.
   */
  createPayment(payload: FiservPaymentPayload): Observable<FiservPaymentResponse> {
    return this.http.post<FiservPaymentResponse>(
      `${this.baseUrl}/fiserv/create-fiserv-payment`,
      payload
    );
  }
}
