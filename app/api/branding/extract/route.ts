import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is vereist" }, { status: 400 });
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: "Ongeldige URL" }, { status: 400 });
    }

    // Fetch the page
    const response = await fetch(normalizedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SnelRIE/1.0; +https://snelrie.nl)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Kon website niet bereiken (${response.status})` },
        { status: 400 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract company name
    const companyName =
      $('meta[property="og:site_name"]').attr("content") ||
      $('meta[name="application-name"]').attr("content") ||
      $("title").text().split(/[|\-–—]/).at(0)?.trim() ||
      parsedUrl.hostname.replace("www.", "");

    // Extract logo/image
    const logoUrl =
      $('meta[property="og:image"]').attr("content") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      $('link[rel="apple-touch-icon-precomposed"]').attr("href") ||
      $('link[rel*="icon"][sizes="192x192"]').attr("href") ||
      $('link[rel*="icon"][sizes="180x180"]').attr("href") ||
      $('link[rel*="icon"][sizes="152x152"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="icon"]').attr("href") ||
      null;

    // Resolve relative URLs
    const resolvedLogoUrl = logoUrl
      ? logoUrl.startsWith("http")
        ? logoUrl
        : new URL(logoUrl, normalizedUrl).href
      : null;

    // Extract primary color
    const themeColor =
      $('meta[name="theme-color"]').attr("content") ||
      $('meta[name="msapplication-TileColor"]').attr("content") ||
      null;

    // Try to find dominant color from inline styles or CSS
    let primaryColor = themeColor;
    if (!primaryColor) {
      // Look for common CSS color patterns in inline styles
      const styleBlocks = $("style").text() + ($('link[rel="stylesheet"]').length > 0 ? "" : "");
      const colorMatches = styleBlocks.match(/#[0-9a-fA-F]{6}\b/g) || [];
      // Filter out common non-brand colors (white, black, grays)
      const brandColors = colorMatches.filter((c) => {
        const lower = c.toLowerCase();
        return (
          lower !== "#ffffff" &&
          lower !== "#000000" &&
          !lower.match(/^#([0-9a-f])\1{5}$/i) && // exclude single-char repeats like #333333
          !lower.match(/^#[def][def][def][def][def][def]$/i) // exclude very light grays
        );
      });
      // Count frequency
      const freq: Record<string, number> = {};
      brandColors.forEach((c) => {
        const key = c.toLowerCase();
        freq[key] = (freq[key] || 0) + 1;
      });
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        primaryColor = sorted[0][0];
      }
    }

    return NextResponse.json({
      companyName: companyName || null,
      logoUrl: resolvedLogoUrl,
      primaryColor: primaryColor || null,
      websiteUrl: normalizedUrl,
    });
  } catch (error) {
    console.error("Brand extract error:", error);
    return NextResponse.json(
      { error: "Kon branding niet ophalen" },
      { status: 500 }
    );
  }
}
