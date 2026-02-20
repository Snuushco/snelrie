"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
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

type FormData = {
  // Step 1
  bedrijfsnaam: string;
  branche: string;
  aantalMedewerkers: string;
  aantalLocaties: string;
  // Step 2
  typeWerkzaamheden: string[];
  gevaarlijkeStoffen: string;
  beeldschermwerk: string;
  fysiekWerk: string;
  buitenwerk: string;
  nachtwerk: string;
  alleenWerken: string;
  // Step 3
  bhvAanwezig: string;
  aantalBhvers: string;
  preventiemedewerker: string;
  eerderRie: string;
  laatsteRie: string;
  // Step 4
  email: string;
  naam: string;
};

const initialForm: FormData = {
  bedrijfsnaam: "",
  branche: "",
  aantalMedewerkers: "",
  aantalLocaties: "1",
  typeWerkzaamheden: [],
  gevaarlijkeStoffen: "nee",
  beeldschermwerk: "nee",
  fysiekWerk: "nee",
  buitenwerk: "nee",
  nachtwerk: "nee",
  alleenWerken: "nee",
  bhvAanwezig: "nee",
  aantalBhvers: "",
  preventiemedewerker: "nee",
  eerderRie: "nee",
  laatsteRie: "",
  email: "",
  naam: "",
};

const werkzaamhedenOpties = [
  "Kantoorwerk / beeldschermwerk",
  "Fysiek / handmatig werk",
  "Werken op hoogte",
  "Werken met machines",
  "Werken met gevaarlijke stoffen",
  "Klantcontact / publiekswerk",
  "Buitenwerk",
  "Rijden / transport",
  "Nachtwerk / onregelmatige diensten",
  "Alleen werken",
];

export default function ScanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTier = searchParams.get("tier") || "GRATIS";

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleWerkzaamheid = (item: string) => {
    setForm((prev) => ({
      ...prev,
      typeWerkzaamheden: prev.typeWerkzaamheden.includes(item)
        ? prev.typeWerkzaamheden.filter((w) => w !== item)
        : [...prev.typeWerkzaamheden, item],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return form.bedrijfsnaam && form.branche && form.aantalMedewerkers;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return form.email && form.email.includes("@");
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
          ...form,
          aantalMedewerkers: parseInt(form.aantalMedewerkers),
          aantalLocaties: parseInt(form.aantalLocaties) || 1,
          tier: preselectedTier,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Er ging iets mis");
      }

      const { reportId } = await res.json();

      // Trigger AI generation in background (separate route with its own 60s timeout)
      fetch("/api/rie/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      }).catch(() => {}); // fire-and-forget

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
          <div className="text-sm text-gray-500">
            Stap {step} van 4
          </div>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-1">
        <div
          className="bg-brand-600 h-1 transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step 1: Bedrijfsgegevens */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Uw bedrijfsgegevens
              </h2>
              <p className="text-gray-600 mt-1">
                Vertel ons over uw organisatie
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrijfsnaam *
                </label>
                <input
                  type="text"
                  value={form.bedrijfsnaam}
                  onChange={(e) => updateField("bedrijfsnaam", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  placeholder="Uw bedrijfsnaam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branche *
                </label>
                <select
                  value={form.branche}
                  onChange={(e) => updateField("branche", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                >
                  <option value="">Selecteer uw branche</option>
                  {BRANCHES.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aantal medewerkers *
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.aantalMedewerkers}
                  onChange={(e) =>
                    updateField("aantalMedewerkers", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  placeholder="Bijv. 15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aantal locaties
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.aantalLocaties}
                  onChange={(e) =>
                    updateField("aantalLocaties", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  placeholder="1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Werkplek */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Werkplekgegevens
              </h2>
              <p className="text-gray-600 mt-1">
                Wat voor werkzaamheden worden er verricht?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type werkzaamheden (selecteer alle die van toepassing zijn)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {werkzaamhedenOpties.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        form.typeWerkzaamheden.includes(opt)
                          ? "border-brand-500 bg-brand-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.typeWerkzaamheden.includes(opt)}
                        onChange={() => toggleWerkzaamheid(opt)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          form.typeWerkzaamheden.includes(opt)
                            ? "bg-brand-600 border-brand-600"
                            : "border-gray-300"
                        }`}
                      >
                        {form.typeWerkzaamheden.includes(opt) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {[
                { field: "gevaarlijkeStoffen" as const, label: "Wordt er gewerkt met gevaarlijke stoffen?" },
                { field: "beeldschermwerk" as const, label: "Is er langdurig beeldschermwerk (>2 uur per dag)?" },
                { field: "fysiekWerk" as const, label: "Is er sprake van zwaar fysiek werk (tillen, duwen, trekken)?" },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <div className="flex gap-4">
                    {["ja", "nee"].map((val) => (
                      <label
                        key={val}
                        className={`flex-1 text-center py-3 rounded-lg border cursor-pointer transition font-medium ${
                          form[field] === val
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={field}
                          value={val}
                          checked={form[field] === val}
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
          </div>
        )}

        {/* Step 3: Huidige situatie */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Huidige situatie
              </h2>
              <p className="text-gray-600 mt-1">
                Wat heeft u al geregeld op het gebied van veiligheid?
              </p>
            </div>

            <div className="space-y-4">
              {[
                { field: "bhvAanwezig" as const, label: "Heeft u BHV'ers (bedrijfshulpverlening) in dienst?" },
                { field: "preventiemedewerker" as const, label: "Is er een preventiemedewerker aangewezen?" },
                { field: "eerderRie" as const, label: "Is er eerder een RI&E uitgevoerd?" },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <div className="flex gap-4">
                    {["ja", "nee"].map((val) => (
                      <label
                        key={val}
                        className={`flex-1 text-center py-3 rounded-lg border cursor-pointer transition font-medium ${
                          form[field] === val
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={field}
                          value={val}
                          checked={form[field] === val}
                          onChange={(e) => updateField(field, e.target.value)}
                          className="sr-only"
                        />
                        {val === "ja" ? "Ja" : "Nee"}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {form.bhvAanwezig === "ja" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aantal BHV'ers
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.aantalBhvers}
                    onChange={(e) => updateField("aantalBhvers", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
              )}

              {form.eerderRie === "ja" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wanneer was de laatste RI&E?
                  </label>
                  <input
                    type="text"
                    value={form.laatsteRie}
                    onChange={(e) => updateField("laatsteRie", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                    placeholder="Bijv. 2022 of 'meer dan 3 jaar geleden'"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Contact + betaling */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Uw gegevens
              </h2>
              <p className="text-gray-600 mt-1">
                We sturen het rapport naar uw e-mailadres
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naam
                </label>
                <input
                  type="text"
                  value={form.naam}
                  onChange={(e) => updateField("naam", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  placeholder="Uw naam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mailadres *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  placeholder="uw@email.nl"
                />
              </div>
            </div>

            {/* Tier info */}
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">
                  {preselectedTier === "GRATIS" && "Gratis Scan"}
                  {preselectedTier === "BASIS" && "Basis RI&E"}
                  {preselectedTier === "PROFESSIONAL" && "Professional RI&E"}
                  {preselectedTier === "ENTERPRISE" && "Enterprise RI&E"}
                </span>
                <span className="text-2xl font-extrabold text-brand-600">
                  {preselectedTier === "GRATIS" && "€0"}
                  {preselectedTier === "BASIS" && "€99"}
                  {preselectedTier === "PROFESSIONAL" && "€299"}
                  {preselectedTier === "ENTERPRISE" && "€499"}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {preselectedTier === "GRATIS" &&
                  "U ontvangt een preview met de eerste 3 risico's. Upgrade op elk moment."}
                {preselectedTier !== "GRATIS" &&
                  "Na het genereren van uw RI&E wordt u doorgestuurd naar de betaalpagina."}
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

          {step < 4 ? (
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
              className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  RI&E wordt gegenereerd...
                </>
              ) : (
                <>
                  Genereer mijn RI&E
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
