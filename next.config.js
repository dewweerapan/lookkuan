import { withSentryConfig } from '@sentry/nextjs'

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

export default withSentryConfig(nextConfig, {
  // Suppress source map upload (no auth token set in dev)
  silent: true,
  // Disable Sentry telemetry
  telemetry: false,
  // Don't add Sentry to every route in dev
  disableLogger: true,
  // Only upload source maps in CI
  dryRun: process.env.CI !== 'true',
})
