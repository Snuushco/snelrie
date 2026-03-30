"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, AlertCircle, Pen, Loader2 } from "lucide-react";
import SignatureInput from "@/components/SignatureInput";

type SignLinkInfo = {
  reportId: string;
  bedrijfsnaam: string;
  role: string;
  roleLabel: string;
  expired: boolean;
  used: boolean;
  alreadySigned: boolean;
};

export default function OndertekeningPage() {
  const { token } = useParams<{ token: string }>();
  const [info, setInfo] = useState<SignLinkInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [functie, setFunctie] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  // Load sign link info
  useEffect(() => {
    fetch(`/api/onderteken/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setInfo(data);
        }
      })
      .catch(() => setError("Kon ondertekeningsgegevens niet laden"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit() {
    if (!info || !name.trim() || !functie.trim() || !signatureDataUrl) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/rie/${info.reportId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureImage: signatureDataUrl,
          name: name.trim(),
          functie: functie.trim(),
          role: info.role,
          token,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        if (data.verificationCode) {
          setVerificationCode(data.verificationCode);
        }
      } else {
        setError(data.error || "Er ging iets mis bij het ondertekenen");
      }
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Ondertekening niet beschikbaar
          </h1>
          <p className="text-gray-600">
            {error || "Ongeldige link"}
          </p>
        </div>
      </div>
    );
  }

  if (info.expired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link verlopen</h1>
          <p className="text-gray-600">
            Deze ondertekeningslink is verlopen. Vraag de werkgever om een nieuwe link te versturen.
          </p>
        </div>
      </div>
    );
  }

  if (info.used || info.alreadySigned) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Al ondertekend</h1>
          <p className="text-gray-600">
            Dit rapport is al ondertekend als {info.roleLabel}.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Succesvol ondertekend!
          </h1>
          <p className="text-gray-600">
            De RI&E van <strong>{info.bedrijfsnaam}</strong> is ondertekend als {info.roleLabel}.
            De werkgever ontvangt hiervan een bevestiging.
          </p>
          {verificationCode && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-600 mb-1">Digitaal Waarmerk</p>
              <p className="font-mono font-bold text-blue-900 tracking-wider">
                {verificationCode}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                Verificatie: snelrie.nl/verificatie/{verificationCode}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xl mb-4">
            <span>Snel</span>
            <span className="text-blue-800">RIE</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            RI&E Ondertekenen
          </h1>
          <p className="text-gray-600">
            U bent gevraagd om als <strong>{info.roleLabel}</strong> de RI&E van{" "}
            <strong>{info.bedrijfsnaam}</strong> te ondertekenen.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
          {/* Naam */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Naam
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Uw volledige naam"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Functie */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Functie
            </label>
            <input
              type="text"
              value={functie}
              onChange={(e) => setFunctie(e.target.value)}
              placeholder={
                info.role === "arbodeskundige"
                  ? "Registratienummer / functie"
                  : "Uw functie binnen het bedrijf"
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Datum */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Datum
            </label>
            <input
              type="text"
              disabled
              value={new Date().toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          {/* Signature input (multi-method) */}
          <SignatureInput
            onSignatureChange={setSignatureDataUrl}
            hasSignature={!!signatureDataUrl}
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !name.trim() || !functie.trim() || !signatureDataUrl}
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Ondertekenen...
              </>
            ) : (
              <>
                <Pen className="w-4 h-4" />
                Ondertekenen
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Door te ondertekenen bevestigt u dat u de RI&E heeft gelezen en akkoord gaat
            met de inhoud voor zover van toepassing op uw rol.
          </p>
        </div>
      </div>
    </div>
  );
}
