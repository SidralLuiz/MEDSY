import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Observabilidade: amostragem de performance (ajustar conforme plano)
  tracesSampleRate: 1.0,

  // Privacidade LGPD: nunca enviar PII de saúde por padrão
  sendDefaultPii: false,

  // Desativa em dev para não poluir
  enabled: process.env.NODE_ENV !== 'development',
});
