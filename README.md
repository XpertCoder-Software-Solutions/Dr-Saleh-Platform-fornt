# منصة د. صالح عبد الكريم — Frontend

React 19 + TypeScript + Vite, talking to the NestJS backend (`Dr-Saleh-Platform-BackEnd`).

## Run

```bash
cp .env.example .env      # defaults work for local dev
npm install
npm run dev               # http://localhost:5173, proxies /api and /uploads to localhost:3000
```

`npm run build` type-checks and builds to `dist/`. `npm run lint` runs ESLint.

In production set `VITE_API_URL` to the full API URL including `/api`
(for example `https://api.drsaleh.com/api`) and add the site origin to the
backend's `CORS_ALLOWED_ORIGINS`.

## Structure

| Path | What's there |
|---|---|
| `src/api/client.ts` | axios instance: unwraps `{ success, message, data }`, refreshes the access token once on 401, then retries; `resolveAssetUrl()` for `/uploads/...` paths |
| `src/api/endpoints.ts` | typed calls per backend module |
| `src/types/api.ts` | response types (copied from the backend's `docs/frontend/dr-saleh-api.types.ts`) |
| `src/auth/` | `AuthProvider`, `useAuth()`, and `useCopy()` for gender-aware copy |
| `src/copy/strings.ts` | every gendered string, in three versions: guest (neutral), male, female |
| `src/styles/` | design tokens, motion layer ported from the design canvas, shared classes |
| `src/components/` | header, footer, page hero, CTA band, course cover/card, icons, empty/error states |
| `src/pages/` | home, courses, course details, login, register, verify email, forgot password |

## Gendered copy

The design's rule: an account with gender `Female` sees feminine copy, `Male`
sees masculine, and guests (or accounts without gender) see neutral copy.
Add new strings to `src/copy/strings.ts` with all three versions and read them
with `const t = useCopy(); t('cta.start')`.
