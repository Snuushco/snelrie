"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

/**
 * Displays a live scan counter fetched from /api/stats/scans.
 * Shows "Al X+ scans uitgevoerd" as social proof.
 */
export function ScanCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/stats/scans")
      .then((res) => res.json())
      .then((data) => setCount(data.count))
      .catch(() => setCount(127)); // Fallback
  }, []);

  if (count === null) return null;

  return (
    <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 px-4 py-2 rounded-full text-sm font-medium">
      <Users className="h-4 w-4" />
      <span>Al <strong>{count}+</strong> scans uitgevoerd</span>
    </div>
  );
}
