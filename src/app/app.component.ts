import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private readonly translate: TranslateService) {
    this.translate.addLangs(['en', 'bs']);
    const savedLanguage = localStorage.getItem('rtd-language') ?? 'en';
    this.translate.use(savedLanguage);
  }
}
