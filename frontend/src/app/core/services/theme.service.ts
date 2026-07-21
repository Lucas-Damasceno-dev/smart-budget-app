import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkThemeSubject = new BehaviorSubject<boolean>(
    this.getStoredTheme()
  );

  isDarkTheme$ = this.isDarkThemeSubject.asObservable();

  toggleTheme(): void {
    const newValue = !this.isDarkThemeSubject.value;
    this.isDarkThemeSubject.next(newValue);
    localStorage.setItem('darkTheme', String(newValue));
    this.applyTheme(newValue);
  }

  private getStoredTheme(): boolean {
    const stored = localStorage.getItem('darkTheme');
    if (stored !== null) {
      return stored === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(isDark: boolean): void {
    document.body.classList.toggle('dark-theme', isDark);
  }
}
