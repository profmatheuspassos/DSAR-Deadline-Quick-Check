export type Language = 'en' | 'pt';
export type ThemeMode = 'light' | 'dark';

export type CountryCode =
  | 'EE'
  | 'LV'
  | 'LT'
  | 'FI'
  | 'SE'
  | 'DE'
  | 'FR'
  | 'ES'
  | 'IT'
  | 'NL';

export type ExtensionMonths = 0 | 1 | 2;

export type RequestArticle =
  | 'art15'
  | 'art16'
  | 'art17'
  | 'art18'
  | 'art19'
  | 'art20'
  | 'art21'
  | 'art22';

export interface HolidayEntry {
  countryCode: CountryCode;
  date: string; // YYYY-MM-DD
  nameEN: string;
  namePT: string;
}

export interface HolidayDataset {
  version: string;
  supportedYears: number[];
  countries: CountryCode[];
  holidays: HolidayEntry[];
}

export interface CountryMeta {
  code: CountryCode;
  flag: string;
  nameEN: string;
  namePT: string;
}

export interface SkippedDay {
  date: string; // YYYY-MM-DD
  weekdayIndex: number; // 0 = Sun ... 6 = Sat
  isWeekend: boolean;
  holiday: HolidayEntry | null;
}

export interface DeadlineOutcome {
  monthsAdded: number;
  nominalDate: string; // After direct month addition + clamping
  wasClamped: boolean;
  originalReceiptDay: number;
  clampedDay: number;
  suspensionDaysApplied: number;
  preRolloverDate: string; // nominalDate + suspensionDaysApplied
  finalDate: string; // After weekend/holiday rollover
  shiftedDays: number;
  skippedDays: SkippedDay[];
  appliedHolidays: HolidayEntry[];
  totalCalendarDaysFromReceipt: number;
}

export interface CalculationInput {
  receiptDate: string; // YYYY-MM-DD
  countryCode: CountryCode;
  requestArticle: RequestArticle;
  extensionMonths: ExtensionMonths;
  identityDoubtEnabled: boolean;
  suspensionDays: number; // 0..365
  complexityFlagged: boolean;
  unfoundedFlagged: boolean;
}

export interface CalculationResult {
  input: CalculationInput;
  effectiveSuspensionDays: number;
  dayOneDate: string;
  ordinary: DeadlineOutcome;
  extensionNoticeDate: string;
  extended: DeadlineOutcome | null;
  suspendedOrdinary: DeadlineOutcome | null;
  suspendedExtended: DeadlineOutcome | null;
  outOfBoundsYears: number[];
  datasetVersion: string;
  supportedYears: number[];
}

export interface UIPreferences {
  language: Language;
  defaultCountry: CountryCode;
  theme: ThemeMode;
}
