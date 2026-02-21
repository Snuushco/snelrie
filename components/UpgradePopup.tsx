"use client";

import { useState, useEffect } from "react";
import { X, Shield, FileText, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UpgradePopupProps {
  /** Show popup after this delay in ms (default: 2000) */
  delayMs?: number;
  /** Called when user closes the popup */
  onClose?: () => void;
}

export default function UpgradePopup({
  delayMs = 2000,
  onClose,
}: UpgradePopupProps) {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem("upgrade-popup-dismissed")) return;

    const timer = setTimeout(() => {
      setVisible(true);
      // Trigger entrance animation on next frame
      requestAnimationFrame(() => setAnimateIn(true));
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  const handleClose = () => {
    setAnimateIn(false);
    sessionStorage.setItem("upgrade-popup-dismissed", "1");
    setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 200);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        animateIn ? "bg-black/50 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transition-all duration-300 ${
          animateIn
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Sluiten"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-100 rounded-full mb-4">
            <Shield className="h-7 w-7 text-brand-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Waarom upgraden naar BASIS?
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Je gratis RI&E is klaar — maar er is meer.
          </p>
        </div>

        {/* 3 Key Benefits */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Volledig PDF-rapport
              </h3>
              <p className="text-xs text-gray-500">
                Download een professioneel rapport met álle risico's, maatregelen en plan van aanpak.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Alle risico's zichtbaar
              </h3>
              <p className="text-xs text-gray-500">
                De gratis versie toont max 3 risico's. Basis ontgrendelt het complete overzicht.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Wettelijk compliant
              </h3>
              <p className="text-xs text-gray-500">
                Voldoe aan de Arbowet met een volledige RI&E inclusief wettelijke verplichtingen.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/pricing"
          className="flex items-center justify-center gap-2 w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition"
          onClick={handleClose}
        >
          Zie pricing
          <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="text-center text-xs text-gray-400 mt-3">
          Vanaf €99 — eenmalig, geen abonnement
        </p>
      </div>
    </div>
  );
}
