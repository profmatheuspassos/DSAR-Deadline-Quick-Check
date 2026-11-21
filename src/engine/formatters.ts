import {
  COUNTRY_MAP,
  MONTHS,
  MONTHS_SHORT,
  REQUEST_ARTICLES,
  WEEKDAYS,
  WEEKDAYS_SHORT,
} from '../i18n/translations';
import type {
  CalculationResult,
  DeadlineOutcome,
  HolidayEntry,
  Language,
  SkippedDay,
} from '../types/dsar';
import { getWeekdayUTC, parseISODate } from './dsarCalculator';

export function formatLongDate(iso: string, lang: Language): string {
  const { year, month, day } = parseISODate(iso);
  const weekday = WEEKDAYS[lang][getWeekdayUTC(iso)];
  const monthName = MONTHS[lang][month - 1];

  if (lang === 'pt') {
    return `${weekday}, ${day} de ${monthName} de ${year}`;
  }
  return `${weekday}, ${day} ${monthName} ${year}`;
}

export function formatShortDate(iso: string, lang: Language): string {
  const { year, month, day } = parseISODate(iso);
  const weekday = WEEKDAYS_SHORT[lang][getWeekdayUTC(iso)];
  const monthName = MONTHS_SHORT[lang][month - 1];

  if (lang === 'pt') {
    return `${weekday}, ${day} ${monthName} ${year}`;
  }
  return `${weekday}, ${day} ${monthName} ${year}`;
}

export function getHolidayName(holiday: HolidayEntry, lang: Language): string {
  return lang === 'pt' ? holiday.namePT : holiday.nameEN;
}

export function getCountryName(code: CalculationResult['input']['countryCode'], lang: Language): string {
  const meta = COUNTRY_MAP[code];
  return lang === 'pt' ? meta.namePT : meta.nameEN;
}

export function getArticleTitle(articleId: CalculationResult['input']['requestArticle'], lang: Language): string {
  const found = REQUEST_ARTICLES.find((a) => a.id === articleId) ?? REQUEST_ARTICLES[0];
  return lang === 'pt' ? found.titlePT : found.titleEN;
}

function formatSkippedDayLine(skipped: SkippedDay, lang: Language): string {
  const weekday = WEEKDAYS[lang][skipped.weekdayIndex];
  const reasons: string[] = [];
  if (skipped.isWeekend) {
    reasons.push(lang === 'pt' ? 'Fim de semana' : 'Weekend');
  }
  if (skipped.holiday) {
    const hName = getHolidayName(skipped.holiday, lang);
    reasons.push(lang === 'pt' ? `Feriado: ${hName}` : `Holiday: ${hName}`);
  }
  return `${skipped.date} (${weekday}) [${reasons.join(' + ')}]`;
}

function describeRolloverShort(outcome: DeadlineOutcome, lang: Language): string {
  if (outcome.shiftedDays === 0) {
    return lang === 'pt' ? 'Sem deslocamento (dia útil)' : 'No rollover (working day)';
  }
  const reasons = outcome.skippedDays
    .map((s) => {
      const parts: string[] = [];
      if (s.isWeekend) parts.push(WEEKDAYS_SHORT[lang][s.weekdayIndex]);
      if (s.holiday) parts.push(getHolidayName(s.holiday, lang));
      return `${s.date}: ${parts.join(' / ')}`;
    })
    .join('; ');
  return lang === 'pt'
    ? `Prorrogado +${outcome.shiftedDays}d (${reasons})`
    : `Rolled over +${outcome.shiftedDays}d (${reasons})`;
}

export function buildCopySummary(result: CalculationResult, lang: Language): string {
  const { input, ordinary, extended, suspendedOrdinary, suspendedExtended } = result;
  const country = COUNTRY_MAP[input.countryCode];
  const countryLabel = `${country.code} (${lang === 'pt' ? country.namePT : country.nameEN})`;
  const articleLabel = getArticleTitle(input.requestArticle, lang);

  const lines: string[] = [];

  if (lang === 'pt') {
    lines.push('PRIVACY QUICKCHECK — RESUMO DE PRAZO DSAR (RGPD)');
    lines.push('================================================');
    lines.push(`Data de Recebimento (Dia 0): ${input.receiptDate} (${formatLongDate(input.receiptDate, 'pt')})`);
    lines.push(`Jurisdição do EEE:           ${countryLabel}`);
    lines.push(`Tipo de Pedido:              ${articleLabel}`);
    lines.push(
      `Prorrogação Selecionada:     ${
        input.extensionMonths === 0
          ? 'Nenhuma (0)'
          : `+${input.extensionMonths} ${input.extensionMonths === 1 ? 'Mês' : 'Meses'}`
      }`
    );
    lines.push(
      `Suspensão (Art. 12.º(6)):    ${
        result.effectiveSuspensionDays > 0
          ? `Ativa (+${result.effectiveSuspensionDays} dias corridos)`
          : 'Inativa (0 dias)'
      }`
    );
    lines.push('');
    lines.push('PRAZOS LEGAIS (Reg. 1182/71 e Art. 12.º RGPD)');
    lines.push('------------------------------------------------');
    lines.push(
      `• Prazo Ordinário (1M):            ${ordinary.finalDate} (${formatLongDate(ordinary.finalDate, 'pt')})`
    );
    lines.push(`  Nominal: ${ordinary.nominalDate} | ${describeRolloverShort(ordinary, 'pt')}`);
    lines.push(
      `• Notificação Prorrogação/Recusa:  ${result.extensionNoticeDate} (${formatLongDate(result.extensionNoticeDate, 'pt')})`
    );

    if (extended) {
      lines.push(
        `• Prazo Prorrogado (+${input.extensionMonths}M):          ${extended.finalDate} (${formatLongDate(extended.finalDate, 'pt')})`
      );
      lines.push(
        `  Base direta: ${input.receiptDate} + ${extended.monthsAdded}M -> Nominal: ${extended.nominalDate} | ${describeRolloverShort(extended, 'pt')}`
      );
    }

    if (suspendedOrdinary) {
      lines.push('');
      lines.push(`SUSPENSÃO PARALELA (+${result.effectiveSuspensionDays} DIAS — ART. 12.º(6))`);
      lines.push('------------------------------------------------');
      lines.push(
        `• Ordinário (Original vs. Ajustado):   ${ordinary.finalDate}  -->  ${suspendedOrdinary.finalDate} (${formatLongDate(suspendedOrdinary.finalDate, 'pt')})`
      );
      if (extended && suspendedExtended) {
        lines.push(
          `• Prorrogado (Original vs. Ajustado):  ${extended.finalDate}  -->  ${suspendedExtended.finalDate} (${formatLongDate(suspendedExtended.finalDate, 'pt')})`
        );
      }
    }

    if (input.complexityFlagged || input.unfoundedFlagged) {
      lines.push('');
      lines.push('NOTAS DE ADMISSIBILIDADE SINALIZADAS');
      lines.push('------------------------------------------------');
      if (input.complexityFlagged) {
        lines.push('• Complexidade / Elevado Volume (Art. 12.º(3) · CEPD 01/2022 §§ 162–164)');
      }
      if (input.unfoundedFlagged) {
        lines.push('• Manifestamente Infundado / Excessivo (Art. 12.º(5) · TJUE C-526/24 Brillen Rottler)');
      }
    }

    if (result.outOfBoundsYears.length > 0) {
      lines.push('');
      lines.push(
        `AVISO: Feriados nacionais não verificados para o(s) ano(s) ${result.outOfBoundsYears.join(', ')} (base embutida: 2026–2028). Apenas fins de semana aplicados.`
      );
    }

    lines.push('');
    lines.push(
      `Base normativa: Reg. (CEE) 1182/71, Art. 12.º RGPD, CEPD 01/2022 (nota 90) | Base de Feriados EEE v${result.datasetVersion}`
    );
  } else {
    lines.push('PRIVACY QUICKCHECK — GDPR DSAR DEADLINE SUMMARY');
    lines.push('================================================');
    lines.push(`Date of Receipt (Day 0):     ${input.receiptDate} (${formatLongDate(input.receiptDate, 'en')})`);
    lines.push(`EEA Jurisdiction:            ${countryLabel}`);
    lines.push(`Request Type:                ${articleLabel}`);
    lines.push(
      `Selected Extension:          ${
        input.extensionMonths === 0
          ? 'None (0)'
          : `+${input.extensionMonths} ${input.extensionMonths === 1 ? 'Month' : 'Months'}`
      }`
    );
    lines.push(
      `Suspension (Art. 12(6)):     ${
        result.effectiveSuspensionDays > 0
          ? `Active (+${result.effectiveSuspensionDays} calendar days)`
          : 'Inactive (0 days)'
      }`
    );
    lines.push('');
    lines.push('STATUTORY DEADLINES (Reg. 1182/71 & GDPR Art. 12)');
    lines.push('------------------------------------------------');
    lines.push(
      `• Ordinary Deadline (1M):          ${ordinary.finalDate} (${formatLongDate(ordinary.finalDate, 'en')})`
    );
    lines.push(`  Nominal: ${ordinary.nominalDate} | ${describeRolloverShort(ordinary, 'en')}`);
    lines.push(
      `• Extension / Refusal Notice:      ${result.extensionNoticeDate} (${formatLongDate(result.extensionNoticeDate, 'en')})`
    );

    if (extended) {
      lines.push(
        `• Extended Deadline (+${input.extensionMonths}M):         ${extended.finalDate} (${formatLongDate(extended.finalDate, 'en')})`
      );
      lines.push(
        `  Direct base: ${input.receiptDate} + ${extended.monthsAdded}M -> Nominal: ${extended.nominalDate} | ${describeRolloverShort(extended, 'en')}`
      );
    }

    if (suspendedOrdinary) {
      lines.push('');
      lines.push(`PARALLEL SUSPENSION (+${result.effectiveSuspensionDays} DAYS — ART. 12(6))`);
      lines.push('------------------------------------------------');
      lines.push(
        `• Ordinary (Original vs. Adjusted):    ${ordinary.finalDate}  -->  ${suspendedOrdinary.finalDate} (${formatLongDate(suspendedOrdinary.finalDate, 'en')})`
      );
      if (extended && suspendedExtended) {
        lines.push(
          `• Extended (Original vs. Adjusted):    ${extended.finalDate}  -->  ${suspendedExtended.finalDate} (${formatLongDate(suspendedExtended.finalDate, 'en')})`
        );
      }
    }

    if (input.complexityFlagged || input.unfoundedFlagged) {
      lines.push('');
      lines.push('FLAGGED ADMISSIBILITY NOTES');
      lines.push('------------------------------------------------');
      if (input.complexityFlagged) {
        lines.push('• Complexity or High Volume (Art. 12(3) · EDPB 01/2022 §§ 162–164)');
      }
      if (input.unfoundedFlagged) {
        lines.push('• Manifestly Unfounded or Excessive (Art. 12(5) · CJEU C-526/24 Brillen Rottler)');
      }
    }

    if (result.outOfBoundsYears.length > 0) {
      lines.push('');
      lines.push(
        `WARNING: National holidays not verified for year(s) ${result.outOfBoundsYears.join(', ')} (bundled dataset: 2026–2028). Weekend rollovers applied only.`
      );
    }

    lines.push('');
    lines.push(
      `Legal basis: Reg. (EEC) 1182/71, GDPR Art. 12, EDPB 01/2022 (fn. 90) | EEA Holiday Bundle v${result.datasetVersion}`
    );
  }

  return lines.join('\n');
}

function renderOutcomeAuditBlock(
  label: string,
  receiptDate: string,
  outcome: DeadlineOutcome,
  lang: Language
): string[] {
  const out: string[] = [];
  out.push(label);
  if (lang === 'pt') {
    out.push(`  Adição direta de meses: ${receiptDate} + ${outcome.monthsAdded} mês(es) => ${outcome.nominalDate}`);
    if (outcome.wasClamped) {
      out.push(
        `  Ajuste de fim de mês (Reg. 1182/71 Art. 3.º(2)(c)): dia ${outcome.originalReceiptDay} ajustado para ${outcome.clampedDay}`
      );
    } else {
      out.push(`  Ajuste de fim de mês (Reg. 1182/71 Art. 3.º(2)(c)): não necessário`);
    }
    if (outcome.suspensionDaysApplied > 0) {
      out.push(
        `  Suspensão (Art. 12.º(6)): ${outcome.nominalDate} + ${outcome.suspensionDaysApplied} dia(s) corrido(s) => ${outcome.preRolloverDate} (pré-deslocamento)`
      );
    }
    if (outcome.shiftedDays === 0) {
      const wd = WEEKDAYS.pt[getWeekdayUTC(outcome.finalDate)];
      out.push(
        `  Verificação de dia útil (Reg. 1182/71 Art. 3.º(4)): ${outcome.finalDate} (${wd}) é dia útil => sem deslocamento (+0d)`
      );
    } else {
      out.push(`  Deslocamento de dias não úteis (Reg. 1182/71 Art. 3.º(4)): +${outcome.shiftedDays} dia(s)`);
      for (const s of outcome.skippedDays) {
        out.push(`    - Ignorado: ${formatSkippedDayLine(s, 'pt')}`);
      }
      const wd = WEEKDAYS.pt[getWeekdayUTC(outcome.finalDate)];
      out.push(`    - Próximo dia útil: ${outcome.finalDate} (${wd})`);
    }
    out.push(
      `  => PRAZO FINAL: ${outcome.finalDate} (${formatLongDate(outcome.finalDate, 'pt')}) [${outcome.totalCalendarDaysFromReceipt} dias corridos desde o Dia 0]`
    );
  } else {
    out.push(`  Direct month addition: ${receiptDate} + ${outcome.monthsAdded} month(s) => ${outcome.nominalDate}`);
    if (outcome.wasClamped) {
      out.push(
        `  Month-end clamping (Reg. 1182/71 Art. 3(2)(c)): day ${outcome.originalReceiptDay} clamped to ${outcome.clampedDay}`
      );
    } else {
      out.push(`  Month-end clamping (Reg. 1182/71 Art. 3(2)(c)): not required`);
    }
    if (outcome.suspensionDaysApplied > 0) {
      out.push(
        `  Suspension (Art. 12(6)): ${outcome.nominalDate} + ${outcome.suspensionDaysApplied} calendar day(s) => ${outcome.preRolloverDate} (pre-rollover)`
      );
    }
    if (outcome.shiftedDays === 0) {
      const wd = WEEKDAYS.en[getWeekdayUTC(outcome.finalDate)];
      out.push(
        `  Working-day check (Reg. 1182/71 Art. 3(4)): ${outcome.finalDate} (${wd}) is a working day => no rollover (+0d)`
      );
    } else {
      out.push(`  Non-working day rollover (Reg. 1182/71 Art. 3(4)): +${outcome.shiftedDays} day(s)`);
      for (const s of outcome.skippedDays) {
        out.push(`    - Skipped: ${formatSkippedDayLine(s, 'en')}`);
      }
      const wd = WEEKDAYS.en[getWeekdayUTC(outcome.finalDate)];
      out.push(`    - Next working day: ${outcome.finalDate} (${wd})`);
    }
    out.push(
      `  => FINAL DEADLINE: ${outcome.finalDate} (${formatLongDate(outcome.finalDate, 'en')}) [${outcome.totalCalendarDaysFromReceipt} calendar days from Day 0]`
    );
  }
  return out;
}

export function buildAuditTrailText(result: CalculationResult, lang: Language): string {
  const { input, ordinary, extended, suspendedOrdinary, suspendedExtended } = result;
  const country = COUNTRY_MAP[input.countryCode];
  const countryName = lang === 'pt' ? country.namePT : country.nameEN;
  const articleLabel = getArticleTitle(input.requestArticle, lang);

  const lines: string[] = [];

  if (lang === 'pt') {
    lines.push('======================================================================');
    lines.push('PRIVACY QUICKCHECK — MEMÓRIA DE CÁLCULO DETERMINÍSTICA');
    lines.push('Norma: Regulamento (CEE, Euratom) n.º 1182/71 · Art. 12.º RGPD');
    lines.push(`Base de Feriados: EEE v${result.datasetVersion} (Anos cobertos: ${result.supportedYears.join(', ')})`);
    lines.push('Normalização temporal: Datas de calendário UTC (YYYY-MM-DD)');
    lines.push('======================================================================');
    lines.push('');
    lines.push('[0] PARÂMETROS DE ENTRADA');
    lines.push(`  Data de Recebimento (Dia 0): ${input.receiptDate} (${WEEKDAYS.pt[getWeekdayUTC(input.receiptDate)]})`);
    lines.push(`  Jurisdição:                  ${country.code} — ${countryName}`);
    lines.push(`  Tipo de Pedido:              ${articleLabel}`);
    lines.push(
      `  Prorrogação (Art. 12.º(3)):  ${input.extensionMonths === 0 ? 'Nenhuma (0M)' : `+${input.extensionMonths}M`}`
    );
    lines.push(
      `  Suspensão (Art. 12.º(6)):    ${
        input.identityDoubtEnabled
          ? `Ativada (${result.effectiveSuspensionDays} dias corridos)`
          : `Desativada (efetivo: 0 dias; valor memorizado: ${input.suspensionDays}d)`
      }`
    );
    lines.push('');
    lines.push('[1] EXCLUSÃO DO DIA DO EVENTO (Reg. 1182/71 Art. 3.º(1))');
    lines.push(`  Dia 0 (Recebimento, excluído): ${input.receiptDate}`);
    lines.push(
      `  Dia 1 (Início da contagem):    ${result.dayOneDate} (${WEEKDAYS.pt[getWeekdayUTC(result.dayOneDate)]})`
    );
    lines.push('');
    lines.push(
      ...renderOutcomeAuditBlock(
        '[2] PRAZO LEGAL ORDINÁRIO (1 MÊS — Art. 12.º(3) RGPD)',
        input.receiptDate,
        ordinary,
        'pt'
      )
    );
    lines.push('');
    lines.push('[3] PRAZO DE NOTIFICAÇÃO DE PRORROGAÇÃO OU RECUSA (Art. 12.º(3)–(4) RGPD)');
    lines.push(`  Regra: Sempre igual ao Prazo Ordinário.`);
    lines.push(
      `  => PRAZO DE NOTIFICAÇÃO: ${result.extensionNoticeDate} (${formatLongDate(result.extensionNoticeDate, 'pt')})`
    );

    if (extended) {
      lines.push('');
      lines.push(
        ...renderOutcomeAuditBlock(
          `[4] PRAZO PRORROGADO (+${input.extensionMonths}M — ADIÇÃO DIRETA DE ${extended.monthsAdded}M AO RECEBIMENTO)`,
          input.receiptDate,
          extended,
          'pt'
        )
      );
      lines.push(
        '  Observação: Nunca se somam meses a um prazo ordinário já deslocado por fim de semana ou feriado.'
      );
    }

    if (suspendedOrdinary) {
      lines.push('');
      lines.push(
        ...renderOutcomeAuditBlock(
          `[5] SUSPENSÃO PARALELA — PRAZO ORDINÁRIO AJUSTADO (+${result.effectiveSuspensionDays}d — Art. 12.º(6))`,
          input.receiptDate,
          suspendedOrdinary,
          'pt'
        )
      );
      lines.push(
        `  Comparativo Ordinário: Original ${ordinary.finalDate} vs. Ajustado ${suspendedOrdinary.finalDate}`
      );
    }

    if (extended && suspendedExtended) {
      lines.push('');
      lines.push(
        ...renderOutcomeAuditBlock(
          `[6] SUSPENSÃO PARALELA — PRAZO PRORROGADO AJUSTADO (+${result.effectiveSuspensionDays}d — Art. 12.º(6))`,
          input.receiptDate,
          suspendedExtended,
          'pt'
        )
      );
      lines.push(
        `  Comparativo Prorrogado: Original ${extended.finalDate} vs. Ajustado ${suspendedExtended.finalDate}`
      );
    }

    lines.push('');
    lines.push('[VERIFICAÇÃO DE ESCOPO E ADMISSIBILIDADE]');
    if (result.outOfBoundsYears.length > 0) {
      lines.push(
        `  [!] Anos fora da base de feriados (2026–2028): ${result.outOfBoundsYears.join(', ')} — somente fins de semana verificados.`
      );
    } else {
      lines.push('  [OK] Todos os anos envolvidos cobertos pela base nacional de feriados (2026–2028).');
    }
    lines.push(
      `  Complexidade / Elevado Volume (CEPD §§ 162–164): ${input.complexityFlagged ? 'Sinalizado' : 'Não sinalizado'}`
    );
    lines.push(
      `  Manifestamente Infundado / Excessivo (Art. 12.º(5) / TJUE C-526/24): ${input.unfoundedFlagged ? 'Sinalizado' : 'Não sinalizado'}`
    );
  } else {
    lines.push('======================================================================');
    lines.push('PRIVACY QUICKCHECK — DETERMINISTIC AUDIT TRAIL');
    lines.push('Legal Standard: Council Regulation (EEC, Euratom) 1182/71 · GDPR Art. 12');
    lines.push(`Holiday Dataset: EEA v${result.datasetVersion} (Supported years: ${result.supportedYears.join(', ')})`);
    lines.push('Date Normalization: UTC calendar dates (YYYY-MM-DD)');
    lines.push('======================================================================');
    lines.push('');
    lines.push('[0] INPUT PARAMETERS');
    lines.push(`  Date of Receipt (Day 0):     ${input.receiptDate} (${WEEKDAYS.en[getWeekdayUTC(input.receiptDate)]})`);
    lines.push(`  Jurisdiction:                ${country.code} — ${countryName}`);
    lines.push(`  Request Type:                ${articleLabel}`);
    lines.push(
      `  Extension (Art. 12(3)):      ${input.extensionMonths === 0 ? 'None (0M)' : `+${input.extensionMonths}M`}`
    );
    lines.push(
      `  Suspension (Art. 12(6)):     ${
        input.identityDoubtEnabled
          ? `Enabled (${result.effectiveSuspensionDays} calendar days)`
          : `Disabled (effective: 0 days; remembered input: ${input.suspensionDays}d)`
      }`
    );
    lines.push('');
    lines.push('[1] EVENT DAY EXCLUSION (Reg. 1182/71 Art. 3(1))');
    lines.push(`  Day 0 (Receipt, excluded):   ${input.receiptDate}`);
    lines.push(
      `  Day 1 (Counting begins):     ${result.dayOneDate} (${WEEKDAYS.en[getWeekdayUTC(result.dayOneDate)]})`
    );
    lines.push('');
    lines.push(
      ...renderOutcomeAuditBlock(
        '[2] ORDINARY STATUTORY DEADLINE (1 MONTH — GDPR Art. 12(3))',
        input.receiptDate,
        ordinary,
        'en'
      )
    );
    lines.push('');
    lines.push('[3] EXTENSION / REFUSAL NOTICE DEADLINE (GDPR Art. 12(3)–(4))');
    lines.push(`  Rule: Always equal to the Ordinary Deadline.`);
    lines.push(
      `  => NOTICE DEADLINE: ${result.extensionNoticeDate} (${formatLongDate(result.extensionNoticeDate, 'en')})`
    );

    if (extended) {
      lines.push('');
      lines.push(
        ...renderOutcomeAuditBlock(
          `[4] EXTENDED DEADLINE (+${input.extensionMonths}M — DIRECT +${extended.monthsAdded}M FROM RECEIPT)`,
          input.receiptDate,
          extended,
          'en'
        )
      );
      lines.push(
        '  Note: Months are never added to an already weekend/holiday-shifted ordinary deadline.'
      );
    }

    if (suspendedOrdinary) {
      lines.push('');
      lines.push(
        ...renderOutcomeAuditBlock(
          `[5] PARALLEL SUSPENSION — ADJUSTED ORDINARY DEADLINE (+${result.effectiveSuspensionDays}d — Art. 12(6))`,
          input.receiptDate,
          suspendedOrdinary,
          'en'
        )
      );
      lines.push(
        `  Ordinary Comparison: Original ${ordinary.finalDate} vs. Adjusted ${suspendedOrdinary.finalDate}`
      );
    }

    if (extended && suspendedExtended) {
      lines.push('');
      lines.push(
        ...renderOutcomeAuditBlock(
          `[6] PARALLEL SUSPENSION — ADJUSTED EXTENDED DEADLINE (+${result.effectiveSuspensionDays}d — Art. 12(6))`,
          input.receiptDate,
          suspendedExtended,
          'en'
        )
      );
      lines.push(
        `  Extended Comparison: Original ${extended.finalDate} vs. Adjusted ${suspendedExtended.finalDate}`
      );
    }

    lines.push('');
    lines.push('[SCOPE VERIFICATION & ADMISSIBILITY]');
    if (result.outOfBoundsYears.length > 0) {
      lines.push(
        `  [!] Out-of-bounds years (outside 2026–2028): ${result.outOfBoundsYears.join(', ')} — weekend rollovers applied only.`
      );
    } else {
      lines.push('  [OK] All calculation years verified against bundled 2026–2028 national holiday dataset.');
    }
    lines.push(
      `  Complexity / High Volume (EDPB §§ 162–164): ${input.complexityFlagged ? 'Flagged' : 'Not flagged'}`
    );
    lines.push(
      `  Manifestly Unfounded / Excessive (Art. 12(5) / CJEU C-526/24): ${input.unfoundedFlagged ? 'Flagged' : 'Not flagged'}`
    );
  }

  return lines.join('\n');
}
