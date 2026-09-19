# The Detailing Mafia Poonamallee | Landing Page

Static Google Ads landing page for The Detailing Mafia, Poonamallee (Chennai).
Conversions are Call and WhatsApp only. No build step: open `index.html`, or
serve the folder with any static host.

- Live address: <https://lp.tdmpoonamallee.in> (on the Profitcast KVM, waiting on
  one DNS record; `DEPLOYMENT.md`)
- Review link: <https://tdmpoonamallee-preview.187.127.149.216.nip.io>
- Code: <https://github.com/profitcastdev-byte/tdm-poonamallee>

```
index.html
assets/css/style.css
assets/js/main.js
assets/img/            logos, favicon, hero banner, section photos
deploy/                KVM deploy script and nginx vhost (DEPLOYMENT.md)
deploy-kvm.cmd         runs the deploy script from PowerShell / cmd
audit-report.md        pre-launch QA, 19 Sep 2026
TDM-Poonamallee-Landing-Page-deploy.zip   ready-to-upload bundle
```

Local preview: `python -m http.server 5621`, then open http://localhost:5621
(or start `tdm-poonamallee` from `.claude/launch.json`).

## Deploy

The page lives on the Profitcast KVM. From the project root in PowerShell:

```powershell
.\deploy-kvm.cmd              # upload, swap in, verify
.\deploy-kvm.cmd --check      # is the KVM running exactly this page?
.\deploy-kvm.cmd --rollback   # put the previous release back
```

`DEPLOYMENT.md` has the server details, the go-live steps (one DNS record, one
certbot command) and the rules for that shared server.

`TDM-Poonamallee-Landing-Page-deploy.zip` holds exactly what the site needs, for
any other host: `index.html` and `assets/` at the zip's root (22 files, about
2.4 MB). It is tracked in git on purpose, so the latest bundle can always be
downloaded from the repo. After any edit, bump the `?v=` numbers, rebuild the zip
from the same files, deploy, and commit and push everything together:

```powershell
python -c "import zipfile; from pathlib import Path; fs=[Path('index.html'),Path('assets/css/style.css'),Path('assets/js/main.js')]+sorted(Path('assets/img').iterdir()); z=zipfile.ZipFile('TDM-Poonamallee-Landing-Page-deploy.zip','w',zipfile.ZIP_DEFLATED,compresslevel=9); [z.write(f,f.as_posix()) for f in fs]; z.close()"
```

## Source material

- **Layout:** follows https://hdcarstudio.in/ section for section (hero, services,
  why us, dark about band with a workshop card, detail splits, FAQ, contact, footer).
  The brief has three detail sections (PPF, Ceramic / Graphene, Denting & Painting),
  so there is one more split than on the reference.
- **Copy:** `TDM_Poonamallee_Landing_Page_Copy.pdf`, word for word, with every em dash
  removed. The footer tagline's dash became a colon.
- **Logo:** `assets/img/tdm-poonamallee-logo.png` is the supplied file, byte for byte.
  `tdm-poonamallee-logo-white.*` is generated from it for dark backgrounds: black ink
  becomes white, red and white stay as they are, anti-aliased edges are preserved.

### FAQ answers 2 to 6

The brief marks these as "not required for launch copy". So the accordion does not
open onto nothing, each answer is built only from sentences already approved
elsewhere in the brief, which adds no new claims:

| Question | Answer taken from |
|---|---|
| Difference between PPF and coating | PPF detail body (sentence 1) + Coating detail body (sentence 1) |
| Repaint only part of my car | Denting detail body (sentences 3 and 2) |
| Will PPF change the colour or look | PPF detail body (both sentences) |
| How is the price decided | Why Us cards: Inspection-Led Process + Clear Communication |
| Exterior only, or interior too | Car Detailing service card, prefixed with "We offer" |

Replace them in `index.html` when final answers arrive.

## Design

- **Type:** Manrope (400 to 800), loaded from Google Fonts.
- **Palette:** sampled from the logo, which is exactly three inks: `#FF0000`,
  `#000000`, `#FFFFFF`. Pure red fills buttons and icon tiles (white bold text on it
  is 4.0:1, fine for bold text at 14px and up). Smaller white text sits on `#E00000`
  (5.0:1), and red text on white uses `#C40000` (6.3:1). All pairs pass WCAG AA.
- **Header:** logo and "Book Free Inspection" only, no navigation links. Transparent
  with the white logo over the hero; after 24px of scroll it turns white and
  crossfades to the original logo.
- **Logo size:** set once as `--logo-h` in `style.css` and used by both the header and
  footer logo, so they are always identical: 72px tall (102px wide) from 768px up,
  58px tall on phones. The header logo does not shrink on scroll.
- **Footer:** Kar Care Yelahanka structure. Logo and tagline on the left, "Reach us"
  with phone and address (icon rows) on the right, copyright and Profitcast credit
  along the bottom. On phones it is one column, everything left aligned.
- **Rhythm:** white and `#F5F5F5` bands alternate, with the dark About band and black
  footer, so each section reads as its own block.

## Photos

The client's photos (`TDM poonamallee.zip`, 18 Sep 2026) are in `assets/img`, named
by the slot they fill. Each ships as WebP with a JPEG fallback; the section photos
also have a 600px WebP that 1x screens download instead of the 1000px one.

| Slot | Files | Source | Shown on desktop | Tablet (under 900px) | Phone (under 560px) |
|---|---|---|---|---|---|
| Hero banner (one image, no slideshow) | `hero-banner.webp` / `.jpg` | Hero Banner.jpg, 1920 x 1080 | Full screen, dark overlay on the text side | Full screen | Full screen, cropped towards the car (`object-position: 70%`) |
| Why Us | `why-us-600.webp`, `why-us-1000.webp` / `.jpg` | Image 2.jpg, 1000 x 1252 | 500 x 626 | 16:10 crop | 4:3 crop |
| PPF | `ppf-600.webp`, `ppf-1000.webp` / `.jpg` | Image 3.jpg, 1000 x 1040 | 500 x 519 | 16:10 crop | 4:3 crop |
| Ceramic / Graphene | `coating-600.webp`, `coating-1000.webp` / `.jpg` | Image 4.jpg, 1000 x 1040 | 500 x 519 | 16:10 crop | 4:3 crop |
| Denting & Painting | `denting-painting-600.webp`, `denting-painting-1000.webp` / `.jpg` | Grey i20 photo sent 18 Sep (replaced the zip's Image 5), 1000 x 1040 | 500 x 519 | 16:10 crop | 4:3 crop |

To replace a photo, export it at the same size, save it over the files with the same
names (WebP at quality 80, JPEG at 82), update its `alt` in `index.html`, and bump
the `?v=` numbers. Every photo is cropped to fill its frame (`object-fit: cover`),
so keep the subject near the middle.

Notes on the current set:

- Image 2 (Why Us) shows a customer's number plate clearly. Blur it if the owner
  has not agreed to appear.
- The hero banner JPEG is also the `og:image` (the preview card when the link is
  shared on WhatsApp and elsewhere), next to the canonical URL
  `https://lp.tdmpoonamallee.in/` in `<head>`. It stays a JPEG because WhatsApp
  previews do not reliably render WebP. If the address changes, update the
  canonical, `og:url`, `og:image`, the JSON-LD `url` / `image` and `LIVE_URL` in
  `deploy/deploy-kvm.sh` together (the script refuses to upload if they disagree).

## Changing phone, WhatsApp or address

Edit the `CLIENT` block at the top of `assets/js/main.js` only. Every phone,
WhatsApp and map link on the page (header, hero, FAQ, contact cards, footer,
floating buttons, mobile bar) plus the map embed is rewritten from it at runtime.
If you get the Google Business Profile short link (`maps.app.goo.gl/...`), put it in
`mapShortLink` and every "Get Directions" link will use it.

The `href`s written in `index.html` are the no-JavaScript fallback and should stay
correct too.

## Call to action buttons

- **"Book Free Inspection"** places a call wherever it appears: header, hero, and the
  phone sticky bar. "Get Directions" opens Google Maps directions.
- **Floating Call + WhatsApp** sit in the bottom corners at every screen size (60px on
  tablet and desktop, 54px on phones, where they float 14px above the sticky bar).
  On phones they always stay beside the sticky bar; the footer's bottom padding keeps
  its last line above them. On tablet and desktop, at the very end of the page they
  rise just enough to clear the copyright line, so the footer needs no extra padding.
- **Phones:** the hero's "Book Free Inspection" and "Get Directions" buttons are
  hidden and move into a sticky bar pinned to the bottom of the screen: a solid red
  pill and an outlined pill, as on the Kar Care Yelahanka page.
- `whatsappMessage` in the `CLIENT` block is the prefilled text for the WhatsApp button.

## Tracking

Live for Google Ads account `AW-17512378912` (set up 19 Sep 2026; the account's
website is tdmpoonamallee.in, the page is served from lp.tdmpoonamallee.in):

- The Google tag (gtag.js) is in `<head>` of `index.html`, exactly as Google gave it.
- The two conversion actions are in the `ADS` block at the top of `main.js`:

| Conversion action | Label | Fires on |
|---|---|---|
| PC - LP - Phone Call Click | `TEzwCJOaqv0cEKDkxp5B` | every `tel:` link: header, hero and mobile-bar "Book Free Inspection", FAQ Call Now, contact card phone, footer phone, floating Call |
| PC - LP - WhatsApp Click | `4VS2CJzWqv0cEKDkxp5B` | every `wa.me` link: FAQ WhatsApp, contact card WhatsApp, floating WhatsApp |

Both send value 1.0 INR. One click handler finds the links by their `href`, so any
call or WhatsApp link added later is tracked automatically. Clicks are never delayed:
`tel:` hands off to the dialer and WhatsApp opens a new tab, so the page stays open
while the hit sends.

Do not paste Google's per-conversion event snippets into the page. Both define the
same `gtag_report_conversion` function, so the second silently overwrites the first
and every click would count as one action. Change labels in the `ADS` block instead.

Optional: set `ADS.ga4` to a GA4 measurement ID (and add its `gtag('config', ...)`
line in `<head>`) to also get `click_call` / `click_whatsapp` events in GA4 with the
button's location (`data-cta`). They are addressed to GA4 only, never to Ads.

To check it once live: open the site with Google Tag Assistant
(tagassistant.google.com), click a call and a WhatsApp button, and confirm the two
conversions fire. Google Ads shows the actions as "Recording conversions" within
about a day of the first real clicks.

## Responsive behaviour

| Width | Behaviour |
|---|---|
| 1380px and up | Full layout; hero slide ticker bottom right; floating Call (left) and WhatsApp (right) |
| 768 to 1379px | Hero slide ticker lifted above the floating buttons |
| 900px and below | Splits, About, FAQ, contact and footer stack; services go 2 across |
| 767px and below | Matches the Kar Care Yelahanka mobile layout: logo centred on its own (header button hidden); hero copy centred between the header and the floating buttons; service name right aligned (white, red dot) just above the WhatsApp button; hero buttons move to a sticky Book Free Inspection + Get Directions bar; floating Call and WhatsApp in the corners above it; services 1 across with icon and title on one row; footer left aligned |
| Phones under 620px tall | Hero padding trimmed so the hero still fits the screen |

## Motion

- Hero: the banner is on screen from the first paint (no black while loading: a
  500-byte blurred preview inside `style.css` shows until the photo arrives) and
  settles from a slow zoom. The header drops in, the headline rises line by line, and
  the service names tick through every 5.2s. The copy, floating buttons and phone bar
  enter with pure CSS, so a slow `main.js` never holds them back. (Extra `.slide`
  elements would rotate with the names automatically.)
- If you replace `hero-banner.jpg`, regenerate the blurred preview too (the
  `data:image/jpeg` URL on `.hero` in `style.css`), or the old photo flashes briefly.
- On scroll: section heads rise and unblur, cards cascade in reading order, the map
  wipes up, the hero image drifts slower than the page, and a red progress bar tracks
  the scroll. The four section photos have no entrance animation (client request,
  18 Sep): they are simply there when you scroll to them.
- Floating buttons: ripple rings, a periodic phone "ring" and WhatsApp pulse; on
  desktop hover they expand to show their label. The phone sticky bar slides up on
  load and a light sweep runs across "Book Free Inspection".
- `prefers-reduced-motion` turns all of it off and shows everything immediately.
- Without JavaScript nothing is hidden: reveals, FAQ answers, floating buttons and the
  mobile bar all render in their final state.

When editing reveals: never put `clip-path` on the element carrying `data-reveal`.
IntersectionObserver treats a fully clipped target as not intersecting, so its
reveal would never fire. The wipe lives on the element's first child for that reason.

## Launch checklist

- [x] Real photos in the five slots, with `alt` text
- [x] Denting & Painting photo (grey i20, 18 Sep)
- [ ] Number plate in the Why Us photo blurred, or the owner's OK
- [x] Google tag in `<head>` and conversion labels in `ADS` (AW-17512378912)
- [x] Canonical URL and JPEG `og:image` (https://lp.tdmpoonamallee.in/)
- [x] Launch QA (`audit-report.md`, 19 Sep): deploy-ready
- [x] On the Profitcast KVM with HTTPS at the review link (`DEPLOYMENT.md`)
- [x] Code on GitHub (profitcastdev-byte/tdm-poonamallee)
- [ ] DNS at Hostinger: `A lp -> 187.127.149.216`, then the certbot `--expand` in `DEPLOYMENT.md`
- [ ] Google Ads final URLs switched to https://lp.tdmpoonamallee.in/
- [ ] After launch: verify both conversions in Google Tag Assistant
- [ ] Final FAQ answers 2 to 6 (or confirm the brief-sourced ones)
- [ ] Google Business Profile short link in `CLIENT.mapShortLink` (optional)
- [ ] Bump `?v=` on the CSS and JS links after any edit
