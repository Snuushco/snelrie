"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles } from "lucide-react";

/**
 * Exit-intent popup for /scan page.
 * Detects when the user moves their mouse toward the top of the viewport
 * (intent to leave) and shows a CTA to try the AI demo at /demo.
 *
 * Feature-flagged via NEXT_PUBLIC_EXIT_INTENT_ENABLED (default: false).
 * Tracks shown/clicked/dismissed events via GA4 dataLayer.
 */
export default function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  const trackEvent = useCallback(
    (action: string) => {
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", action, {
          event_category: "exit_intent",
          event_label: "scan_to_demo",
        });
      }
    },
    []
  );

  useEffect(() => {
    // Don't show if already dismissed this session
    if (dismissed) return;
    if (sessionStorage.getItem("exit_intent_dismissed")) {
      setDismissed(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when cursor moves toward top of viewport
      if (e.clientY <= 5 && !dismissed) {
        setVisible(true);
        trackEvent("exit_intent_shown");
      }
    };

    // Small delay so it doesn't fire on initial page load mouse movements
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [dismissed, trackEvent]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("exit_intent_dismissed", "1");
    trackEvent("exit_intent_dismissed");
  };

  const handleCTA = () => {
    trackEvent("exit_intent_clicked");
    sessionStorage.setItem("exit_intent_dismissed", "1");
    router.push("/demo");
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
            <Sparkles className="h-7 w-7 text-brand-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Wacht even!
          </h2>
          <p className="text-gray-600 mb-6">
            Wil je eerst zien hoe onze AI een RI&amp;E opstelt?{" "}
            <span className="font-semibold text-brand-700">
              Probeer de gratis demo
            </span>{" "}
            — geen account nodig.
          </p>
          <button
            onClick={handleCTA}
            className="w-full rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Probeer de AI demo →
          </button>
          <button
            onClick={handleDismiss}
            className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
          >
            Nee bedankt, ik ga verder
          </button>
        </div>
      </div>
    </div>
  );
}
