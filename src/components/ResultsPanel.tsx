import { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CalendarPlus,
  Check,
  Clock,
  Copy,
  FileText,
  Info,
  Mail,
  PauseCircle,
} from 'lucide-react';
import { diffCalendarDaysUTC, getTodayUTCISO } from '../engine/dsarCalculator';
import {
  buildCopySummary,
  formatLongDate,
  formatShortDate,
  getHolidayName,
} from '../engine/formatters';
import { downloadDSARCalendarICS } from '../engine/icsExport';
import { getActiveResponseTemplates } from '../engine/templates';
import { COUNTRY_MAP, TRANSLATIONS, WEEKDAYS_SHORT } from '../i18n/translations';
import type { CalculationResult, DeadlineOutcome, Language } from '../types/dsar';
import { copyTextToClipboard } from '../utils/clipboard';

interface ResultsPanelProps {
  result: CalculationResult;
  language: Language;
  onOpenAuditTrail: () => void;
}

function CountdownBadge({
  targetIso,
  todayUtcIso,
  language,
}: {
  targetIso: string;
  todayUtcIso: string;
  language: Language;
}) {
  const t = TRANSLATIONS[language];
  const delta = diffCalendarDaysUTC(todayUtcIso, targetIso);

  let label: string;
  let toneClass: string;
  let isOverdue = false;

  if (delta < 0) {
    isOverdue = true;
    label = t.countdownOverdueDays(Math.abs(delta));
    toneClass =
      'border-red-300 dark:border-red-800/80 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300';
  } else if (delta === 0) {
    label = t.countdownDueToday;
    toneClass =
      'border-amber-300 dark:border-amber-700/80 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300';
  } else if (delta <= 5) {
    label = t.countdownInDays(delta);
    toneClass =
      'border-amber-300 dark:border-amber-700/80 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300';
  } else {
    label = t.countdownInDays(delta);
    toneClass =
      'border-emerald-300/90 dark:border-emerald-800/70 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tabular-dates whitespace-nowrap shrink-0 ${toneClass}`}
    >
      {isOverdue ? (
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      )}
      <span>{label}</span>
    </span>
  );
}

function RolloverSummaryBlock({
  outcome,
  language,
}: {
  outcome: DeadlineOutcome;
  language: Language;
}) {
  const t = TRANSLATIONS[language];

  if (outcome.shiftedDays === 0) {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Check
          className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
          aria-hidden="true"
        />
        <span>{t.noShiftNotice}</span>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-amber-200/90 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/30 px-3.5 py-2.5 text-xs">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-amber-900 dark:text-amber-300">
        <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{t.shiftedNotice(outcome.shiftedDays)}</span>
        <span
          aria-hidden="true"
          className="font-normal text-amber-700/70 dark:text-amber-400/70"
        >
          ·
        </span>
        <span className="font-mono font-normal tabular-dates text-amber-800 dark:text-amber-200">
          {outcome.preRolloverDate} → {outcome.finalDate}
        </span>
      </div>

      <ul className="mt-2 space-y-1 text-amber-900/90 dark:text-amber-200/90">
        {outcome.skippedDays.map((s) => {
          const weekdayShort = WEEKDAYS_SHORT[language][s.weekdayIndex];
          const reasonParts: string[] = [];
          if (s.isWeekend) reasonParts.push(`${t.weekendLabel} (${weekdayShort})`);
          if (s.holiday)
            reasonParts.push(`${t.holidayLabel}: ${getHolidayName(s.holiday, language)}`);
          return (
            <li key={s.date} className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-mono tabular-dates font-medium">{s.date}</span>
              <span className="text-amber-800/90 dark:text-amber-300/90">
                {reasonParts.join(' · ')}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ResultsPanel({
  result,
  language,
  onOpenAuditTrail,
}: ResultsPanelProps) {
  const t = TRANSLATIONS[language];
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  const todayUtcIso = getTodayUTCISO();

  const {
    input,
    ordinary,
    extended,
    suspendedOrdinary,
    suspendedExtended,
    outOfBoundsYears,
    effectiveSuspensionDays,
  } = result;

  const activeTemplates = useMemo(
    () => getActiveResponseTemplates(result, language),
    [result, language]
  );

  const country = COUNTRY_MAP[input.countryCode];
  const countryLabel = `${country.flag} ${country.code} · ${
    language === 'pt' ? country.namePT : country.nameEN
  }`;

  const handleCopySummary = async () => {
    const text = buildCopySummary(result, language);
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedSummary(true);
      window.setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const handleCopyTemplate = async (templateId: string, text: string) => {
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedTemplateId(templateId);
      window.setTimeout(() => {
        setCopiedTemplateId((prev) => (prev === templateId ? null : prev));
      }, 2000);
    }
  };

  // Build concise timeline milestones
  const milestones: Array<{
    key: string;
    label: string;
    date: string;
    highlight?: boolean;
  }> = [
    { key: 'receipt', label: t.timelineReceipt, date: input.receiptDate },
    { key: 'day1', label: t.timelineDayOne, date: result.dayOneDate },
    {
      key: 'ordinary',
      label: t.timelineOrdinary,
      date: ordinary.finalDate,
      highlight: true,
    },
  ];
  if (suspendedOrdinary) {
    milestones.push({
      key: 'suspended',
      label: `${t.timelineSuspended} (+${effectiveSuspensionDays}d)`,
      date: suspendedOrdinary.finalDate,
    });
  }
  if (extended) {
    milestones.push({
      key: 'extended',
      label: `${t.timelineExtended} (+${input.extensionMonths}M)`,
      date: extended.finalDate,
      highlight: true,
    });
  }

  return (
    <div className="space-y-5">
      {/* Out-of-bounds Year Info Banner (Rule 7) */}
      {outOfBoundsYears.length > 0 && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-amber-300/90 dark:border-amber-700/70 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs sm:text-sm text-amber-950 dark:text-amber-100"
        >
          <AlertTriangle
            className="h-4 w-4 mt-0.5 text-amber-700 dark:text-amber-400 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              {t.outOfBoundsTitle}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/85">
              {t.outOfBoundsBody(outOfBoundsYears.join(', '))}
            </p>
          </div>
        </div>
      )}

      {/* Primary Focal Anchor: Ordinary Statutory Deadline */}
      <section
        aria-labelledby="ordinary-deadline-heading"
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2
              id="ordinary-deadline-heading"
              className="text-sm font-semibold text-slate-900 dark:text-slate-100"
            >
              {t.ordinaryDeadlineTitle}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t.ordinaryDeadlineBasis}
            </p>
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
            {countryLabel}
          </span>
        </div>

        {/* Dominant Tabular Date Display + Relative Countdown */}
        <div className="mt-5 flex flex-wrap items-start justify-between gap-x-4 gap-y-2.5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-3xl sm:text-4xl font-semibold tracking-tight tabular-dates text-slate-950 dark:text-white">
                {ordinary.finalDate}
              </span>
              <CountdownBadge
                targetIso={ordinary.finalDate}
                todayUtcIso={todayUtcIso}
                language={language}
              />
            </div>
            <div className="mt-1 text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
              {formatLongDate(ordinary.finalDate, language)}
            </div>
          </div>

          {ordinary.shiftedDays > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 dark:border-amber-700/80 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:text-amber-300 whitespace-nowrap shrink-0">
              <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{t.shiftedNotice(ordinary.shiftedDays)}</span>
            </div>
          )}
        </div>

        {/* Unboxed Metadata Line */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
          <span>
            {t.nominalLabel}:{' '}
            <strong className="font-mono tabular-dates font-medium text-slate-800 dark:text-slate-200">
              {ordinary.nominalDate}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-dates">
            {t.calendarDaysLabel(ordinary.totalCalendarDaysFromReceipt)}
          </span>
          {ordinary.wasClamped && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-blue-700 dark:text-blue-400">
                {t.clampedNotice(ordinary.originalReceiptDay, ordinary.clampedDay)}
              </span>
            </>
          )}
        </div>

        <RolloverSummaryBlock outcome={ordinary} language={language} />
      </section>

      {/* Secondary Statutory Cards Grid: Extension Notice + Extended Deadline (if active) */}
      <div
        className={`grid gap-5 ${extended ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
      >
        {/* Extension / Refusal Notice Deadline */}
        <section
          aria-labelledby="notice-deadline-heading"
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 flex flex-col justify-between"
        >
          <div>
            <h3
              id="notice-deadline-heading"
              className="text-sm font-semibold text-slate-900 dark:text-slate-100"
            >
              {t.extensionNoticeTitle}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t.extensionNoticeBasis}
            </p>
            <div className="mt-4">
              <div className="font-mono text-2xl font-semibold tracking-tight tabular-dates text-slate-900 dark:text-slate-100">
                {result.extensionNoticeDate}
              </div>
              <div className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                {formatLongDate(result.extensionNoticeDate, language)}
              </div>
            </div>
          </div>

          <p className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t.extensionNoticeDesc}
          </p>
        </section>

        {/* Extended Deadline Card (Rendered when extension > 0) */}
        {extended && (input.extensionMonths === 1 || input.extensionMonths === 2) && (
          <section
            aria-labelledby="extended-deadline-heading"
            className="rounded-xl border border-blue-200 dark:border-blue-900/70 bg-white dark:bg-[#111827] p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3
                    id="extended-deadline-heading"
                    className="text-sm font-semibold text-slate-900 dark:text-slate-100"
                  >
                    {t.extendedDeadlineTitle(input.extensionMonths)}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {t.extendedDeadlineBasis(extended.monthsAdded)}
                  </p>
                </div>
                {extended.shiftedDays > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 dark:border-amber-700/80 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:text-amber-300 whitespace-nowrap shrink-0">
                    +{extended.shiftedDays}d
                  </span>
                )}
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-2xl font-semibold tracking-tight tabular-dates text-blue-800 dark:text-blue-300">
                    {extended.finalDate}
                  </span>
                  <CountdownBadge
                    targetIso={extended.finalDate}
                    todayUtcIso={todayUtcIso}
                    language={language}
                  />
                </div>
                <div className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  {formatLongDate(extended.finalDate, language)}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                <span>
                  {t.nominalLabel}:{' '}
                  <strong className="font-mono tabular-dates font-medium text-slate-800 dark:text-slate-200">
                    {extended.nominalDate}
                  </strong>
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-dates">
                  {t.calendarDaysLabel(extended.totalCalendarDaysFromReceipt)}
                </span>
                {extended.wasClamped && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-blue-700 dark:text-blue-400">
                      {t.clampedNotice(extended.originalReceiptDay, extended.clampedDay)}
                    </span>
                  </>
                )}
              </div>

              <RolloverSummaryBlock outcome={extended} language={language} />
            </div>

            <p className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.extendedDirectNote(input.receiptDate, extended.monthsAdded)}
            </p>
          </section>
        )}
      </div>

      {/* Parallel Suspension Comparison Card (Rendered when identityDoubtEnabled && suspensionDays > 0) */}
      {suspendedOrdinary && (
        <section
          aria-labelledby="suspension-compare-heading"
          className="rounded-xl border border-blue-200 dark:border-blue-800/70 bg-white dark:bg-[#111827] p-5 sm:p-6"
        >
          <div className="flex items-start gap-2.5">
            <PauseCircle
              className="h-4 w-4 mt-0.5 text-blue-700 dark:text-blue-400 shrink-0"
              aria-hidden="true"
            />
            <div>
              <h3
                id="suspension-compare-heading"
                className="text-sm font-semibold text-slate-900 dark:text-slate-100"
              >
                {t.suspensionCompareTitle}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {t.suspensionCompareBasis(effectiveSuspensionDays)}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {/* Ordinary Side-by-Side Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {/* Unadjusted Ordinary */}
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3.5">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t.ordinaryRowLabel} · {t.unadjustedColumn}
                </div>
                <div className="mt-1.5 font-mono text-lg font-semibold tabular-dates text-slate-900 dark:text-slate-100">
                  {ordinary.finalDate}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {formatShortDate(ordinary.finalDate, language)}
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-dates">
                  {t.nominalLabel}: {ordinary.nominalDate}
                  {ordinary.shiftedDays > 0 ? ` (+${ordinary.shiftedDays}d)` : ''}
                </div>
              </div>

              {/* Suspension-Adjusted Ordinary */}
              <div className="rounded-lg border border-blue-200 dark:border-blue-800/80 bg-blue-50/50 dark:bg-blue-950/30 p-3.5">
                <div className="flex items-center justify-between gap-2 text-xs text-blue-800 dark:text-blue-300 font-medium">
                  <span>
                    {t.ordinaryRowLabel} · {t.adjustedColumn}
                  </span>
                  <span className="font-mono tabular-dates">
                    {t.netDeltaLabel(
                      diffCalendarDaysUTC(ordinary.finalDate, suspendedOrdinary.finalDate)
                    )}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-lg font-semibold tabular-dates text-blue-900 dark:text-blue-200">
                    {suspendedOrdinary.finalDate}
                  </span>
                  <CountdownBadge
                    targetIso={suspendedOrdinary.finalDate}
                    todayUtcIso={todayUtcIso}
                    language={language}
                  />
                </div>
                <div className="text-xs text-blue-900/80 dark:text-blue-300/90">
                  {formatShortDate(suspendedOrdinary.finalDate, language)}
                </div>
                <div className="mt-2 text-xs text-blue-800/80 dark:text-blue-300/80 font-mono tabular-dates">
                  {t.preRolloverLabel}: {suspendedOrdinary.preRolloverDate}
                  {suspendedOrdinary.shiftedDays > 0
                    ? ` (+${suspendedOrdinary.shiftedDays}d)`
                    : ''}
                </div>
                {suspendedOrdinary.appliedHolidays.length > 0 && (
                  <div className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                    {suspendedOrdinary.appliedHolidays
                      .map((h) => getHolidayName(h, language))
                      .join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Extended Side-by-Side Row (if extension > 0) */}
            {extended &&
              suspendedExtended &&
              (input.extensionMonths === 1 || input.extensionMonths === 2) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {/* Unadjusted Extended */}
                  <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3.5">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {t.extendedRowLabel(input.extensionMonths)} · {t.unadjustedColumn}
                    </div>
                    <div className="mt-1.5 font-mono text-lg font-semibold tabular-dates text-slate-900 dark:text-slate-100">
                      {extended.finalDate}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {formatShortDate(extended.finalDate, language)}
                    </div>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-dates">
                      {t.nominalLabel}: {extended.nominalDate}
                      {extended.shiftedDays > 0 ? ` (+${extended.shiftedDays}d)` : ''}
                    </div>
                  </div>

                  {/* Suspension-Adjusted Extended */}
                  <div className="rounded-lg border border-blue-200 dark:border-blue-800/80 bg-blue-50/50 dark:bg-blue-950/30 p-3.5">
                    <div className="flex items-center justify-between gap-2 text-xs text-blue-800 dark:text-blue-300 font-medium">
                      <span>
                        {t.extendedRowLabel(input.extensionMonths)} · {t.adjustedColumn}
                      </span>
                      <span className="font-mono tabular-dates">
                        {t.netDeltaLabel(
                          diffCalendarDaysUTC(
                            extended.finalDate,
                            suspendedExtended.finalDate
                          )
                        )}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-lg font-semibold tabular-dates text-blue-900 dark:text-blue-200">
                        {suspendedExtended.finalDate}
                      </span>
                      <CountdownBadge
                        targetIso={suspendedExtended.finalDate}
                        todayUtcIso={todayUtcIso}
                        language={language}
                      />
                    </div>
                    <div className="text-xs text-blue-900/80 dark:text-blue-300/90">
                      {formatShortDate(suspendedExtended.finalDate, language)}
                    </div>
                    <div className="mt-2 text-xs text-blue-800/80 dark:text-blue-300/80 font-mono tabular-dates">
                      {t.preRolloverLabel}: {suspendedExtended.preRolloverDate}
                      {suspendedExtended.shiftedDays > 0
                        ? ` (+${suspendedExtended.shiftedDays}d)`
                        : ''}
                    </div>
                    {suspendedExtended.appliedHolidays.length > 0 && (
                      <div className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                        {suspendedExtended.appliedHolidays
                          .map((h) => getHolidayName(h, language))
                          .join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        </section>
      )}

      {/* Compact Timeline & Actions Surface */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t.timelineTitle}
          </h3>
          <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
            <span>UTC</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-y-3 gap-x-2">
          {milestones.map((m, idx) => (
            <div key={m.key} className="flex items-center gap-2">
              <div className="min-w-[108px]">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {m.label}
                </div>
                <div
                  className={`font-mono text-xs sm:text-sm tabular-dates ${
                    m.highlight
                      ? 'font-semibold text-slate-900 dark:text-slate-100'
                      : 'font-medium text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {m.date}
                </div>
              </div>
              {idx < milestones.length - 1 && (
                <ArrowRight
                  className="h-3.5 w-3.5 text-slate-300 dark:text-slate-700 shrink-0"
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 px-4 text-sm font-medium text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            {copiedSummary ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                <span>{t.copiedBtn}</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>{t.copySummaryBtn}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => downloadDSARCalendarICS(result, language)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 text-sm font-medium text-slate-800 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <CalendarPlus
              className="h-4 w-4 text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            />
            <span>{t.exportIcsBtn}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAuditTrail}
            title={t.shortcutHint}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 text-sm font-medium text-slate-800 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <FileText
              className="h-4 w-4 text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            />
            <span>{t.auditTrailBtn}</span>
          </button>
        </div>
      </section>

      {/* Deterministic Response Templates Section (Appears when Extension, Identity Doubt, or Art. 12(5) is active) */}
      {activeTemplates.length > 0 && (
        <section
          aria-labelledby="response-templates-heading"
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-start gap-2.5">
            <Mail
              className="h-4 w-4 mt-0.5 text-blue-700 dark:text-blue-400 shrink-0"
              aria-hidden="true"
            />
            <div>
              <h3
                id="response-templates-heading"
                className="text-sm font-semibold text-slate-900 dark:text-slate-100"
              >
                {t.templatesSectionTitle}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.templatesSectionDesc}
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {activeTemplates.map((tpl, index) => {
              const isCopied = copiedTemplateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  className={index === 0 ? 'pt-1' : 'pt-5 mt-5'}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2.5">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {tpl.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {tpl.legalBasis}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyTemplate(tpl.id, tpl.body)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      {isCopied ? (
                        <>
                          <Check
                            className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
                            aria-hidden="true"
                          />
                          <span>{t.copiedBtn}</span>
                        </>
                      ) : (
                        <>
                          <Copy
                            className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400"
                            aria-hidden="true"
                          />
                          <span>{t.copyTemplateBtn}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="w-full max-h-64 overflow-y-auto overflow-x-auto subtle-scroll rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] p-3.5 font-sans text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
                    {tpl.body}
                  </pre>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
