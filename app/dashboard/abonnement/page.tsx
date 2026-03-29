import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CheckCircle, CreditCard, ArrowRight } from "lucide-react";

const plans = [
  {
    tier: "STARTER",
    name: "Starter",
    price: "Gratis",
    description: "Voor kleine bedrijven die willen starten",
    features: [
      "1 gratis RI&E rapport",
      "Basis risico-analyse",
      "PDF download",
      "Email support",
    ],
    current: false,
  },
  {
    tier: "PROFESSIONAL",
    name: "Professional",
    price: "€29/maand",
    description: "Voor groeiende bedrijven",
    features: [
      "Onbeperkt rapporten",
      "Uitgebreide risico-analyse",
      "Plan van aanpak",
      "Branding & huisstijl",
      "Prioriteit support",
      "AI chat assistent",
    ],
    current: false,
    highlighted: true,
  },
  {
    tier: "ENTERPRISE",
    name: "Enterprise",
    price: "Op maat",
    description: "Voor grote organisaties",
    features: [
      "Alles van Professional",
      "Multi-locatie support",
      "API toegang",
      "Dedicated account manager",
      "Custom integraties",
      "SLA garantie",
    ],
    current: false,
  },
];

export default async function AbonnementPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const currentTier = subscription?.tier || "STARTER";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Abonnement</h1>
        <p className="text-gray-500 text-sm mt-1">
          Beheer je abonnement en upgrade wanneer je klaar bent
        </p>
      </div>

      {/* Current plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Huidig abonnement</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-blue-600">{currentTier}</span>
          {subscription?.status && (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                subscription.status === "ACTIVE"
                  ? "bg-green-50 text-green-700"
                  : subscription.status === "TRIALING"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {subscription.status === "ACTIVE"
                ? "Actief"
                : subscription.status === "TRIALING"
                  ? "Proefperiode"
                  : subscription.status === "CANCELLED"
                    ? "Opgezegd"
                    : "Achterstallig"}
            </span>
          )}
        </div>
        {subscription?.currentPeriodEnd && (
          <p className="text-sm text-gray-500 mt-2">
            Volgende factuurdatum:{" "}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.tier === currentTier;

          return (
            <div
              key={plan.tier}
              className={`bg-white rounded-xl border-2 p-6 ${
                plan.highlighted
                  ? "border-blue-500 shadow-lg relative"
                  : isCurrent
                    ? "border-blue-200"
                    : "border-gray-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Populairst
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
              <p className="text-3xl font-bold text-gray-900 mt-4">{plan.price}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 cursor-not-allowed"
                  >
                    Huidig plan
                  </button>
                ) : (
                  <button
                    disabled
                    className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                      plan.highlighted
                        ? "bg-blue-600 text-white opacity-75 cursor-not-allowed"
                        : "border border-gray-300 text-gray-700 opacity-75 cursor-not-allowed"
                    }`}
                    title="Stripe integratie komt in Fase 2"
                  >
                    {plan.tier === "ENTERPRISE" ? "Contact opnemen" : "Upgraden"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-gray-400 mt-8">
        Abonnement upgrades worden binnenkort beschikbaar via Stripe.
        Neem contact op via{" "}
        <a href="mailto:info@snelrie.nl" className="text-blue-600 hover:underline">
          info@snelrie.nl
        </a>{" "}
        voor Enterprise plannen.
      </p>
    </div>
  );
}
