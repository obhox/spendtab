import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

// ── SEO ──────────────────────────────────────────────────────────

const SITE_URL = "https://spendtab.com";

export const metadata: Metadata = {
  title: "Blog | SpendTab — Finance Tips for Nigerian SMEs",
  description:
    "Practical guides on expense tracking, VAT compliance, cash flow management, and bookkeeping for Nigerian small businesses and entrepreneurs.",
  keywords:
    "Nigerian business finance blog, SME accounting tips Nigeria, VAT Nigeria, cash flow management, expense tracking Nigeria, bookkeeping small business",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "SpendTab Blog — Finance Tips for Nigerian SMEs",
    description:
      "Practical guides on expense tracking, VAT compliance, cash flow management, and bookkeeping for Nigerian entrepreneurs.",
    url: `${SITE_URL}/blog`,
    siteName: "SpendTab",
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendTab Blog — Finance Tips for Nigerian SMEs",
    description: "Practical finance guides built for Nigerian business owners and SMEs.",
  },
};

// ── Helpers ───────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Page ──────────────────────────────────────────────────────────

export default async function BlogIndexPage() {
  const posts = await getAllPosts();
  const categories = Array.from(new Set(posts.map((p) => p.category)));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "SpendTab Blog",
    description: "Finance guides, tax tips, and business advice for Nigerian SMEs and entrepreneurs.",
    url: `${SITE_URL}/blog`,
    publisher: {
      "@type": "Organization",
      name: "SpendTab",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.dateModified ?? post.date,
      url: `${SITE_URL}/blog/${post.slug}`,
      author: { "@type": "Person", name: post.author },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section className="border-b border-ibm-g20 pt-16 pb-0 px-6">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end pb-12">
            <div>
              <p className="font-mono-ibm text-[0.68rem] tracking-[0.18em] uppercase font-medium text-ibm-blue flex items-center gap-2.5 mb-6">
                <span className="w-0.5 h-3.5 bg-ibm-blue" />
                SpendTab Blog
              </p>
              <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.022em] text-ibm-black">
                Finance made simple<br />
                for Nigerian<br />
                <span className="text-ibm-blue">businesses.</span>
              </h1>
            </div>
            <div className="pb-2">
              <p className="text-[1.0625rem] text-ibm-g70 leading-[1.7] max-w-[400px]">
                Practical guides on bookkeeping, VAT, cash flow, and growing your
                business — written for SME owners, not accountants.
              </p>
              <div className="flex items-center gap-2 mt-6 text-[0.78rem] text-ibm-g50">
                <span className="font-mono-ibm">{posts.length} articles</span>
                <span className="text-ibm-g20">·</span>
                <span className="font-mono-ibm">{categories.length} categories</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category filter ── */}
      <div className="bg-ibm-g10 border-b border-ibm-g20 px-6 py-4">
        <div className="max-w-[1120px] mx-auto flex items-center gap-2 flex-wrap">
          <span className="font-mono-ibm text-[0.68rem] text-ibm-g50 uppercase tracking-wider mr-2">
            Filter
          </span>
          <button className="font-mono-ibm text-[0.68rem] tracking-[0.1em] uppercase px-3 py-1.5 bg-ibm-black text-white font-medium">
            All Posts
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className="font-mono-ibm text-[0.68rem] tracking-[0.1em] uppercase px-3 py-1.5 border border-ibm-g30 text-ibm-g70 hover:border-ibm-black hover:text-ibm-black transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Post grid ── */}
      <div className="max-w-[1120px] mx-auto px-6 py-14">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-ibm-g50 font-mono-ibm text-sm">
            No posts yet — check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ibm-g20">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                aria-label={`Read: ${post.title}`}
                className={`group flex flex-col bg-white p-8 hover:bg-ibm-g10 transition-colors ${
                  i === 0 ? "lg:col-span-2 lg:row-span-1" : ""
                }`}
              >
                {/* Top meta */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-mono-ibm text-[0.62rem] tracking-[0.14em] uppercase px-2 py-1 bg-ibm-g10 border border-ibm-g20 text-ibm-blue group-hover:bg-white transition-colors">
                    {post.category}
                  </span>
                  <time
                    dateTime={post.date}
                    className="font-mono-ibm text-[0.68rem] text-ibm-g50"
                  >
                    {formatDate(post.date)}
                  </time>
                </div>

                {/* Title */}
                <h2
                  className={`font-semibold leading-[1.25] tracking-[-0.015em] text-ibm-black mb-3 group-hover:text-ibm-blue transition-colors ${
                    i === 0 ? "text-[1.375rem]" : "text-[1.0625rem]"
                  }`}
                >
                  {post.title}
                </h2>

                {/* Description */}
                <p className="text-[0.875rem] text-ibm-g60 leading-[1.65] flex-1 mb-6">
                  {post.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-ibm-g20 pt-4 mt-auto">
                  <span className="text-[0.78rem] text-ibm-g60 font-medium">
                    {post.author}
                  </span>
                  <span className="font-mono-ibm text-[0.68rem] text-ibm-g50 flex items-center gap-1.5">
                    {post.readingTime} min read
                    <span className="text-ibm-blue group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-px bg-ibm-black text-white p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="font-mono-ibm text-[0.68rem] text-ibm-g50 tracking-wider uppercase mb-2">
              Ready to act on what you&apos;ve read?
            </p>
            <h3 className="text-xl font-semibold tracking-[-0.01em]">
              Start managing your finances the smart way.
            </h3>
          </div>
          <a
            href="https://app.spendtab.com/signup"
            className="shrink-0 bg-ibm-blue text-white px-6 py-3.5 text-sm font-semibold hover:bg-ibm-blueh transition-colors"
          >
            Get started free
          </a>
        </div>
      </div>
    </>
  );
}
