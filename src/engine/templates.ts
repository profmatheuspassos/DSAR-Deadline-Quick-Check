import type { CalculationResult, Language } from '../types/dsar';
import { formatLongDate, getArticleTitle, getCountryName } from './formatters';

export type ResponseTemplateId = 'extension' | 'identity' | 'refusal';

export interface GeneratedResponseTemplate {
  id: ResponseTemplateId;
  title: string;
  legalBasis: string;
  subject: string;
  body: string;
}

export function buildExtensionNoticeTemplate(
  result: CalculationResult,
  lang: Language
): GeneratedResponseTemplate | null {
  const { input, extended, suspendedExtended } = result;
  if (input.extensionMonths <= 0 || !extended) return null;

  const articleTitle = getArticleTitle(input.requestArticle, lang);
  const receiptFormatted = formatLongDate(input.receiptDate, lang);
  const noticeFormatted = formatLongDate(result.extensionNoticeDate, lang);
  const extendedFormatted = formatLongDate(extended.finalDate, lang);
  const countryName = getCountryName(input.countryCode, lang);

  if (lang === 'pt') {
    const extPeriod =
      input.extensionMonths === 1 ? '1 (um) mês adicional' : '2 (dois) meses adicionais';
    const suspensionNote = suspendedExtended
      ? `\nNota de Suspensão (Art. 12.º(6) RGPD): Considerando o período de suspensão de ${result.effectiveSuspensionDays} dia(s) corrido(s), o prazo prorrogado ajustado corresponde a ${suspendedExtended.finalDate} (${formatLongDate(suspendedExtended.finalDate, 'pt')}).\n`
      : '';

    return {
      id: 'extension',
      title: 'Notificação de Prorrogação de Prazo',
      legalBasis: 'Art. 12.º(3) RGPD · CEPD 01/2022 §§ 162–164',
      subject: `Notificação de prorrogação de prazo — Pedido do Titular (${articleTitle})`,
      body: [
        `Assunto: Notificação de prorrogação de prazo — Pedido do Titular (${articleTitle})`,
        '',
        'Prezado(a) [Nome do Titular],',
        '',
        `Acusamos o recebimento do seu pedido referente a "${articleTitle}", recebido em ${input.receiptDate} (${receiptFormatted}), sob a jurisdição aplicável (${countryName}).`,
        '',
        `Nos termos do Artigo 12.º, n.º 3, do Regulamento Geral sobre a Proteção de Dados (RGPD) e das Diretrizes 01/2022 do CEPD (§§ 162–164), informamos — dentro do prazo ordinário legal de notificação que se encerra em ${result.extensionNoticeDate} (${noticeFormatted}) — que será necessário prorrogar o prazo de resposta por ${extPeriod}, em razão da complexidade e/ou do volume de dados envolvidos no atendimento do pedido.`,
        '',
        'Motivos específicos da prorrogação: [Descrever de forma objetiva a complexidade técnica, volume de registros ou necessidade de análise de direitos de terceiros].',
        '',
        `Novo prazo legal máximo para resposta: ${extended.finalDate} (${extendedFormatted}).`,
        suspensionNote.trimEnd(),
        'Caso tenha dúvidas sobre o andamento do seu pedido, entre em contato pelo canal [e-mail do DPO / privacidade]. Recordamos também que lhe assiste o direito de apresentar reclamação junto à autoridade de controle competente e de intentar ação judicial nos termos dos Artigos 77.º e 79.º do RGPD.',
        '',
        'Atenciosamente,',
        '[Nome / Encarregado pelo Tratamento de Dados (DPO)]',
        '[Organização]',
      ]
        .filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''))
        .join('\n'),
    };
  }

  const extPeriod =
    input.extensionMonths === 1 ? '1 (one) additional month' : '2 (two) additional months';
  const suspensionNote = suspendedExtended
    ? `\nSuspension Note (GDPR Art. 12(6)): Accounting for the ${result.effectiveSuspensionDays}-day suspension period, the suspension-adjusted extended deadline is ${suspendedExtended.finalDate} (${formatLongDate(suspendedExtended.finalDate, 'en')}).\n`
    : '';

  return {
    id: 'extension',
    title: 'Extension Notice',
    legalBasis: 'GDPR Art. 12(3) · EDPB 01/2022 §§ 162–164',
    subject: `Notice of Deadline Extension — Data Subject Request (${articleTitle})`,
    body: [
      `Subject: Notice of Deadline Extension — Data Subject Request (${articleTitle})`,
      '',
      'Dear [Data Subject Name],',
      '',
      `We confirm receipt of your request under "${articleTitle}", received on ${input.receiptDate} (${receiptFormatted}) (${countryName}).`,
      '',
      `Pursuant to Article 12(3) of the General Data Protection Regulation (GDPR) and EDPB Guidelines 01/2022 (§§ 162–164), we hereby notify you — within the ordinary statutory notice deadline of ${result.extensionNoticeDate} (${noticeFormatted}) — that we need to extend the response period by ${extPeriod}, taking into account the complexity and/or number of requests involved.`,
      '',
      'Specific reasons for the delay: [Insert objective justification regarding data volume, multi-system extraction complexity, or third-party rights redaction].',
      '',
      `New statutory response deadline: ${extended.finalDate} (${extendedFormatted}).`,
      suspensionNote.trimEnd(),
      'If you have any questions regarding your request, please contact [DPO / Privacy Contact Email]. Please note that you have the right to lodge a complaint with the competent supervisory authority and to seek a judicial remedy pursuant to Articles 77 and 79 GDPR.',
      '',
      'Sincerely,',
      '[Name / Data Protection Officer]',
      '[Organization]',
    ]
      .filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''))
      .join('\n'),
  };
}

export function buildIdentityClarificationTemplate(
  result: CalculationResult,
  lang: Language
): GeneratedResponseTemplate | null {
  const { input, ordinary, suspendedOrdinary } = result;
  if (!input.identityDoubtEnabled) return null;

  const articleTitle = getArticleTitle(input.requestArticle, lang);
  const receiptFormatted = formatLongDate(input.receiptDate, lang);
  const ordinaryFormatted = formatLongDate(ordinary.finalDate, lang);

  if (lang === 'pt') {
    const suspensionLine =
      suspendedOrdinary && result.effectiveSuspensionDays > 0
        ? `Com base em uma suspensão estimada de ${result.effectiveSuspensionDays} dia(s) corrido(s), o prazo ordinário original (${ordinary.finalDate} — ${ordinaryFormatted}) passaria para ${suspendedOrdinary.finalDate} (${formatLongDate(suspendedOrdinary.finalDate, 'pt')}).`
        : `O prazo ordinário sem suspensão encontra-se previsto para ${ordinary.finalDate} (${ordinaryFormatted}), sendo suspenso a partir desta solicitação até o recebimento das informações solicitadas.`;

    return {
      id: 'identity',
      title: 'Pedido de Confirmação de Identidade / Esclarecimento de Escopo',
      legalBasis: 'Art. 12.º(6) RGPD · CEPD 01/2022 §§ 63–79',
      subject: `Solicitação de informações adicionais — Pedido do Titular (${articleTitle})`,
      body: [
        `Assunto: Solicitação de informações adicionais — Pedido do Titular (${articleTitle})`,
        '',
        'Prezado(a) [Nome do Titular],',
        '',
        `Recebemos em ${input.receiptDate} (${receiptFormatted}) o seu pedido relativo a "${articleTitle}".`,
        '',
        'Nos termos do Artigo 12.º, n.º 6, do RGPD e das Diretrizes 01/2022 do CEPD (§§ 63–79), para proteger os seus dados pessoais contra divulgação indevida (ou para localizar com precisão os registros pertinentes entre grande volume de informações tratadas), solicitamos o fornecimento estritamente proporcional das seguintes informações adicionais:',
        '',
        '• [Ex.: confirmação do e-mail cadastrado, número de cliente/contrato ou período específico dos dados solicitados — evitar exigir cópia integral de documento de identidade quando meios menos intrusivos bastarem].',
        '',
        `Suspensão da contagem do prazo: Em conformidade com as Diretrizes 01/2022 do CEPD, a contagem do prazo legal permanece suspensa até o recebimento da confirmação/esclarecimento solicitado. ${suspensionLine}`,
        '',
        'Assim que recebermos sua resposta, daremos seguimento imediato ao tratamento do pedido.',
        '',
        'Atenciosamente,',
        '[Nome / Encarregado pelo Tratamento de Dados (DPO)]',
        '[Organização]',
      ].join('\n'),
    };
  }

  const suspensionLine =
    suspendedOrdinary && result.effectiveSuspensionDays > 0
      ? `Based on a modeled suspension of ${result.effectiveSuspensionDays} calendar day(s), the original ordinary deadline (${ordinary.finalDate} — ${ordinaryFormatted}) shifts to ${suspendedOrdinary.finalDate} (${formatLongDate(suspendedOrdinary.finalDate, 'en')}).`
      : `The unadjusted ordinary deadline is ${ordinary.finalDate} (${ordinaryFormatted}); the statutory clock is paused from this request until the requested clarification is received.`;

  return {
    id: 'identity',
    title: 'Identity / Scope Clarification Request',
    legalBasis: 'GDPR Art. 12(6) · EDPB 01/2022 §§ 63–79',
    subject: `Request for Additional Information — Data Subject Request (${articleTitle})`,
    body: [
      `Subject: Request for Additional Information — Data Subject Request (${articleTitle})`,
      '',
      'Dear [Data Subject Name],',
      '',
      `We received your request under "${articleTitle}" on ${input.receiptDate} (${receiptFormatted}).`,
      '',
      'Pursuant to Article 12(6) GDPR and EDPB Guidelines 01/2022 (§§ 63–79), in order to safeguard your personal data against unauthorized disclosure (or to specify the information/processing activities to which your request relates), please provide the following proportionate additional details:',
      '',
      '• [E.g., confirmation of registered account email, customer reference number, or specific timeframe/processing context — avoid requesting a full ID copy where less intrusive verification suffices].',
      '',
      `Clock-Stop Notice: In accordance with EDPB Guidelines 01/2022, the statutory response period is suspended until we receive the requested verification or clarification. ${suspensionLine}`,
      '',
      'As soon as we receive your confirmation, we will resume processing your request without undue delay.',
      '',
      'Sincerely,',
      '[Name / Data Protection Officer]',
      '[Organization]',
    ].join('\n'),
  };
}

export function buildRefusalFeeTemplate(
  result: CalculationResult,
  lang: Language
): GeneratedResponseTemplate | null {
  const { input } = result;
  if (!input.unfoundedFlagged) return null;

  const articleTitle = getArticleTitle(input.requestArticle, lang);
  const receiptFormatted = formatLongDate(input.receiptDate, lang);
  const noticeFormatted = formatLongDate(result.extensionNoticeDate, lang);

  if (lang === 'pt') {
    return {
      id: 'refusal',
      title: 'Notificação de Recusa ou Taxa Razoável',
      legalBasis: 'Art. 12.º(4)–(5) RGPD · TJUE C-526/24 (Brillen Rottler)',
      subject: `Decisão sobre pedido do titular — Art. 12.º(5) RGPD (${articleTitle})`,
      body: [
        `Assunto: Decisão sobre pedido do titular — Art. 12.º(5) RGPD (${articleTitle})`,
        '',
        'Prezado(a) [Nome do Titular],',
        '',
        `Em resposta ao seu pedido relativo a "${articleTitle}", recebido em ${input.receiptDate} (${receiptFormatted}), e dentro do prazo legal de 1 mês que se encerra em ${result.extensionNoticeDate} (${noticeFormatted}) (Art. 12.º(4) RGPD), informamos que, após análise individualizada, a organização concluiu que o pedido se enquadra no Artigo 12.º, n.º 5, do RGPD por apresentar caráter manifestamente infundado ou excessivo.`,
        '',
        'Fundamentação objetiva (ônus da prova do controlador — Art. 12.º(5) RGPD e Acórdão TJUE C-526/24, Brillen Rottler):',
        '[Inserir elementos objetivos e documentados que demonstrem caráter manifestamente infundado, repetição abusiva ou intenção abusiva — um único pedido inicial não basta, por si só, para caracterizar excesso].',
        '',
        'Medida adotada (selecionar a opção aplicável):',
        '• [Opção A — Recusa]: A organização recusa dar seguimento ao pedido nos termos do Artigo 12.º, n.º 5, alínea b), do RGPD.',
        '• [Opção B — Taxa razoável]: Para dar seguimento ao pedido, será cobrada taxa administrativa razoável de [valor e detalhamento de custos administrativos], nos termos do Artigo 12.º, n.º 5, alínea a), do RGPD.',
        '',
        'Direitos de recurso (Art. 12.º(4) RGPD): Informamos que o(a) titular tem o direito de apresentar reclamação junto à autoridade de controle competente (Art. 77.º RGPD) e de recorrer às vias judiciais (Art. 79.º RGPD).',
        '',
        'Atenciosamente,',
        '[Nome / Encarregado pelo Tratamento de Dados (DPO)]',
        '[Organização]',
      ].join('\n'),
    };
  }

  return {
    id: 'refusal',
    title: 'Refusal / Reasonable Fee Notice',
    legalBasis: 'GDPR Art. 12(4)–(5) · CJEU C-526/24 (Brillen Rottler)',
    subject: `Decision on Data Subject Request — Art. 12(5) GDPR (${articleTitle})`,
    body: [
      `Subject: Decision on Data Subject Request — Art. 12(5) GDPR (${articleTitle})`,
      '',
      'Dear [Data Subject Name],',
      '',
      `Further to your request under "${articleTitle}", received on ${input.receiptDate} (${receiptFormatted}), and within the mandatory one-month notification deadline ending on ${result.extensionNoticeDate} (${noticeFormatted}) (Article 12(4) GDPR), we inform you that following an individual assessment, we have determined that the request is manifestly unfounded or excessive within the meaning of Article 12(5) GDPR.`,
      '',
      'Objective Grounds (Controller Burden of Proof — Art. 12(5) GDPR & CJEU Case C-526/24, Brillen Rottler):',
      '[Insert specific, documented objective evidence demonstrating manifestly unfounded grounds or abusive/repetitive intent — note that a single initial request cannot automatically be deemed excessive].',
      '',
      'Action Taken (select applicable option):',
      '• [Option A — Refusal]: Pursuant to Article 12(5)(b) GDPR, we decline to act on the request.',
      '• [Option B — Reasonable Fee]: Pursuant to Article 12(5)(a) GDPR, fulfilling the request is subject to a reasonable administrative fee of [amount & administrative cost breakdown].',
      '',
      'Supervisory & Judicial Remedies (Art. 12(4) GDPR): You have the right to lodge a complaint with the competent EEA data protection supervisory authority (Article 77 GDPR) and to seek a judicial remedy (Article 79 GDPR).',
      '',
      'Sincerely,',
      '[Name / Data Protection Officer]',
      '[Organization]',
    ].join('\n'),
  };
}

export function getActiveResponseTemplates(
  result: CalculationResult,
  lang: Language
): GeneratedResponseTemplate[] {
  const list: GeneratedResponseTemplate[] = [];
  const ext = buildExtensionNoticeTemplate(result, lang);
  if (ext) list.push(ext);
  const id = buildIdentityClarificationTemplate(result, lang);
  if (id) list.push(id);
  const ref = buildRefusalFeeTemplate(result, lang);
  if (ref) list.push(ref);
  return list;
}
