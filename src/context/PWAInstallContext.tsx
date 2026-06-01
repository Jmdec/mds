"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAInstallContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  showBanner: boolean;
  handleInstall: () => Promise<void>;
  handleDismiss: () => void;
}

const PWAInstallContext = createContext<PWAInstallContextType | null>(null);

export function PWAInstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((window.navigator as any).standalone === true) return;
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    // The event may have already fired before this effect ran,
    // so we listen AND check a global we set in _document or SW
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If the event was stored globally before React mounted
    if ((window as any).__pwaInstallPrompt) {
      setDeferredPrompt((window as any).__pwaInstallPrompt);
      setShowBanner(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
      (window as any).__pwaInstallPrompt = null;
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa-banner-dismissed", "true");
  };

  return (
    <PWAInstallContext.Provider
      value={{ deferredPrompt, showBanner, handleInstall, handleDismiss }}
    >
      {children}
    </PWAInstallContext.Provider>
  );
}

export function usePWAInstall() {
  const ctx = useContext(PWAInstallContext);
  if (!ctx)
    throw new Error("usePWAInstall must be used within PWAInstallProvider");
  return ctx;
}
