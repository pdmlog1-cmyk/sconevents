# SCON Events Landing Pages — Project Memory

**Last updated: 11 Sep 2026**
For step-by-step working instructions, read **`TEAM-GUIDE.txt`** in this same folder.
This file is the technical reference: architecture, current data, and known traps.

---

## 1. Project Overview

| | |
|---|---|
| **Live site** | https://www.sconevents.com |
| **GitHub repo** | https://github.com/pdmlog1-cmyk/sconevents (public) |
| **Framework** | Next.js 14.2.35 — App Router, TypeScript |
| **Hosting** | Cloudflare Workers via OpenNext |
| **Workers URL** | https://sconevents.pdmlog1.workers.dev |
| **Node version** | 22 |
| **Team folder** | `D:\Companies\SCON\Websites\SCON_landing-Pages` |
| **Original working copy** | `C:\xampp\htdocs\SCON\sconevents-landing` |
| **Third working copy** | `D:\SCON_landing-Pages\SCON_landing-Pages` — has its own `.env`, built and deployed from here on 10 Sep 2026 |

One code base serves all 10 conference landing pages through the dynamic route
`app/[conference]/page.tsx`.

> **Hosting is Cloudflare Workers, not Vercel.** Vercel was fully removed in July 2026 —
> project deleted, GitHub integration revoked. Ignore any older note mentioning Vercel,
> `vercel-dns.com` nameservers, or "set env vars in Vercel". None of it applies.

---

## 2. The 10 Conferences

| Slug | Short | Landing page | Main site |
|------|-------|--------------|-----------|
| addiction | WCAB 2027 | /addiction | addictionmedicine-conference.com |
| biotechnology | GSBG 2027 | /biotechnology | biotech-meetings.com |
| cardiology | GCCM 2027 | /cardiology | cardiology-conference.com |
| food | GSFS 2027 | /food | foodtech-conference.com |
| gastroenterology | GCGD 2027 | /gastroenterology | gastro-meetings.com |
| neurology | GCNN 2027 | /neurology | neuroscience-conference.com |
| obesity | GSOD 2027 | /obesity | obesity-conferences.com |
| pharmaceutical | WCPD 2027 | /pharmaceutical | pharmaworldconference.com |
| physicalmedicine | WSPR 2027 | /physicalmedicine | physicalmedicine-conference.com |
| surgery | GCSA 2027 | /surgery | surgery-meetings.com |

Full names worth noting:
- **WSPR** = World Summit on Physical Medicine & Rehabilitation (changed from "Global Congress on…")
- **WCAB** = World Congress on Addiction Medicine & Behavioral Health (renamed from **WCAM**)

---

## 3. Dates, Venues and Deadlines — authoritative (07 Sep 2026)

| Short | City | Country | Venue | Dates | Early Bird Ends | Abstract Deadline | Acceptance |
|-------|------|---------|-------|-------|-----------------|-------------------|------------|
| GSBG 2027 | Singapore | Singapore | Hotel Village Changi | Mar 25–26, 2027 | Sep 30, 2026 | Nov 14, 2026 | Dec 14, 2026 |
| WCPD 2027 | Singapore | Singapore | Hotel Village Changi | Mar 25–26, 2027 | Sep 30, 2026 | Nov 14, 2026 | Dec 14, 2026 |
| GCCM 2027 | Barcelona | Spain | — | Apr 27–28, 2027 | Oct 15, 2026 | Dec 14, 2026 | Jan 14, 2027 |
| GCSA 2027 | Barcelona | Spain | — | Apr 29–30, 2027 | Oct 15, 2026 | Dec 14, 2026 | Jan 14, 2027 |
| WSPR 2027 | Singapore | Singapore | Hotel Village Changi | May 27–28, 2027 | Oct 31, 2026 | Jan 14, 2027 | Feb 14, 2027 |
| GSFS 2027 | Singapore | Singapore | Hotel Village Changi | May 27–28, 2027 | Oct 31, 2026 | Jan 14, 2027 | Feb 14, 2027 |
| GSOD 2027 | Singapore | Singapore | Hotel Village Changi | May 27–28, 2027 | Oct 31, 2026 | Jan 14, 2027 | Feb 14, 2027 |
| GCGD 2027 | Singapore | Singapore | Hotel Village Changi | May 27–28, 2027 | Oct 31, 2026 | Jan 14, 2027 | Feb 14, 2027 |
| GCNN 2027 | Prague | Czech Republic | — | Jun 22–23, 2027 | Nov 14, 2026 | Feb 14, 2027 | Mar 14, 2027 |
| WCAB 2027 | Prague | Czech Republic | — | Jun 24–25, 2027 | Nov 14, 2026 | Feb 14, 2027 | Mar 14, 2027 |

**GCNN and WCAB are in June 2027, not April.** An earlier commit wrongly reverted their
`marketing.json` "Conference Opens" to Apr 26. Fixed 31 Aug 2026.

**Acceptance dates were CONFIRMED by the user on 07 Sep 2026.** They were supplied as an
explicit list and matched, date for date, the *Acceptance = Abstract Deadline + 1 month*
rule that had been applied on 31 Aug 2026 — so no file needed changing. The rule is now
validated, not an assumption. (Before 31 Aug all 10 sites carried a flat `15 Jan 2027`,
which broke the ordering once abstract deadlines moved past it.)

---

## 4. Changing a date — all 5 files

A conference date lives in **five** files. Miss one and the same page shows two different
dates. There is no single source of truth.

| File | Fields |
|------|--------|
| `data/<slug>/conference.json` | `dateline`, `dates`, `dates_short`, `start_date_iso`, `abstract_deadline`, `early_bird_deadline` |
| `data/<slug>/marketing.json` | `key_dates` → Abstract Deadline, Early Bird Ends, Acceptance, Conference Opens |
| `data/<slug>/registration.json` | `phases[Early Bird].closes`, `phases[Late].closes`, `form.checkin_dates`, `form.checkout_dates` |
| `data/<slug>/common.json` | FAQ "How can I register" (early bird) + "abstract submission deadline" |
| `data/<slug>/seo.json` | `pages.index.description` (conf dates), `pages.abstract.description` (deadline) |

**Acceptance is the exception — it lives in `marketing.json` only.** It is not in
`conference.json`, `common.json` or `seo.json`, so changing an acceptance date is a
one-file edit, not five. Every other date really does need all five.

### Important Dates sort order
`LandingClient.tsx` uses a **fixed** order, not chronological:

```
['Early Bird Ends', 'Abstract Deadline', 'Acceptance', 'Conference Opens']
```

This is deliberate — it was fixed to this order on purpose. Do not "correct" it back to
date order.

---

## 5. Data files per conference

Each `data/<slug>/` folder holds 10 JSON files:

| File | Contains |
|------|----------|
| `conference.json` | Name, short name, dates, city, venue, contact email |
| `marketing.json` | Important Dates box, headlines, CTA copy |
| `registration.json` | Pricing, Early Bird / Late phases, form date ranges |
| `tracks.json` | 35 session tracks |
| `speakers.json` | Speakers |
| `committee.json` | Organizing committee |
| `gallery.json` | Photos |
| `common.json` | FAQ, footer text |
| `navigation.json` | Menu links |
| `seo.json` | Page titles and meta descriptions |

---

## 6. Key source files

| File | Purpose |
|------|---------|
| `lib/conferences.ts` | Conference metadata — slug, name, theme colors, `gtagId`, `mainSiteUrl` |
| `lib/logoSvgs.ts` | Inline SVG for all 10 logos, keyed by slug |
| `lib/config.ts` | `ConferenceConfig` type + default Addiction data (backwards compat) |
| `lib/getConfig.ts` | Loads the per-conference JSON; `trackFromJson()` adapter |
| `lib/forms.ts` | Form helpers incl. `verifyCaptcha()` |
| `app/[conference]/page.tsx` | Conference route + gtag scripts |
| `app/[conference]/LandingClient.tsx` | The entire landing page UI, for all 10 conferences |
| `app/[conference]/api/brochure/route.ts` | Brochure lead capture → CMS + email |
| `components/LandingLeadModal.tsx` | The brochure download modal |
| `public/logos/*.svg` | Static SVGs — used as **favicons only**, not in the header |
| `public/brochures/*.pdf` | 10 brochure PDFs, hosted locally |
| `public/assets/legacy/` | 28 gallery JPGs, hosted locally |

**Anything in `lib/` or `LandingClient.tsx` affects all 10 pages.** Only `data/<slug>/`
is safe to edit for a single conference.

---

## 7. Architecture notes

### Logos
Header and footer logos are **inline SVG**, injected via `dangerouslySetInnerHTML` on the
`.brand-icon` div, with the SVG strings in `lib/logoSvgs.ts`. Being inline is what lets
`var(--accent)`, `var(--ink)` and `var(--ink-soft)` work inside them. The files in
`public/logos/` are separate copies with hardcoded hex, used as favicons.

Theme CSS variables are injected per conference in `LandingClient.tsx` through a
`<style dangerouslySetInnerHTML>` block.

### Session tracks
Each conference has **35 tracks** in `tracks.json`. The landing page renders only the
first 6 (`slice(0,6)`); the "View all X tracks" button reads `conf.tracks.length`
dynamically. Track shape is `{ title, tagline, details?, subtopics? }` — the first 9 have
full details, tracks 10–35 carry title + tagline only. In `lib/config.ts` the type is a
tuple: `Track = [title, description, details?, subtopics?]`.

### Registration buttons
The three pricing-card buttons link to the main site with a category param:

```
{mainSiteUrl}/register?category=student
{mainSiteUrl}/register?category=listener
{mainSiteUrl}/register?category=presenter
```

Other "Register Now" / "Book Your Slot" buttons use `{mainSiteUrl}/register` with no param.

### Download section
Both download buttons use the **same filenames for every conference**:

```
{mainSiteUrl}/assets/abstract-template.docx
{mainSiteUrl}/assets/presentation-template.pptx
```

They download on the same page — no `target="_blank"`.

### Brochure download (form-gated)
"Download Brochure" dispatches an `lpb-open-brochure` event, which opens
`LandingLeadModal`. The form posts to `/{slug}/api/brochure`, which captures the lead and
returns success; a programmatic `<a>` click then starts the download.

- URL: `/brochures/{shortname}.pdf` — e.g. `/brochures/wcab-2027.pdf`
- Saved filename: `{conf.short} - Brochure.pdf` — e.g. `WCAB 2027 - Brochure.pdf`
- Slug rule: `conf.short.toLowerCase().replace(/\s+/g, '-')`
- **`BrochureModal.tsx` is dead code** — unused. `LandingLeadModal.tsx` does everything.

Brochures and gallery images are hosted **locally in this repo**, not on an external R2
bucket or on `cardiology-conference.com`.

### Contact emails
Format is `secretariat@{main-site-domain}`, set in `data/<slug>/conference.json` → `email`.
Changed from the old `{short}@meetings.llc` format on 14 Aug 2026.

### Google Analytics
gtag IDs live on each conference in `lib/conferences.ts` → `gtagId`, and are rendered by
`app/[conference]/page.tsx` via `next/script` (`afterInteractive`).

| Conference | gtag ID | | Conference | gtag ID |
|---|---|---|---|---|
| Addiction | G-1H9MQ5CWHD | | Neurology | G-09YX3Q9LE8 |
| Biotechnology | G-SP7NVERHLL | | Obesity | G-G90SNS2J3B |
| Cardiology | G-EWQ82M98Q3 | | Pharmaceutical | G-3FBTFN36QY |
| Food Science | G-VVWPRKXW5B | | Physical Medicine | G-MLZTFBP55Q |
| Gastroenterology | G-898K93S14Z | | Surgery | G-JDN2EQXJBG |

### hCaptcha
- Sitekey (frontend): `e3021954-d6b0-4d1a-b36c-c5e2d3062916`
- Secret: `HCAPTCHA_SECRET_KEY`, set in `wrangler.jsonc` → `vars`
- Verified in `lib/forms.ts` → `verifyCaptcha()`
- Allowed domains: sconevents.com, www.sconevents.com
- Dashboard: https://dashboard.hcaptcha.com

---

## 8. Build and deploy

```bash
npm install            # once
npm run dev            # local dev server, http://localhost:3000/<slug>
npm run build          # type-checks — MUST pass before pushing
npm run build:cf       # OpenNext build for Cloudflare
npx wrangler deploy    # admin only
```

`build:cf` expands to:

```
npx @opennextjs/cloudflare build --dangerouslyUseUnsupportedNextVersion
```

The `--dangerouslyUseUnsupportedNextVersion` flag is required because OpenNext does not
officially support Next.js 14. Do not remove it.

> **`build:cf` needs a bigger Node heap on Windows.** Export this first:
>
> ```bash
> export NODE_OPTIONS=--max-old-space-size=4096
> npm run build:cf
> ```
>
> Without it the build dies with `Next.js build worker exited with code: 3221226505`.
> See trap 9 in §10 — that is an out-of-memory abort, **not** a Windows incompatibility,
> and it does not mean you need WSL.

### Push

```bash
git -c credential.https://github.com.helper=manager push origin main
```

**Use that form, not a plain `git push`.** Confirmed again 07 Sep 2026: a bare
`git push origin main` fails on this machine with

```
'C:\Program Files\GitHub CLI\gh.exe' auth git-credential get: No such file or directory
fatal: could not read Username for 'https://github.com'
```

Git's config still points the credential helper at `gh.exe`, but **GitHub CLI is not
installed here** — the path does not exist. The `credential.helper=manager` override routes
auth through Windows Credential Manager instead and works. It still prints the same gh.exe
errors on stderr; ignore them and read the last line — a successful push ends with
`<old>..<new>  main -> main`.

### Cloudflare deploy auth

- **Account: `pdmlog1@gmail.com`** — Account ID `71e2bd85acab89c801465786b37e0fcd`
- Worker name: `sconevents`
- API token lives in `C:\xampp\htdocs\SCON\sconevents-landing\.env` (gitignored, `.gitignore:12`)
- **Always run `npx wrangler whoami` first** and confirm it prints `pdmlog1@gmail.com`

> ⚠️ **Wrong-account trap.** `evega.hyd@gmail.com` (Account ID `f266d210…`) is a *different*
> Cloudflare account used by the SCON conference **main** websites. Its token sits in
> `D:\Companies\SCON\Websites\SCON-Main-Websites\Sconconferences\.env.credentials`.
> Never deploy sconevents with it. This was actually attempted on 31 Aug 2026.

`wrangler login` cannot run from a non-interactive session (no browser), so the `.env`
token is the only route there.

To create a fresh token: dash.cloudflare.com/profile/api-tokens → Create Token →
"Edit Cloudflare Workers" template → Account = pdmlog1, Zone = sconevents.com.

### DNS and routes
- Zone `sconevents.com`: A record `@` → `192.0.2.1` (proxied), CNAME `www` → `sconevents.com` (proxied)
- Worker routes: `sconevents.com/*` and `*.sconevents.com/*` → worker `sconevents`

### ⚠️ There is NO auto-deploy

**A push to `main` does not put anything live.** Cloudflare does not build from GitHub.

Verified 1 Sep 2026 against the Cloudflare API: all 10 deployments on the `sconevents`
worker report `"source": "wrangler"` (9) or `"dash"` (1). **Not one came from a Git
trigger.** The repo has no `.github/` folder and `wrangler.jsonc` has no build section,
so there is no CI either.

The OpenNext build runs **on a local machine**, and `wrangler deploy` uploads the
`.open-next/` output from there. So if someone edits a file directly on github.com, the
live site is unchanged until an admin runs, locally:

```bash
git pull
npm run build        # must say "Compiled successfully"
npm run build:cf
npx wrangler whoami  # must print pdmlog1@gmail.com
npx wrangler deploy
```

### What we use in Cloudflare

| Service | Used for |
|---|---|
| **Workers** | Runs the Next.js app (`.open-next/worker.js`) |
| **Workers Static Assets** | Serves brochures, images, logos, `_next` JS/CSS (`ASSETS` binding) |
| **Durable Objects** | `DOQueueHandler`, `DOShardedTagCache` — created by OpenNext, internal only |
| **DNS** | Zone `sconevents.com` |
| **Worker Routes** | `sconevents.com/*`, `*.sconevents.com/*` → worker `sconevents` |
| **CDN cache** | Speed |
| **Bot protection** | Blocks curl, allows browsers (the 403 in §9) |
| **`wrangler.jsonc` vars** | `HCAPTCHA_SECRET_KEY` at runtime |

**Not used:** R2 (brochures are in-repo now), KV, D1, Cloudflare Pages, Cloudflare Git
integration, GitHub Actions. `open-next.config.ts` sets `incrementalCache: "dummy"`,
`tagCache: "dummy"`, `queue: "direct"` — no external cache storage is wired up.

---

## 9. Verifying a deploy

`www.sconevents.com` **returns HTTP 403 to curl** — that is Cloudflare bot protection
(configured per `cloudflare-security-setup.txt`), not a broken deploy. Browsers are fine.

For command-line checks use the workers.dev URL, which is not bot-protected:

```bash
https://sconevents.pdmlog1.workers.dev/<slug>
```

Brochure dates can be checked end-to-end — `pdftotext` is available on the original
machine (mingw64):

```bash
curl -sL -o /tmp/x.pdf https://sconevents.pdmlog1.workers.dev/brochures/gsfs-2027.pdf \
  && pdftotext /tmp/x.pdf - | grep -iE "deadline|early bird"
```

Do this before every brochure commit — verify the PDF against the site data.

---

## 10. Traps and lessons learned

1. **Cloudflare Dashboard env vars do not reliably reach `process.env` in OpenNext
   Workers.** Use `wrangler.jsonc` → `"vars"` instead. Confirmed working 17 Aug 2026.

2. **GitHub push protection may block `wrangler.jsonc`** because it contains the hCaptcha
   secret. Fix: open the unblock URL from the error message and click "Allow secret".

3. **`npm run dev` does not type-check; `npm run build` does.** Code can run clean locally
   for hours and still fail the build. Always build before pushing.

4. **Pushing ships everything on `main`, not just your commit.** Run
   `git log HEAD..origin/main` before pushing and tell the team what else is going out.

5. **Never commit `.env`** — it holds the live Cloudflare API token.

6. **A single 404/500 that clears on retry is a recompile, not a bug.** Hit the URL twice
   before investigating.

7. **A long-running local dev server degrades** — it starts returning 404 on routes that
   worked minutes earlier. Restart it; do not go hunting through the data files.

8. **An interrupted `npm run build` leaves `.next` without `routes-manifest.json`**, and
   the dev server then 500s on every route. Delete `.next` and restart.

9. **`npm run build:cf` failing with exit code `3221226505` is an out-of-memory abort,
   not a Windows problem.** `3221226505` is `0xC0000409`, which Node raises when it aborts
   on OOM. Fix by exporting `NODE_OPTIONS=--max-old-space-size=4096` before the build —
   confirmed working 10 Sep 2026, built and deployed from Windows with no WSL.
   Plain `npm run build` succeeds unaided; it only dies under OpenNext, which runs
   `next build` as a subprocess while holding its own memory, so the default heap has to
   cover both. `NODE_OPTIONS` is inherited by the subprocess.
   **Do not read OpenNext's "not fully compatible with Windows — use WSL" banner as the
   cause and hand the deploy off to someone else.** That banner prints on every run,
   including successful ones. This was misdiagnosed once and cost a deploy cycle.

---

## 11. Recent changes

### 11 Sep 2026 — neurology logo matched to the main site — `14599f7`

The `/neurology` logo now matches neuroscience-conference.com, checked against the live
main site in a headless browser (the icon renders pixel-identical):

- Lockup line reads **"June 22–23 | Prague"** (was the derived "Jun 22-23 | Czech Republic"),
  in both header and footer. It comes from new optional `brand_dates` / `brand_place` in
  `data/<slug>/conference.json`; conferences without them keep the derived
  `"<Mon> <dd-dd> | <country>"`, so the other nine are unchanged (verified live).
- Tile light corner hard-coded to the main site's `#581c87` in the neurology entry of
  `lib/logoSvgs.ts`. The landing theme's `--ink-soft` (`#4c1d95`) was left alone — it
  colours other text on the page.
- `public/logos/neurology.svg` (favicon) replaced with the main site's `icon.svg`.

Known leftover: the lockup's grey date text uses the landing theme's `--muted`
(`#5a4a6a`); the main site's is `#6b5b7a`. Not changed, because `--muted` is page-wide.

Pushed `67680ab..14599f7`; deployed from this copy, worker version
`ceaf4846-ba01-45c9-8ab1-ca0d63f077ce`.

### 11 Sep 2026 — neurology hero "Featured Speakers" card — `67680ab`

`/neurology` now shows a rotating **Featured Speakers** card on the right of the hero —
the first 4 (`HERO_SPEAKER_COUNT`) of the real speaker list in `data/neurology/speakers.json`
→ `speakers` (same order as neuroscience-conference.com/speakers). Ported from the main
site's `HeroSpeakerSlider` plus its `.hero-spk-*` CSS; `lib/getConfig.ts` passes the list
through as `conf.speaker_records`. Only conferences with a `speakers` list get the card and
the two-column `.lpb-hero--speakers` layout, so the other nine are untouched — verified live
on `/cardiology`, `/addiction`, `/surgery`. Section numbering is unchanged (01–05).

`npm run build` compiled successfully; pushed `2261467..67680ab`; deployed from
`D:\SCON_landing-Pages\SCON_landing-Pages` (`wrangler whoami` = pdmlog1@gmail.com),
worker version `4fe91513-84b3-48e0-bcce-a8d2c1bfc7ee`.

> The user wants landing pages kept **identical to live** apart from the change asked
> for. A "Speakers by session" section that renumbered the page was tried locally the
> same day and removed at their request — never deployed.

### 11 Sep 2026 — neurology mirror REVERTED — `1a1ed18`

The user asked for the 10 Sep `/neurology` mirror (below) to be taken back out.
`git revert 6b8cbcb` — the code tree is byte-identical to `0f0a46b` again (verified with
`git diff 0f0a46b HEAD -- . ':!CLAUDE_MEMORY.md'`, empty). All ten landing pages use
`LandingClient.tsx` once more; the five mirror components, `sessions.json`, the two
appended CSS blocks and the copied images are gone, and `data/neurology/` is back to its
pre-mirror contents. Pushed and redeployed the same day.

The 10 Sep entry is kept as a record of **how** to mirror a page if it is wanted again —
`git revert 1a1ed18` would restore it exactly. Trap 9 (§10) and the heap flag in §8 are
unaffected; they are about the build, not the mirror.

### 10 Sep 2026 — `/neurology` mirrored its main site — `6b8cbcb` *(reverted 11 Sep)*

`/neurology` reproduced the **neuroscience-conference.com home page** instead of the
shared `LandingClient` layout. `app/[conference]/page.tsx` selects it via a
`MAIN_SITE_MIRROR` set holding only `'neurology'`, so **the other nine are untouched** —
verified live: `/addiction`, `/cardiology`, `/surgery` still serve 300 `lpb-` markers and
zero new ones. Deployed, worker version `027b2cc8-5117-4971-920e-99fec18d1693`.

**Where the source came from.** Each main site has a local checkout at
`D:\SCON_landing-Pages\Sconconferences\Sconconferences\<slug>` — neurology's is the
reference for this port. Read that, not the live URL: the live sites 403 to curl.

New files, all prop-driven so nothing shared moved:

| File | Ported from |
|---|---|
| `app/[conference]/NeurologyLanding.tsx` | main `app/page.tsx` |
| `components/MainSiteChrome.tsx` | main `InfoStrip` + `Header` + `Footer` |
| `components/EarlyBirdBanner.tsx` | main `EarlyBirdBanner.tsx` — sticky countdown bar |
| `components/HeroSpeakerSlider.tsx` | main `HeroSpeakerSlider.tsx` |
| `components/HomepageFaqsLanding.tsx` | main `HomepageFaqs.tsx` |

The originals all read one hard-coded conference from `lib/config.ts`; these take `conf`
and `baseUrl` as props, and every internal link is an absolute `<a>` to the main site,
because this deployment only serves `/<slug>`.

**`globals.css` was missing only two blocks** — `.hero-spk-*` and `.eb-*`, appended from
the main site. Every other class the home page needs (`.hero-poster`, `.topics-grid`,
`.pricing-grid`, `.dates-timeline`, `.cta-banner`, `.site-header`, `.site-footer`) was
already here. **If a mirrored page renders unstyled, diff the CSS before rewriting it** —
an earlier attempt that day guessed the markup from a screenshot, used correct class names
with no backing CSS, and had to be reverted wholesale.

Data: copied neurology's 9 data files from the main site, plus `sessions.json`, which had
no counterpart here. Also copied `public/assets/images/prague-hero.jpg` and
`public/assets/speakers/` (2 files).

> ⚠️ **Do not copy `hcaptcha_sitekey` from a main site's `conference.json`.** Each key is
> registered to its own domain; the main site's `4b4e844a…` would break the brochure form
> on sconevents.com. The landing key `e3021954…` was restored by hand after the copy.
> `base` was left pointing at the main site — it is only passed through `getConfig` and
> never rendered.

**Hero speakers read `speakers.json` → `speakers`, sliced to 4** — the same array, in the
same order, that the main site's `/speakers` page renders. Deliberately *not*
`featured_speakers`: that field is a hand-maintained copy of the first three and had
already drifted (3 entries against a real list of 9). `HERO_SPEAKER_COUNT` is a one-number
edit. Only speaker 1 has a photo; the rest carry `"photo": ""` and fall back to initials —
same as the main site.

The page keeps `robots: noindex`, so it does not compete with the main site in search.

### 07 Sep 2026 — acceptance dates confirmed
- The user supplied the authoritative acceptance-date list for all 10 conferences. Checked
  every `marketing.json` **and** the live worker: **all 10 already matched, exactly.**
  No file was changed. The *Abstract Deadline + 1 month* rule is now confirmed, not assumed.

| Conference | Acceptance |
|---|---|
| Pharmaceutical (WCPD) | Dec 14, 2026 |
| Biotechnology (GSBG) | Dec 14, 2026 |
| Cardiology (GCCM) | Jan 14, 2027 |
| Surgery (GCSA) | Jan 14, 2027 |
| Physical Medicine (WSPR) | Feb 14, 2027 |
| Food Technology (GSFS) | Feb 14, 2027 |
| Obesity (GSOD) | Feb 14, 2027 |
| Gastroenterology (GCGD) | Feb 14, 2027 |
| Neurology (GCNN) | Mar 14, 2027 |
| Addiction (WCAB) | Mar 14, 2027 |

> Acceptance lives **only** in `marketing.json` → `key_dates`. It is not in `conference.json`,
> `common.json` or `seo.json`. On the rendered page it shows in the short `14 Mar 2027` form,
> so a `grep` for `"March 14, 2027"` against live HTML will *not* find it — match the flight
> data instead: `["14","Mar 2027","Acceptance"`.

### 07 Sep 2026 — WCAB abstract deadline back to Feb 14
- The user asked for the addiction abstract deadline to be **February 14, 2027**, which
  reverts `8ab617c`. Changed in `common.json`, `conference.json`, `marketing.json` (`key_dates`
  day `15` → `14`) and `seo.json`. `npm run build` — Compiled successfully.
- The four blobs hash back to their pre-`8ab617c` values, so the diff is an exact revert.
- Committed as `7caaaec`, pushed, and **deployed 07 Sep 2026** — worker version
  `e7cadea1-c605-4b81-9a20-0b13bd1c0cd1`. Live verified: `/addiction` now serves
  `February 14, 2027` in both the FAQ and the abstract meta, and the Important Dates
  tile reads `["14","Feb 2027","Abstract Deadline"`. Zero hits for Feb 15.
- Build ran in `C:\xampp\htdocs\SCON\sconevents-landing` (the only copy with `.env`);
  `npx wrangler whoami` confirmed `pdmlog1@gmail.com` / `71e2bd85…` first. Both local
  copies are on `7caaaec`.

### 07 Sep 2026 — sync
- Both local copies were **one commit behind `origin/main`** and behind the live site.
  Pulled `8ab617c` into the team folder `D:\Companies\SCON\Websites\SCON_landing-Pages`
  **and** the original copy `C:\xampp\htdocs\SCON\sconevents-landing`. Both now at `8ab617c`.
- `8ab617c` (pushed 1 Sep by stem-networks) — **WCAB / addiction abstract deadline
  Feb 14 → Feb 15, 2027** in `common.json`, `conference.json`, `marketing.json`, `seo.json`.
  `registration.json` was correctly not touched — it carries no abstract deadline.
- Verified live: `sconevents.pdmlog1.workers.dev/addiction` already serves **February 15, 2027**,
  so that commit *was* deployed. All 10 landing pages were then diffed live-vs-local — every
  date rendered live exists in the local JSON. **No un-committed dashboard drift.**

> **Lesson:** the team folder does not update itself. Run `git fetch && git log HEAD..origin/main`
> before starting any edit — someone else may have pushed *and deployed* since your last pull.

### 01 Sep 2026
- Code cloned to the team folder `D:\Companies\SCON\Websites\SCON_landing-Pages`
  at commit `63b60ab`
- `TEAM-GUIDE.txt` written — the step-by-step working guide for team members
- This memory file rewritten and brought up to date (it was still describing Vercel)

### 31 Aug 2026 — `cd5f6e7`, `654f0f5`, `63b60ab`
- **All 2027 conference dates, deadlines and brochures updated** across all 10 conferences
- GSFS, WCPD, WSPR and GSBG brochures re-issued with corrected deadlines
- **GCNN / WCAB "Conference Opens" corrected from April to June 2027** — an earlier commit
  had wrongly reverted them
- Acceptance dates moved from a flat 15 Jan 2027 to *abstract deadline + 1 month*
  (still unconfirmed by the user)
- `.wrangler/` added to `.gitignore`

### 17 Aug 2026 — `a4c4060`, `cb6c29d`, `1b25771`
- All 10 brochure PDFs updated (Aug 17 versions)
- `HCAPTCHA_SECRET_KEY` moved into `wrangler.jsonc` vars after Cloudflare Dashboard vars
  proved unreliable for OpenNext Workers — confirmed working

### 14 Aug 2026 — `c05ca8c`
- Contact emails changed from `{short}@meetings.llc` to `secretariat@{domain}`
  for all 10 conferences

### 13 Aug 2026 — `75b96a4`
- Early Bird deadline moved from Aug 15 to **Aug 31, 2026** for all 10 conferences

### 3 Aug 2026 — `253834e`, `1ecae45`
- Early Bird deadline set to Aug 15, 2026 for all 10
- All 10 brochure PDFs refreshed (August 2026 revision)

---

## 12. Open items

- **`TEAM-GUIDE.txt` is NOT in the repo.** It is untracked and exists only in the team
  folder, so a fresh `git clone` will not have it. Hand it over separately, or commit it.
- **`BrochureModal.tsx` is dead code** and could be deleted.
- **This file is committed to a public repo.** It deliberately contains no secrets — only
  the hCaptcha *sitekey* (public by design), the Cloudflare account ID, and file paths.
  Keep it that way: never paste an API token in here.
