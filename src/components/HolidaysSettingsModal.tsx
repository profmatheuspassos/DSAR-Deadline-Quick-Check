import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { getWeekdayUTC, HOLIDAY_DATASET } from '../engine/dsarCalculator';
import { COUNTRIES, TRANSLATIONS, WEEKDAYS } from '../i18n/translations';
import type { CountryCode, Language } from '../types/dsar';

interface HolidaysSettingsModalProps {
  open: boolean;
  onClose: () => void;
  language: Language;
  activeCountry: CountryCode;
  defaultCountry: CountryCode;
  onDefaultCountryChange: (code: CountryCode) => void;
}

type ModalTab = 'holidays' | 'disclaimer';

export function HolidaysSettingsModal({
  open,
  onClose,
  language,
  activeCountry,
  defaultCountry,
  onDefaultCountryChange,
}: HolidaysSettingsModalProps) {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<ModalTab>('holidays');
  const [filterCountry, setFilterCountry] = useState<CountryCode>(activeCountry);
  const [filterYear, setFilterYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedDefaultFlash, setSavedDefaultFlash] = useState(false);

  // Sync browse country with current active jurisdiction whenever modal opens
  useEffect(() => {
    if (open) {
      setFilterCountry(activeCountry);
    }
  }, [open, activeCountry]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const filteredHolidays = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return HOLIDAY_DATASET.holidays.filter((h) => {
      if (h.countryCode !== filterCountry) return false;
      if (filterYear !== 'all' && !h.date.startsWith(`${filterYear}-`)) return false;
      if (q) {
        const matchDate = h.date.includes(q);
        const matchEN = h.nameEN.toLowerCase().includes(q);
        const matchPT = h.namePT.toLowerCase().includes(q);
        if (!matchDate && !matchEN && !matchPT) return false;
      }
      return true;
    });
  }, [filterCountry, filterYear, searchQuery]);

  if (!open) return null;

  const handleDefaultCountryUpdate = (code: CountryCode) => {
    onDefaultCountryChange(code);
    setSavedDefaultFlash(true);
    window.setTimeout(() => setSavedDefaultFlash(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 px-5 py-4 sm:px-6">
          <h2
            id="settings-modal-title"
            className="text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            {t.settingsModalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeBtn}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800 px-5 sm:px-6 pt-3">
          <div role="tablist" className="flex items-center gap-6">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'holidays'}
              onClick={() => setActiveTab('holidays')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'holidays'
                  ? 'border-blue-700 dark:border-blue-400 text-blue-700 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.tabHolidays}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'disclaimer'}
              onClick={() => setActiveTab('disclaimer')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'disclaimer'
                  ? 'border-blue-700 dark:border-blue-400 text-blue-700 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.tabDisclaimer}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto subtle-scroll p-5 sm:p-6">
          {activeTab === 'holidays' ? (
            <div className="space-y-5">
              {/* Default Country Preference */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3.5">
                <div>
                  <label
                    htmlFor="default-country-pref"
                    className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {t.defaultCountryLabel}
                  </label>
                  {savedDefaultFlash && (
                    <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      {t.defaultCountrySaved}
                    </span>
                  )}
                </div>
                <div className="relative sm:w-56">
                  <select
                    id="default-country-pref"
                    value={defaultCountry}
                    onChange={(e) =>
                      handleDefaultCountryUpdate(e.target.value as CountryCode)
                    }
                    className="w-full h-9 appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3 pr-8 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} — {language === 'pt' ? c.namePT : c.nameEN}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4 relative">
                  <label htmlFor="holiday-country-filter" className="sr-only">
                    {t.filterCountryLabel}
                  </label>
                  <select
                    id="holiday-country-filter"
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value as CountryCode)}
                    className="w-full h-10 appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3 pr-8 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} — {language === 'pt' ? c.namePT : c.nameEN}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                    aria-hidden="true"
                  />
                </div>

                <div className="sm:col-span-3 relative">
                  <label htmlFor="holiday-year-filter" className="sr-only">
                    {t.filterYearLabel}
                  </label>
                  <select
                    id="holiday-year-filter"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full h-10 appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3 pr-8 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none cursor-pointer"
                  >
                    <option value="all">{t.allYears}</option>
                    {HOLIDAY_DATASET.supportedYears.map((yr) => (
                      <option key={yr} value={String(yr)}>
                        {yr}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                    aria-hidden="true"
                  />
                </div>

                <div className="sm:col-span-5 relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchHolidaysPlaceholder}
                    className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Count */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{t.holidaysCount(filteredHolidays.length)}</span>
                <span className="font-mono tabular-dates">
                  v{HOLIDAY_DATASET.version}
                </span>
              </div>

              {/* High-Density Tabular Holiday List */}
              {filteredHolidays.length === 0 ? (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t.noHolidaysMatch}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                  <table className="w-full border-collapse text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <th className="py-2.5 px-3.5 whitespace-nowrap">{t.tableDate}</th>
                        <th className="py-2.5 px-3.5 whitespace-nowrap">{t.tableDay}</th>
                        <th className="py-2.5 px-3.5">{t.tableHoliday}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {filteredHolidays.map((h) => {
                        const wdIdx = getWeekdayUTC(h.date);
                        const isWeekend = wdIdx === 0 || wdIdx === 6;
                        const primaryName = language === 'pt' ? h.namePT : h.nameEN;
                        const secondaryName = language === 'pt' ? h.nameEN : h.namePT;
                        return (
                          <tr
                            key={`${h.countryCode}-${h.date}-${h.nameEN}`}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-2.5 px-3.5 font-mono text-xs tabular-dates font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                              {h.date}
                            </td>
                            <td
                              className={`py-2.5 px-3.5 text-xs whitespace-nowrap ${
                                isWeekend
                                  ? 'text-slate-400 dark:text-slate-500'
                                  : 'text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {WEEKDAYS[language][wdIdx]}
                            </td>
                            <td className="py-2.5 px-3.5">
                              <div className="font-medium text-slate-900 dark:text-slate-100">
                                {primaryName}
                              </div>
                              {secondaryName !== primaryName && (
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {secondaryName}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Legal Disclaimer Tab */
            <div className="space-y-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <section>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t.disclaimerHeading1}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.disclaimerBody1}
                </p>
              </section>

              <section className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t.disclaimerHeading2}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.disclaimerBody2}
                </p>
              </section>

              <section className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t.disclaimerHeading3}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.disclaimerBody3}
                </p>
              </section>

              <section className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t.disclaimerHeading4}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.disclaimerBody4}
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 dark:border-slate-800 px-5 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
