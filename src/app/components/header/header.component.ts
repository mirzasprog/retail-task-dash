import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  readonly user$ = this.auth.user$;
  readonly today = new Date();

  constructor(private readonly auth: AuthService, public readonly translate: TranslateService) {}

  get currentLocale(): string {
    return this.translate.currentLang === 'bs' ? 'bs-BA' : 'en-US';
  }

  logout(): void {
    this.auth.logout();
  }
}
