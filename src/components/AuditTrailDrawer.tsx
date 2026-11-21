import { useEffect, useState } from 'react';
import { Check, Copy, Download, X } from 'lucide-react';
import { buildAuditTrailText } from '../engine/formatters';
import { TRANSLATIONS } from '../i18n/translations';
import type { CalculationResult, Language } from '../types/dsar';
import { copyTextToClipboard } from '../utils/clipboard';

interface AuditTrailDrawerProps {
  open: boolean;
  onClose: () => void;
  result: CalculationResult;
  language: Language;
}

export function AuditTrailDrawer({
  open,
  onClose,
  result,
  language,
}: AuditTrailDrawerProps) {
  const t = TRANSLATIONS[language];
  const [copied, setCopied] = useState(false);

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

  if (!open) return null;

  const auditText = buildAuditTrailText(result, language);

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(auditText);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([auditText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `privacy-quickcheck-audit-${result.input.receiptDate}-${result.input.countryCode}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-drawer-title"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full max-w-2xl flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="audit-drawer-title"
              className="text-base font-semibold text-slate-900 dark:text-slate-100"
            >
              {t.auditModalTitle}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t.auditModalSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeBtn}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Monospace Audit Content */}
        <div className="flex-1 overflow-y-auto subtle-scroll p-4 sm:p-6">
          <pre className="w-full overflow-x-auto subtle-scroll rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre tabular-dates">
            {auditText}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 border-t border-slate-200 dark:border-slate-800 px-5 py-4 sm:px-6 bg-white dark:bg-[#0F172A]">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.closeBtn}
          </button>
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
            <span>{t.downloadTxtBtn}</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 px-4 text-sm font-medium text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                <span>{t.copiedBtn}</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>{t.copyAuditBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
