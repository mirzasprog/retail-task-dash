import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { UserRole } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const allowedRoles = route.data['roles'] as UserRole[] | undefined;
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    if (this.auth.hasRole(...allowedRoles)) {
      return true;
    }

    return this.router.createUrlTree(['/not-authorized']);
  }
}
