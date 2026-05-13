import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'momentum_theme';

  isDark = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Inicializar desde localStorage o preferencia del sistema
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved !== null) {
        this.isDark.set(saved === 'dark');
      } else {
        this.isDark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }

      // Aplicar clase al documento cada vez que cambie
      effect(() => {
        const dark = this.isDark();
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
        localStorage.setItem(this.STORAGE_KEY, dark ? 'dark' : 'light');
      });
    }
  }

  toggle() {
    this.isDark.update(v => !v);
  }
}
