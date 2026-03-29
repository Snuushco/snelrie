"use client";

import { useState } from "react";
import { ArrowRight, ExternalLink, Loader2 } from "lucide-react";

interface SubscriptionActionsProps {
  hasSubscription?: boolean;
  currentTier?: string;
  status?: string | null;
  mode?: "full" | "inline";
  targetTier?: string;
  isUpgrade?: boolean;
}

export function SubscriptionActions({
  hasSubscription = false,
  currentTier,
  status,
  mode = "full",
  targetTier,
  isUpgrade = false,
}: SubscriptionActionsProps) {
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Portaal kon niet worden geopend. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  const startCheckout = async (tier: string, cycle: "MONTHLY" | "YEARLY" = "MONTHLY") => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, billingCycle: cycle }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Checkout kon niet worden gestart. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  // Inline mode: single button for a specific tier
  if (mode === "inline" && targetTier) {
    if (hasSubscription) {
      return (
        <button
          onClick={openPortal}
          disabled={loading}
          className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
            isUpgrade
              ? "bg-brand-600 text-white hover:bg-brand-700"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {isUpgrade ? "Upgraden" : "Wijzigen"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      );
    }

    return (
      <button
        onClick={() => startCheckout(targetTier)}
        disabled={loading}
        className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
          isUpgrade
            ? "bg-brand-600 text-white hover:bg-brand-700"
            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            Aan de slag
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    );
  }

  // Full mode: manage subscription button
  if (!hasSubscription) return null;

  return (
    <div className="flex gap-3">
      <button
        onClick={openPortal}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <ExternalLink className="w-4 h-4" />
            Beheer je abonnement
          </>
        )}
      </button>
    </div>
  );
}
