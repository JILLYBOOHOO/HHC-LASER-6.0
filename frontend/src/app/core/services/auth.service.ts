import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthStateService } from '../store/auth-state.service';
import { ApiResponse, LoginDto, RegisterDto, User } from '../models/models';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private authState: AuthStateService,
    private router: Router,
  ) {}

  login(dto: LoginDto): Observable<User> {
    return this.http.post<ApiResponse<{ accessToken: string; user: User }>>(
      `${this.api}/login`, dto, { withCredentials: true }
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.authState.setAuth(res.data.user, res.data.accessToken);
        }
      }),
      map(res => res.data!.user)
    );
  }

  register(dto: RegisterDto): Observable<User> {
    return this.http.post<ApiResponse<{ accessToken: string; user: User }>>(
      `${this.api}/register`, dto, { withCredentials: true }
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.authState.setAuth(res.data.user, res.data.accessToken);
        }
      }),
      map(res => res.data!.user)
    );
  }

  googleLogin(googleData: { google_id: string; email: string; first_name: string; last_name: string }): Observable<User> {
    return this.http.post<ApiResponse<{ accessToken: string; user: User }>>(
      `${this.api}/google`, googleData, { withCredentials: true }
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.authState.setAuth(res.data.user, res.data.accessToken);
        }
      }),
      map(res => res.data!.user)
    );
  }

  refreshToken(): Observable<string> {
    return this.http.post<ApiResponse<{ accessToken: string }>>(
      `${this.api}/refresh`, {}, { withCredentials: true }
    ).pipe(
      tap(res => {
        if (res.data?.accessToken) {
          this.authState.setAuth(this.authState.user()!, res.data.accessToken);
        }
      }),
      map(res => res.data!.accessToken)
    );
  }

  me(): Observable<User> {
    return this.http.get<ApiResponse<{ user: User }>>(
      `${this.api}/me`, { withCredentials: true }
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.authState.setUserOnly(res.data.user);
        }
      }),
      map(res => res.data!.user)
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.api}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.authState.clearAuth();
        this.router.navigate(['/']);
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.api}/change-password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }
}
