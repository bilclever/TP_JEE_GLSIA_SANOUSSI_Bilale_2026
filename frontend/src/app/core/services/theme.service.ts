import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'app-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private mode$ = new BehaviorSubject<ThemeMode>('dark');
  readonly isLight$ = this.mode$.asObservable();

  constructor() {
    this.initTheme();
  }

  initTheme(): void {
    const stored = (localStorage.getItem(THEME_KEY) as ThemeMode) || null;
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    const initial: ThemeMode = stored || (prefersLight ? 'light' : 'dark');
    this.applyTheme(initial);
  }

  toggle(): void {
    const next: ThemeMode = this.mode$.value === 'light' ? 'dark' : 'light';
    this.applyTheme(next);
  }

  set(mode: ThemeMode): void {
    this.applyTheme(mode);
  }

  get current(): ThemeMode {
    return this.mode$.value;
  }

  private applyTheme(mode: ThemeMode): void {
    const body = document.body;
    if (mode === 'light') {
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
    }
    localStorage.setItem(THEME_KEY, mode);
    this.mode$.next(mode);
  }
}
