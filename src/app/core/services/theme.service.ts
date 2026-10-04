import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkSubject: BehaviorSubject<boolean>;
  public isDark$: Observable<boolean>;

  constructor(
    private storage: StorageService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    const initialTheme = this.storage.getSavedTheme();
    const isDark = initialTheme === 'dark';
    this.isDarkSubject = new BehaviorSubject<boolean>(isDark);
    this.isDark$ = this.isDarkSubject.asObservable();

    if (isPlatformBrowser(this.platformId)) {
      this.applyTheme(isDark);
    }
  }

  public toggleTheme(): void {
    const newDark = !this.isDarkSubject.value;
    this.setDarkTheme(newDark);
  }

  public setDarkTheme(isDark: boolean): void {
    this.isDarkSubject.next(isDark);
    this.storage.saveTheme(isDark ? 'dark' : 'light');
    if (isPlatformBrowser(this.platformId)) {
      this.applyTheme(isDark);
    }
  }

  public isDark(): boolean {
    return this.isDarkSubject.value;
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
