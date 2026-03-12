import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "SnelRIE — Je RI&E in minuten";
  const description =
    searchParams.get("description") ||
    "AI-gestuurde Risico-Inventarisatie & Evaluatie voor elk bedrijf.";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #ecfdf5 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#2563eb",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            S
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#111827",
            }}
          >
            Snel
            <span style={{ color: "#2563eb" }}>RIE</span>
          </span>
        </div>
        <div
          style={{
            fontSize: "48px",
            fontWeight: "800",
            color: "#111827",
            lineHeight: 1.2,
            marginBottom: "20px",
            maxWidth: "900px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "22px",
            color: "#6b7280",
            lineHeight: 1.5,
            maxWidth: "800px",
          }}
        >
          {description}
        </div>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "18px",
            color: "#9ca3af",
          }}
        >
          snelrie.nl
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
