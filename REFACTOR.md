# Event taxonomy & i18n refactor

## Primary categories (`lib/taxonomy.ts`)

`music` · `nightlife` · `culture` · `comedy` · `food-drink` · `outdoor` · `community` · `sports` · `family` · `other`

Filter chips use the same ids as `event.category`. Nuance lives in **`tags[]`** on each event (`lib/data.ts`).

## Search (`lib/search.ts`)

Matches: title, category, tags, venue, district, description.

Lightweight EN/PL synonym groups, e.g.:

- `muzyka` → music, concert, techno, rave, jazz, live music
- `jedzenie` → food, restaurant, cocktails, beer, drinks

## i18n

- `lib/i18n/translations.ts` — EN/PL strings
- `hooks/use-locale.tsx` — `LocaleProvider`, `t("key.path")`, `AppLocaleShell`
- Header **EN | PL** toggle (`site-header.integrated.tsx`)
- Locale persisted: `localStorage` key `krakow-events:locale`

UI implementations live in `*.integrated.tsx`; canonical files re-export them.

## Optional cleanup

Inline `*.integrated.tsx` into canonical components and remove re-export shims when convenient.
