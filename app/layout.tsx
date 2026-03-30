import type { Metadata } from "next";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import SessionProvider from "@/components/SessionProvider";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import "./globals.css";

export const metadata: Metadata = {
  title: "SnelRIE — Je RI&E in minuten, niet weken",
  description:
    "AI-gestuurde Risico-Inventarisatie & Evaluatie voor elk bedrijf in Nederland. Wettelijk verplicht, nu eenvoudig en betaalbaar. Vanaf €19/mnd.",
  keywords: [
    "RI&E",
    "risico-inventarisatie",
    "evaluatie",
    "arbowet",
    "veiligheid",
    "werkplek",
    "plan van aanpak",
    "arbo",
    "MKB",
  ],
  openGraph: {
    title: "SnelRIE — Je RI&E in minuten, niet weken",
    description: "AI-gestuurde RI&E voor elk bedrijf. Vanaf €19/mnd.",
    url: "https://snelrie.nl",
    siteName: "SnelRIE",
    locale: "nl_NL",
    type: "website",
    images: [
      {
        url: "https://snelrie.nl/og",
        width: 1200,
        height: 630,
        alt: "SnelRIE — Je RI&E in minuten, niet weken",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SnelRIE — Je RI&E in minuten, niet weken",
    description: "AI-gestuurde RI&E voor elk bedrijf. Vanaf €19/mnd.",
    images: ["https://snelrie.nl/og"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="min-h-screen flex flex-col">
        <SessionProvider>
          <GoogleAnalytics />
          {children}
          <ExitIntentPopup />
        </SessionProvider>
      </body>
    </html>
  );
}
