import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

interface PriceResult {
  sku: string;
  name: string;
  storePrice: number;
  onlinePrice: number;
  competitorPrice: number;
}

@Component({
  selector: 'app-price-checker-page',
  templateUrl: './price-checker-page.component.html',
  styleUrls: ['./price-checker-page.component.scss']
})
export class PriceCheckerPageComponent {
  readonly form = this.fb.group({
    sku: ['', Validators.required],
    storeId: ['', Validators.required]
  });

  result: PriceResult | null = null;
  isLoading = false;

  constructor(private readonly fb: FormBuilder) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    setTimeout(() => {
      this.result = {
        sku: this.form.value.sku ?? '',
        name: 'Smart LED Light Strip',
        storePrice: 24.99,
        onlinePrice: 22.5,
        competitorPrice: 26.75
      };
      this.isLoading = false;
    }, 600);
  }
}
