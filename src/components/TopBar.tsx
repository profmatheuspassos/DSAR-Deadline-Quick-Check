import { CalendarDays, Moon, Sun } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import type { Language, ThemeMode } from '../types/dsar';
import { PWAInstallButton } from './PWAInstallButton';

interface TopBarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export function TopBar({
  language,
  onLanguageChange,
  theme,
  onToggleTheme,
  onOpenSettings,
}: TopBarProps) {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element brand wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          {t.appTitle}
        </a>

        {/* Zone 2: Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <PWAInstallButton language={language} />

          {/* Language Segmented Control */}
          <div
            role="group"
            aria-label="Language"
            className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800/80 p-0.5"
          >
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              aria-pressed={language === 'en'}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                language === 'en'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('pt')}
              aria-pressed={language === 'pt'}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                language === 'pt'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              PT
            </button>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t.themeToLight : t.themeToDark}
            title={theme === 'dark' ? t.themeToLight : t.themeToDark}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          {/* Holidays & Legal Modal Trigger */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-3 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <CalendarDays className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" aria-hidden="true" />
            <span>{t.navHolidaysSettings}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
