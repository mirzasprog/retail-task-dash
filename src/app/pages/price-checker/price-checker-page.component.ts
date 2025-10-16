import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(private readonly fb: FormBuilder, private readonly translate: TranslateService) {}

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

  formatPrice(amount: number): string {
    const locale = this.translate.currentLang === 'bs' ? 'bs-BA' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(amount);
  }
}
