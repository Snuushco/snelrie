"use client";

import { useState, useCallback, useRef } from "react";

type BrandingData = {
  logoUrl: string | null;
  primaryColor: string | null;
  companyName: string | null;
  websiteUrl: string | null;
};

export default function BrandingPage() {
  const [email, setEmail] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [branding, setBranding] = useState<BrandingData>({
    logoUrl: null,
    primaryColor: null,
    companyName: null,
    websiteUrl: null,
  });
  const [websiteInput, setWebsiteInput] = useState("");
  const [scrapeResult, setScrapeResult] = useState<BrandingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing branding
  const loadBranding = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/branding?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.branding) {
          setBranding(data.branding);
        }
        setAuthenticated(true);
      } else {
        const err = await res.json();
        setMessage(err.error || "Kon branding niet laden");
      }
    } catch {
      setMessage("Verbindingsfout");
    }
    setLoading(false);
  };

  // Logo upload
  const uploadLogo = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setMessage("Bestand is te groot (max 2MB)");
      return;
    }
    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
      setMessage("Gebruik PNG, JPG of SVG");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("logo", file);
    formData.append("email", email);

    try {
      const res = await fetch("/api/branding/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setBranding((prev) => ({ ...prev, logoUrl: data.logoUrl }));
        setMessage("Logo geüpload! ✓");
      } else {
        setMessage(data.error || "Upload mislukt");
      }
    } catch {
      setMessage("Upload mislukt");
    }
    setLoading(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadLogo(file);
    },
    [email]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadLogo(file);
  };

  // Website scraper
  const scrapeWebsite = async () => {
    if (!websiteInput) return;
    setLoading(true);
    setScrapeResult(null);
    try {
      const res = await fetch("/api/branding/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setScrapeResult(data);
        setMessage("");
      } else {
        setMessage(data.error || "Kon branding niet ophalen");
      }
    } catch {
      setMessage("Verbindingsfout");
    }
    setLoading(false);
  };

  const applyScrapeResult = () => {
    if (!scrapeResult) return;
    setBranding((prev) => ({
      logoUrl: scrapeResult.logoUrl || prev.logoUrl,
      primaryColor: scrapeResult.primaryColor || prev.primaryColor,
      companyName: scrapeResult.companyName || prev.companyName,
      websiteUrl: scrapeResult.websiteUrl || prev.websiteUrl,
    }));
    setScrapeResult(null);
    setMessage("Branding overgenomen! Pas aan en sla op.");
  };

  // Save branding
  const saveBranding = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/branding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...branding }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Branding opgeslagen! ✓");
      } else {
        setMessage(data.error || "Opslaan mislukt");
      }
    } catch {
      setMessage("Verbindingsfout");
    }
    setSaving(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Snel<span className="text-blue-600">RIE</span> Branding
          </h1>
          <p className="text-gray-500 mb-6">
            Log in met je email om je branding in te stellen.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="je@bedrijf.nl"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            onKeyDown={(e) => e.key === "Enter" && loadBranding()}
          />
          <button
            onClick={loadBranding}
            disabled={loading || !email}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Laden..." : "Ga verder"}
          </button>
          {message && <p className="mt-4 text-red-600 text-sm">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Snel<span className="text-blue-600">RIE</span> Branding
          </h1>
          <p className="text-gray-500 mt-1">
            Stel je huisstijl in voor Enterprise RI&E rapporten.
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm ${
              message.includes("✓")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Section 1: Website Scraper */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🌐 Branding ophalen van website
          </h2>
          <div className="flex gap-3">
            <input
              type="url"
              value={websiteInput}
              onChange={(e) => setWebsiteInput(e.target.value)}
              placeholder="Vul je website URL in"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              onKeyDown={(e) => e.key === "Enter" && scrapeWebsite()}
            />
            <button
              onClick={scrapeWebsite}
              disabled={loading || !websiteInput}
              className="bg-gray-900 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-gray-800 disabled:opacity-50 transition whitespace-nowrap"
            >
              {loading ? "Ophalen..." : "Ophalen"}
            </button>
          </div>

          {scrapeResult && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-blue-900 mb-3">
                We hebben dit gevonden:
              </p>
              <div className="space-y-3">
                {scrapeResult.companyName && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-24">Naam:</span>
                    <span className="font-medium">{scrapeResult.companyName}</span>
                  </div>
                )}
                {scrapeResult.logoUrl && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-24">Logo:</span>
                    <img
                      src={scrapeResult.logoUrl}
                      alt="Gevonden logo"
                      className="h-10 max-w-[160px] object-contain bg-white rounded border p-1"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                    />
                  </div>
                )}
                {scrapeResult.primaryColor && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-24">Kleur:</span>
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: scrapeResult.primaryColor }}
                    />
                    <span className="text-sm font-mono">{scrapeResult.primaryColor}</span>
                  </div>
                )}
              </div>
              <button
                onClick={applyScrapeResult}
                className="mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
              >
                Overnemen en aanpassen
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Logo Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🖼️ Logo uploaden
          </h2>

          {branding.logoUrl && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Huidig logo:</p>
              <img
                src={branding.logoUrl}
                alt="Je logo"
                className="h-16 max-w-[240px] object-contain"
              />
            </div>
          )}

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
              dragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <div className="text-4xl mb-2">📁</div>
            <p className="text-gray-700 font-medium">
              Sleep je logo hierheen of klik om te uploaden
            </p>
            <p className="text-gray-400 text-sm mt-1">
              PNG, JPG of SVG · Max 2MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Section 3: Manual Branding Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🎨 Huisstijl instellingen
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrijfsnaam
              </label>
              <input
                type="text"
                value={branding.companyName || ""}
                onChange={(e) =>
                  setBranding((prev) => ({ ...prev, companyName: e.target.value || null }))
                }
                placeholder="Je bedrijfsnaam"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primaire kleur
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={branding.primaryColor || "#2563eb"}
                  onChange={(e) =>
                    setBranding((prev) => ({ ...prev, primaryColor: e.target.value }))
                  }
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.primaryColor || ""}
                  onChange={(e) =>
                    setBranding((prev) => ({ ...prev, primaryColor: e.target.value || null }))
                  }
                  placeholder="#2563eb"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            👁️ Preview
          </h2>
          <div
            className="border rounded-lg p-6"
            style={{ borderTopWidth: 4, borderTopColor: branding.primaryColor || "#2563eb" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {branding.logoUrl ? (
                  <img
                    src={branding.logoUrl}
                    alt="Logo"
                    className="h-8 max-w-[120px] object-contain"
                  />
                ) : (
                  <span className="font-bold text-lg" style={{ color: branding.primaryColor || "#2563eb" }}>
                    {branding.companyName || "Je Bedrijf"}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">Voorbeeld PDF header</span>
            </div>
            <div className="h-2 bg-gray-100 rounded w-3/4 mb-2" />
            <div className="h-2 bg-gray-100 rounded w-1/2" />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={saveBranding}
          disabled={saving}
          className="w-full bg-blue-600 text-white rounded-xl px-6 py-4 font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
        >
          {saving ? "Opslaan..." : "Branding opslaan"}
        </button>
      </div>
    </div>
  );
}
