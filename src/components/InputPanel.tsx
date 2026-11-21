import { useEffect, useState } from 'react';
import { ChevronDown, Minus, Plus, RotateCcw } from 'lucide-react';
import { formatLongDate } from '../engine/formatters';
import { getTodayISO, isValidISODate } from '../engine/dsarCalculator';
import { COUNTRIES, REQUEST_ARTICLES, TRANSLATIONS } from '../i18n/translations';
import type {
  CalculationInput,
  CountryCode,
  ExtensionMonths,
  Language,
  RequestArticle,
} from '../types/dsar';

interface DemoPreset {
  id: 'easter' | 'clamping' | 'suspension';
  patch: Partial<CalculationInput>;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'easter',
    patch: {
      receiptDate: '2026-03-03',
      countryCode: 'DE',
      requestArticle: 'art15',
      extensionMonths: 0,
      identityDoubtEnabled: false,
      suspensionDays: 0,
    },
  },
  {
    id: 'clamping',
    patch: {
      receiptDate: '2026-01-31',
      countryCode: 'FR',
      requestArticle: 'art17',
      extensionMonths: 1,
      identityDoubtEnabled: false,
      suspensionDays: 0,
    },
  },
  {
    id: 'suspension',
    patch: {
      receiptDate: '2026-05-15',
      countryCode: 'EE',
      requestArticle: 'art15',
      extensionMonths: 0,
      identityDoubtEnabled: true,
      suspensionDays: 8,
    },
  },
];

interface InputPanelProps {
  input: CalculationInput;
  defaultCountry: CountryCode;
  language: Language;
  onChange: (patch: Partial<CalculationInput>) => void;
  onCountrySelect: (code: CountryCode) => void;
  onReset: () => void;
}

export function InputPanel({
  input,
  defaultCountry,
  language,
  onChange,
  onCountrySelect,
  onReset,
}: InputPanelProps) {
  const t = TRANSLATIONS[language];
  const todayIso = getTodayISO();

  const [identityExpanded, setIdentityExpanded] = useState<boolean>(
    input.identityDoubtEnabled
  );
  const [complexityExpanded, setComplexityExpanded] = useState<boolean>(false);
  const [unfoundedExpanded, setUnfoundedExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (input.identityDoubtEnabled) {
      setIdentityExpanded(true);
    }
  }, [input.identityDoubtEnabled]);

  const handleToggleIdentity = () => {
    const next = !input.identityDoubtEnabled;
    onChange({ identityDoubtEnabled: next });
    if (next) {
      setIdentityExpanded(true);
    }
  };

  const handleSuspensionChange = (rawVal: number) => {
    const clamped = Math.max(0, Math.min(365, Math.floor(Number.isNaN(rawVal) ? 0 : rawVal)));
    onChange({ suspensionDays: clamped });
  };

  const extensionOptions: Array<{ value: ExtensionMonths; label: string }> = [
    { value: 0, label: t.extensionNone },
    { value: 1, label: t.extensionPlus1 },
    { value: 2, label: t.extensionPlus2 },
  ];

  const isDateValid = isValidISODate(input.receiptDate);

  const getPresetLabel = (id: DemoPreset['id']): string => {
    if (id === 'easter') return t.presetEaster;
    if (id === 'clamping') return t.presetClamping;
    return t.presetSuspension;
  };

  const isPresetActive = (preset: DemoPreset): boolean => {
    const p = preset.patch;
    return (
      input.receiptDate === p.receiptDate &&
      input.countryCode === p.countryCode &&
      input.requestArticle === p.requestArticle &&
      input.extensionMonths === p.extensionMonths &&
      input.identityDoubtEnabled === p.identityDoubtEnabled &&
      (p.identityDoubtEnabled ? input.suspensionDays === p.suspensionDays : true)
    );
  };

  const isAtDefault =
    input.receiptDate === todayIso &&
    input.countryCode === defaultCountry &&
    input.requestArticle === 'art15' &&
    input.extensionMonths === 0 &&
    !input.identityDoubtEnabled &&
    input.suspensionDays === 0 &&
    !input.complexityFlagged &&
    !input.unfoundedFlagged;

  const handleResetClick = () => {
    onReset();
    setIdentityExpanded(false);
    setComplexityExpanded(false);
    setUnfoundedExpanded(false);
  };

  return (
    <div className="space-y-5">
      {/* Quick Demo Presets & Reset */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-0.5 whitespace-nowrap">
          {t.presetsLabel}:
        </span>
        {DEMO_PRESETS.map((preset) => {
          const active = isPresetActive(preset);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.patch)}
              aria-pressed={active}
              className={`inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                active
                  ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200'
                  : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {getPresetLabel(preset.id)}
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleResetClick}
          disabled={isAtDefault}
          className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700/80 bg-transparent px-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <RotateCcw className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>{t.resetFormBtn}</span>
        </button>
      </div>

      {/* Section 1: Core Request Parameters */}
      <section
        aria-labelledby="inputs-heading"
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 sm:p-6"
      >
        <div className="mb-5">
          <h2
            id="inputs-heading"
            className="text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            {t.sectionInputsTitle}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t.sectionInputsDesc}
          </p>
        </div>

        <div className="space-y-5">
          {/* Receipt Date */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label
                htmlFor="receipt-date"
                className="text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                {t.receiptDateLabel}
              </label>
              {input.receiptDate !== todayIso && (
                <button
                  type="button"
                  onClick={() => onChange({ receiptDate: todayIso })}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  <span>{t.todayButton}</span>
                </button>
              )}
            </div>
            <input
              id="receipt-date"
              type="date"
              value={input.receiptDate}
              onChange={(e) => {
                if (e.target.value) {
                  onChange({ receiptDate: e.target.value });
                }
              }}
              className="w-full h-11 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-sm font-mono tabular-dates text-slate-900 dark:text-slate-100 focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
              {isDateValid && (
                <>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {formatLongDate(input.receiptDate, language)}
                  </span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span>{t.receiptDateHint}</span>
            </div>
          </div>

          {/* EEA Jurisdiction */}
          <div>
            <label
              htmlFor="jurisdiction-select"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
            >
              {t.jurisdictionLabel}
            </label>
            <div className="relative">
              <select
                id="jurisdiction-select"
                value={input.countryCode}
                onChange={(e) => onCountrySelect(e.target.value as CountryCode)}
                className="w-full h-11 appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3.5 pr-10 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
              >
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.code} —{' '}
                    {language === 'pt' ? country.namePT : country.nameEN}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Request Type (GDPR Arts. 15-22) */}
          <div>
            <label
              htmlFor="request-type-select"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
            >
              {t.requestTypeLabel}
            </label>
            <div className="relative">
              <select
                id="request-type-select"
                value={input.requestArticle}
                onChange={(e) =>
                  onChange({ requestArticle: e.target.value as RequestArticle })
                }
                className="w-full h-11 appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3.5 pr-10 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
              >
                {REQUEST_ARTICLES.map((art) => (
                  <option key={art.id} value={art.id}>
                    {language === 'pt' ? art.titlePT : art.titleEN}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Extension Segmented Control */}
          <div>
            <span
              id="extension-group-label"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
            >
              {t.extensionLabel}
            </span>
            <div
              role="radiogroup"
              aria-labelledby="extension-group-label"
              className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800/80 p-1"
            >
              {extensionOptions.map((opt) => {
                const active = input.extensionMonths === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onChange({ extensionMonths: opt.value })}
                    className={`h-9 px-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      active
                        ? 'bg-blue-700 dark:bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.extensionHelp}
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Admissibility & Clock-Stop Checklist (3 Expandable Cards) */}
      <section aria-labelledby="checklist-heading" className="space-y-3">
        <div className="px-0.5">
          <h2
            id="checklist-heading"
            className="text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            {t.sectionChecklistTitle}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {t.sectionChecklistDesc}
          </p>
        </div>

        {/* Card 1: Identity or Scope Doubt (Art. 12(6)) */}
        <div
          className={`rounded-xl border transition-colors bg-white dark:bg-[#111827] ${
            input.identityDoubtEnabled
              ? 'border-blue-600/60 dark:border-blue-500/60'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-start justify-between gap-3 p-4">
            <button
              type="button"
              onClick={() => setIdentityExpanded((prev) => !prev)}
              aria-expanded={identityExpanded}
              className="flex-1 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t.cardIdentityTitle}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  · {t.cardIdentityArticle}
                </span>
                {!input.identityDoubtEnabled && input.suspensionDays > 0 && (
                  <span className="text-xs font-mono tabular-dates text-slate-500 dark:text-slate-400">
                    · {t.cardIdentitySavedDays(input.suspensionDays)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.cardIdentitySubtitle}
              </p>
            </button>

            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              {/* Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={input.identityDoubtEnabled}
                aria-label={t.cardIdentityTitle}
                onClick={handleToggleIdentity}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                  input.identityDoubtEnabled
                    ? 'bg-blue-700 dark:bg-blue-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    input.identityDoubtEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => setIdentityExpanded((prev) => !prev)}
                aria-label="Toggle details"
                aria-expanded={identityExpanded}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-150 ${
                    identityExpanded ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {identityExpanded && (
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label
                    htmlFor="suspension-days-input"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t.suspensionDaysLabel} ({t.suspensionDaysUnit})
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[7, 14, 30].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        disabled={!input.identityDoubtEnabled}
                        onClick={() => handleSuspensionChange(preset)}
                        className={`px-2 py-1 text-xs font-mono tabular-dates rounded border transition-colors whitespace-nowrap cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                          input.identityDoubtEnabled && input.suspensionDays === preset
                            ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 font-semibold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        +{preset}d
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!input.identityDoubtEnabled || input.suspensionDays <= 0}
                    onClick={() => handleSuspensionChange(input.suspensionDays - 1)}
                    aria-label="Decrease suspension days"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>

                  <input
                    id="suspension-days-input"
                    type="number"
                    min={0}
                    max={365}
                    step={1}
                    disabled={!input.identityDoubtEnabled}
                    value={input.suspensionDays}
                    onChange={(e) => {
                      const v = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                      handleSuspensionChange(v);
                    }}
                    className="h-10 flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-center text-sm font-mono font-semibold tabular-dates text-slate-900 dark:text-slate-100 disabled:opacity-50 focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />

                  <button
                    type="button"
                    disabled={!input.identityDoubtEnabled || input.suspensionDays >= 365}
                    onClick={() => handleSuspensionChange(input.suspensionDays + 1)}
                    aria-label="Increase suspension days"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {t.suspensionRangeHint}
                </p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800/80">
                {t.suspensionLegalNote}
              </p>
            </div>
          )}
        </div>

        {/* Card 2: Complexity or High Volume (Art. 12(3) · EDPB 01/2022 §§ 162–164) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
          <button
            type="button"
            onClick={() => setComplexityExpanded((prev) => !prev)}
            aria-expanded={complexityExpanded}
            className="flex w-full items-start justify-between gap-3 p-4 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t.cardComplexityTitle}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  · {t.cardComplexityArticle}
                </span>
                {input.complexityFlagged && (
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                    · {t.flaggedBadgeText}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.cardComplexitySubtitle}
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 mt-0.5 text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-150 ${
                complexityExpanded ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {complexityExpanded && (
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>{t.cardComplexityIntro}</p>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
                {t.cardComplexityCriteria.map((criterion, idx) => (
                  <li key={idx}>{criterion}</li>
                ))}
              </ul>
              <p className="pt-2 border-t border-slate-100 dark:border-slate-800/80 font-medium text-slate-800 dark:text-slate-200">
                {t.cardComplexityFootnote}
              </p>
              <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={input.complexityFlagged}
                  onChange={(e) => onChange({ complexityFlagged: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-700 focus:ring-blue-600 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {t.cardComplexityFlagLabel}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Card 3: Manifestly Unfounded or Excessive (Art. 12(5) · CJEU C-526/24) */}
        <div
          className={`rounded-xl border transition-colors bg-white dark:bg-[#111827] ${
            input.unfoundedFlagged
              ? 'border-blue-600/60 dark:border-blue-500/60'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-start justify-between gap-3 p-4">
            <button
              type="button"
              onClick={() => setUnfoundedExpanded((prev) => !prev)}
              aria-expanded={unfoundedExpanded}
              className="flex-1 min-w-0 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t.cardUnfoundedTitle}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  · {t.cardUnfoundedArticle}
                </span>
                {input.unfoundedFlagged && (
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                    · {t.flaggedBadgeText}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.cardUnfoundedSubtitle}
              </p>
            </button>

            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              <button
                type="button"
                role="switch"
                aria-checked={input.unfoundedFlagged}
                aria-label={t.cardUnfoundedTitle}
                onClick={() => {
                  const next = !input.unfoundedFlagged;
                  onChange({ unfoundedFlagged: next });
                  if (next) setUnfoundedExpanded(true);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                  input.unfoundedFlagged
                    ? 'bg-blue-700 dark:bg-blue-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    input.unfoundedFlagged ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => setUnfoundedExpanded((prev) => !prev)}
                aria-label="Toggle details"
                aria-expanded={unfoundedExpanded}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-150 ${
                    unfoundedExpanded ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {unfoundedExpanded && (
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>{t.cardUnfoundedIntro}</p>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
                {t.cardUnfoundedPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
              <p className="pt-2 border-t border-slate-100 dark:border-slate-800/80 font-medium text-slate-800 dark:text-slate-200">
                {t.cardUnfoundedFootnote}
              </p>
              <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={input.unfoundedFlagged}
                  onChange={(e) => onChange({ unfoundedFlagged: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-700 focus:ring-blue-600 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {t.cardUnfoundedFlagLabel}
                </span>
              </label>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
