import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  canActivate(): boolean | UrlTree {
    return this.resolveAuth();
  }

  canActivateChild(): boolean | UrlTree {
    return this.resolveAuth();
  }

  canLoad(_route: Route, _segments: UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.resolveAuth();
  }

  private resolveAuth(): boolean | UrlTree {
    if (this.auth.isAuthenticated) {
      return true;
    }

    return this.router.createUrlTree(['/login']);
  }
}
