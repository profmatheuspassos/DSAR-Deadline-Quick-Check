import { COUNTRY_MAP } from '../i18n/translations';
import type { CountryCode, Language, ThemeMode, UIPreferences } from '../types/dsar';

const STORAGE_KEY = 'privacy_quickcheck_prefs_v1';

const DEFAULT_PREFERENCES: UIPreferences = {
  language: 'en',
  defaultCountry: 'DE',
  theme: 'light',
};

function isValidCountry(val: unknown): val is CountryCode {
  return typeof val === 'string' && val in COUNTRY_MAP;
}

function isValidLanguage(val: unknown): val is Language {
  return val === 'en' || val === 'pt';
}

function isValidTheme(val: unknown): val is ThemeMode {
  return val === 'light' || val === 'dark';
}

export function loadPreferences(): UIPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      return {
        ...DEFAULT_PREFERENCES,
        theme: prefersDark ? 'dark' : 'light',
      };
    }
    const parsed = JSON.parse(raw) as Partial<UIPreferences>;
    return {
      language: isValidLanguage(parsed.language)
        ? parsed.language
        : DEFAULT_PREFERENCES.language,
      defaultCountry: isValidCountry(parsed.defaultCountry)
        ? parsed.defaultCountry
        : DEFAULT_PREFERENCES.defaultCountry,
      theme: isValidTheme(parsed.theme) ? parsed.theme : DEFAULT_PREFERENCES.theme,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UIPreferences): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota or private browsing errors gracefully
  }
}
