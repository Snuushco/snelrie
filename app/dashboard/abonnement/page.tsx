import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  CheckCircle,
  CreditCard,
  ArrowRight,
  AlertTriangle,
  Crown,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { SUBSCRIPTION_PRICING } from "@/lib/stripe";
import { getRemainingReports } from "@/lib/stripe-client";
import { SubscriptionActions } from "./SubscriptionActions";

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const checkoutStatus = params.checkout;

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const currentTier = (subscription?.tier || "STARTER") as keyof typeof SUBSCRIPTION_PRICING;
  const currentPlan = SUBSCRIPTION_PRICING[currentTier];
  const reports = await getRemainingReports(session.user.id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Abonnement</h1>
        <p className="text-gray-500 text-sm mt-1">
          Beheer je abonnement en bekijk je limieten
        </p>
      </div>

      {/* Checkout feedback */}
      {checkoutStatus === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-800">Abonnement geactiveerd!</p>
            <p className="text-sm text-green-600">
              Je {currentPlan.name} abonnement is succesvol gestart. Je hebt nu toegang tot alle functies.
            </p>
          </div>
        </div>
      )}

      {checkoutStatus === "cancelled" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-800">Betaling geannuleerd</p>
            <p className="text-sm text-yellow-600">
              Je betaling is geannuleerd. Je kunt op elk moment een nieuw abonnement kiezen.
            </p>
          </div>
        </div>
      )}

      {/* Past due warning */}
      {subscription?.status === "PAST_DUE" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">Betaling mislukt</p>
            <p className="text-sm text-red-600">
              Je laatste betaling is mislukt. Werk je betaalmethode bij om je abonnement actief te houden.
            </p>
          </div>
        </div>
      )}

      {/* Current plan card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentPlan.name}
              </h2>
              <p className="text-sm text-gray-500">Huidig abonnement</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {subscription?.billingCycle && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                {subscription.billingCycle === "YEARLY" ? "Jaarlijks" : "Maandelijks"}
              </span>
            )}
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                subscription?.status === "ACTIVE"
                  ? "bg-green-50 text-green-700"
                  : subscription?.status === "TRIALING"
                    ? "bg-blue-50 text-blue-700"
                    : subscription?.status === "PAST_DUE"
                      ? "bg-red-50 text-red-700"
                      : subscription?.status === "CANCELLED"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-gray-50 text-gray-700"
              }`}
            >
              {subscription?.status === "ACTIVE"
                ? "Actief"
                : subscription?.status === "TRIALING"
                  ? "Proefperiode"
                  : subscription?.status === "PAST_DUE"
                    ? "Betaling mislukt"
                    : subscription?.status === "CANCELLED"
                      ? "Opgezegd"
                      : "Gratis"}
            </span>
          </div>
        </div>

        {/* Period info */}
        {subscription?.currentPeriodEnd && (
          <p className="text-sm text-gray-500 mb-4">
            {subscription.cancelAtPeriodEnd
              ? "Eindigt op"
              : "Volgende factuurdatum"}:{" "}
            <span className="font-medium text-gray-700">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
        )}

        {/* Usage stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">Rapporten deze maand</p>
            <p className="text-lg font-semibold text-gray-900">
              {reports.unlimited
                ? "Onbeperkt"
                : `${reports.remaining} van ${reports.limit}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Locaties</p>
            <p className="text-lg font-semibold text-gray-900">
              {currentPlan.limits.locations === -1
                ? "Onbeperkt"
                : currentPlan.limits.locations}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">AI Chat</p>
            <p className="text-lg font-semibold text-gray-900">
              {currentPlan.limits.aiChat ? "✓" : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Branding</p>
            <p className="text-lg font-semibold text-gray-900">
              {currentPlan.limits.branding ? "✓" : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <SubscriptionActions
        hasSubscription={!!subscription?.stripeCustomerId}
        currentTier={currentTier}
        status={subscription?.status || null}
      />

      {/* Available plans */}
      <h2 className="text-lg font-semibold text-gray-900 mt-10 mb-4">
        {subscription?.stripeSubscriptionId ? "Upgrade je plan" : "Kies een abonnement"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.entries(SUBSCRIPTION_PRICING) as [string, typeof SUBSCRIPTION_PRICING.STARTER][]).map(
          ([tier, plan]) => {
            const isCurrent = tier === currentTier;
            const isHigher =
              ["STARTER", "PROFESSIONAL", "ENTERPRISE"].indexOf(tier) >
              ["STARTER", "PROFESSIONAL", "ENTERPRISE"].indexOf(currentTier);

            return (
              <div
                key={tier}
                className={`bg-white rounded-xl border-2 p-6 ${
                  isCurrent
                    ? "border-brand-300 bg-brand-50/30"
                    : tier === "PROFESSIONAL"
                      ? "border-brand-200 shadow-md"
                      : "border-gray-200"
                }`}
              >
                {tier === "PROFESSIONAL" && !isCurrent && (
                  <div className="text-xs font-semibold text-brand-600 mb-2 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Populairst
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-3">
                  {plan.monthly.label}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  of {plan.yearly.label}{" "}
                  <span className="text-green-600 font-medium">
                    ({plan.yearly.monthlyCost})
                  </span>
                </p>

                <ul className="mt-5 space-y-2.5">
                  {plan.features.slice(0, 5).map((feature) => (
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
                      className="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-brand-50 text-brand-600 cursor-not-allowed border border-brand-200"
                    >
                      Huidig plan
                    </button>
                  ) : (
                    <SubscriptionActions
                      mode="inline"
                      targetTier={tier}
                      isUpgrade={isHigher}
                      hasSubscription={!!subscription?.stripeCustomerId}
                    />
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>

      <p className="text-center text-sm text-gray-400 mt-8">
        Vragen over je abonnement? Mail naar{" "}
        <a href="mailto:info@snelrie.nl" className="text-brand-600 hover:underline">
          info@snelrie.nl
        </a>
      </p>
    </div>
  );
}
