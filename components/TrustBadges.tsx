import { CheckCircle2 } from "lucide-react";

const badges = [
  "Voldoet aan Arbowet",
  "AI-gestuurd",
  "Binnen 10 minuten klaar",
  "Geen verborgen kosten",
];

export function TrustBadges() {
  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
      {badges.map((badge) => (
        <div
          key={badge}
          className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm"
        >
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span>{badge}</span>
        </div>
      ))}
    </div>
  );
}
