/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fix for WalletConnect packages with Turbopack
  serverExternalPackages: [
    'thread-stream',
    'pino',
    'pino-pretty',
  ],
  // Enable Turbopack with empty config (silences webpack config warning)
  turbopack: {},
  // Exclude test files and non-JS assets from WalletConnect packages
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
}

export default nextConfig

