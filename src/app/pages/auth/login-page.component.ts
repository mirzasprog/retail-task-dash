import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../shared/models/user.model';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./auth-pages.scss']
})
export class LoginPageComponent {
  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  error: string | null = null;

  constructor(private readonly fb: FormBuilder, private readonly auth: AuthService, private readonly router: Router) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.auth.login(this.form.value as { email: string; password: string }).subscribe({
      next: response => {
        this.navigateByRole(response.user.role);
      },
      error: () => {
        this.error = 'Neispravni podaci za prijavu.';
      }
    });
  }

  private navigateByRole(role: UserRole): void {
    switch (role) {
      case UserRole.Admin:
        this.router.navigate(['/admin']);
        break;
      case UserRole.Headquarters:
        this.router.navigate(['/hq']);
        break;
      case UserRole.RegionalDirector:
        this.router.navigate(['/regional']);
        break;
      case UserRole.AreaManager:
        this.router.navigate(['/area']);
        break;
      case UserRole.StoreManager:
      default:
        this.router.navigate(['/store']);
        break;
    }
  }
}
