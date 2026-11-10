# SEO / share images

Swap these files anytime — keep the **same filenames** so metadata keeps working.

| File | Use | Size guide |
| --- | --- | --- |
| `og-default.jpg` | Open Graph / Facebook / LinkedIn / WhatsApp preview | 1200×630 (16:9 ok) |
| `twitter-card.jpg` | X / Twitter large card | Same as OG (or 1200×600) |
| `og-square.jpg` | Optional square share / Pinterest-style | 1:1 |
| `icon.png` | Favicon / app icon fallback | Square PNG |

After replacing a file, hard-refresh and re-check with:

- https://www.opengraph.xyz/
- https://cards-dev.twitter.com/validator

Canonical site URL is set via `NEXT_PUBLIC_SITE_URL` (see `.env.example`).
