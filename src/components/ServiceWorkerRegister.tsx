'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;
    let cancelled = false;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        registration?.update();
      }
    };

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        if (cancelled) return;
        registration = reg;
        document.addEventListener('visibilitychange', handleVisibilityChange);
      })
      .catch((err) => console.warn('SW registration failed:', err));

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
