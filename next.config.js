/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Remove appDir from here
    serverComponentsExternalPackages: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-slot',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
    ],
  }
}

module.exports = nextConfig
