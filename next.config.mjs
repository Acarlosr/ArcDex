/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fix for WalletConnect packages
  serverExternalPackages: [
    'thread-stream',
    'pino',
    'pino-pretty',
  ],
  // Enable Turbopack (required for Next.js 16)
  turbopack: {},
  // Webpack fallbacks and externals
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    // Externalize optional wagmi connector dependencies
    config.externals.push(
      'pino-pretty',
      'lokijs',
      'encoding',
      'utf-8-validate',
      'bufferutil',
      // Optional wagmi connectors that we don't use
      'porto',
      'porto/internal',
      '@safe-global/safe-apps-sdk',
      '@metamask/sdk',
      '@solana/kit',
      '@solana-program/system',
      '@solana-program/token',
      '@coinbase/cdp-sdk',
    );

    // Ignore porto connector errors
    config.resolve.alias = {
      ...config.resolve.alias,
      'porto/internal': false,
      'porto': false,
    };

    return config;
  },
}

export default nextConfig
