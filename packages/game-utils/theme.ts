// Preserved from games/games/mascot-runner — Phaser.addThemeToggle removed.
// Theme helpers are pure DOM / localStorage utilities, usable by any package.

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'wizkidz-theme';

export function getThemeMode(): ThemeMode {
  try {
    return (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? 'light';
  } catch {
    return 'light';
  }
}

export function setThemeMode(m: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, m);
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new CustomEvent('wizkidz-theme-change'));
}

export function cycleTheme(): ThemeMode {
  const order: ThemeMode[] = ['light', 'dark', 'system'];
  const next = order[(order.indexOf(getThemeMode()) + 1) % 3];
  setThemeMode(next);
  return next;
}

export function resolveTheme(): 'light' | 'dark' {
  const m = getThemeMode();
  if (m !== 'system') return m;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}
