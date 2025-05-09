/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for ShadCN UI path aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    }
    return config
  },
  // Fixes "Module not found" for ShadCN components
  experimental: {
    serverComponentsExternalPackages: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-slot',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
    ],
  },
}

module.exports = nextConfig
