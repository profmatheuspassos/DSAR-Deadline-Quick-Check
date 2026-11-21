import { isValidISODate, getTodayISO } from '../engine/dsarCalculator';
import { COUNTRY_MAP, REQUEST_ARTICLES } from '../i18n/translations';
import type {
  CalculationInput,
  CountryCode,
  ExtensionMonths,
  RequestArticle,
} from '../types/dsar';

const VALID_ARTICLES = new Set<string>(REQUEST_ARTICLES.map((a) => a.id));

function parseExtensionMonths(raw: string | null): ExtensionMonths {
  if (raw === '1') return 1;
  if (raw === '2') return 2;
  return 0;
}

function parseSuspensionDays(raw: string | null): number {
  if (!raw || !/^\d+$/.test(raw.trim())) return 0;
  const parsed = parseInt(raw.trim(), 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(365, parsed));
}

export function parseInputFromURL(defaultCountry: CountryCode): CalculationInput {
  const fallback: CalculationInput = {
    receiptDate: getTodayISO(),
    countryCode: defaultCountry,
    requestArticle: 'art15',
    extensionMonths: 0,
    identityDoubtEnabled: false,
    suspensionDays: 0,
    complexityFlagged: false,
    unfoundedFlagged: false,
  };

  if (typeof window === 'undefined') return fallback;

  try {
    const params = new URLSearchParams(window.location.search);

    const rawDate = params.get('receiptDate');
    const receiptDate =
      rawDate && isValidISODate(rawDate) ? rawDate : fallback.receiptDate;

    const rawJurisdiction = params.get('jurisdiction')?.toUpperCase();
    const countryCode: CountryCode =
      rawJurisdiction && rawJurisdiction in COUNTRY_MAP
        ? (rawJurisdiction as CountryCode)
        : fallback.countryCode;

    const rawRequestType = params.get('requestType')?.toLowerCase();
    const requestArticle: RequestArticle =
      rawRequestType && VALID_ARTICLES.has(rawRequestType)
        ? (rawRequestType as RequestArticle)
        : fallback.requestArticle;

    const extensionMonths = parseExtensionMonths(params.get('extensionMonths'));
    const suspensionDays = parseSuspensionDays(params.get('suspensionDays'));

    return {
      ...fallback,
      receiptDate,
      countryCode,
      requestArticle,
      extensionMonths,
      identityDoubtEnabled: suspensionDays > 0,
      suspensionDays,
    };
  } catch {
    return fallback;
  }
}

export function syncInputToURL(input: CalculationInput): void {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;

  try {
    const url = new URL(window.location.href);
    const effectiveSuspension = input.identityDoubtEnabled
      ? Math.max(0, Math.min(365, Math.floor(input.suspensionDays)))
      : 0;

    url.searchParams.set('receiptDate', input.receiptDate);
    url.searchParams.set('jurisdiction', input.countryCode);
    url.searchParams.set('requestType', input.requestArticle);
    url.searchParams.set('extensionMonths', String(input.extensionMonths));
    url.searchParams.set('suspensionDays', String(effectiveSuspension));

    const nextRelative = `${url.pathname}?${url.searchParams.toString()}${url.hash}`;
    const currentRelative = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextRelative !== currentRelative) {
      window.history.replaceState(null, '', nextRelative);
    }
  } catch {
    // Ignore history API restrictions in sandboxed frames
  }
}
