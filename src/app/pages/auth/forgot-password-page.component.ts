import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./auth-pages.scss']
})
export class ForgotPasswordPageComponent {
  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submitted = false;

  constructor(private readonly fb: FormBuilder) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted = true;
  }
}
