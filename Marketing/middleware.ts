import { NextResponse } from "next/server"

// No-op middleware to prevent the root project's Supabase middleware from
// being picked up by Turbopack when Vercel builds this static marketing site.
// With output: "export", middleware is not executed at runtime.
export function middleware() {
  return NextResponse.next()
}
