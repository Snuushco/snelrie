"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, ArrowLeft, ArrowRight, Loader2, Clock } from "lucide-react";
import Link from "next/link";

const BRANCHES = [
  { value: "beveiliging", label: "Beveiliging" },
  { value: "horeca", label: "Horeca" },
  { value: "bouw", label: "Bouw" },
  { value: "kinderopvang", label: "Kinderopvang" },
  { value: "schoonmaak", label: "Schoonmaak" },
  { value: "detailhandel", label: "Detailhandel" },
  { value: "transport", label: "Transport & Logistiek" },
  { value: "zorg", label: "Zorg" },
  { value: "kantoor", label: "Kantoor & ICT" },
  { value: "overig", label: "Overig" },
];

const MEDEWERKER_RANGES = [
  { value: "1", label: "1–5 medewerkers" },
  { value: "6", label: "6–15 medewerkers" },
  { value: "16", label: "16–25 medewerkers" },
  { value: "30", label: "25–50 medewerkers" },
  { value: "75", label: "50+ medewerkers" },
];

// Branch-specific questions (dynamic based on selection)
const BRANCHE_VRAGEN: Record<string, { field: string; label: string }[]> = {
  beveiliging: [
    { field: "alleenWerken", label: "Werken uw medewerkers alleen (bijv. objectbeveiliging)?" },
    { field: "nachtwerk", label: "Zijn er nacht- of onregelmatige diensten?" },
    { field: "fysiekWerk", label: "Is er risico op agressie of fysiek geweld?" },
  ],
  horeca: [
    { field: "fysiekWerk", label: "Wordt er zwaar getild (vaten, kratten, meubilair)?" },
    { field: "gevaarlijkeStoffen", label: "Wordt er gewerkt met hete vloeistoffen of schoonmaakmiddelen?" },
    { field: "nachtwerk", label: "Zijn er avond- of nachtdiensten?" },
  ],
  bouw: [
    { field: "fysiekWerk", label: "Wordt er gewerkt op hoogte (steigers, daken)?" },
    { field: "gevaarlijkeStoffen", label: "Wordt er gewerkt met gevaarlijke stoffen (asbest, verf, oplosmiddelen)?" },
    { field: "buitenwerk", label: "Wordt er voornamelijk buiten gewerkt?" },
  ],
  kinderopvang: [
    { field: "fysiekWerk", label: "Wordt er veel getild (kinderen, speelgoed, meubilair)?" },
    { field: "beeldschermwerk", label: "Is er langdurig beeldschermwerk (administratie)?" },
    { field: "alleenWerken", label: "Werken medewerkers weleens alleen met een groep kinderen?" },
  ],
  schoonmaak: [
    { field: "gevaarlijkeStoffen", label: "Wordt er gewerkt met chemische schoonmaakmiddelen?" },
    { field: "fysiekWerk", label: "Is er sprake van zwaar fysiek werk (tillen, bukken)?" },
    { field: "alleenWerken", label: "Werken medewerkers vaak alleen?" },
  ],
  detailhandel: [
    { field: "fysiekWerk", label: "Wordt er zwaar getild (dozen, pallets)?" },
    { field: "alleenWerken", label: "Werken medewerkers weleens alleen in de winkel?" },
    { field: "beeldschermwerk", label: "Is er langdurig kassawerk of beeldschermwerk?" },
  ],
  transport: [
    { field: "fysiekWerk", label: "Wordt er zwaar getild bij laden/lossen?" },
    { field: "nachtwerk", label: "Zijn er nachtritten of onregelmatige diensten?" },
    { field: "alleenWerken", label: "Rijden chauffeurs alleen?" },
  ],
  zorg: [
    { field: "fysiekWerk", label: "Wordt er getild of verplaatst (patiënten, bedden)?" },
    { field: "nachtwerk", label: "Zijn er nacht- of weekenddiensten?" },
    { field: "gevaarlijkeStoffen", label: "Wordt er gewerkt met medicijnen of biologisch materiaal?" },
  ],
  kantoor: [
    { field: "beeldschermwerk", label: "Werken medewerkers >4 uur per dag achter een beeldscherm?" },
    { field: "alleenWerken", label: "Werken medewerkers veel vanuit huis?" },
    { field: "fysiekWerk", label: "Is de werkplek ergonomisch ingericht (bureau, stoel, beeldscherm)?" },
  ],
  overig: [
    { field: "fysiekWerk", label: "Is er sprake van zwaar fysiek werk?" },
    { field: "gevaarlijkeStoffen", label: "Wordt er gewerkt met gevaarlijke stoffen?" },
    { field: "beeldschermwerk", label: "Is er langdurig beeldschermwerk (>2 uur/dag)?" },
  ],
};

// Smart defaults per branche (auto-filled based on industry)
const BRANCHE_DEFAULTS: Record<string, Record<string, string>> = {
  beveiliging: { alleenWerken: "ja", nachtwerk: "ja" },
  horeca: { fysiekWerk: "ja", nachtwerk: "ja" },
  bouw: { fysiekWerk: "ja", buitenwerk: "ja" },
  kinderopvang: { fysiekWerk: "ja" },
  schoonmaak: { gevaarlijkeStoffen: "ja", fysiekWerk: "ja" },
  detailhandel: {},
  transport: { fysiekWerk: "ja", nachtwerk: "ja" },
  zorg: { fysiekWerk: "ja", nachtwerk: "ja" },
  kantoor: { beeldschermwerk: "ja" },
  overig: {},
};

type FormData = {
  branche: string;
  aantalMedewerkers: string;
  // Dynamic ja/nee fields
  [key: string]: string;
};

export default function ScanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTier = searchParams.get("tier") || "GRATIS";

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    branche: "",
    aantalMedewerkers: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // When branche changes, apply smart defaults
    if (field === "branche") {
      const defaults = BRANCHE_DEFAULTS[value] || {};
      setForm((prev) => ({
        ...prev,
        [field]: value,
        // Reset all dynamic fields, then apply defaults
        gevaarlijkeStoffen: defaults.gevaarlijkeStoffen || "nee",
        beeldschermwerk: defaults.beeldschermwerk || "nee",
        fysiekWerk: defaults.fysiekWerk || "nee",
        buitenwerk: defaults.buitenwerk || "nee",
        nachtwerk: defaults.nachtwerk || "nee",
        alleenWerken: defaults.alleenWerken || "nee",
      }));
    }
  };

  const brancheVragen = form.branche ? (BRANCHE_VRAGEN[form.branche] || BRANCHE_VRAGEN.overig) : [];

  const canProceed = () => {
    switch (step) {
      case 1:
        return form.branche && form.aantalMedewerkers;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rie/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bedrijfsnaam: form.branche + "-bedrijf", // Auto-generated placeholder
          branche: form.branche,
          aantalMedewerkers: parseInt(form.aantalMedewerkers),
          aantalLocaties: 1,
          tier: preselectedTier,
          // Pass all dynamic fields
          gevaarlijkeStoffen: form.gevaarlijkeStoffen || "nee",
          beeldschermwerk: form.beeldschermwerk || "nee",
          fysiekWerk: form.fysiekWerk || "nee",
          buitenwerk: form.buitenwerk || "nee",
          nachtwerk: form.nachtwerk || "nee",
          alleenWerken: form.alleenWerken || "nee",
          bhvAanwezig: "nee",
          preventiemedewerker: "nee",
          eerderRie: "nee",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Er ging iets mis");
      }

      const { reportId } = await res.json();

      // Trigger AI generation in background
      fetch("/api/rie/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      }).catch(() => {});

      router.push(`/scan/resultaat/${reportId}`);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-600" />
            <span className="text-lg font-bold">
              Snel<span className="text-brand-600">RIE</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            Stap {step} van 2 · Nog ~1 minuut
          </div>
        </div>
      </nav>

      {/* Visual step indicator */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: "Uw bedrijf" },
              { num: 2, label: "Situatie" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center flex-1 last:flex-none max-w-[200px]">
                <div className="flex flex-col items-center w-full">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step > s.num
                        ? "bg-green-500 text-white"
                        : step === s.num
                        ? "bg-brand-600 text-white ring-4 ring-brand-100"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s.num ? "✓" : s.num}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${step >= s.num ? "text-gray-900" : "text-gray-400"}`}>
                    {s.label}
                  </span>
                </div>
                {i < 1 && (
                  <div className={`flex-1 h-0.5 mx-3 mt-[-12px] ${step > s.num ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step 1: Branche + Medewerkers */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Over uw bedrijf
              </h2>
              <p className="text-gray-600 mt-1">
                Twee vragen — dan genereren we uw risico-overzicht
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  In welke branche bent u actief? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BRANCHES.map((b) => (
                    <label
                      key={b.value}
                      className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition text-sm font-medium text-center ${
                        form.branche === b.value
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="branche"
                        value={b.value}
                        checked={form.branche === b.value}
                        onChange={(e) => updateField("branche", e.target.value)}
                        className="sr-only"
                      />
                      {b.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hoeveel medewerkers heeft u? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {MEDEWERKER_RANGES.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition text-sm font-medium ${
                        form.aantalMedewerkers === r.value
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="medewerkers"
                        value={r.value}
                        checked={form.aantalMedewerkers === r.value}
                        onChange={(e) => updateField("aantalMedewerkers", e.target.value)}
                        className="sr-only"
                      />
                      {r.label}
                    </label>
                  ))}
                </div>
              </div>

              {parseInt(form.aantalMedewerkers) > 25 && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                  <p className="text-amber-800 text-sm font-medium">
                    ⚠️ Let op: voor bedrijven met meer dan 25 medewerkers moet de RI&E getoetst
                    worden door een gecertificeerde arbodeskundige.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Branch-specific questions */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Uw werksituatie
              </h2>
              <p className="text-gray-600 mt-1">
                We hebben slimme standaardwaarden ingevuld op basis van uw branche. Pas aan waar nodig.
              </p>
            </div>

            <div className="space-y-4">
              {brancheVragen.map(({ field, label }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <div className="flex gap-4">
                    {["ja", "nee"].map((val) => (
                      <label
                        key={val}
                        className={`flex-1 text-center py-3 rounded-lg border cursor-pointer transition font-medium ${
                          (form[field] || "nee") === val
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={field}
                          value={val}
                          checked={(form[field] || "nee") === val}
                          onChange={(e) => updateField(field, e.target.value)}
                          className="sr-only"
                        />
                        {val === "ja" ? "Ja" : "Nee"}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Reassurance */}
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-sm text-brand-800">
              <p className="font-medium">🔒 Geen account of email nodig</p>
              <p className="text-brand-600 mt-1">
                U ziet direct uw risico-overzicht. Gratis en vrijblijvend.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Vorige
            </button>
          ) : (
            <div />
          )}

          {step < 2 ? (
            <button
              onClick={() => canProceed() && setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Volgende
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="flex items-center gap-2 px-8 py-4 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg shadow-brand-600/25"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Wordt gegenereerd...
                </>
              ) : (
                <>
                  Genereer mijn RI&E — Gratis
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
