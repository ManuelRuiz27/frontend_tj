import { useCallback, useEffect, useState } from 'react';
import './A2HSBanner.css';

const DISMISS_KEY = 'tj_a2hs_dismissed_at';
const DISMISS_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 días

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  preventDefault: () => void;
}

const isStandalone = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error - soporte para iOS Safari
    window.navigator.standalone === true;
};

const dismissedRecently = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const value = window.localStorage.getItem(DISMISS_KEY);
  if (!value) {
    return false;
  }
  const timestamp = Number(value);
  if (Number.isNaN(timestamp)) {
    return false;
  }
  const diff = Date.now() - timestamp;
  if (diff > DISMISS_DURATION) {
    window.localStorage.removeItem(DISMISS_KEY);
    return false;
  }
  return true;
};

const rememberDismiss = () => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(DISMISS_KEY, Date.now().toString());
};

const A2HSBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  const hideBanner = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || isStandalone()) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      if (dismissedRecently()) {
        return;
      }
      setDeferredPrompt(promptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      hideBanner();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [hideBanner]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        hideBanner();
      }
    } catch (error) {
      console.warn('No se pudo completar la instalación', error);
    }
  };

  const handleDismiss = () => {
    rememberDismiss();
    hideBanner();
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="a2hs-banner" role="region" aria-label="Instalar Tarjeta Joven">
      <div className="a2hs-banner__header">
        <h3 className="a2hs-banner__title">Instala Tarjeta Joven</h3>
        <button type="button" className="a2hs-banner__close" aria-label="Cerrar" onClick={handleDismiss}>
          ✕
        </button>
      </div>
      <p className="a2hs-banner__description">
        Agrega la aplicación a tu pantalla de inicio para acceder más rápido a tus beneficios.
      </p>
      <div className="a2hs-banner__actions">
        <button type="button" className="a2hs-banner__install" onClick={handleInstall}>
          Instalar
        </button>
        <button type="button" className="a2hs-banner__dismiss" onClick={handleDismiss}>
          Ahora no
        </button>
      </div>
    </div>
  );
};

export default A2HSBanner;
