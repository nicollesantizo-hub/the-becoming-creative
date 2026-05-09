"use client";

import { useEffect, useState } from "react";

export function InstallBanner() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    const android = /android/i.test(ua);
    const standalone = window.matchMedia("(display-mode: standalone)").matches;

    if (standalone) {
      setInstalled(true);
      return;
    }

    setIsIOS(ios);
    setIsAndroid(android);

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    const prompt = installPrompt as any;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  }

  if (installed || dismissed || (!isIOS && !isAndroid && !installPrompt)) return null;

  return (
    <div
      className="mx-8 mb-8 p-5 flex items-start justify-between gap-4"
      style={{ backgroundColor: "var(--charcoal)" }}
    >
      <div className="flex flex-col gap-1">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
        >
          Add to your home screen
        </p>
        {isIOS ? (
          <p
            className="text-xs opacity-50 leading-relaxed"
            style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
          >
            Tap the Share button below, then &ldquo;Add to Home Screen&rdquo;
          </p>
        ) : (
          <p
            className="text-xs opacity-50 leading-relaxed"
            style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
          >
            Install The Becoming Creative for quick access
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {isAndroid && installPrompt && (
          <button
            onClick={handleInstall}
            className="text-xs uppercase tracking-widest px-4 py-2 transition-opacity hover:opacity-80"
            style={{
              backgroundColor: "var(--clay)",
              color: "var(--cream)",
              fontFamily: "var(--font-body)",
            }}
          >
            Install
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="text-xs opacity-30 hover:opacity-60 transition-opacity"
          style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
