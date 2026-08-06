// Middleware global MEDSY:
//  1. Rate limiting + banimento de IP por rota (todas as rotas)
//  2. Validação de sessão Supabase (rotas protegidas)
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { rateLimit } from '@/lib/rate-limit';

const ROTAS_PUBLICAS = new Set([
  '/',
  '/api/auth/google',
  '/api/auth/google/callback',
  '/api/auth/outlook',
  '/api/auth/outlook/callback',
]);

export async function middleware(request: NextRequest) {
  // ============ 1) RATE LIMIT (todas as rotas) ============
  const rl = rateLimit(request);
  if (!rl.ok) {
    const response = new NextResponse(
      JSON.stringify({
        error: rl.banned ? 'IP temporariamente banido por excesso de requisições.' : 'Muitas requisições. Tente novamente em instantes.',
      }),
      { status: rl.banned ? 429 : 429, headers: { 'Content-Type': 'application/json' } },
    );
    Object.entries(rl.headers).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  }

  const { pathname } = request.nextUrl;

  // ============ 2) AUTH ============
  if (ROTAS_PUBLICAS.has(pathname)) {
    const response = NextResponse.next({ request });
    Object.entries(rl.headers).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  }

  let response = NextResponse.next({ request });
  Object.entries(rl.headers).forEach(([k, v]) => response.headers.set(k, v));

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response; // sem Supabase configurado: deixa passar (modo dev/mock)
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({ request });
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
