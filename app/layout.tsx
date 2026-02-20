import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SnelRIE — Je RI&E in minuten, niet weken",
  description:
    "AI-gestuurde Risico-Inventarisatie & Evaluatie voor elk bedrijf in Nederland. Wettelijk verplicht, nu eenvoudig en betaalbaar. Vanaf €99.",
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
    description: "AI-gestuurde RI&E voor elk bedrijf. Vanaf €99.",
    url: "https://snelrie.nl",
    siteName: "SnelRIE",
    locale: "nl_NL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
