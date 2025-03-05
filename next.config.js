const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  // Disable serverComponentsExternalPackages to prevent Edge Runtime issues
  serverComponentsExternalPackages: [],

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
}



module.exports = nextConfig

