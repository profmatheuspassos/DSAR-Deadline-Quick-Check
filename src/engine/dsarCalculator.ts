import rawHolidayData from '../data/eee_holidays.json';
import type {
  CalculationInput,
  CalculationResult,
  CountryCode,
  DeadlineOutcome,
  HolidayDataset,
  HolidayEntry,
  SkippedDay,
} from '../types/dsar';

export const HOLIDAY_DATASET: HolidayDataset = rawHolidayData as HolidayDataset;

const SUPPORTED_YEARS_SET = new Set<number>(HOLIDAY_DATASET.supportedYears);

// Pre-index holidays by `${countryCode}:${YYYY-MM-DD}` for O(1) deterministic lookups
const HOLIDAY_INDEX = new Map<string, HolidayEntry>();
for (const entry of HOLIDAY_DATASET.holidays) {
  HOLIDAY_INDEX.set(`${entry.countryCode}:${entry.date}`, entry);
}

export interface CalendarDate {
  year: number;
  month: number; // 1..12
  day: number; // 1..31
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function pad4(n: number): string {
  return String(n).padStart(4, '0');
}

export function isValidISODate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const check = new Date(Date.UTC(y, m - 1, d));
  return (
    check.getUTCFullYear() === y &&
    check.getUTCMonth() === m - 1 &&
    check.getUTCDate() === d
  );
}

export function parseISODate(iso: string): CalendarDate {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
}

export function formatISODate(date: CalendarDate): string {
  return `${pad4(date.year)}-${pad2(date.month)}-${pad2(date.day)}`;
}

export function getTodayISO(): string {
  const now = new Date();
  return formatISODate({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  });
}

export function getTodayUTCISO(): string {
  const now = new Date();
  return formatISODate({
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    day: now.getUTCDate(),
  });
}

export function getWeekdayUTC(iso: string): number {
  const { year, month, day } = parseISODate(iso);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function addDaysUTC(iso: string, deltaDays: number): string {
  const { year, month, day } = parseISODate(iso);
  const dt = new Date(Date.UTC(year, month - 1, day + deltaDays));
  return formatISODate({
    year: dt.getUTCFullYear(),
    month: dt.getUTCMonth() + 1,
    day: dt.getUTCDate(),
  });
}

export function diffCalendarDaysUTC(startIso: string, endIso: string): number {
  const s = parseISODate(startIso);
  const e = parseISODate(endIso);
  const msStart = Date.UTC(s.year, s.month - 1, s.day);
  const msEnd = Date.UTC(e.year, e.month - 1, e.day);
  return Math.round((msEnd - msStart) / 86_400_000);
}

export function getHoliday(countryCode: CountryCode, iso: string): HolidayEntry | null {
  return HOLIDAY_INDEX.get(`${countryCode}:${iso}`) ?? null;
}

/**
 * Reg. 1182/71 Art. 3(2)(c):
 * Add N months directly to receipt date. If target month lacks that day number,
 * clamp to the last day of the target month.
 */
export function addMonthsWithClamping(
  receiptIso: string,
  monthsToAdd: number
): {
  nominalDate: string;
  wasClamped: boolean;
  originalReceiptDay: number;
  clampedDay: number;
} {
  const { year, month, day } = parseISODate(receiptIso);
  const totalMonths = year * 12 + (month - 1) + monthsToAdd;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = (totalMonths % 12) + 1; // 1..12

  // Day 0 of (targetMonth) in 0-indexed month arithmetic gives the last day of targetMonth
  const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  const clampedDay = Math.min(day, daysInTargetMonth);
  const wasClamped = day > daysInTargetMonth;

  return {
    nominalDate: formatISODate({
      year: targetYear,
      month: targetMonth,
      day: clampedDay,
    }),
    wasClamped,
    originalReceiptDay: day,
    clampedDay,
  };
}

/**
 * Reg. 1182/71 Art. 3(4):
 * If the deadline falls on Saturday, Sunday, or a national public holiday for
 * the selected country, advance +1 calendar day repeatedly until a working day.
 */
export function applyNonWorkingRollover(
  candidateIso: string,
  countryCode: CountryCode
): {
  finalDate: string;
  shiftedDays: number;
  skippedDays: SkippedDay[];
  appliedHolidays: HolidayEntry[];
} {
  let current = candidateIso;
  const skippedDays: SkippedDay[] = [];
  const appliedHolidays: HolidayEntry[] = [];

  // Safety ceiling of 30 iterations (no EEA country has >10 consecutive non-working days)
  for (let i = 0; i < 30; i++) {
    const weekdayIndex = getWeekdayUTC(current);
    const isWeekend = weekdayIndex === 0 || weekdayIndex === 6;
    const holiday = getHoliday(countryCode, current);

    if (!isWeekend && !holiday) {
      break;
    }

    skippedDays.push({
      date: current,
      weekdayIndex,
      isWeekend,
      holiday,
    });

    if (holiday) {
      appliedHolidays.push(holiday);
    }

    current = addDaysUTC(current, 1);
  }

  return {
    finalDate: current,
    shiftedDays: skippedDays.length,
    skippedDays,
    appliedHolidays,
  };
}

function computeDeadlineOutcome(
  receiptIso: string,
  monthsToAdd: number,
  suspensionDays: number,
  countryCode: CountryCode
): DeadlineOutcome {
  const { nominalDate, wasClamped, originalReceiptDay, clampedDay } =
    addMonthsWithClamping(receiptIso, monthsToAdd);

  // Rule 6: Add suspension days to nominal date BEFORE weekend/holiday rollover
  const preRolloverDate =
    suspensionDays > 0 ? addDaysUTC(nominalDate, suspensionDays) : nominalDate;

  // Rule 3: Apply Reg. 1182/71 Art. 3(4) non-working day rollover
  const { finalDate, shiftedDays, skippedDays, appliedHolidays } =
    applyNonWorkingRollover(preRolloverDate, countryCode);

  return {
    monthsAdded: monthsToAdd,
    nominalDate,
    wasClamped,
    originalReceiptDay,
    clampedDay,
    suspensionDaysApplied: suspensionDays,
    preRolloverDate,
    finalDate,
    shiftedDays,
    skippedDays,
    appliedHolidays,
    totalCalendarDaysFromReceipt: diffCalendarDaysUTC(receiptIso, finalDate),
  };
}

function collectYears(outcome: DeadlineOutcome | null, target: Set<number>): void {
  if (!outcome) return;
  target.add(parseISODate(outcome.nominalDate).year);
  target.add(parseISODate(outcome.preRolloverDate).year);
  target.add(parseISODate(outcome.finalDate).year);
  for (const skipped of outcome.skippedDays) {
    target.add(parseISODate(skipped.date).year);
  }
}

export function calculateDSAR(input: CalculationInput): CalculationResult {
  const receiptIso = isValidISODate(input.receiptDate)
    ? input.receiptDate
    : getTodayISO();

  const clampedSuspension = Math.max(
    0,
    Math.min(365, Math.floor(Number.isFinite(input.suspensionDays) ? input.suspensionDays : 0))
  );
  const effectiveSuspensionDays = input.identityDoubtEnabled ? clampedSuspension : 0;

  // Rule 1: Event day exclusion (Day 0 = receipt date, Day 1 = receipt + 1)
  const dayOneDate = addDaysUTC(receiptIso, 1);

  // Rules 2 & 3: Ordinary deadline (+1M from receipt date)
  const ordinary = computeDeadlineOutcome(receiptIso, 1, 0, input.countryCode);

  // Rule 4: Extension/Refusal Notice Deadline always equals Ordinary Deadline
  const extensionNoticeDate = ordinary.finalDate;

  // Rule 5: Extended deadline (+2M or +3M directly from original receipt date)
  const extended =
    input.extensionMonths > 0
      ? computeDeadlineOutcome(
          receiptIso,
          1 + input.extensionMonths,
          0,
          input.countryCode
        )
      : null;

  // Rule 6: Parallel Suspension (when identity/scope doubt active & suspensionDays > 0)
  const suspendedOrdinary =
    effectiveSuspensionDays > 0
      ? computeDeadlineOutcome(
          receiptIso,
          1,
          effectiveSuspensionDays,
          input.countryCode
        )
      : null;

  const suspendedExtended =
    effectiveSuspensionDays > 0 && input.extensionMonths > 0
      ? computeDeadlineOutcome(
          receiptIso,
          1 + input.extensionMonths,
          effectiveSuspensionDays,
          input.countryCode
        )
      : null;

  // Rule 7: Out-of-bounds years warning (outside 2026-2028)
  const touchedYears = new Set<number>();
  touchedYears.add(parseISODate(receiptIso).year);
  collectYears(ordinary, touchedYears);
  collectYears(extended, touchedYears);
  collectYears(suspendedOrdinary, touchedYears);
  collectYears(suspendedExtended, touchedYears);

  const outOfBoundsYears = Array.from(touchedYears)
    .filter((yr) => !SUPPORTED_YEARS_SET.has(yr))
    .sort((a, b) => a - b);

  return {
    input: {
      ...input,
      receiptDate: receiptIso,
      suspensionDays: clampedSuspension,
    },
    effectiveSuspensionDays,
    dayOneDate,
    ordinary,
    extensionNoticeDate,
    extended,
    suspendedOrdinary,
    suspendedExtended,
    outOfBoundsYears,
    datasetVersion: HOLIDAY_DATASET.version,
    supportedYears: HOLIDAY_DATASET.supportedYears,
  };
}
