import { Injectable, signal, computed, effect } from '@angular/core';
import { User, AuthState, UserRole } from '../models/models';

const TOKEN_KEY = 'hhc_access_token';

@Injectable({ providedIn: 'root' })
export class AuthStateService {

  // ─── Signals ──────────────────────────────────────────────────────────────
  private _user    = signal<User | null>(this.loadUser());
  private _token   = signal<string | null>(this.loadToken());
  private _loading = signal<boolean>(false);

  // ─── Computed ─────────────────────────────────────────────────────────────
  readonly user           = this._user.asReadonly();
  readonly token          = this._token.asReadonly();
  readonly isLoading      = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user() && !!this._token());
  readonly userRoles       = computed(() => this._user()?.roles ?? []);
  readonly userFullName    = computed(() => {
    const u = this._user();
    return u ? `${u.first_name} ${u.last_name}` : '';
  });
  readonly isAdmin   = computed(() => this.hasRole('admin') || this.hasRole('owner'));
  readonly isManager = computed(() => this.hasRole('manager') || this.isAdmin());
  readonly isStaff   = computed(() => this.hasRole('specialist') || this.isManager());

  constructor() {
    // Persist token changes to sessionStorage
    effect(() => {
      const t = this._token();
      if (t) sessionStorage.setItem(TOKEN_KEY, t);
      else sessionStorage.removeItem(TOKEN_KEY);
    });
  }

  setAuth(user: User, token: string): void {
    this._user.set(user);
    this._token.set(token);
    sessionStorage.setItem('hhc_user', JSON.stringify(user));
  }

  setTokenOnly(token: string): void {
    this._token.set(token);
  }

  setUserOnly(user: User): void {
    this._user.set(user);
    sessionStorage.setItem('hhc_user', JSON.stringify(user));
  }

  clearAuth(): void {
    this._user.set(null);
    this._token.set(null);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem('hhc_user');
  }

  updateUser(user: Partial<User>): void {
    const current = this._user();
    if (current) {
      const updated = { ...current, ...user };
      this._user.set(updated);
      sessionStorage.setItem('hhc_user', JSON.stringify(updated));
    }
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  hasRole(...roles: UserRole[]): boolean {
    const userRoles = this._user()?.roles ?? [];
    return roles.some(r => userRoles.includes(r));
  }

  private loadToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  private loadUser(): User | null {
    try {
      const raw = sessionStorage.getItem('hhc_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
