/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fix for WalletConnect/Reown packages with Turbopack
  serverExternalPackages: [
    'thread-stream',
    'pino',
    'pino-pretty',
    '@solana/kit',
    '@solana-program/system',
    '@solana-program/token',
    '@coinbase/cdp-sdk',
  ],
  // Enable Turbopack with empty config
  turbopack: {},
  // Webpack fallbacks and externals
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    config.externals.push(
      'pino-pretty',
      'lokijs',
      'encoding',
      '@solana/kit',
      '@solana-program/system',
      '@solana-program/token',
    );
    return config;
  },
}

export default nextConfig
