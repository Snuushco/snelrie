"use client";

import { useState } from "react";
import { Mail, Download, Loader2, CheckCircle2, ArrowRight } from "lucide-react";

export function ChecklistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Er ging iets mis. Probeer het opnieuw.");
        return;
      }

      setSuccess(true);

      // Track conversion
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "checklist_download", {
          event_category: "lead_magnet",
          event_label: "rie_checklist",
        });
      }
    } catch {
      setError("Verbindingsfout. Controleer uw internet en probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Check uw inbox! 📬
        </h3>
        <p className="text-gray-600 mb-4">
          De RI&E Checklist is onderweg naar <strong>{email}</strong>. Controleer
          ook uw spam-map als u hem niet direct ziet.
        </p>
        <div className="border-t border-green-200 pt-4 mt-4">
          <p className="text-sm text-gray-500 mb-3">
            Wilt u direct uw volledige RI&E laten genereren?
          </p>
          <a
            href="/scan"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition text-sm"
          >
            Start Gratis RI&E Scan
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-brand-200 rounded-2xl p-8 shadow-lg">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Download className="h-7 w-7 text-brand-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          Download de gratis checklist
        </h3>
        <p className="text-gray-500 text-sm mt-2">
          Vul uw gegevens in en ontvang de PDF direct per email.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Uw naam
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jan de Vries"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Zakelijk emailadres
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="u@bedrijf.nl"
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition text-gray-900"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Bezig met verzenden...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Download Gratis Checklist
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-4">
        We respecteren uw privacy. Geen spam, uitschrijven kan altijd.{" "}
        <a href="/privacy" className="underline hover:text-gray-600">
          Privacybeleid
        </a>
      </p>
    </div>
  );
}
