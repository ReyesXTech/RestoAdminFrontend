import { Injectable, signal, computed, effect, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'dashboard-theme';
const PREVIEW_STORAGE_KEY = 'dashboard-preview-enabled';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeSignal = signal<Theme>('light');
  private readonly previewEnabledSignal = signal<boolean>(true);
  private readonly isBrowser: boolean;

  readonly currentTheme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.themeSignal() === 'dark');
  readonly isLight = computed(() => this.themeSignal() === 'light');
  readonly previewEnabled = this.previewEnabledSignal.asReadonly();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Initialize theme from localStorage or default to light
    if (this.isBrowser) {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      const initialTheme = storedTheme || 'light';
      this.themeSignal.set(initialTheme);
      this.applyTheme(initialTheme);

      // Initialize preview setting
      const storedPreview = localStorage.getItem(PREVIEW_STORAGE_KEY);
      const initialPreview = storedPreview !== null ? storedPreview === 'true' : false;
      this.previewEnabledSignal.set(initialPreview);
    }
  }

  setTheme(theme: Theme): void {
    if (this.themeSignal() === theme) return;

    this.themeSignal.set(theme);

    if (this.isBrowser) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      this.applyTheme(theme);
    }
  }

  toggleTheme(): void {
    const newTheme = this.isDark() ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  setPreviewEnabled(enabled: boolean): void {
    this.previewEnabledSignal.set(enabled);

    if (this.isBrowser) {
      localStorage.setItem(PREVIEW_STORAGE_KEY, enabled.toString());
    }
  }

  togglePreview(): void {
    const newEnabled = !this.previewEnabled();
    this.setPreviewEnabled(newEnabled);
  }

  private applyTheme(theme: Theme): void {
    if (!this.isBrowser) return;

    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
