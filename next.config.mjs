import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
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

// Only wrap with Sentry when DSN is configured (avoids dev-mode conflicts)
const sentryConfig = {
  silent: true,
  telemetry: false,
  dryRun: process.env.CI !== 'true',
  disableClientWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN,
  disableServerWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN,
}

export default withSentryConfig(nextConfig, sentryConfig)
