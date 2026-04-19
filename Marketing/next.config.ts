import type { NextConfig } from "next";

// Node.js 22 exposes localStorage as an object without methods when
// --localstorage-file is missing. This breaks Next.js SSR. Remove it.
if (
  typeof localStorage !== "undefined" &&
  typeof (localStorage as Storage).getItem !== "function"
) {
  (globalThis as unknown as Record<string, unknown>).localStorage = undefined;
}

const nextConfig: NextConfig = {
  output: "export",
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
