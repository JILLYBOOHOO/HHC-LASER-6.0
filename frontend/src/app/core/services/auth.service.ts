import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of, throwError } from 'rxjs';
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

  login(dto: LoginDto, rememberMe = false): Observable<User> {
    return this.http.post<ApiResponse<{ accessToken: string; user: User }>>(
      `${this.api}/login`, dto, { withCredentials: true }
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.authState.setAuth(res.data.user, res.data.accessToken, rememberMe);
        }
      }),
      map(res => res.data!.user),
      catchError(err => {
        // Propagate backend error to UI; no demo fallback
        return throwError(() => err);
      })
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
      map(res => res.data!.user),
      catchError(() => {
        // Fallback for demo resilience when backend API is offline
        const mockUser: User = {
          id: Math.floor(Math.random() * 1000) + 10,
          email: dto.email,
          first_name: dto.first_name,
          last_name: dto.last_name,
          phone: dto.phone,
          date_of_birth: dto.date_of_birth,
          roles: ['customer'],
          is_active: true,
          created_at: new Date().toISOString()
        };
        this.authState.setAuth(mockUser, 'demo-customer-token');
        return of(mockUser);
      })
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
    const performLogout = () => {
      this.authState.clearAuth();
      this.router.navigate(['/']);
    };

    const obs$ = this.http.post(`${this.api}/logout`, {}, { withCredentials: true }).pipe(
      catchError(() => of(null)),
      tap(() => performLogout())
    );

    obs$.subscribe({
      next: () => performLogout(),
      error: () => performLogout(),
    });

    return obs$;
  }

  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.api}/change-password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }
}
