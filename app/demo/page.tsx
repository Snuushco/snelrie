import { Suspense } from "react";
import type { Metadata } from "next";
import DemoFlow from "./demo-flow";

export const metadata: Metadata = {
  title: "Demo — Ontdek uw RI&E-risico's in 5 vragen | SnelRIE",
  description:
    "Beantwoord 5 korte vragen en bekijk direct een AI-gegenereerde preview van uw Risico-Inventarisatie & Evaluatie. Gratis en vrijblijvend.",
  openGraph: {
    title: "Demo — Ontdek uw RI&E-risico's in 5 vragen | SnelRIE",
    description:
      "Beantwoord 5 korte vragen en bekijk direct een AI-gegenereerde preview van uw RI&E.",
    url: "https://snelrie.nl/demo",
  },
};

export default function DemoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <DemoFlow />
    </Suspense>
  );
}
