"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle, AlertCircle, Pen, Trash2, Loader2,
  Send, Copy, ArrowLeft, Shield,
} from "lucide-react";

type SignatureInfo = {
  role: string;
  name: string;
  signedAt: string;
};

type ReportInfo = {
  id: string;
  bedrijfsnaam: string;
  tier: string;
  signatures: SignatureInfo[];
};

export default function OndertekeningDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [report, setReport] = useState<ReportInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Signing state
  const [signingAs, setSigningAs] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [functie, setFunctie] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Sign link state
  const [sendingLink, setSendingLink] = useState<string | null>(null);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkResult, setLinkResult] = useState<{ role: string; url: string } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    loadReport();
  }, [id]);

  async function loadReport() {
    try {
      const res = await fetch(`/api/rie/${id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Get signatures from the report
      const sigs = data.generatedContent?.signatures || [];
      setReport({
        id: data.id,
        bedrijfsnaam: data.bedrijfsnaam,
        tier: data.tier,
        signatures: sigs,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Fetch actual signatures from report
  useEffect(() => {
    if (!report) return;
    // Re-fetch to get updated signatures
    fetch(`/api/rie/${id}`)
      .then((r) => r.json())
      .then((data) => {
        // Signatures are stored at report level, not in generatedContent
        // We need a separate endpoint or check the full report
      })
      .catch(() => {});
  }, [signSuccess]);

  // Canvas setup
  useEffect(() => {
    if (!canvasRef.current || !signingAs) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [signingAs]);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDrawing(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    setHasDrawn(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDrawing() { setIsDrawing(false); }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }

  async function handleSign() {
    if (!signingAs || !name.trim() || !functie.trim() || !hasDrawn) return;
    setSubmitting(true);
    try {
      const canvas = canvasRef.current!;
      const signatureImage = canvas.toDataURL("image/png");
      const res = await fetch(`/api/rie/${id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureImage, name: name.trim(), functie: functie.trim(), role: signingAs }),
      });
      const data = await res.json();
      if (data.success) {
        setSignSuccess(true);
        setSigningAs(null);
        // Reload report to get updated signatures
        loadReport();
      } else {
        setError(data.error);
      }
    } catch {
      setError("Ondertekenen mislukt");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendLink(role: string) {
    if (!linkEmail.trim()) return;
    setSendingLink(role);
    try {
      const res = await fetch(`/api/rie/${id}/sign-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email: linkEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setLinkResult({ role, url: data.signUrl });
        setLinkEmail("");
      } else {
        setError(data.error);
      }
    } catch {
      setError("Link aanmaken mislukt");
    } finally {
      setSendingLink(null);
    }
  }

  function copyLink() {
    if (!linkResult) return;
    navigator.clipboard.writeText(linkResult.url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  const ROLE_CONFIG = [
    { role: "werkgever", label: "Werkgever", icon: "👔" },
    { role: "preventiemedewerker", label: "Preventiemedewerker", icon: "🦺" },
    { role: "arbodeskundige", label: "Arbodeskundige", icon: "🔬" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ondertekening</h1>
          <p className="text-gray-500 text-sm mt-1">{report.bedrijfsnaam}</p>
        </div>
      </div>

      {signSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <p className="text-green-800 text-sm">Rapport succesvol ondertekend!</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Signature status cards */}
      <div className="space-y-4 mb-8">
        {ROLE_CONFIG.map(({ role, label, icon }) => {
          const sig = report.signatures.find((s) => s.role === role);
          return (
            <div
              key={role}
              className={`bg-white rounded-xl border p-5 ${
                sig ? "border-green-200" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{label}</h3>
                    {sig ? (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Ondertekend door {sig.name} op {sig.signedAt}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">Nog niet ondertekend</p>
                    )}
                  </div>
                </div>

                {!sig && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSigningAs(role);
                        setName("");
                        setFunctie("");
                        setHasDrawn(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                    >
                      <Pen className="w-3.5 h-3.5" />
                      Zelf ondertekenen
                    </button>
                    <button
                      onClick={() => {
                        setSendingLink(sendingLink === role ? null : role);
                        setLinkEmail("");
                        setLinkResult(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Verzoek versturen
                    </button>
                  </div>
                )}
              </div>

              {/* Send link form */}
              {sendingLink === role && !sig && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={linkEmail}
                      onChange={(e) => setLinkEmail(e.target.value)}
                      placeholder="E-mailadres ontvanger"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <button
                      onClick={() => handleSendLink(role)}
                      disabled={!linkEmail.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      Versturen
                    </button>
                  </div>
                  {linkResult?.role === role && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800 mb-2">Link verstuurd en aangemaakt!</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={linkResult.url}
                          className="flex-1 px-2 py-1.5 bg-white border border-green-200 rounded text-xs text-gray-600"
                        />
                        <button
                          onClick={copyLink}
                          className="px-2 py-1.5 bg-white border border-green-200 rounded text-xs hover:bg-green-50 transition flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          {linkCopied ? "Gekopieerd!" : "Kopiëren"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Signing modal / inline form */}
      {signingAs && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Ondertekenen als{" "}
              {ROLE_CONFIG.find((r) => r.role === signingAs)?.label}
            </h2>
            <button
              onClick={() => setSigningAs(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Naam</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Uw volledige naam"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Functie</label>
              <input
                type="text"
                value={functie}
                onChange={(e) => setFunctie(e.target.value)}
                placeholder="Uw functie"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Datum</label>
              <input
                type="text"
                disabled
                value={new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Pen className="w-4 h-4" />
                  Handtekening
                </label>
                {hasDrawn && (
                  <button onClick={clearCanvas} className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" />
                    Wissen
                  </button>
                )}
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  className="w-full touch-none cursor-crosshair"
                  style={{ height: 140 }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              {!hasDrawn && (
                <p className="text-xs text-gray-400 mt-1 text-center">
                  Teken uw handtekening in het vak hierboven
                </p>
              )}
            </div>
            <button
              onClick={handleSign}
              disabled={submitting || !name.trim() || !functie.trim() || !hasDrawn}
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
          </div>
        </div>
      )}

      {/* Signing completion info */}
      {(() => {
        const signedCount = report.signatures.length;
        const requiredRoles = ["werkgever", "preventiemedewerker"];
        const allRequired = requiredRoles.every((r) =>
          report.signatures.some((s) => s.role === r)
        );
        return (
          <div className={`rounded-xl border p-4 ${allRequired ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
            <p className={`text-sm font-medium ${allRequired ? "text-green-800" : "text-gray-600"}`}>
              {allRequired
                ? "✅ Alle verplichte handtekeningen zijn gezet. Het rapport is volledig ondertekend."
                : `${signedCount} van ${requiredRoles.length} verplichte handtekeningen gezet.`}
            </p>
          </div>
        );
      })()}
    </div>
  );
}
