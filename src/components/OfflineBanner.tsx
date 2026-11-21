import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import type { Language } from '../types/dsar';

interface OfflineBannerProps {
  language: Language;
}

export function OfflineBanner({ language }: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  const t = TRANSLATIONS[language];

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/90 px-3 py-2 text-xs font-medium text-amber-950 dark:text-amber-100 shadow-lg"
    >
      <WifiOff className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400 shrink-0" aria-hidden="true" />
      <span>{t.offlineActiveNotice}</span>
    </div>
  );
}
