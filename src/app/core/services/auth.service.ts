import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UserProfile, UserRole } from '../../shared/models/user.model';

const TOKEN_KEY = 'retail-task-dash-token';
const USER_KEY = 'retail-task-dash-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<UserProfile | null>(this.loadUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get currentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  hasRole(...roles: UserRole[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) {
      return false;
    }

    return roles.includes(user.role);
  }

  private loadUser(): UserProfile | null {
    const serialized = localStorage.getItem(USER_KEY);
    if (!serialized) {
      return null;
    }

    try {
      return JSON.parse(serialized) as UserProfile;
    } catch {
      return null;
    }
  }
}
