# Responsive UI Audit

Full 5-viewport matrix was **not** completed for every route. Spot checks:

| Viewport | Page | Observation | Status |
|----------|------|-------------|--------|
| Desktop (~default automation canvas) | `/`, `/events`, fighter pages | Layout readable; manga panels/nav present | PASS |
| Mobile emulation 375×812 | Fighter dashboard after admin redirect | Nav wraps; Sign out visible; no obvious horizontal clip in snapshot | PASS |
| 390 / 768 / 1366 / 1920 | — | Not systematically captured | NOT FULLY TESTED |

## Defects

- Home **Shuffle** control click intercepted by overlapping non-interactive span (likely sticker/polaroid layer) — hit target broken on desktop automation viewport.
- Home hero can feel dense; not treated as a defect without design change request.

## Themes

No separate light/dark theme toggle found in navigation — single branded theme.
