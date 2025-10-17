import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  readonly today = new Date();

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  get userName(): string {
    return this.auth.currentUser?.fullName ?? '';
  }

  get userRole(): string {
    return this.auth.currentUser?.role ?? '';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
