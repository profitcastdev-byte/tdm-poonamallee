# Pre-launch QA: TDM Poonamallee Landing Page

**Date:** 19 September 2026
**Page:** `index.html` + `assets/` (static site, no build step)
**Traffic:** Google Ads, mostly phones
**Review link:** <https://tdmpoonamallee-preview.187.127.149.216.nip.io>
**Live address:** <https://lp.tdmpoonamallee.in> (goes live once its DNS record is added)

## Verdict: DEPLOY-READY ✅ YES

No blocking issues. Four small fixes were made during this QA. The page is
already running on the Profitcast KVM at the review link above. Going live on
`lp.tdmpoonamallee.in` waits only on one DNS record at Hostinger (see *To do*).

## What was checked

| Area | Result | What that means |
|---|---|---|
| Conversion tracking | ✅ Pass | The Google tag (`AW-17512378912`) loads on every page view. Every one of the 10 call and WhatsApp buttons fires exactly one conversion with the right label: 7 phone buttons fire **PC - LP - Phone Call Click**, 3 WhatsApp buttons fire **PC - LP - WhatsApp Click**, each 1.0 INR. Tested by clicking every button on the live review link with Google blocked, so no test conversions reached the Ads account. |
| Lead capture | ✅ Pass | No form, by design. Leads come in as calls and WhatsApp messages, and both are tracked as conversions. |
| Mobile | ✅ Pass | 18 layout breakpoints. Rendered at 320, 360, 375, 414, 768, 1024, 1280 and 1920 px wide: no sideways scrolling at any size. On phones the logo is centred, Book Free Inspection + Get Directions stay pinned to the bottom, and Call / WhatsApp float in the corners. Every call button on a phone now has a tap area at least 44 px tall. |
| Loading speed | ✅ Pass | Measured on the live server, empty cache, throttled like a mid-range phone on 4G (150 ms, 1.6 Mbps, 4x slower CPU): headline on screen in **1.8 s**, no layout shift (CLS 0), **310 KB** in 10 requests. Desktop: 0.3 s, 479 KB. The Google tag adds about 164 KB on top, loaded in the background. Photos below the hero load only when scrolled near. |
| Search and sharing | ✅ Pass | Title 58 characters, description 159 (both inside search-result limits), one H1, canonical link, Open Graph tags for WhatsApp / Facebook previews, favicon, LocalBusiness structured data. |
| Accessibility | ✅ Pass | Every image has alt text, the page language is set, there is a skip-to-content link, every button and link has a name, headings are in order, the FAQ announces open/closed, the map has a title, and text colours pass WCAG AA contrast. |
| Code health | ✅ Pass | No broken HTML, no script errors, no duplicate IDs or broken anchors, all 21 files the page uses load, no insecure `http://` links, links that open a new tab are safe. Works without JavaScript and with reduced motion. |
| Hosting | ✅ Pass | HTTPS with automatic renewal, gzip, sensible caching, security headers, and internal files (README, reports, scripts, zip) are not reachable from the web. Details in `DEPLOYMENT.md`. |

## Fixed during this QA

1. **Search title and description shortened** so Google shows them in full:
   the title went from 77 to 58 characters and the description from 191 to
   159, which keeps "Book a free inspection" visible in search results.
2. **Bigger tap area for the footer phone number** on phones (38 → 44 px
   tall). The layout is pixel-for-pixel the same; only the clickable area grew.
3. **Images can never stretch.** Added the standard `img { height: auto }`
   safety rule, so any photo squeezed on a small screen keeps its proportions.
   Every current image already sized itself correctly; this protects later edits.
4. **The page now names its real address.** Canonical, `og:url`, `og:image` and
   the structured data point at `https://lp.tdmpoonamallee.in/`, the address it
   will be served from. The deploy script refuses to upload the page if these
   ever name a different address.

## Notes on the automated scan

- The scanner could not open the stylesheet through its cache-busting `?v=`
  link, so it first reported "no media queries" and "no responsive-image rule".
  Re-run on a copy without the `?v=`, it found all 18 media queries and the
  image rule.
- It then flagged a 960 px fixed width. That is the soft red glow behind the
  About section, which the section clips; the layout sweep confirms no
  sideways scroll at any width.
- Three images load immediately rather than lazily on purpose: the two logo
  versions in the header and the hero photo are the first thing on screen, and
  lazy-loading them would slow the page.
- `hero-banner.jpg` stays a JPEG because it is the WhatsApp / Facebook preview
  image and those apps do not reliably show WebP. On the page itself every
  photo is served as WebP, with the JPEG as fallback.

## To do before and after going live

These cannot be done from the files.

1. **Add the DNS record at Hostinger** (hPanel → Domains → tdmpoonamallee.in →
   DNS): `A`, name `lp`, points to `187.127.149.216`. Optionally also `A`,
   name `*.lp`, same IP, for future `<page>.lp` pages; the wildcard does not
   cover `lp` itself. Then the certificate is extended to the live name with
   one command (`DEPLOYMENT.md`, *Going live*, step 3).
2. **Switch the Google Ads final URLs** to `https://lp.tdmpoonamallee.in/`.
3. **Test the conversions on the live URL.** Open it with Google Tag Assistant,
   tap Call and WhatsApp once each, and confirm both conversions register. In
   Google Ads (Goals > Conversions) both actions should show "Recording
   conversions" within a day.
4. **Run PageSpeed Insights on the live URL.** Lighthouse is not installed on
   this machine, so speed was measured directly in Chrome instead.
5. **Share the live URL once on WhatsApp** to confirm the preview shows the
   workshop photo.

## Known, not blocking

- **Number plate.** The Why Us photo shows a customer's number plate clearly.
  Blur it unless the owner has agreed to appear.
- **FAQ answers 2 to 6.** The brief marks them "not required for launch copy",
  so they are built only from sentences approved elsewhere in the brief
  (README, *FAQ answers 2 to 6*). Replace them when final answers arrive.
- **Consent.** The Google tag loads on arrival. That is fine for Indian
  traffic; EU or UK traffic would need a consent banner first.
