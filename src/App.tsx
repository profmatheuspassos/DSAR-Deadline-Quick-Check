import { useEffect, useMemo, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { AuditTrailDrawer } from './components/AuditTrailDrawer';
import { HolidaysSettingsModal } from './components/HolidaysSettingsModal';
import { InputPanel } from './components/InputPanel';
import { OfflineBanner } from './components/OfflineBanner';
import { ResultsPanel } from './components/ResultsPanel';
import { TopBar } from './components/TopBar';
import { calculateDSAR, getTodayISO } from './engine/dsarCalculator';
import { buildAuditTrailText } from './engine/formatters';
import { TRANSLATIONS } from './i18n/translations';
import type { CalculationInput, CountryCode, Language, UIPreferences } from './types/dsar';
import { copyTextToClipboard } from './utils/clipboard';
import { loadPreferences, savePreferences } from './utils/preferences';
import { parseInputFromURL, syncInputToURL } from './utils/urlState';

export default function App() {
  const [prefs, setPrefs] = useState<UIPreferences>(() => loadPreferences());

  // Stateless calculator inputs — hydrated from URL query params when present, never saved to localStorage
  const [input, setInput] = useState<CalculationInput>(() =>
    parseInputFromURL(prefs.defaultCountry)
  );

  const [auditOpen, setAuditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutToastVisible, setShortcutToastVisible] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  // Sync dark mode class on <html> and persist UI preferences
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.lang = prefs.language;
    savePreferences(prefs);
  }, [prefs]);

  // Sync shareable scenario parameters to URL query string
  useEffect(() => {
    syncInputToURL(input);
  }, [
    input.receiptDate,
    input.countryCode,
    input.requestArticle,
    input.extensionMonths,
    input.identityDoubtEnabled,
    input.suspensionDays,
  ]);

  const result = useMemo(() => calculateDSAR(input), [input]);
  const t = TRANSLATIONS[prefs.language];

  // Global keyboard shortcut: Ctrl/Cmd + Shift + C copies the Audit Trail with visual toast
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        !e.altKey &&
        e.key.toLowerCase() === 'c'
      ) {
        e.preventDefault();
        const auditText = buildAuditTrailText(result, prefs.language);
        void copyTextToClipboard(auditText).then((ok) => {
          if (!ok) return;
          setShortcutToastVisible(true);
          if (toastTimerRef.current !== null) {
            window.clearTimeout(toastTimerRef.current);
          }
          toastTimerRef.current = window.setTimeout(() => {
            setShortcutToastVisible(false);
          }, 2600);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, [result, prefs.language]);

  const handleLanguageChange = (language: Language) => {
    setPrefs((prev) => ({ ...prev, language }));
  };

  const handleToggleTheme = () => {
    setPrefs((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const handleCountrySelect = (countryCode: CountryCode) => {
    setInput((prev) => ({ ...prev, countryCode }));
    setPrefs((prev) => ({ ...prev, defaultCountry: countryCode }));
  };

  const handleDefaultCountryChange = (defaultCountry: CountryCode) => {
    setPrefs((prev) => ({ ...prev, defaultCountry }));
    setInput((prev) => ({ ...prev, countryCode: defaultCountry }));
  };

  const handleInputPatch = (patch: Partial<CalculationInput>) => {
    setInput((prev) => ({ ...prev, ...patch }));
  };

  const handleReset = () => {
    setInput({
      receiptDate: getTodayISO(),
      countryCode: prefs.defaultCountry,
      requestArticle: 'art15',
      extensionMonths: 0,
      identityDoubtEnabled: false,
      suspensionDays: 0,
      complexityFlagged: false,
      unfoundedFlagged: false,
    });
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100">
      <TopBar
        language={prefs.language}
        onLanguageChange={handleLanguageChange}
        theme={prefs.theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Clean Editorial Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white [text-wrap:balance]">
            {t.pageSubtitle}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.legalBasisLine}
          </p>
        </div>

        {/* 2-Column Desktop / Stacked Mobile Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-5">
            <InputPanel
              input={input}
              defaultCountry={prefs.defaultCountry}
              language={prefs.language}
              onChange={handleInputPatch}
              onCountrySelect={handleCountrySelect}
              onReset={handleReset}
            />
          </div>

          <div className="lg:col-span-7 lg:sticky lg:top-20">
            <ResultsPanel
              result={result}
              language={prefs.language}
              onOpenAuditTrail={() => setAuditOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="mt-12 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="mx-auto flex max-w-[1280px] flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{t.footerOfflineNote}</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline font-mono text-[11px]">{t.shortcutHint}</span>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="hover:text-slate-800 dark:hover:text-slate-200 underline-offset-4 hover:underline cursor-pointer whitespace-nowrap shrink-0"
          >
            {t.footerDatasetNote(result.datasetVersion)}
          </button>
        </div>
      </footer>

      <AuditTrailDrawer
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
        result={result}
        language={prefs.language}
      />

      <HolidaysSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        language={prefs.language}
        activeCountry={input.countryCode}
        defaultCountry={prefs.defaultCountry}
        onDefaultCountryChange={handleDefaultCountryChange}
      />

      <OfflineBanner language={prefs.language} />

      {/* Keyboard Shortcut Toast */}
      {shortcutToastVisible && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-900 dark:bg-slate-100 px-3.5 py-2.5 text-xs font-medium text-white dark:text-slate-900 shadow-lg"
        >
          <Check
            className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-600 shrink-0"
            aria-hidden="true"
          />
          <span>{t.shortcutCopiedToast}</span>
        </div>
      )}
    </div>
  );
}
