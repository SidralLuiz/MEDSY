// Rate Limiting por IP (Edge runtime / in-memory).
// Janela deslizante + banimento automático após N violações.
//
// AVISO: storage in-memory por isolate. Em deploy multi-instance (Vercel/Serverless),
// o estado é por-instância. Para limite global determinístico use Redis/Upstash.
// Limites por rota configuráveis via RATE_LIMITS.

export interface RateLimitConfig {
  limit: number;        // máx. requests por janela
  windowMs: number;     // duração da janela
  banThreshold: number; // violações antes de banir
  banMs: number;        // duração do ban
}

const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 120,
  windowMs: 60_000,
  banThreshold: 10,
  banMs: 15 * 60_000,
};

interface Bucket {
  count: number;
  resetAt: number;
}

// Por-rota, com prefixo por padrão de rota (ex.: /api/auth/google → auth)
const RATE_LIMITS: { prefix: string; config: RateLimitConfig }[] = [
  { prefix: '/api/auth', config: { limit: 10, windowMs: 60_000, banThreshold: 5, banMs: 60 * 60_000 } },
  { prefix: '/api/calendar', config: { limit: 30, windowMs: 60_000, banThreshold: 10, banMs: 15 * 60_000 } },
];

const buckets = new Map<string, Bucket>();
const bans = new Map<string, { until: number; violations: number }>();

function getConfig(pathname: string): RateLimitConfig {
  const match = RATE_LIMITS.find(({ prefix }) => pathname.startsWith(prefix));
  return match ? match.config : DEFAULT_CONFIG;
}

function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export interface RateLimitResult {
  ok: boolean;
  limited: boolean;
  banned: boolean;
  remaining: number;
  retryAfterMs: number;
  headers: Record<string, string>;
}

export function rateLimit(request: Request): RateLimitResult {
  const { pathname } = new URL(request.url);
  const cfg = getConfig(pathname);
  const ip = getClientIp(request);
  const now = Date.now();

  // 1) Checagem de banimento
  const ban = bans.get(ip);
  if (ban && ban.until > now) {
    const retryAfterMs = ban.until - now;
    return {
      ok: false,
      limited: true,
      banned: true,
      remaining: 0,
      retryAfterMs,
      headers: {
        'X-RateLimit-Banned': 'true',
        'Retry-After': String(Math.ceil(retryAfterMs / 1000)),
      },
    };
  }
  if (ban) bans.delete(ip); // ban expirado

  // 2) Janela deslizante
  const key = `${ip}:${pathname}`;
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + cfg.windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;

  // 3) Excedeu o limite → conta violação
  if (bucket.count > cfg.limit) {
    const current = bans.get(ip);
    const violations = (current ? current.violations : 0) + 1;

    if (violations >= cfg.banThreshold) {
      bans.set(ip, { until: now + cfg.banMs, violations });
      return {
        ok: false,
        limited: true,
        banned: true,
        remaining: 0,
        retryAfterMs: cfg.banMs,
        headers: {
          'X-RateLimit-Banned': 'true',
          'Retry-After': String(Math.ceil(cfg.banMs / 1000)),
        },
      };
    }
    bans.set(ip, { until: 0, violations });
    return {
      ok: false,
      limited: true,
      banned: false,
      remaining: 0,
      retryAfterMs: bucket.resetAt - now,
      headers: {
        'X-RateLimit-Limit': String(cfg.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(bucket.resetAt / 1000)),
        'Retry-After': String(Math.ceil((bucket.resetAt - now) / 1000)),
      },
    };
  }

  // 4) OK
  return {
    ok: true,
    limited: false,
    banned: false,
    remaining: Math.max(0, cfg.limit - bucket.count),
    retryAfterMs: 0,
    headers: {
      'X-RateLimit-Limit': String(cfg.limit),
      'X-RateLimit-Remaining': String(Math.max(0, cfg.limit - bucket.count)),
      'X-RateLimit-Reset': String(Math.ceil(bucket.resetAt / 1000)),
    },
  };
}

// Cleanup periódico para não vazar memória em long-running
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    for (const [k, v] of bans) if (v.until <= now) bans.delete(k);
  }, 60_000).unref?.();
}
