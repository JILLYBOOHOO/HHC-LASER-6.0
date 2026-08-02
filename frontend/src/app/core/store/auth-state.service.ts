import { Injectable, signal, computed, effect } from '@angular/core';
import { User, AuthState, UserRole } from '../models/models';

const TOKEN_KEY = 'hhc_access_token';
const USER_KEY = 'hhc_user';
const REMEMBER_KEY = 'hhc_remember_me';

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
    // Persist token changes to the appropriate storage
    effect(() => {
      const t = this._token();
      const storage = this.getStorage();
      if (t) storage.setItem(TOKEN_KEY, t);
      else {
        sessionStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    });
  }

  private isRemembered(): boolean {
    return localStorage.getItem(REMEMBER_KEY) === 'true';
  }

  private getStorage(): Storage {
    return this.isRemembered() ? localStorage : sessionStorage;
  }

  setAuth(user: User, token: string, rememberMe = false): void {
    // Set remember me preference
    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    const storage = rememberMe ? localStorage : sessionStorage;
    this._user.set(user);
    this._token.set(token);
    storage.setItem(USER_KEY, JSON.stringify(user));
    storage.setItem(TOKEN_KEY, token);
  }

  setTokenOnly(token: string): void {
    this._token.set(token);
  }

  setUserOnly(user: User): void {
    this._user.set(user);
    const storage = this.getStorage();
    storage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearAuth(): void {
    this._user.set(null);
    this._token.set(null);
    // Clear from both storages
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  }

  updateUser(user: Partial<User>): void {
    const current = this._user();
    if (current) {
      const updated = { ...current, ...user };
      this._user.set(updated);
      const storage = this.getStorage();
      storage.setItem(USER_KEY, JSON.stringify(updated));
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
    // Check localStorage first (remember me), then sessionStorage
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  }

  private loadUser(): User | null {
    try {
      // Check localStorage first (remember me), then sessionStorage
      const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

