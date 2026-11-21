import type { CountryCode, CountryMeta, Language, RequestArticle } from '../types/dsar';

export const COUNTRIES: CountryMeta[] = [
  { code: 'EE', flag: '🇪🇪', nameEN: 'Estonia', namePT: 'Estônia' },
  { code: 'LV', flag: '🇱🇻', nameEN: 'Latvia', namePT: 'Letônia' },
  { code: 'LT', flag: '🇱🇹', nameEN: 'Lithuania', namePT: 'Lituânia' },
  { code: 'FI', flag: '🇫🇮', nameEN: 'Finland', namePT: 'Finlândia' },
  { code: 'SE', flag: '🇸🇪', nameEN: 'Sweden', namePT: 'Suécia' },
  { code: 'DE', flag: '🇩🇪', nameEN: 'Germany', namePT: 'Alemanha' },
  { code: 'FR', flag: '🇫🇷', nameEN: 'France', namePT: 'França' },
  { code: 'ES', flag: '🇪🇸', nameEN: 'Spain', namePT: 'Espanha' },
  { code: 'IT', flag: '🇮🇹', nameEN: 'Italy', namePT: 'Itália' },
  { code: 'NL', flag: '🇳🇱', nameEN: 'Netherlands', namePT: 'Países Baixos' },
];

export const COUNTRY_MAP: Record<CountryCode, CountryMeta> = COUNTRIES.reduce(
  (acc, item) => {
    acc[item.code] = item;
    return acc;
  },
  {} as Record<CountryCode, CountryMeta>
);

export const REQUEST_ARTICLES: Array<{
  id: RequestArticle;
  articleLabel: string;
  titleEN: string;
  titlePT: string;
  shortEN: string;
  shortPT: string;
}> = [
  {
    id: 'art15',
    articleLabel: 'Art. 15',
    titleEN: 'Art. 15 — Right of Access',
    titlePT: 'Art. 15 — Direito de Acesso',
    shortEN: 'Right of Access',
    shortPT: 'Direito de Acesso',
  },
  {
    id: 'art16',
    articleLabel: 'Art. 16',
    titleEN: 'Art. 16 — Right to Rectification',
    titlePT: 'Art. 16 — Direito de Retificação',
    shortEN: 'Right to Rectification',
    shortPT: 'Direito de Retificação',
  },
  {
    id: 'art17',
    articleLabel: 'Art. 17',
    titleEN: 'Art. 17 — Right to Erasure',
    titlePT: 'Art. 17 — Direito ao Apagamento',
    shortEN: 'Right to Erasure',
    shortPT: 'Direito ao Apagamento',
  },
  {
    id: 'art18',
    articleLabel: 'Art. 18',
    titleEN: 'Art. 18 — Right to Restriction of Processing',
    titlePT: 'Art. 18 — Direito à Limitação do Tratamento',
    shortEN: 'Restriction of Processing',
    shortPT: 'Limitação do Tratamento',
  },
  {
    id: 'art19',
    articleLabel: 'Art. 19',
    titleEN: 'Art. 19 — Notification Obligation (Recipients)',
    titlePT: 'Art. 19 — Obrigação de Notificação (Destinatários)',
    shortEN: 'Notification Obligation',
    shortPT: 'Obrigação de Notificação',
  },
  {
    id: 'art20',
    articleLabel: 'Art. 20',
    titleEN: 'Art. 20 — Right to Data Portability',
    titlePT: 'Art. 20 — Direito à Portabilidade dos Dados',
    shortEN: 'Data Portability',
    shortPT: 'Portabilidade dos Dados',
  },
  {
    id: 'art21',
    articleLabel: 'Art. 21',
    titleEN: 'Art. 21 — Right to Object',
    titlePT: 'Art. 21 — Direito de Oposição',
    shortEN: 'Right to Object',
    shortPT: 'Direito de Oposição',
  },
  {
    id: 'art22',
    articleLabel: 'Art. 22',
    titleEN: 'Art. 22 — Automated Decisions & Profiling',
    titlePT: 'Art. 22 — Decisões Automatizadas e Perfis',
    shortEN: 'Automated Decisions & Profiling',
    shortPT: 'Decisões Automatizadas e Perfis',
  },
];

export const WEEKDAYS: Record<Language, string[]> = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  pt: [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ],
};

export const WEEKDAYS_SHORT: Record<Language, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  pt: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
};

export const MONTHS: Record<Language, string[]> = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  pt: [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ],
};

export const MONTHS_SHORT: Record<Language, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
};

export interface Translations {
  appTitle: string;
  pageSubtitle: string;
  legalBasisLine: string;
  navHolidaysSettings: string;
  themeToLight: string;
  themeToDark: string;
  sectionInputsTitle: string;
  sectionInputsDesc: string;
  receiptDateLabel: string;
  receiptDateHint: string;
  todayButton: string;
  dayZeroNote: string;
  jurisdictionLabel: string;
  requestTypeLabel: string;
  extensionLabel: string;
  extensionNone: string;
  extensionPlus1: string;
  extensionPlus2: string;
  extensionHelp: string;
  sectionChecklistTitle: string;
  sectionChecklistDesc: string;
  cardIdentityTitle: string;
  cardIdentityArticle: string;
  cardIdentitySubtitle: string;
  cardIdentitySavedDays: (days: number) => string;
  suspensionDaysLabel: string;
  suspensionDaysUnit: string;
  suspensionRangeHint: string;
  suspensionLegalNote: string;
  cardComplexityTitle: string;
  cardComplexityArticle: string;
  cardComplexitySubtitle: string;
  cardComplexityFlagLabel: string;
  cardComplexityIntro: string;
  cardComplexityCriteria: string[];
  cardComplexityFootnote: string;
  cardUnfoundedTitle: string;
  cardUnfoundedArticle: string;
  cardUnfoundedSubtitle: string;
  cardUnfoundedFlagLabel: string;
  cardUnfoundedIntro: string;
  cardUnfoundedPoints: string[];
  cardUnfoundedFootnote: string;
  outOfBoundsTitle: string;
  outOfBoundsBody: (years: string) => string;
  ordinaryDeadlineTitle: string;
  ordinaryDeadlineBasis: string;
  nominalLabel: string;
  calendarDaysLabel: (days: number) => string;
  shiftedNotice: (days: number) => string;
  clampedNotice: (fromDay: number, toDay: number) => string;
  noShiftNotice: string;
  weekendLabel: string;
  holidayLabel: string;
  extensionNoticeTitle: string;
  extensionNoticeBasis: string;
  extensionNoticeDesc: string;
  extendedDeadlineTitle: (months: 1 | 2) => string;
  extendedDeadlineBasis: (totalMonths: number) => string;
  extendedDirectNote: (receiptDate: string, totalMonths: number) => string;
  suspensionCompareTitle: string;
  suspensionCompareBasis: (days: number) => string;
  unadjustedColumn: string;
  adjustedColumn: string;
  ordinaryRowLabel: string;
  extendedRowLabel: (months: 1 | 2) => string;
  preRolloverLabel: string;
  netDeltaLabel: (days: number) => string;
  timelineTitle: string;
  timelineReceipt: string;
  timelineDayOne: string;
  timelineOrdinary: string;
  timelineSuspended: string;
  timelineExtended: string;
  copySummaryBtn: string;
  copiedBtn: string;
  auditTrailBtn: string;
  auditModalTitle: string;
  auditModalSubtitle: string;
  copyAuditBtn: string;
  downloadTxtBtn: string;
  closeBtn: string;
  presetsLabel: string;
  presetEaster: string;
  presetClamping: string;
  presetSuspension: string;
  resetFormBtn: string;
  settingsModalTitle: string;
  tabHolidays: string;
  tabDisclaimer: string;
  defaultCountryLabel: string;
  defaultCountrySaved: string;
  filterCountryLabel: string;
  filterYearLabel: string;
  allYears: string;
  searchHolidaysPlaceholder: string;
  holidaysCount: (count: number) => string;
  noHolidaysMatch: string;
  tableDate: string;
  tableDay: string;
  tableHoliday: string;
  disclaimerHeading1: string;
  disclaimerBody1: string;
  disclaimerHeading2: string;
  disclaimerBody2: string;
  disclaimerHeading3: string;
  disclaimerBody3: string;
  disclaimerHeading4: string;
  disclaimerBody4: string;
  footerOfflineNote: string;
  footerDatasetNote: (version: string) => string;
  flaggedBadgeText: string;
  exportIcsBtn: string;
  countdownInDays: (days: number) => string;
  countdownDueToday: string;
  countdownOverdueDays: (days: number) => string;
  templatesSectionTitle: string;
  templatesSectionDesc: string;
  copyTemplateBtn: string;
  shortcutCopiedToast: string;
  shortcutHint: string;
  pwaInstallBtn: string;
  pwaIosGuideTitle: string;
  pwaIosStep1: string;
  pwaIosStep2: string;
  offlineActiveNotice: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appTitle: 'Privacy QuickCheck',
    pageSubtitle: 'GDPR DSAR Deadline & Admissibility Calculator',
    legalBasisLine: 'EU Regulation 1182/71 · GDPR Art. 12 · EDPB Guidelines 01/2022',
    navHolidaysSettings: 'Holidays & Legal',
    themeToLight: 'Switch to light mode',
    themeToDark: 'Switch to dark mode',
    sectionInputsTitle: 'Request Parameters',
    sectionInputsDesc: 'All dates are normalized to UTC calendar dates to prevent timezone or DST drift.',
    receiptDateLabel: 'Date of Receipt',
    receiptDateHint: 'Day 0 — excluded from time calculation (Reg. 1182/71 Art. 3(1))',
    todayButton: 'Today',
    dayZeroNote: 'Day 0',
    jurisdictionLabel: 'EEA Jurisdiction',
    requestTypeLabel: 'Request Type (GDPR)',
    extensionLabel: 'Response Extension (Art. 12(3))',
    extensionNone: 'None (0)',
    extensionPlus1: '+1 Month',
    extensionPlus2: '+2 Months',
    extensionHelp: 'Computed directly from original receipt date (+2M or +3M), never from a rolled-over ordinary deadline.',
    sectionChecklistTitle: 'Admissibility & Clock-Stop Assessment',
    sectionChecklistDesc: 'Review statutory grounds under GDPR Art. 12 and apply identity/scope suspension if applicable.',
    cardIdentityTitle: 'Identity or Scope Doubt',
    cardIdentityArticle: 'Art. 12(6) · EDPB 01/2022',
    cardIdentitySubtitle: 'Pause the clock while awaiting identity verification or scope clarification.',
    cardIdentitySavedDays: (days) => `Remembered: ${days}d`,
    suspensionDaysLabel: 'Suspension duration',
    suspensionDaysUnit: 'calendar days',
    suspensionRangeHint: 'Valid range: 0–365 calendar days. Added to nominal deadline before weekend/holiday rollover.',
    suspensionLegalNote:
      'Under GDPR Art. 12(6) and EDPB Guidelines 01/2022 (§§ 160–161), where the controller has reasonable doubts concerning identity or needs clarification of a large processing scope, the time limit is suspended until the required information is provided. Both unadjusted and adjusted deadlines are shown in parallel.',
    cardComplexityTitle: 'Complexity or High Volume',
    cardComplexityArticle: 'Art. 12(3) · EDPB §§ 162–164',
    cardComplexitySubtitle: 'Criteria justifying a 1- or 2-month extension notice.',
    cardComplexityFlagLabel: 'Include complexity note in summary',
    cardComplexityIntro:
      'Per EDPB Guidelines 01/2022 (§§ 162–164), extending the 1-month deadline by up to two further months is an exception and must be assessed case-by-case:',
    cardComplexityCriteria: [
      'Volume of personal data processed and difficulty locating or extracting records across distributed systems.',
      'Technical and organizational complexity required to review, compile, and securely deliver the data.',
      'Need to redact or assess third-party rights and freedoms (Art. 15(4)) before disclosure.',
      'Number of concurrent requests received from the same data subject or exceptional operational surges.',
    ],
    cardComplexityFootnote:
      'Mandatory: The controller must inform the data subject of the extension and the reasons for the delay within the original 1-month ordinary deadline.',
    cardUnfoundedTitle: 'Manifestly Unfounded or Excessive',
    cardUnfoundedArticle: 'Art. 12(5) · CJEU C-526/24',
    cardUnfoundedSubtitle: 'Controller burden of proof, refusal, or reasonable fee threshold.',
    cardUnfoundedFlagLabel: 'Include Art. 12(5) admissibility note in summary',
    cardUnfoundedIntro:
      'Under GDPR Art. 12(5), controllers may charge a reasonable administrative fee or refuse to act only where a request is demonstrably manifestly unfounded or excessive:',
    cardUnfoundedPoints: [
      'Strict Burden of Proof: The controller bears the full evidentiary burden to prove the manifestly unfounded or excessive character.',
      'CJEU C-526/24 (Brillen Rottler): A single initial access request cannot automatically be deemed excessive; the controller must establish objective abusive intent or repetitive harassment.',
      'Narrow Interpretation: Frequency alone does not establish excessiveness; context, data changes, and legitimate data subject interests must be weighed.',
      'Notice Deadline Still Applies: If refusing to act, the controller must notify the data subject without delay and at latest within the 1-month Art. 12(4) deadline, informing them of supervisory authority and judicial remedies.',
    ],
    cardUnfoundedFootnote:
      'Document objective evidence before relying on Art. 12(5) in case of supervisory authority review.',
    outOfBoundsTitle: 'National holidays not verified for out-of-range year',
    outOfBoundsBody: (years) =>
      `Year(s) ${years} fall outside the bundled 2026–2028 EEA public holiday dataset. Saturday/Sunday rollovers are still applied deterministically, but national public holidays must be verified manually.`,
    ordinaryDeadlineTitle: 'Ordinary Statutory Deadline',
    ordinaryDeadlineBasis: 'GDPR Art. 12(3) · Reg. 1182/71 Art. 3(2)(c) & 3(4)',
    nominalLabel: 'Nominal',
    calendarDaysLabel: (days) => `${days} calendar days from receipt`,
    shiftedNotice: (days) => `Rolled over +${days} ${days === 1 ? 'day' : 'days'}`,
    clampedNotice: (fromDay, toDay) => `Month-end clamped (day ${fromDay} → ${toDay})`,
    noShiftNotice: 'Working day — no rollover required',
    weekendLabel: 'Weekend',
    holidayLabel: 'Public Holiday',
    extensionNoticeTitle: 'Extension / Refusal Notice Deadline',
    extensionNoticeBasis: 'GDPR Art. 12(3) & Art. 12(4)',
    extensionNoticeDesc:
      'Latest date to notify the data subject of any extension (with reasons) or refusal to act (with right to lodge a complaint). Always equals the Ordinary Deadline.',
    extendedDeadlineTitle: (months) =>
      months === 1 ? 'Extended Deadline (+1 Month)' : 'Extended Deadline (+2 Months)',
    extendedDeadlineBasis: (totalMonths) =>
      `GDPR Art. 12(3) · Direct +${totalMonths}M from receipt`,
    extendedDirectNote: (receiptDate, totalMonths) =>
      `Calculated directly as ${receiptDate} + ${totalMonths} months, then clamped and rolled over.`,
    suspensionCompareTitle: 'Parallel Suspension Comparison',
    suspensionCompareBasis: (days) =>
      `GDPR Art. 12(6) · +${days} suspension ${days === 1 ? 'day' : 'days'} added prior to rollover`,
    unadjustedColumn: 'Original Unadjusted',
    adjustedColumn: 'Suspension-Adjusted',
    ordinaryRowLabel: 'Ordinary (1M)',
    extendedRowLabel: (months) => `Extended (+${months}M)`,
    preRolloverLabel: 'Pre-rollover',
    netDeltaLabel: (days) => `+${days}d net`,
    timelineTitle: 'Statutory Timeline',
    timelineReceipt: 'Receipt (Day 0)',
    timelineDayOne: 'Start (Day 1)',
    timelineOrdinary: 'Ordinary',
    timelineSuspended: 'Suspended',
    timelineExtended: 'Extended',
    copySummaryBtn: 'Copy Summary',
    copiedBtn: 'Copied',
    auditTrailBtn: 'Audit Trail',
    auditModalTitle: 'Audit Trail',
    auditModalSubtitle: 'Deterministic step-by-step calculation log (UTC calendar dates)',
    copyAuditBtn: 'Copy Audit Trail',
    downloadTxtBtn: 'Download .txt',
    closeBtn: 'Close',
    presetsLabel: 'Quick presets',
    presetEaster: 'DE Easter Rollover',
    presetClamping: 'Jan 31 Clamping',
    presetSuspension: 'EE ID Suspension',
    resetFormBtn: 'Reset',
    settingsModalTitle: 'Holidays & Legal Reference',
    tabHolidays: 'EEA Holidays (2026–2028)',
    tabDisclaimer: 'Legal Disclaimer',
    defaultCountryLabel: 'Default Jurisdiction (saved in browser)',
    defaultCountrySaved: 'Saved as default',
    filterCountryLabel: 'Country',
    filterYearLabel: 'Year',
    allYears: 'All (2026–2028)',
    searchHolidaysPlaceholder: 'Search holiday name or date (YYYY-MM-DD)...',
    holidaysCount: (count) => `${count} ${count === 1 ? 'holiday' : 'holidays'}`,
    noHolidaysMatch: 'No holidays match your current filter.',
    tableDate: 'Date',
    tableDay: 'Weekday',
    tableHoliday: 'Public Holiday',
    disclaimerHeading1: 'Regulation 1182/71 & EDPB 01/2022 Footnote 90',
    disclaimerBody1:
      'Deadlines are calculated pursuant to Article 12(3)–(4) GDPR and Council Regulation (EEC, Euratom) No 1182/71, as expressly endorsed by the European Data Protection Board in Guidelines 01/2022 on data subject rights — Right of access (footnote 90). Receipt day is excluded (Art. 3(1)); periods expressed in months expire on the corresponding day of the final month or its last day (Art. 3(2)(c)); and deadlines ending on a Saturday, Sunday, or public holiday roll over to the next working day (Art. 3(4)).',
    disclaimerHeading2: 'National vs. Regional Holidays',
    disclaimerBody2:
      'The bundled holiday calendar covers nationwide public holidays for 2026–2028 across 10 EEA jurisdictions (EE, LV, LT, FI, SE, DE, FR, ES, IT, NL). Regional, state (e.g., German Bundesländer, Spanish Comunidades Autónomas), or municipal holidays are excluded and should be verified against local statutory rules.',
    disclaimerHeading3: '100% Offline & Stateless Operation',
    disclaimerBody3:
      'Privacy QuickCheck runs exclusively inside your browser with zero external API calls, zero telemetry, and zero backend persistence. Case inputs are never saved or transmitted. Only your interface preferences (language, default jurisdiction, and light/dark theme) are stored in browser localStorage.',
    disclaimerHeading4: 'No Legal Advice',
    disclaimerBody4:
      'This calculator is an operational compliance aid intended for privacy professionals and Data Protection Officers. It does not constitute formal legal advice. Always verify edge cases with qualified legal counsel or the competent supervisory authority.',
    footerOfflineNote: '100% local browser calculation · Stateless · No data transmitted',
    footerDatasetNote: (version) => `EEA Holiday Bundle v${version} (2026–2028)`,
    flaggedBadgeText: 'Flagged',
    exportIcsBtn: 'Export .ics',
    countdownInDays: (days) => (days === 1 ? 'In 1 day' : `In ${days} days`),
    countdownDueToday: 'Due today',
    countdownOverdueDays: (days) =>
      days === 1 ? 'Overdue by 1 day' : `Overdue by ${days} days`,
    templatesSectionTitle: 'Response Templates',
    templatesSectionDesc:
      'Deterministic, ready-to-copy notices generated locally from your active calculation (no AI).',
    copyTemplateBtn: 'Copy Template',
    shortcutCopiedToast: 'Audit Trail copied to clipboard',
    shortcutHint: 'Ctrl/Cmd + Shift + C copies Audit Trail',
    pwaInstallBtn: 'Install App',
    pwaIosGuideTitle: 'Install Privacy QuickCheck on iOS',
    pwaIosStep1: 'Tap the Share button in the Safari toolbar.',
    pwaIosStep2: 'Scroll down and tap "Add to Home Screen".',
    offlineActiveNotice: 'Offline mode — running locally from cache',
  },
  pt: {
    appTitle: 'Privacy QuickCheck',
    pageSubtitle: 'Calculadora de Prazos e Admissibilidade de DSAR (RGPD)',
    legalBasisLine: 'Regulamento (CEE) 1182/71 · Art. 12.º RGPD · Diretrizes CEPD 01/2022',
    navHolidaysSettings: 'Feriados e Legal',
    themeToLight: 'Alternar para modo claro',
    themeToDark: 'Alternar para modo escuro',
    sectionInputsTitle: 'Parâmetros do Pedido',
    sectionInputsDesc: 'Todas as datas são normalizadas em calendário UTC para evitar desvios de fuso horário ou horário de verão.',
    receiptDateLabel: 'Data de Recebimento',
    receiptDateHint: 'Dia 0 — excluído da contagem do prazo (Reg. 1182/71 Art. 3.º(1))',
    todayButton: 'Hoje',
    dayZeroNote: 'Dia 0',
    jurisdictionLabel: 'Jurisdição do EEE',
    requestTypeLabel: 'Tipo de Pedido (RGPD)',
    extensionLabel: 'Prorrogação de Prazo (Art. 12.º(3))',
    extensionNone: 'Nenhuma (0)',
    extensionPlus1: '+1 Mês',
    extensionPlus2: '+2 Meses',
    extensionHelp: 'Calculada diretamente a partir da data de recebimento original (+2M ou +3M), nunca sobre um prazo ordinário prorrogado por fim de semana/feriado.',
    sectionChecklistTitle: 'Admissibilidade e Suspensão de Prazo',
    sectionChecklistDesc: 'Avalie os fundamentos legais do Art. 12.º do RGPD e aplique suspensão por dúvida de identidade ou escopo, se cabível.',
    cardIdentityTitle: 'Dúvida de Identidade ou Escopo',
    cardIdentityArticle: 'Art. 12.º(6) · CEPD 01/2022',
    cardIdentitySubtitle: 'Suspende a contagem enquanto aguarda confirmação de identidade ou especificação do pedido.',
    cardIdentitySavedDays: (days) => `Memorizado: ${days}d`,
    suspensionDaysLabel: 'Duração da suspensão',
    suspensionDaysUnit: 'dias corridos',
    suspensionRangeHint: 'Intervalo válido: 0–365 dias corridos. Somado ao prazo nominal antes da prorrogação por dia não útil.',
    suspensionLegalNote:
      'Nos termos do Art. 12.º(6) do RGPD e das Diretrizes CEPD 01/2022 (§§ 160–161), havendo dúvidas razoáveis quanto à identidade ou necessidade de especificação de grande volume de dados, o prazo fica suspenso até o fornecimento das informações. Os prazos original e ajustado são exibidos lado a lado.',
    cardComplexityTitle: 'Complexidade ou Elevado Volume',
    cardComplexityArticle: 'Art. 12.º(3) · CEPD §§ 162–164',
    cardComplexitySubtitle: 'Critérios que fundamentam a notificação de prorrogação de 1 ou 2 meses.',
    cardComplexityFlagLabel: 'Incluir nota de complexidade no resumo',
    cardComplexityIntro:
      'Segundo as Diretrizes CEPD 01/2022 (§§ 162–164), prorrogar o prazo de 1 mês por até dois meses adicionais é medida excepcional sujeita à análise do caso concreto:',
    cardComplexityCriteria: [
      'Volume de dados pessoais tratados e dificuldade de localização ou extração em múltiplos sistemas.',
      'Complexidade técnica e organizacional para revisar, compilar e entregar os dados com segurança.',
      'Necessidade de anonimização ou ponderação de direitos e liberdades de terceiros (Art. 15.º(4)).',
      'Número elevado de pedidos simultâneos do mesmo titular ou picos operacionais excepcionais.',
    ],
    cardComplexityFootnote:
      'Obrigatório: O responsável pelo tratamento deve informar o titular sobre a prorrogação e os motivos do atraso dentro do prazo ordinário original de 1 mês.',
    cardUnfoundedTitle: 'Manifestamente Infundado ou Excessivo',
    cardUnfoundedArticle: 'Art. 12.º(5) · TJUE C-526/24',
    cardUnfoundedSubtitle: 'Ônus da prova do controlador, recusa de atendimento ou taxa razoável.',
    cardUnfoundedFlagLabel: 'Incluir nota de admissibilidade (Art. 12.º(5)) no resumo',
    cardUnfoundedIntro:
      'Nos termos do Art. 12.º(5) do RGPD, o responsável pelo tratamento só pode cobrar taxa administrativa razoável ou recusar dar seguimento quando o pedido for manifestamente infundado ou excessivo:',
    cardUnfoundedPoints: [
      'Ônus da Prova Estrito: Cabe integralmente ao controlador demonstrar o caráter manifestamente infundado ou excessivo do pedido.',
      'TJUE C-526/24 (Brillen Rottler): Um único pedido inicial de acesso não pode ser presumido excessivo; exige-se demonstração objetiva de intenção abusiva ou caráter repetitivo.',
      'Interpretação Restritiva: A mera frequência não basta para configurar excesso; deve-se avaliar o contexto, alterações nos dados e o interesse legítimo do titular.',
      'Prazo de Notificação Mantido: Em caso de recusa, o titular deve ser informado sem demora e no máximo no prazo de 1 mês (Art. 12.º(4)), indicando o direito de reclamação à autoridade e recurso judicial.',
    ],
    cardUnfoundedFootnote:
      'Documente evidências objetivas antes de invocar o Art. 12.º(5) para eventual escrutínio da autoridade de controle.',
    outOfBoundsTitle: 'Feriados nacionais não verificados para ano fora do conjunto',
    outOfBoundsBody: (years) =>
      `O(s) ano(s) ${years} está(ão) fora do calendário embutido de feriados do EEE (2026–2028). A prorrogação de sábados e domingos continua sendo aplicada, mas feriados nacionais devem ser verificados manualmente.`,
    ordinaryDeadlineTitle: 'Prazo Legal Ordinário',
    ordinaryDeadlineBasis: 'Art. 12.º(3) RGPD · Reg. 1182/71 Art. 3.º(2)(c) e 3.º(4)',
    nominalLabel: 'Nominal',
    calendarDaysLabel: (days) => `${days} dias corridos desde o recebimento`,
    shiftedNotice: (days) => `Prorrogado +${days} ${days === 1 ? 'dia' : 'dias'}`,
    clampedNotice: (fromDay, toDay) => `Ajuste de fim de mês (dia ${fromDay} → ${toDay})`,
    noShiftNotice: 'Dia útil — sem deslocamento',
    weekendLabel: 'Fim de semana',
    holidayLabel: 'Feriado nacional',
    extensionNoticeTitle: 'Prazo para Notificação de Prorrogação / Recusa',
    extensionNoticeBasis: 'Art. 12.º(3) e Art. 12.º(4) RGPD',
    extensionNoticeDesc:
      'Data limite para notificar o titular sobre eventual prorrogação (com justificativa) ou recusa (com indicação dos meios de recurso). Sempre igual ao Prazo Ordinário.',
    extendedDeadlineTitle: (months) =>
      months === 1 ? 'Prazo Prorrogado (+1 Mês)' : 'Prazo Prorrogado (+2 Meses)',
    extendedDeadlineBasis: (totalMonths) =>
      `Art. 12.º(3) RGPD · Adição direta de +${totalMonths}M ao recebimento`,
    extendedDirectNote: (receiptDate, totalMonths) =>
      `Calculado diretamente como ${receiptDate} + ${totalMonths} meses, seguido de ajuste de fim de mês e prorrogação de dia não útil.`,
    suspensionCompareTitle: 'Comparativo de Suspensão Paralela',
    suspensionCompareBasis: (days) =>
      `Art. 12.º(6) RGPD · +${days} ${days === 1 ? 'dia' : 'dias'} de suspensão somado(s) antes do deslocamento`,
    unadjustedColumn: 'Original Sem Suspensão',
    adjustedColumn: 'Ajustado com Suspensão',
    ordinaryRowLabel: 'Ordinário (1M)',
    extendedRowLabel: (months) => `Prorrogado (+${months}M)`,
    preRolloverLabel: 'Pré-deslocamento',
    netDeltaLabel: (days) => `+${days}d líquidos`,
    timelineTitle: 'Linha do Tempo Legal',
    timelineReceipt: 'Recebimento (Dia 0)',
    timelineDayOne: 'Início (Dia 1)',
    timelineOrdinary: 'Ordinário',
    timelineSuspended: 'Com Suspensão',
    timelineExtended: 'Prorrogado',
    copySummaryBtn: 'Copiar Resumo',
    copiedBtn: 'Copiado',
    auditTrailBtn: 'Memória de Cálculo',
    auditModalTitle: 'Memória de Cálculo',
    auditModalSubtitle: 'Registro determinístico passo a passo (datas em calendário UTC)',
    copyAuditBtn: 'Copiar Memória de Cálculo',
    downloadTxtBtn: 'Baixar .txt',
    closeBtn: 'Fechar',
    presetsLabel: 'Exemplos rápidos',
    presetEaster: 'DE Feriado Páscoa',
    presetClamping: 'Ajuste 31 Jan',
    presetSuspension: 'EE Suspensão ID',
    resetFormBtn: 'Redefinir',
    settingsModalTitle: 'Feriados e Referência Legal',
    tabHolidays: 'Feriados do EEE (2026–2028)',
    tabDisclaimer: 'Aviso Legal',
    defaultCountryLabel: 'Jurisdição Padrão (salva no navegador)',
    defaultCountrySaved: 'Salva como padrão',
    filterCountryLabel: 'País',
    filterYearLabel: 'Ano',
    allYears: 'Todos (2026–2028)',
    searchHolidaysPlaceholder: 'Buscar feriado por nome ou data (AAAA-MM-DD)...',
    holidaysCount: (count) => `${count} ${count === 1 ? 'feriado' : 'feriados'}`,
    noHolidaysMatch: 'Nenhum feriado corresponde ao filtro atual.',
    tableDate: 'Data',
    tableDay: 'Dia da semana',
    tableHoliday: 'Feriado Nacional',
    disclaimerHeading1: 'Regulamento 1182/71 e Nota de Rodapé 90 do CEPD 01/2022',
    disclaimerBody1:
      'Os prazos são calculados conforme o Art. 12.º(3)–(4) do RGPD e o Regulamento (CEE, Euratom) n.º 1182/71, conforme expressamente adotado pelo Comité Europeu para a Proteção de Dados nas Diretrizes 01/2022 sobre o direito de acesso (nota de rodapé 90). O dia do recebimento é excluído (Art. 3.º(1)); prazos em meses terminam no dia correspondente do último mês ou no último dia desse mês (Art. 3.º(2)(c)); e prazos encerrados em sábado, domingo ou feriado deslocam-se para o próximo dia útil (Art. 3.º(4)).',
    disclaimerHeading2: 'Feriados Nacionais vs. Regionais',
    disclaimerBody2:
      'O calendário embutido cobre feriados públicos de abrangência nacional (2026–2028) em 10 jurisdições do EEE (EE, LV, LT, FI, SE, DE, FR, ES, IT, NL). Feriados regionais, estaduais (ex.: Bundesländer na Alemanha ou Comunidades Autônomas na Espanha) ou municipais não estão incluídos e devem ser verificados localmente.',
    disclaimerHeading3: 'Operação 100% Offline e Sem Estado',
    disclaimerBody3:
      'O Privacy QuickCheck opera inteiramente no navegador, sem chamadas a APIs externas, sem telemetria e sem banco de dados. Nenhum histórico de casos é armazenado ou transmitido. Apenas preferências de interface (idioma, jurisdição padrão e tema claro/escuro) ficam gravadas no localStorage do navegador.',
    disclaimerHeading4: 'Caráter Informativo',
    disclaimerBody4:
      'Esta calculadora é um instrumento operacional de apoio a encarregados de proteção de dados (DPOs) e profissionais de privacidade. Não substitui aconselhamento jurídico formal. Em casos limítrofes, confirme com assessoria jurídica especializada ou a autoridade de controle competente.',
    footerOfflineNote: 'Cálculo 100% local no navegador · Sem estado · Nenhum dado transmitido',
    footerDatasetNote: (version) => `Base de Feriados do EEE v${version} (2026–2028)`,
    flaggedBadgeText: 'Sinalizado',
    exportIcsBtn: 'Exportar .ics',
    countdownInDays: (days) => (days === 1 ? 'Em 1 dia' : `Em ${days} dias`),
    countdownDueToday: 'Vence hoje',
    countdownOverdueDays: (days) =>
      days === 1 ? 'Vencido há 1 dia' : `Vencido há ${days} dias`,
    templatesSectionTitle: 'Modelos de Resposta',
    templatesSectionDesc:
      'Notificações determinísticas prontas para copiar, geradas localmente a partir do cálculo ativo (sem IA).',
    copyTemplateBtn: 'Copiar Modelo',
    shortcutCopiedToast: 'Memória de Cálculo copiada para a área de transferência',
    shortcutHint: 'Ctrl/Cmd + Shift + C copia a Memória de Cálculo',
    pwaInstallBtn: 'Instalar App',
    pwaIosGuideTitle: 'Instalar Privacy QuickCheck no iOS',
    pwaIosStep1: 'Toque no botão Compartilhar na barra do Safari.',
    pwaIosStep2: 'Role para baixo e toque em "Adicionar à Tela de Início".',
    offlineActiveNotice: 'Modo offline — executando localmente em cache',
  },
};
