/**
 * CMS-AGNOSTIC DATA LAYER
 *
 * This module is the single source of truth for blog post data.
 * All page components import from here — they are unaware of the
 * underlying data source.
 *
 * ── Migrating to Sanity (or any headless CMS) ──────────────────
 * 1. Install the CMS client:  npm install @sanity/client next-sanity
 * 2. Re-implement `getAllPosts()` and `getPostBySlug()` below to
 *    fetch from the CMS API instead of the filesystem.
 * 3. Map CMS response fields onto the `Post` interface — field names
 *    are already aligned with Sanity conventions (slug, _type, etc.).
 * 4. Delete the gray-matter / marked dependencies.
 * 5. The page components (app/blog/**) require zero changes.
 * ───────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

// ── Types ────────────────────────────────────────────────────────

export interface Post {
  slug: string;
  title: string;
  description: string;       // Used for meta description & card excerpt
  date: string;              // ISO 8601 — "YYYY-MM-DD"
  dateModified?: string;     // ISO 8601 — falls back to `date` if absent
  author: string;
  authorTitle?: string;      // e.g. "Finance Writer"
  category: string;
  tags: string[];
  readingTime: number;       // Minutes, calculated at parse time
  content: string;           // Rendered HTML (replace with portable text for Sanity)
}

// Lighter type used on the listing page (no full content)
export type PostMeta = Omit<Post, "content">;

// ── Filesystem helpers ───────────────────────────────────────────

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function calcReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function parsePost(slug: string, raw: string): Post {
  const { data, content } = matter(raw);
  const html = marked.parse(content) as string;

  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    date: data.date ?? "",
    dateModified: data.dateModified,
    author: data.author ?? "SpendTab Team",
    authorTitle: data.authorTitle,
    category: data.category ?? "General",
    tags: data.tags ?? [],
    readingTime: calcReadingTime(content),
    content: html,
  };
}

// ── Public API ───────────────────────────────────────────────────
// Replace these implementations when migrating to a CMS.

/** Returns all posts sorted newest-first. */
export async function getAllPosts(): Promise<Post[]> {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    return parsePost(slug, raw);
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Returns a single post by slug, or null if not found. */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return parsePost(slug, raw);
}

/** Returns all slugs — used by generateStaticParams. */
export async function getAllSlugs(): Promise<string[]> {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}
