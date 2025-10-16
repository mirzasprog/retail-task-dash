import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ApiService } from './api.service';
import { LoginRequest, LoginResponse } from '../../shared/models/auth.model';

const AUTH_STORAGE_KEY = 'rtd-auth-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly userSubject = new BehaviorSubject<LoginResponse | null>(this.readFromStorage());
  readonly user$: Observable<LoginResponse | null> = this.userSubject.asObservable();

  constructor(private readonly api: ApiService, private readonly router: Router) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.api.login(credentials).pipe(
      tap(response => {
        this.writeToStorage(response);
        this.userSubject.next(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.userSubject.next(null);
    void this.router.navigate(['/login']);
  }

  get currentUser(): LoginResponse | null {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  private writeToStorage(user: LoginResponse): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  private readFromStorage(): LoginResponse | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as LoginResponse;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  }
}
