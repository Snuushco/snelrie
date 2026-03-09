import Link from "next/link";
import { Shield, ArrowLeft, Calendar, User, ArrowRight } from "lucide-react";
import { getAllPosts, getPostBySlug, markdownToHtml } from "@/lib/blog";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — SnelRIE Blog`,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://snelrie.nl/blog/${post.slug}`,
      siteName: "SnelRIE",
      locale: "nl_NL",
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: post.ogImage ? [post.ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const htmlContent = await markdownToHtml(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "SnelRIE",
      url: "https://snelrie.nl",
    },
    mainEntityOfPage: `https://snelrie.nl/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
  };

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
            <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900">
              Blog
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

      {/* Article */}
      <article className="pt-24 sm:pt-28 lg:pt-32 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-brand-600 text-sm font-medium mb-5 sm:mb-6 hover:text-brand-700 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Terug naar blog
          </Link>

          <header className="mb-8 sm:mb-10">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.date).toLocaleDateString("nl-NL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1">
                <User className="h-4 w-4" />
                {post.author}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 text-balance leading-tight">
              {post.title}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 leading-7 sm:leading-8 max-w-3xl">
              {post.description}
            </p>
          </header>

          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* CTA */}
          <div className="mt-10 sm:mt-12 rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-brand-100/60 p-6 sm:p-8 lg:p-10 text-center shadow-sm">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Klaar om je RI&E op te stellen?
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-2xl mx-auto leading-7">
              Start met een gratis scan en ontdek de risico&apos;s in jouw bedrijf.
              In 5 minuten klaar.
            </p>
            <Link
              href="/scan"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-brand-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition"
            >
              Start Gratis Scan
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-400" />
            <span className="text-white font-bold">SnelRIE</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/blog" className="hover:text-white transition">Blog</Link>
            <Link href="/voorwaarden" className="hover:text-white transition">Voorwaarden</Link>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} SnelRIE</p>
        </div>
      </footer>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
