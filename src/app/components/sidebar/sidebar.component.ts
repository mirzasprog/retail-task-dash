import { Component } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../shared/models/user.model';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private readonly navigation: NavigationItem[] = [
    { label: 'Store', icon: 'store', route: '/store', roles: [UserRole.StoreManager, UserRole.AreaManager, UserRole.RegionalDirector, UserRole.Headquarters, UserRole.Admin] },
    { label: 'Područni', icon: 'dashboard', route: '/area', roles: [UserRole.AreaManager, UserRole.Admin] },
    { label: 'Regija', icon: 'map', route: '/regional', roles: [UserRole.RegionalDirector, UserRole.Admin] },
    { label: 'Uprava', icon: 'insights', route: '/hq', roles: [UserRole.Headquarters, UserRole.Admin] },
    { label: 'Admin', icon: 'settings', route: '/admin', roles: [UserRole.Admin] }
  ];

  constructor(private readonly auth: AuthService) {}

  get items(): NavigationItem[] {
    const role = this.auth.currentUser?.role;
    if (!role) {
      return [];
    }
    return this.navigation.filter(item => item.roles.includes(role));
  }
}
