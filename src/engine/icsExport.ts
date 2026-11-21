import type { CalculationResult, Language } from '../types/dsar';
import { addDaysUTC } from './dsarCalculator';
import { getArticleTitle, getCountryName, getHolidayName } from './formatters';

function toICSDate(iso: string): string {
  return iso.replace(/-/g, '');
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function foldICSLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let remaining = line;
  parts.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length > 0) {
    parts.push(' ' + remaining.slice(0, 74));
    remaining = remaining.slice(74);
  }
  return parts.join('\r\n');
}

function getUTCStamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T` +
    `${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`
  );
}

interface ICSEventSpec {
  uidSuffix: string;
  dateIso: string;
  summary: string;
  description: string;
  alarmSummary: string;
}

function buildVEvent(
  spec: ICSEventSpec,
  dtStamp: string,
  receiptDate: string,
  countryCode: string
): string[] {
  const dtStart = toICSDate(spec.dateIso);
  const dtEnd = toICSDate(addDaysUTC(spec.dateIso, 1));
  const uid = `pqc-${receiptDate}-${countryCode}-${spec.uidSuffix}@privacy-quickcheck.local`;

  return [
    'BEGIN:VEVENT',
    foldICSLine(`UID:${uid}`),
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    foldICSLine(`SUMMARY:${escapeICS(spec.summary)}`),
    foldICSLine(`DESCRIPTION:${escapeICS(spec.description)}`),
    'TRANSP:TRANSPARENT',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'TRIGGER:-P3D',
    foldICSLine(`DESCRIPTION:${escapeICS(spec.alarmSummary)}`),
    'END:VALARM',
    'END:VEVENT',
  ];
}

export function buildDSARCalendarICS(
  result: CalculationResult,
  lang: Language
): string {
  const { input, ordinary, extended, suspendedOrdinary, suspendedExtended } = result;
  const dtStamp = getUTCStamp();
  const countryName = getCountryName(input.countryCode, lang);
  const articleTitle = getArticleTitle(input.requestArticle, lang);

  const events: ICSEventSpec[] = [];

  const ordinaryHolidays =
    ordinary.appliedHolidays.length > 0
      ? ordinary.appliedHolidays.map((h) => getHolidayName(h, lang)).join(', ')
      : null;

  if (lang === 'pt') {
    events.push({
      uidSuffix: 'ordinary-notice',
      dateIso: ordinary.finalDate,
      summary: `Prazo Ordinário / Notificação DSAR (${input.countryCode})`,
      description: [
        `Pedido: ${articleTitle}`,
        `Recebimento (Dia 0): ${input.receiptDate}`,
        `Jurisdição: ${input.countryCode} (${countryName})`,
        `Nominal: ${ordinary.nominalDate} | Deslocamento: +${ordinary.shiftedDays}d`,
        ordinaryHolidays ? `Feriados aplicados: ${ordinaryHolidays}` : null,
        'Base legal: Art. 12.º(3)-(4) RGPD e Regulamento (CEE) 1182/71.',
      ]
        .filter(Boolean)
        .join('\n'),
      alarmSummary: `Lembrete (3 dias): Prazo Ordinário / Notificação DSAR (${input.countryCode}) em ${ordinary.finalDate}`,
    });

    if (extended) {
      events.push({
        uidSuffix: `extended-${input.extensionMonths}m`,
        dateIso: extended.finalDate,
        summary: `Prazo Prorrogado DSAR (+${input.extensionMonths}M · ${input.countryCode})`,
        description: [
          `Pedido: ${articleTitle}`,
          `Recebimento (Dia 0): ${input.receiptDate}`,
          `Adição direta (+${extended.monthsAdded}M): Nominal ${extended.nominalDate} | Deslocamento: +${extended.shiftedDays}d`,
          'Base legal: Art. 12.º(3) RGPD e Regulamento (CEE) 1182/71.',
        ].join('\n'),
        alarmSummary: `Lembrete (3 dias): Prazo Prorrogado DSAR (+${input.extensionMonths}M) em ${extended.finalDate}`,
      });
    }

    if (suspendedOrdinary) {
      events.push({
        uidSuffix: `suspended-ordinary-${result.effectiveSuspensionDays}d`,
        dateIso: suspendedOrdinary.finalDate,
        summary: `Prazo Ordinário Ajustado — Suspensão +${result.effectiveSuspensionDays}d (${input.countryCode})`,
        description: [
          `Pedido: ${articleTitle}`,
          `Recebimento (Dia 0): ${input.receiptDate}`,
          `Suspensão Art. 12.º(6): +${result.effectiveSuspensionDays} dias corridos (pré-deslocamento: ${suspendedOrdinary.preRolloverDate})`,
          `Comparativo: Original ${ordinary.finalDate} -> Ajustado ${suspendedOrdinary.finalDate}`,
        ].join('\n'),
        alarmSummary: `Lembrete (3 dias): Prazo Ordinário com Suspensão em ${suspendedOrdinary.finalDate}`,
      });
    }

    if (extended && suspendedExtended) {
      events.push({
        uidSuffix: `suspended-extended-${input.extensionMonths}m-${result.effectiveSuspensionDays}d`,
        dateIso: suspendedExtended.finalDate,
        summary: `Prazo Prorrogado Ajustado (+${input.extensionMonths}M, Suspensão +${result.effectiveSuspensionDays}d · ${input.countryCode})`,
        description: [
          `Pedido: ${articleTitle}`,
          `Recebimento (Dia 0): ${input.receiptDate}`,
          `Suspensão Art. 12.º(6): +${result.effectiveSuspensionDays} dias corridos (pré-deslocamento: ${suspendedExtended.preRolloverDate})`,
          `Comparativo: Original ${extended.finalDate} -> Ajustado ${suspendedExtended.finalDate}`,
        ].join('\n'),
        alarmSummary: `Lembrete (3 dias): Prazo Prorrogado com Suspensão em ${suspendedExtended.finalDate}`,
      });
    }
  } else {
    events.push({
      uidSuffix: 'ordinary-notice',
      dateIso: ordinary.finalDate,
      summary: `DSAR Ordinary & Notice Deadline (${input.countryCode})`,
      description: [
        `Request: ${articleTitle}`,
        `Receipt Date (Day 0): ${input.receiptDate}`,
        `Jurisdiction: ${input.countryCode} (${countryName})`,
        `Nominal: ${ordinary.nominalDate} | Rollover: +${ordinary.shiftedDays}d`,
        ordinaryHolidays ? `Applied holidays: ${ordinaryHolidays}` : null,
        'Legal basis: GDPR Art. 12(3)-(4) and Council Regulation (EEC) 1182/71.',
      ]
        .filter(Boolean)
        .join('\n'),
      alarmSummary: `Reminder (3 days): DSAR Ordinary & Notice Deadline (${input.countryCode}) on ${ordinary.finalDate}`,
    });

    if (extended) {
      events.push({
        uidSuffix: `extended-${input.extensionMonths}m`,
        dateIso: extended.finalDate,
        summary: `DSAR Extended Deadline (+${input.extensionMonths}M · ${input.countryCode})`,
        description: [
          `Request: ${articleTitle}`,
          `Receipt Date (Day 0): ${input.receiptDate}`,
          `Direct addition (+${extended.monthsAdded}M): Nominal ${extended.nominalDate} | Rollover: +${extended.shiftedDays}d`,
          'Legal basis: GDPR Art. 12(3) and Council Regulation (EEC) 1182/71.',
        ].join('\n'),
        alarmSummary: `Reminder (3 days): DSAR Extended Deadline (+${input.extensionMonths}M) on ${extended.finalDate}`,
      });
    }

    if (suspendedOrdinary) {
      events.push({
        uidSuffix: `suspended-ordinary-${result.effectiveSuspensionDays}d`,
        dateIso: suspendedOrdinary.finalDate,
        summary: `DSAR Suspension-Adjusted Ordinary Deadline (+${result.effectiveSuspensionDays}d · ${input.countryCode})`,
        description: [
          `Request: ${articleTitle}`,
          `Receipt Date (Day 0): ${input.receiptDate}`,
          `Art. 12(6) Suspension: +${result.effectiveSuspensionDays} calendar days (pre-rollover: ${suspendedOrdinary.preRolloverDate})`,
          `Comparison: Original ${ordinary.finalDate} -> Adjusted ${suspendedOrdinary.finalDate}`,
        ].join('\n'),
        alarmSummary: `Reminder (3 days): DSAR Suspension-Adjusted Ordinary Deadline on ${suspendedOrdinary.finalDate}`,
      });
    }

    if (extended && suspendedExtended) {
      events.push({
        uidSuffix: `suspended-extended-${input.extensionMonths}m-${result.effectiveSuspensionDays}d`,
        dateIso: suspendedExtended.finalDate,
        summary: `DSAR Suspension-Adjusted Extended Deadline (+${input.extensionMonths}M, +${result.effectiveSuspensionDays}d · ${input.countryCode})`,
        description: [
          `Request: ${articleTitle}`,
          `Receipt Date (Day 0): ${input.receiptDate}`,
          `Art. 12(6) Suspension: +${result.effectiveSuspensionDays} calendar days (pre-rollover: ${suspendedExtended.preRolloverDate})`,
          `Comparison: Original ${extended.finalDate} -> Adjusted ${suspendedExtended.finalDate}`,
        ].join('\n'),
        alarmSummary: `Reminder (3 days): DSAR Suspension-Adjusted Extended Deadline on ${suspendedExtended.finalDate}`,
      });
    }
  }

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Privacy QuickCheck//GDPR DSAR Calculator//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Privacy QuickCheck DSAR (${input.countryCode})`,
  ];

  for (const ev of events) {
    lines.push(...buildVEvent(ev, dtStamp, input.receiptDate, input.countryCode));
  }

  lines.push('END:VCALENDAR', '');
  return lines.join('\r\n');
}

export function downloadDSARCalendarICS(
  result: CalculationResult,
  lang: Language
): void {
  const icsContent = buildDSARCalendarICS(result, lang);
  const blob = new Blob([icsContent], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `privacy-quickcheck-dsar-${result.input.receiptDate}-${result.input.countryCode}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
