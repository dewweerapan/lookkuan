/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint is run separately via `next lint` — skip during build to avoid false positives
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
