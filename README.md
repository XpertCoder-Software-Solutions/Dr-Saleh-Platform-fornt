# منصة د. صالح عبد الكريم — Frontend

React 19 + TypeScript + Vite + Tailwind CSS v4, talking to the NestJS backend (`Dr-Saleh-Platform-BackEnd`).

## Run

```bash
cp .env.example .env      # defaults work for local dev
npm install
npm run dev               # http://localhost:5173, proxies /api and /uploads to localhost:3000
```

`npm run build` type-checks and builds to `dist/`. `npm run lint` runs ESLint, `npm run format` runs Prettier (it also sorts Tailwind classes).

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
| `src/styles/index.css` | Tailwind entry: design tokens in `@theme` (colors, fonts, radii, shadows, animations) and the brand utilities (`bg-navy`, `glass`, `dots`, `glow-card`, `text-sheen`…) |
| `src/components/ui/button.ts` | shared class strings: `buttonClass()`, inputs, section spacing, pill tabs |
| `src/components/` | header, footer, page hero, CTA band, course cover/card, icons, empty/error states |
| `src/pages/` | home, courses, course details, login, register, verify email, forgot password |

## Gendered copy

The design's rule: an account with gender `Female` sees feminine copy, `Male`
sees masculine, and guests (or accounts without gender) see neutral copy.
Add new strings to `src/copy/strings.ts` with all three versions and read them
with `const t = useCopy(); t('cta.start')`.

## Styling

Everything is Tailwind utilities in the components; there are no per-component CSS files.
Colors and sizes come from the design tokens, so prefer `text-ink`, `bg-surface`,
`rounded-card`, `shadow-pop` over raw values. Use `cn()` from `src/lib/cn.ts` to
combine conditional classes.
