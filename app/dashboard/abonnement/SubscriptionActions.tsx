"use client";

import { useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Loader2,
  XCircle,
  AlertTriangle,
  Lock,
  CheckCircle,
} from "lucide-react";

interface CommitmentResponse {
  canCancel: boolean;
  withinCommitment: boolean;
  commitmentEndDate: string | null;
  daysRemaining: number;
  nextRenewalDate: string | null;
  reason: string | null;
}

interface SubscriptionActionsProps {
  hasSubscription?: boolean;
  currentTier?: string;
  status?: string | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  mode?: "full" | "inline";
  targetTier?: string;
  isUpgrade?: boolean;
}

export function SubscriptionActions({
  hasSubscription = false,
  currentTier,
  status,
  cancelAtPeriodEnd = false,
  currentPeriodEnd,
  mode = "full",
  targetTier,
  isUpgrade = false,
}: SubscriptionActionsProps) {
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Modal states
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [blockedReason, setBlockedReason] = useState("");
  const [cancelEndDate, setCancelEndDate] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/subscriptions/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Portaal kon niet worden geopend. Probeer het opnieuw.");
    } finally {
      setPortalLoading(false);
    }
  };

  const startCheckout = async (
    tier: string,
    cycle: "MONTHLY" | "YEARLY" = "MONTHLY"
  ) => {
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

  const handleCancelClick = async () => {
    setCancelLoading(true);
    try {
      // First check commitment status
      const res = await fetch("/api/billing/enforce-commitment");
      const data: CommitmentResponse = await res.json();

      if (!data.canCancel) {
        // Show blocked modal with reason
        setBlockedReason(data.reason || "Opzeggen is op dit moment niet mogelijk.");
        setShowBlockedModal(true);
      } else {
        // Show confirmation modal
        const endDate = data.nextRenewalDate || data.commitmentEndDate;
        setCancelEndDate(endDate ? formatDate(endDate) : "het einde van uw huidige periode");
        setShowConfirmModal(true);
      }
    } catch {
      alert("Kan opzegstatus niet ophalen. Probeer het later opnieuw.");
    } finally {
      setCancelLoading(false);
    }
  };

  const confirmCancel = async () => {
    setCancelLoading(true);
    try {
      const res = await fetch("/api/subscriptions/cancel", { method: "POST" });
      const data = await res.json();

      setShowConfirmModal(false);

      if (data.success) {
        setSuccessMessage(
          data.message || "Uw abonnement is opgezegd."
        );
        setShowSuccessModal(true);
      } else {
        setBlockedReason(data.error || "Opzeggen is niet gelukt.");
        setShowBlockedModal(true);
      }
    } catch {
      setShowConfirmModal(false);
      alert("Opzeggen is niet gelukt. Neem contact op met support.");
    } finally {
      setCancelLoading(false);
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

  // Full mode: manage subscription buttons
  if (!hasSubscription) return null;

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Beheer betaling button */}
        <button
          onClick={openPortal}
          disabled={portalLoading}
          className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition"
        >
          {portalLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              Beheer betaling
            </>
          )}
        </button>

        {/* Cancel button — only show if not already cancelling */}
        {!cancelAtPeriodEnd && status === "ACTIVE" && (
          <button
            onClick={handleCancelClick}
            disabled={cancelLoading}
            className="inline-flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-red-50 hover:border-red-300 transition"
          >
            {cancelLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Abonnement opzeggen
              </>
            )}
          </button>
        )}
      </div>

      {/* Blocked Modal */}
      {showBlockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowBlockedModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Opzeggen niet mogelijk
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {blockedReason}
            </p>
            <button
              onClick={() => setShowBlockedModal(false)}
              className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
            >
              Begrepen
            </button>
          </div>
        </div>
      )}

      {/* Confirm Cancel Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Weet u het zeker?
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-2">
              Uw abonnement wordt opgezegd aan het einde van de huidige periode. 
              U houdt toegang tot <span className="font-medium text-gray-900">{cancelEndDate}</span>.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Daarna wordt uw account omgezet naar het gratis Starter plan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              >
                Annuleren
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelLoading}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                {cancelLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Ja, opzeggen"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowSuccessModal(false);
              window.location.reload();
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Abonnement opgezegd
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {successMessage}
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                window.location.reload();
              }}
              className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </>
  );
}
