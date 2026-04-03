"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X, Shield } from "lucide-react";
import { useSession } from "next-auth/react";

/**
 * Exit-intent popup — shows when user intends to leave:
 * - Desktop: mouse moves toward top of viewport
 * - Mobile: after 30 seconds of inactivity
 *
 * Rules:
 * - Only show once per session (localStorage)
 * - Don't show if user is already logged in
 * - Don't show on /scan page itself
 */
export default function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const trackEvent = useCallback((action: string) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", action, {
        event_category: "exit_intent",
        event_label: "free_scan_cta",
      });
    }
  }, []);

  const shouldShow = useCallback(() => {
    // Don't show on /scan pages
    if (pathname?.startsWith("/scan")) return false;
    // Don't show if logged in
    if (session?.user) return false;
    // Don't show if already dismissed this session
    if (dismissed) return false;
    if (typeof window !== "undefined" && localStorage.getItem("exit_intent_shown")) return false;
    return true;
  }, [pathname, session, dismissed]);

  useEffect(() => {
    if (!shouldShow()) return;

    let mobileTimer: NodeJS.Timeout | null = null;
    let inactivityTimer: NodeJS.Timeout | null = null;

    const showPopup = () => {
      if (!shouldShow()) return;
      setVisible(true);
      trackEvent("exit_intent_shown");
      localStorage.setItem("exit_intent_shown", "1");
    };

    // Desktop: mouse leave detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        showPopup();
      }
    };

    // Mobile: 30s inactivity detection
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(showPopup, 30000);
    };

    // Delay activation to avoid triggering on initial load
    const activationTimer = setTimeout(() => {
      if (!isMobile) {
        document.addEventListener("mouseleave", handleMouseLeave);
      } else {
        // Start inactivity tracking for mobile
        resetInactivityTimer();
        document.addEventListener("touchstart", resetInactivityTimer);
        document.addEventListener("scroll", resetInactivityTimer);
      }
    }, 5000);

    return () => {
      clearTimeout(activationTimer);
      if (mobileTimer) clearTimeout(mobileTimer);
      if (inactivityTimer) clearTimeout(inactivityTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("touchstart", resetInactivityTimer);
      document.removeEventListener("scroll", resetInactivityTimer);
    };
  }, [shouldShow, trackEvent]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    trackEvent("exit_intent_dismissed");
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleDismiss}
    >
      <div
        className="relative mx-4 max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Sluiten"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
            <Shield className="h-7 w-7 text-brand-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Wacht! Check gratis je RI&E-risico's voordat je gaat
          </h2>
          <p className="text-gray-600 mb-6">
            Geen account nodig. Direct resultaat. Speciaal voor kleine ondernemers.
          </p>
          <Link
            href="/scan"
            className="block w-full rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 text-center"
            onClick={() => { trackEvent("exit_intent_clicked"); handleDismiss(); }}
          >
            Start gratis scan →
          </Link>
          <button
            onClick={handleDismiss}
            className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
          >
            Nee bedankt
          </button>
        </div>
      </div>
    </div>
  );
}
