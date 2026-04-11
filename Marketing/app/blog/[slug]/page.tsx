import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";

// ── Static params (required for output: "export") ─────────────────

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ── SEO metadata ──────────────────────────────────────────────────

const SITE_URL = "https://spendtab.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
  const ogImage = `${SITE_URL}/og-blog-default.png`;

  return {
    title: `${post.title} | SpendTab Blog`,
    description: post.description,
    keywords: post.tags.join(", "),
    authors: [{ name: post.author }],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonicalUrl,
      siteName: "SpendTab",
      type: "article",
      locale: "en_NG",
      publishedTime: post.date,
      modifiedTime: post.dateModified ?? post.date,
      authors: [post.author],
      tags: post.tags,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function authorInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// ── Page ──────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.dateModified ?? post.date,
    url: canonicalUrl,
    keywords: post.tags.join(", "),
    author: { "@type": "Person", name: post.author, jobTitle: post.authorTitle },
    publisher: {
      "@type": "Organization",
      name: "SpendTab",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    inLanguage: "en-NG",
    articleSection: post.category,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ── Article header bar ── */}
      <div className="border-b border-ibm-g20 bg-ibm-g10 px-6 py-3">
        <div className="max-w-[1120px] mx-auto flex items-center gap-2 text-[0.78rem] text-ibm-g50 font-mono-ibm">
          <Link href="https://spendtab.com" className="hover:text-ibm-black transition-colors">
            Home
          </Link>
          <span className="text-ibm-g30">›</span>
          <Link href="/blog" className="hover:text-ibm-black transition-colors">
            Blog
          </Link>
          <span className="text-ibm-g30">›</span>
          <span className="text-ibm-g70">{post.category}</span>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="max-w-[1120px] mx-auto px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0">

        {/* ── Main article ── */}
        <div className="lg:pr-16 lg:border-r lg:border-ibm-g20">

          {/* Category + title */}
          <Link
            href="/blog"
            className="font-mono-ibm text-[0.68rem] tracking-[0.14em] uppercase px-2 py-1 bg-ibm-g10 border border-ibm-g20 text-ibm-blue hover:bg-ibm-g20 transition-colors inline-block mb-5"
          >
            {post.category}
          </Link>

          <h1 className="text-[clamp(1.875rem,4vw,2.875rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-ibm-black mb-4">
            {post.title}
          </h1>
          <p className="text-[1.0625rem] text-ibm-g60 leading-[1.7] mb-8">
            {post.description}
          </p>

          {/* Byline */}
          <div className="flex flex-wrap items-center gap-4 pb-8 border-b border-ibm-g20 mb-10">
            <div
              className="w-9 h-9 bg-ibm-black text-white flex items-center justify-center font-mono-ibm text-[0.68rem] font-bold shrink-0"
              aria-hidden="true"
            >
              {authorInitials(post.author)}
            </div>
            <div className="flex-1">
              <div className="text-[0.875rem] font-semibold text-ibm-black">
                {post.author}
              </div>
              {post.authorTitle && (
                <div className="text-[0.78rem] text-ibm-g50 mt-0.5">
                  {post.authorTitle}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 font-mono-ibm text-[0.72rem] text-ibm-g50 shrink-0">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span className="w-1 h-1 bg-ibm-g30 rounded-full" aria-hidden="true" />
              <span>{post.readingTime} min read</span>
            </div>
          </div>

          {/* Article body — markdown HTML */}
          <article
            className="post-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-ibm-g20" aria-label="Tags">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono-ibm text-[0.68rem] tracking-[0.1em] uppercase px-3 py-1.5 bg-ibm-g10 border border-ibm-g20 text-ibm-g70"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <aside
            className="mt-12 bg-ibm-black text-white p-7 md:p-10"
            aria-label="Call to action"
          >
            <p className="font-mono-ibm text-[0.68rem] tracking-[0.18em] uppercase text-ibm-g50 mb-3">
              Ready to act?
            </p>
            <h3 className="text-xl font-semibold tracking-[-0.01em] mb-3">
              Take control of your finances.
            </h3>
            <p className="text-[0.9rem] text-ibm-g50 leading-[1.65] mb-6">
              SpendTab makes it easy to track expenses, manage budgets, and generate
              tax-ready reports — built specifically for Nigerian SMEs.
            </p>
            <a
              href="https://app.spendtab.com/signup"
              className="inline-block bg-ibm-blue text-white px-6 py-3.5 text-sm font-semibold hover:bg-ibm-blueh transition-colors"
            >
              Get started free
            </a>
          </aside>
        </div>

        {/* ── Sidebar ── */}
        <div className="hidden lg:block pl-12 pt-1">
          {/* Article info */}
          <div className="border border-ibm-g20 mb-8">
            <div className="font-mono-ibm text-[0.62rem] tracking-[0.16em] uppercase text-ibm-g50 px-5 py-3 border-b border-ibm-g20 bg-ibm-g10">
              Article info
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              <div>
                <div className="font-mono-ibm text-[0.62rem] text-ibm-g50 uppercase tracking-wider mb-1">Category</div>
                <div className="text-[0.84rem] font-medium text-ibm-black">{post.category}</div>
              </div>
              <div>
                <div className="font-mono-ibm text-[0.62rem] text-ibm-g50 uppercase tracking-wider mb-1">Published</div>
                <div className="text-[0.84rem] font-medium text-ibm-black">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </div>
              </div>
              <div>
                <div className="font-mono-ibm text-[0.62rem] text-ibm-g50 uppercase tracking-wider mb-1">Reading time</div>
                <div className="text-[0.84rem] font-mono-ibm font-medium text-ibm-black">{post.readingTime} min</div>
              </div>
              <div>
                <div className="font-mono-ibm text-[0.62rem] text-ibm-g50 uppercase tracking-wider mb-1">Author</div>
                <div className="text-[0.84rem] font-medium text-ibm-black">{post.author}</div>
                {post.authorTitle && (
                  <div className="text-[0.78rem] text-ibm-g50 mt-0.5">{post.authorTitle}</div>
                )}
              </div>
            </div>
          </div>

          {/* Back to blog */}
          <Link
            href="/blog"
            className="flex items-center gap-2 text-[0.84rem] font-medium text-ibm-g70 hover:text-ibm-black transition-colors mb-8 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
            Back to Blog
          </Link>

          {/* Sticky CTA */}
          <div className="sticky top-20 bg-ibm-blue text-white p-6">
            <p className="font-mono-ibm text-[0.62rem] tracking-[0.14em] uppercase text-white/60 mb-2">
              SpendTab
            </p>
            <h4 className="text-base font-semibold leading-[1.3] mb-3">
              Track every naira. Grow every business.
            </h4>
            <p className="text-[0.8rem] text-white/70 leading-[1.6] mb-5">
              From ₦3,500/month. Cancel anytime.
            </p>
            <a
              href="https://app.spendtab.com/signup"
              className="block text-center bg-white text-ibm-black text-sm font-semibold py-3 hover:bg-ibm-g10 transition-colors"
            >
              Get started free
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
