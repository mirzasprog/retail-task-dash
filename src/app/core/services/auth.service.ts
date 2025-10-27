import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UserProfile, UserRole } from '../../shared/models/user.model';

type RawUserProfile = Omit<UserProfile, 'role' | 'stores'> & {
  role: UserRole | number;
  stores?: unknown;
};

const TOKEN_KEY = 'retail-task-dash-token';
const USER_KEY = 'retail-task-dash-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<UserProfile | null>(this.loadUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();
  private readonly numericRoleMap: Record<number, UserRole> = {
    0: UserRole.Admin,
    1: UserRole.Headquarters,
    2: UserRole.RegionalDirector,
    3: UserRole.AreaManager,
    4: UserRole.StoreManager
  };

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        const normalizedUser = this.normalizeUserProfile(response.user as RawUserProfile);
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
        this.currentUserSubject.next(normalizedUser);
      })
    );
  }

  logout(): void {
    this.clearStoredCredentials();
    this.currentUserSubject.next(null);
  }

  get token(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!this.isTokenValid(token)) {
      this.logout();
      return null;
    }

    return token;
  }

  get currentUser(): UserProfile | null {
    if (!this.ensureValidSession()) {
      return null;
    }

    return this.currentUserSubject.value;
  }

  hasRole(...roles: UserRole[]): boolean {
    if (!this.ensureValidSession()) {
      return false;
    }

    const user = this.currentUserSubject.value;
    if (!user) {
      return false;
    }

    return roles.includes(user.role);
  }

  isAuthenticated(): boolean {
    return this.ensureValidSession() && !!this.currentUserSubject.value;
  }

  private loadUser(): UserProfile | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!this.isTokenValid(token)) {
      this.clearStoredCredentials();
      return null;
    }

    const serialized = localStorage.getItem(USER_KEY);
    if (!serialized) {
      this.clearStoredCredentials();
      return null;
    }

    try {
      return this.normalizeUserProfile(JSON.parse(serialized) as RawUserProfile);
    } catch {
      this.clearStoredCredentials();
      return null;
    }
  }

  private ensureValidSession(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!this.isTokenValid(token)) {
      this.logout();
      return false;
    }

    if (!this.currentUserSubject.value) {
      const user = this.loadUser();
      this.currentUserSubject.next(user);
      return !!user;
    }

    return true;
  }

  private clearStoredCredentials(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private normalizeUserProfile(user: RawUserProfile): UserProfile {
    const normalizedRole = this.normalizeRole(user.role);
    const stores = Array.isArray(user.stores)
      ? (user.stores as unknown[]).map(store => String(store))
      : [];

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: normalizedRole,
      regionId: user.regionId ?? null,
      storeId: user.storeId ?? null,
      stores
    };
  }

  private normalizeRole(role: UserRole | number): UserRole {
    if (typeof role !== 'number') {
      return role;
    }

    return this.numericRoleMap[role] ?? UserRole.StoreManager;
  }

  private isTokenValid(token: string | null): boolean {
    if (!token) {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(this.toBase64(parts[1]))) as Record<string, unknown> | null;
      if (!payload || typeof payload !== 'object') {
        return false;
      }

      const exp = payload['exp'];
      if (typeof exp !== 'number') {
        return true;
      }

      const expiry = exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  private toBase64(base64Url: string): string {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding > 0) {
      base64 = base64.padEnd(base64.length + (4 - padding), '=');
    }
    return base64;
  }
}
