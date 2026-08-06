const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

// Observabilidade: envolve build/routes com Sentry (Sentry Webpack Plugin).
// Se não houver DSN, o wrap não envia nada — build continua funcionando.
module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || 'medsy',
  project: process.env.SENTRY_PROJECT || 'medsy-web',
  silent: !process.env.SENTRY_DSN,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  telemetry: false,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
