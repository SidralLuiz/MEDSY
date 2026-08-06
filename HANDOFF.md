# HANDOFF — 2026-08-05 (MEDSY)

## Objetivo da sessão

Executar as medidas de segurança e conformidade LGPD do projeto MEDSY 5.0 (Next.js 14 + Supabase), conforme o plano em `CONFORMIDADE-SEGURANCA-LGPD.md`. Incluiu: varredura de segurança (RLS, crypto, OAuth, middleware), auditoria LGPD (consentimento, DSR, anonimização) e novos pedidos (rate limit/ban de IP, Sentry).

## Progresso

- [x] **Item 2** — `run-sql-migration.js` sem chave hardcoded (lê `SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_URL` do env; aborta se ausente). Seeds trocados para dados fictícios.
- [x] **Item 4** — `lib/db.ts`: backdoor `paodequeijo123` removido; mockUsuarios com senhas em claro removido; PII real dos mocks trocada por fictícia.
- [x] **Item 5** — `components/LoginModal.tsx`: botões "Acesso Rápido" (credenciais demo) removidos + `setDemoUser` removido + import `Sparkles` limpo.
- [x] **Item 16** — `lib/db.ts`: `autencicarUsuario` agora usa `supabase.auth.signInWithPassword` (email = `{cpf-somente-numeros}@medsy.local`); `.or(cpf.eq...)` injetável removido; `select('*')` → colunas explícitas em `getMedicos`/`getSecretarias` (colunas de senha/tokens ficam fora); `addMedico`/`addSecretaria` não inserem mais `usuarios` nem senha default. Adicionados `logout`, `getTermoConsentimento`, `jaConsentiu`, `registrarConsentimento`, `exportarDadosTitular`.
- [x] **Item 17** — `lib/auth.ts` (getAuth/requireAuth) + `lib/supabase.ts` (createBrowserClient/createServerClient com cookies) + `middleware.ts` (sessão Supabase via `@supabase/ssr`, rotas públicas: `/`, `/api/auth/google*`, `/api/auth/outlook*`).
- [x] **Rate limit + banimento de IP** (novo pedido) — `lib/rate-limit.ts`: janela deslizante in-memory por IP+rota, ban automático após N violações, config por prefixo (`/api/auth` 10/min ban 1h; `/api/calendar` 30/min ban 15min; default 120/min ban 15min). Integrado no `middleware.ts`. **Atenção:** in-memory por isolate (Vercel/serverless não compartilha estado).
- [x] **Item 18** — `app/api/calendar/sync/route.ts`: exige sessão (`requireAuth`) + validação Zod (`zod` instalado).
- [x] **Item 19** — OAuth Google/Outlook: nonce aleatório em `state` + cookie httpOnly `oauth_state`; callbacks validam nonce + sessão e gravam tokens via RPC `gravar_tokens_oauth` (criptografa com `pgp_sym_encrypt`; função criada na migration 0002).
- [x] **Item 21** — Consentimento LGPD + DSR implementados: `components/ConsentModal.tsx` (termo, registra via RPC `registrar_consentimento_lgpd`, bloqueia em recusa), `components/DsrModal.tsx` (portabilidade via `exportar_dados_titular` + revogação), integrados ao fluxo de login em `app/page.tsx` (abre ConsentModal no primeiro acesso quando `jaConsentiu` = false) e botão "Meus Dados" na `components/Navbar.tsx`.
- [x] **Sentry** (novo pedido) — `@sentry/nextjs@10.69.0` instalado; `sentry.client.config.ts`/`sentry.server.config.ts`/`sentry.edge.config.ts`, `instrumentation.ts` (register), `app/global-error.tsx`, `next.config.js` com `withSentryConfig` (DSN em env; `sendDefaultPii: false` por LGPD).
- [x] **Item 29** — PII: seeds de `0001_schema.sql` anonimizados; `app/page.tsx` inicializa `currentUser = null`; `onLogout` chama `dbService.logout()`.
- [x] **Reorganização** — SQLs do Supabase movidos para `supabase/migrations/0001_schema.sql` e `0002_security_lgpd.sql`; legado Java/MySQL movido para `legacy/`; `*.jar`/`*.zip` adicionados ao `.gitignore`.
- [x] **Item 30** — `npm run build` validado (passa) + ESLint configurado (`eslint@8` + `eslint-config-next@14.2.35` + `.eslintrc.json`) com erros corrigidos (aspas não escapadas em 3 componentes). Warnings pré-existentes de `exhaustive-deps` permanecem (benignos).
- [x] **Deps** — `@supabase/ssr@^0.12.4`, `zod@^4.4.3`, `@sentry/nextjs@10.69.0`, `eslint@8`, `eslint-config-next@14.2.35`.
- [ ] **Item 8** — APLICAR no Supabase: `supabase/migrations/0001_schema.sql` e `0002_security_lgpd.sql` (SQL Editor). Inclui 3 tabelas faltantes, RLS, pgcrypto, RPCs LGPD/DSR, migração `auth.users` e funções de OAuth. Sem acesso a psql/CLI.
- [ ] **Item 1/3** — Rotação da `service_role` key (vazou commitada no histórico) + purge git — ação manual no dashboard Supabase.

## Arquivos modificados/criados

- `run-sql-migration.js` — chave de env, seeds fictícios.
- `lib/db.ts` — auth via Supabase, sem backdoor, selects sem `senha`, mocks anonimizados, métodos LGPD/DSR.
- `lib/supabase.ts` — clients com cookies (`createBrowserClient`/`createServerClient` de `@supabase/ssr`).
- `lib/auth.ts` — `getAuth()`/`requireAuth()`.
- `lib/rate-limit.ts` — rate limit + ban de IP.
- `middleware.ts` — sessão + rate limit.
- `app/api/auth/google/{route,callback}/route.ts`, `app/api/auth/outlook/{route,callback}/route.ts` — nonce CSRF + RPC `gravar_tokens_oauth`.
- `app/api/calendar/sync/route.ts` — sessão + Zod.
- `components/ConsentModal.tsx`, `components/DsrModal.tsx` — LGPD (novos).
- `components/Navbar.tsx` — botão "Meus Dados" (DSR).
- `app/page.tsx` — `currentUser = null`, logout real, fluxo de consentimento, DSR modal.
- `app/global-error.tsx`, `instrumentation.ts`, `sentry.{client,server,edge}.config.ts`, `next.config.js` — Sentry.
- `supabase/migrations/0001_schema.sql` — schema base (renomeado; seeds anonimizados).
- `supabase/migrations/0002_security_lgpd.sql` — RLS + pgcrypto + RPCs + LGPD + migração auth.users + RPC `gravar_tokens_oauth`.
- `.env.example` — `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`.
- `.eslintrc.json`, `package.json` — lint config.
- `.opencode/command/handoff.md` — comando `/handoff`.

## Próximos passos

1. **Aplicar migrations no Supabase** (SQL Editor): `0001_schema.sql` → `0002_security_lgpd.sql`. Sem isso: login/auth, RLS, consentimento, DSR e OAuth não funcionam.
2. **Rotacionar a `service_role` key** no dashboard Supabase e purgar o git history (a chave antiga ficou commitada).
3. Adicionar `SUPABASE_SERVICE_ROLE_KEY` (caso precise do script) e DSNs do Sentry ao `.env.local`/Vercel.
4. Teste de fluxo completo em dev: login, consentimento, DSR, OAuth, sync calendar.
