"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Shield,
} from "lucide-react";

type ApiKeyData = {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  requestCount: number;
  revokedAt: string | null;
  createdAt: string;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    try {
      const res = await fetch("/api/v1/keys");
      const data = await res.json();
      setKeys(data.keys || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/v1/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (data.key) {
        setNewKey(data.key);
        setNewKeyName("");
        fetchKeys();
      }
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(id: string) {
    if (!confirm("Weet u zeker dat u deze API-sleutel wilt intrekken?")) return;
    try {
      await fetch(`/api/v1/keys?id=${id}`, { method: "DELETE" });
      fetchKeys();
    } catch {
      // ignore
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const activeKeys = keys.filter((k) => !k.revokedAt);
  const revokedKeys = keys.filter((k) => k.revokedAt);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Key className="w-8 h-8 text-blue-600" />
          API-sleutels
        </h1>
        <p className="text-gray-500 mt-1">
          Beheer API-sleutels voor de SnelRIE Partner API.
        </p>
        <Link
          href="/api-docs"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
        >
          <ExternalLink className="w-4 h-4" />
          API-documentatie bekijken
        </Link>
      </div>

      {/* New key banner */}
      {newKey && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">
                API-sleutel aangemaakt!
              </h3>
              <p className="text-sm text-green-700 mb-3">
                Kopieer deze sleutel nu — hij wordt niet meer getoond.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-green-200 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-900 break-all">
                  {newKey}
                </code>
                <button
                  onClick={() => copyToClipboard(newKey)}
                  className="inline-flex items-center gap-1.5 bg-green-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-green-700 transition flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Gekopieerd" : "Kopieer"}
                </button>
              </div>
            </div>
            <button
              onClick={() => setNewKey(null)}
              className="text-green-400 hover:text-green-600 text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Create new key */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Nieuwe API-sleutel aanmaken
          </button>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Nieuwe API-sleutel
            </h3>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naam
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="bijv. Arbodienst X integratie"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={createKey}
                disabled={creating || !newKeyName.trim()}
                className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                Aanmaken
              </button>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setNewKeyName("");
                }}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5"
              >
                Annuleren
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active keys */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : activeKeys.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">
              Actieve sleutels ({activeKeys.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {activeKeys.map((key) => (
              <div key={key.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{key.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <code className="text-xs text-gray-500 font-mono">
                      {key.keyPrefix}
                    </code>
                    <span className="text-xs text-gray-400">
                      Aangemaakt:{" "}
                      {new Date(key.createdAt).toLocaleDateString("nl-NL")}
                    </span>
                    <span className="text-xs text-gray-400">
                      {key.requestCount} verzoeken
                    </span>
                    {key.lastUsedAt && (
                      <span className="text-xs text-gray-400">
                        Laatst gebruikt:{" "}
                        {new Date(key.lastUsedAt).toLocaleDateString("nl-NL")}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => revokeKey(key.id)}
                  className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Intrekken
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center mb-6">
          <Key className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nog geen API-sleutels aangemaakt.</p>
        </div>
      )}

      {/* Revoked keys */}
      {revokedKeys.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-500">
              Ingetrokken sleutels ({revokedKeys.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {revokedKeys.map((key) => (
              <div key={key.id} className="p-4 flex items-center justify-between opacity-60">
                <div>
                  <p className="font-medium text-gray-500 line-through">{key.name}</p>
                  <code className="text-xs text-gray-400 font-mono">
                    {key.keyPrefix}
                  </code>
                </div>
                <span className="text-xs text-red-400">
                  Ingetrokken op{" "}
                  {new Date(key.revokedAt!).toLocaleDateString("nl-NL")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rate limit info */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-amber-900">Rate limiting</h4>
            <p className="text-sm text-amber-700 mt-1">
              Elke API-sleutel is beperkt tot 100 verzoeken per uur. Bij overschrijding
              ontvangt u een 429-fout met een Retry-After header.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
