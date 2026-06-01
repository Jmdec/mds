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

// Extend Window to avoid `any`
interface WindowWithPWA extends Window {
  __pwaInstallPrompt?: BeforeInstallPromptEvent;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
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
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((window.navigator as NavigatorWithStandalone).standalone === true)
      return;
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const pwaWindow = window as WindowWithPWA;
    if (pwaWindow.__pwaInstallPrompt) {
      setDeferredPrompt(pwaWindow.__pwaInstallPrompt);
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
      (window as WindowWithPWA).__pwaInstallPrompt = undefined;
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
