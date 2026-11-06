# Phase 3 completion report

Date: 6 Nov 2026. Measurements are from `next start` on this machine, against the existing Atlas application database. The production server was warm unless a row says otherwise.

## What changed

The homepage no longer waits for events, rankings, and FAQ before sending the shell. Those sections, the card glimpse, and each event's division brackets render inside `<Suspense>`. Pages stayed server components.

The support chat moved from the root layout to the public layout. Sign-in does not render it. `@tanstack/react-query`, `QueryClientProvider`, and `frontend/src/lib/queryClient.ts` are removed. No `useQuery` or `useMutation` call sites existed. `frontend/src/app/(fighter)/fighter/loading.tsx` uses the existing page loader.

## Measurements

| Measurement | Before | After |
| --- | --- | --- |
| `curl` TTFB `/`, three warm samples | 12.9 ms, 15.7 ms, 21.6 ms | 42.3 ms (first after start), 18.6 ms, 19.2 ms |
| `curl` TTFB `/events` | 18.7 ms, 12.3 ms, 17.6 ms | 33.0 ms (first), 19.5 ms, 17.0 ms |
| `curl` TTFB `/events/underground-arena-vol-4` | 24.4 ms, 23.2 ms, 17.1 ms | 25.7 ms, 19.8 ms, 18.8 ms |
| Browser navigation TTFB `/` | 28 ms | 126 ms on a warm reload |
| LCP `/` | 472 ms, an image | 536 ms, an image, on a warm reload |
| DOM content loaded / load `/` | 151 ms / 225 ms | 202 ms / 285 ms |
| Client JavaScript under `.next/static/chunks` | 77 files, 1,441,780 bytes | 77 files, 1,417,954 bytes |

TTFB and LCP did not improve. Client JavaScript dropped by 23,826 bytes after React Query was removed. The homepage response now includes the static shell and the "Loading events…", "Loading rankings…", and "Loading questions…" fallbacks, and the browser shows the featured event after those fallbacks resolve.

Hydration was not timed as its own millisecond figure. The client leaves that remain on a public page are the header lockup, comic navigation, mobile menu, support chat, navigation loader, toaster, and tooltip provider.

`listPublicEvents` is still wrapped in React `cache()`. The header and the homepage sections call it. That wrapper is what dedupes the read inside one request. This phase did not add a separate query counter.

## Checks

From `frontend/`: `npx tsc --noEmit` exit 0, `npm test` 24 files / 147 tests passed, `npm run build` exit 0 (compiled in 44s). The sign-in page has no support chat. The brackets page shows the event title, then either the brackets or "No brackets published yet."
