import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSwitcherComponent implements OnDestroy {
  languages = [
    { code: 'en', label: 'language.english' },
    { code: 'bs', label: 'language.bosnian' }
  ];

  selectedLanguage: string;
  private readonly subscription: Subscription;

  constructor(private readonly translate: TranslateService) {
    this.selectedLanguage = this.translate.currentLang;
    this.subscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.selectedLanguage = event.lang;
    });
  }

  onLanguageChange(language: string): void {
    this.translate.use(language);
    localStorage.setItem('rtd-language', language);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
