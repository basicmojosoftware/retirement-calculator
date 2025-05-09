/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove the experimental.appDir if present
  // Keep only necessary experimental features
  experimental: {
    serverComponentsExternalPackages: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-slot',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
    ],
  },
  // Add path aliases if using them
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    }
    return config
  }
}

module.exports = nextConfig
