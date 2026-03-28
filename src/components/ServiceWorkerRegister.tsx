'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        registration?.update();
      }
    };

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        registration = reg;
        document.addEventListener('visibilitychange', handleVisibilityChange);
      })
      .catch((err) => console.warn('SW registration failed:', err));

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
