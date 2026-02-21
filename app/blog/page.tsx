import Link from "next/link";
import { Shield, ArrowRight, Calendar, User } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — SnelRIE | Kennis over RI&E en arboveiligheid",
  description:
    "Praktische artikelen over de RI&E, arbowetgeving, risicobeoordeling en werkplekveiligheid. Tips voor MKB en compliance-professionals.",
  openGraph: {
    title: "Blog — SnelRIE",
    description: "Praktische artikelen over RI&E en arboveiligheid.",
    url: "https://snelrie.nl/blog",
    siteName: "SnelRIE",
    locale: "nl_NL",
    type: "website",
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main>
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-brand-600" />
            <span className="text-xl font-bold text-gray-900">
              Snel<span className="text-brand-600">RIE</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/blog" className="text-sm text-brand-600 font-medium">
              Blog
            </Link>
            <Link href="/scan" className="text-sm text-gray-600 hover:text-gray-900">
              Scan
            </Link>
          </div>
          <Link
            href="/scan"
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
          >
            Start Gratis Scan
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            SnelRIE <span className="text-brand-600">Blog</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Praktische kennis over de RI&E, arbowetgeving en werkplekveiligheid.
            Voor ondernemers en compliance-professionals.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-8"
            >
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.date).toLocaleDateString("nl-NL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {post.author}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-brand-600 transition"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4">{post.description}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1 text-brand-600 font-medium text-sm hover:text-brand-700 transition"
              >
                Lees meer <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-brand-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Klaar om je RI&E op te stellen?
          </h2>
          <p className="text-brand-100 mb-8">
            Start met een gratis scan en ontdek de risico&apos;s in jouw bedrijf.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-white text-brand-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-50 transition"
          >
            Start Gratis Scan
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-400" />
            <span className="text-white font-bold">SnelRIE</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/blog" className="hover:text-white transition">
              Blog
            </Link>
            <Link href="/voorwaarden" className="hover:text-white transition">
              Voorwaarden
            </Link>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} SnelRIE</p>
        </div>
      </footer>
    </main>
  );
}
