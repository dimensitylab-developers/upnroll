# Combat Sports Reference Analysis

Phase 0 research deliverable. Each reference was actually fetched and reviewed (via live page fetch) on 2026-10-31. These are UX/operational observations only — none of this is an approved Up 'n Roll business rule. Up 'n Roll's actual disciplines, weight classes, bracket formats, and ranking methodology remain pending client approval (see `docs/decisions/open-decisions.md`).

---

## 1. UFC — https://www.ufc.com/athletes/all

**Feature studied:** Athlete directory and profile linking pattern.

**Observed pattern:**
- Directory header states a total count ("3243 Athletes") with a separate "Filter N Athletes" panel + Apply button — filtering is explicit/applied, not live-reactive.
- Each athlete card shows: photo (or placeholder), nickname in quotes, full name, weight class, W-L-D record, social links, and an explicit "Athlete Profile" link.
- Pagination uses "Load More" with a `?page=N` query param rather than numbered pages or infinite scroll.
- Profile URLs are slugged: `/athlete/[firstname-lastname]`.

**Why useful:** The card format (photo, name, division, record, profile link) is close to the minimum viable public fighter-card for Up 'n Roll's `/fighters` directory. The "Load More + page param" pattern is simpler to implement server-side than infinite scroll and plays well with Server Components + pagination.

**Phase 1 relevance:** Yes — directly informs the `/fighters` directory card and `/fighters/[slug]` profile route shape in the `/ui-preview` fixtures.

**Requires client approval:** No — this is a generic directory/card pattern, not a business rule. Approval is required for which fields are actually public per fighter (see Part H privacy constraints).

**Original adaptation proposed:** Use a similar card (photo, display name, division, W-L-D) but swap UFC's broadcast-grade photography/branding for Up 'n Roll's manga-panel visual motif (halftone background, jagged-edge card border) — same information density, original visual treatment.

---

## 2. ONE Championship — https://www.onefc.com/athletes/

**Feature studied:** Athlete directory filtering and ranking separation.

**Observed pattern:**
- A single combined "All categories" dropdown folds together weight class, discipline (Muay Thai, Jiu-Jitsu, Boxing, etc.), and nationality into one control — no separate control per facet.
- Cards are minimal: photo, name (+ nickname), nationality. No record or rank shown inline on the card.
- Rankings are deliberately NOT shown on the directory — they live on separate dedicated pages ("World Champions," "World Grand Prix Champions," "Athlete Rankings").
- Pagination uses a "Show More" link to `/athletes/page/2/`, not infinite scroll.

**Why useful:** The separation of "directory" (who exists) from "rankings" (who is ranked) is a clean information-architecture decision — it avoids conflating a roster listing with a competitive-standing claim. This matters for Up 'n Roll because rankings require an approved methodology (Part N) while a fighter directory does not.

**Phase 1 relevance:** Yes — supports keeping `/fighters` (directory) and `/rankings` (methodology-driven) as fully separate routes, not a single page with a sort toggle.

**Requires client approval:** No — architectural separation; discipline list itself (Up 'n Roll may not run Muay Thai/Boxing/Judo) is pending.

**Original adaptation proposed:** Keep directory and rankings as separate routes per the target IA (Part H), but since Up 'n Roll's discipline set is unknown, build the filter control as a config-driven list rather than a hardcoded ONE-style multi-discipline dropdown.

---

## 3. Professional Fighters League (PFL) — https://pflmma.com/standings

**Feature studied:** Tournament standings / regular-season-to-playoff presentation.

**Observed pattern:**
- Standings are organized per weight division (6 divisions observed), with a year selector for historical seasons.
- Each division table ranks fighters by accumulated points, shows season W-L record, and uses single-letter status codes explained in a legend at the top: `Y` = clinched #1 seed, `X` = clinched playoff berth, `E` = eliminated, `a` = alternate.
- A visual/textual divider after the 4th-ranked row explicitly states "top 4 fighters qualify for the playoffs," separating qualifying from eliminated competitors without a separate bracket graphic on that page.

**Why useful:** This is a strong reference for *tournament storytelling without a bracket diagram* — a plain ranked table with a status legend and a qualification cutoff line communicates tournament progression clearly and is far cheaper to build than a bracket-drawing engine. Useful as a fallback/companion view alongside the bracket view for Up 'n Roll's points-based or round-robin-to-elimination formats, if the client approves such a format.

**Phase 1 relevance:** Partial — informs the `/events/[slug]/brackets` status-legend treatment and the division-standings table pattern, but PFL's specific points formula and "top 4 advance" rule are PFL's own and must not be assumed for Up 'n Roll.

**Requires client approval:** Yes — whether Up 'n Roll uses any points-accumulation / seeded-bracket hybrid format at all is an open decision (Part N, BRK-002).

**Original adaptation proposed:** Reuse the "status legend + table + qualification divider" pattern as one possible bracket-adjacent view, built generically so it can be disabled if Up 'n Roll only ever runs straight single-elimination.

---

## 4. IMMAF — https://immaf.org/about/

**Feature studied:** Amateur competition governance and eligibility concepts.

**Observed pattern:** The fetched page itself is primarily navigation/footer chrome (menus, partner logos, social links) and did not surface substantive eligibility or rules content directly — it only links out to further sections ("What is MMA? / Rules," "Athlete Eligibility," "Rankings," "Database," "Rules & Policies," "Anti-Doping," "Safeguarding").

**Why useful:** Even without deeper content, the navigational structure itself is informative: IMMAF explicitly separates *event operations* from *sporting rules/eligibility* from *integrity programs* (anti-doping, safeguarding) as distinct top-level sections — a 3-way separation of concerns worth mirroring in Up 'n Roll's own policy documentation (not necessarily its site IA), since event operations (registration, brackets, scheduling) are Phase 1 scope while formal eligibility/anti-doping policy is a client/legal decision, not something to invent.

**Phase 1 relevance:** Indirect — informs documentation structure (keep "competition rules," "eligibility policy," and "safety/integrity policy" as separate content types in the admin content-management model) rather than any specific UI pattern.

**Requires client approval:** Yes, entirely — Up 'n Roll's actual eligibility rules, age/weight categories, and any safety/integrity requirements are 100% pending and must come from the client, not from IMMAF's amateur-MMA-specific rules.

**Original adaptation proposed:** None visual — this reference only confirms that "eligibility policy" should be a first-class, separately-versioned content type in `content_entries`, distinct from a generic FAQ.

**Honesty note:** I could not verify IMMAF's actual eligibility/competition-structure content in this pass because the fetched page did not contain it — flagging rather than fabricating.

---

## 5. Smoothcomp — https://support.smoothcomp.com/

**Feature studied:** Organizer-side tournament operations tooling (the operational backbone most directly comparable to Up 'n Roll's admin portal).

**Observed pattern (from the knowledge-base category structure):**
- Clear split between **athlete/coach-facing** docs (Event, Matches, Profile/Followers, Notifications, Shared accounts) and **organizer-facing** docs.
- Organizer docs are heavily bracket/scheduling-centric: "Our different bracket types" (28 articles), "Creating brackets and scheduling the event" (16 articles), "Registrations, search and send emails" (10 articles), "Weigh-in and registration of fighters" (7 articles), "Statistics and financial reports" (3 articles).
- Distinct categories exist for "Configure settings, discounts, coupon codes, mat settings" vs. "Creating entries, values and rules for your event" — i.e., *event-level configuration* is modeled separately from *division/entry-level configuration*.
- A dedicated "Team Competitions" category exists separately from individual competition docs, implying their data model treats team vs. individual entries as distinct paths.
- "Import, Export and Print" and "Using scoreboards and how to display information" (11 articles) point to day-of-event operational needs (mat-side display, printable brackets) beyond the web UI.

**Why useful:** This is the single most operationally relevant reference for Up 'n Roll's admin portal, because it's the only one of the five built for *running* tournaments rather than *broadcasting* them. It validates several Part J/Part L decisions already in the target architecture:
- Keeping `events` (event-level config) and `divisions` (entry-level config, weight/age/capacity/bracket format) as separate collections.
- Having a distinct registration-management surface separate from bracket management.
- The sheer size of "bracket types" documentation (28 articles) is a signal that bracket format flexibility is a deep feature area — reinforces Part N's instruction to build the bracket engine behind an explicit, swappable strategy interface rather than hardcoding one format.

**Phase 1 relevance:** High for architecture (confirms data-model separations already planned), low for the `/ui-preview` visual showroom itself (Smoothcomp's UI is utilitarian, not a visual reference for Up 'n Roll's manga aesthetic — admin portal should still follow Part O's "efficient, precise, trustworthy" rule, not copy Smoothcomp's literal layout).

**Requires client approval:** No for the architectural separation; yes for which specific bracket types, weigh-in process, and financial-report fields Up 'n Roll actually needs — Phase 1 excludes payment-gateway financial reporting per Part D §8/E.

**Original adaptation proposed:** Mirror the event/division/registration/bracket separation in the `up-n-roll` domain model (already reflected in `docs/architecture/data-model.md`), but design the admin UI with Up 'n Roll's own dark-editorial visual language rather than Smoothcomp's generic SaaS table chrome — satisfying both the operational-rigor lesson from this reference and Part O's anti-generic-design rules.

---

## Summary table

| Source | Belongs to Phase 1? | Client approval needed? | What Up 'n Roll adapts |
|---|---|---|---|
| UFC | Yes (directory/card shape) | No (generic pattern); yes for which fields are public | Card layout + pagination pattern, original visual skin |
| ONE Championship | Yes (IA separation) | No (generic pattern); yes for discipline list | Keep directory and rankings as separate routes |
| PFL | Partial (status-legend table) | Yes (bracket/points format) | Optional standings-table view alongside bracket view |
| IMMAF | Indirect (docs structure only) | Yes (all actual rules) | Separate "eligibility policy" content type |
| Smoothcomp | High (admin architecture) | Yes (specific bracket types, weigh-in flow) | Event/division/registration/bracket model separation already reflected in data-model doc |

No fighter photographs, trademarks, or copyrighted layouts were copied. No Up 'n Roll fighter database, weight classes, or ranking formula were invented from these references.
