const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  // Disable serverComponentsExternalPackages to prevent Edge Runtime issues
  serverComponentsExternalPackages: [],
}

module.exports = nextConfig

