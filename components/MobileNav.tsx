"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileNav({ sectorHref, ctaLabel }: { sectorHref: string; ctaLabel: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-600 hover:text-gray-900"
        aria-label={open ? "Menu sluiten" : "Menu openen"}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="flex flex-col px-4 py-4 space-y-3">
            <a
              href="#hoe-werkt-het"
              onClick={() => setOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900 py-2"
            >
              Hoe werkt het
            </a>
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900 py-2"
            >
              Prijzen
            </Link>
            <a
              href="#faq"
              onClick={() => setOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900 py-2"
            >
              FAQ
            </a>
            <Link
              href="/checklist"
              onClick={() => setOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900 py-2"
            >
              Gratis Checklist
            </Link>
            <Link
              href="/blog"
              onClick={() => setOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900 py-2"
            >
              Blog
            </Link>
            <Link
              href={sectorHref}
              onClick={() => setOpen(false)}
              className="bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 transition text-center"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
