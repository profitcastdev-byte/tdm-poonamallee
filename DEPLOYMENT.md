# Deploying to the Profitcast KVM

| | |
| --- | --- |
| Server | Profitcast KVM: Hostinger VPS `root@187.127.149.216` (srv1575430, Ubuntu, nginx 1.24) |
| Review link | <https://tdmpoonamallee-preview.187.127.149.216.nip.io> (live now, HTTPS, kept out of Google with noindex) |
| Live address | <https://lp.tdmpoonamallee.in> (waiting on one DNS record, see *Going live*) |
| Files | `/var/www/lp.tdmpoonamallee.in`, previous release at `.prev` |
| nginx vhost | `/etc/nginx/sites-available/lp.tdmpoonamallee.in`, source in `deploy/nginx/` |
| Certificate | certbot lineage `lp.tdmpoonamallee.in`, valid to 18 December 2026, renews automatically |
| Code | <https://github.com/profitcastdev-byte/tdm-poonamallee> |

Set up the same way as the TDM ECR pages (`TDM ECR - Wash - Landing Page`),
whose `DEPLOYMENT.md` this follows. SSH is key-based from this PC
(`~/.ssh/id_ed25519`). Deploying from another machine needs that machine's
public key added to `/root/.ssh/authorized_keys` on the server first.

---

## Updating the page

From the project root, in PowerShell or cmd:

```powershell
.\deploy-kvm.cmd              # upload, swap in, verify
.\deploy-kvm.cmd --check      # is the KVM running exactly this page? (changes nothing)
.\deploy-kvm.cmd --rollback   # put the previous release back (run again to undo)
```

From Git Bash, macOS or Linux: `bash deploy/deploy-kvm.sh [--check | --rollback]`.

A deploy:

1. Refuses to start if `canonical`, `og:url` or `og:image` in `index.html` do
   not point at `https://lp.tdmpoonamallee.in/`.
2. Uploads only the 22 files the page serves: `index.html` and `assets/`.
   README, the audit report, this file, `deploy/`, `.claude/` and the zip never
   leave this machine.
3. Unpacks beside the live folder and swaps it in, keeping the previous release
   as `.prev`, so visitors never load a half-uploaded page.
4. Compares a checksum of every file on both ends, then prints the HTTP status
   of both addresses.

It only ever touches the site's files. It never edits nginx, reloads it or
changes certificates.

**Edited `style.css` or `main.js`?** Bump `?v=` on its link in `index.html`
(currently `style.css?v=17`, `main.js?v=9`) before deploying. The server tells
browsers to keep CSS and JS for a day.

**Replaced a photo?** Give the new file a new name, or bump the `?v=` on its
references in `index.html`. Photos are cached for 30 days, so a file swapped
under the same URL stays old for returning visitors.

After any change, rebuild the deploy zip (README, *Deploy*), commit it with the
change and push to GitHub, so the repo always matches what is live.

---

## Going live on lp.tdmpoonamallee.in

The domain's DNS is managed at Hostinger (nameservers `*.dns-parking.com`).
`tdmpoonamallee.in` itself is a Hostinger parked page; leave the `@` and `www`
records alone. Only names under `lp` point at the KVM.

1. **Add the DNS record** in hPanel → Domains → tdmpoonamallee.in →
   DNS / Nameservers → Manage DNS records:

   | Type | Name | Points to | TTL |
   | --- | --- | --- | --- |
   | `A` | `lp` | `187.127.149.216` | default |
   | `A` | `*.lp` | `187.127.149.216` | default (optional, see below) |

   `lp` is the one this page needs. The wildcard `*.lp` follows the house
   scheme (`<page>.lp.<domain>`) so later pages such as `ppf.lp.tdmpoonamallee.in`
   need no new record, but it does **not** cover `lp.tdmpoonamallee.in` itself,
   so it cannot replace the first row. Until a page exists for a name under the
   wildcard, that name lands on another client's site on this shared server
   (plain HTTP) or shows a certificate warning (HTTPS).

   On 19 September 2026 neither record existed (`lp.tdmpoonamallee.in` returned
   NXDOMAIN at `athena.dns-parking.com`). The domain has no CAA records, so
   Let's Encrypt can issue for it.

2. **Wait until public DNS returns the KVM:**

   ```powershell
   Resolve-DnsName lp.tdmpoonamallee.in -Server 8.8.8.8
   ```

3. **Add the live name to the certificate**, on the server:

   ```bash
   ssh root@187.127.149.216
   certbot --nginx --non-interactive --redirect --expand --cert-name lp.tdmpoonamallee.in -d tdmpoonamallee-preview.187.127.149.216.nip.io -d lp.tdmpoonamallee.in
   ```

   This fails until step 2 passes. Until it runs, `http://lp.tdmpoonamallee.in`
   answers 404. That is certbot's placeholder, not a fault.

4. **Check:** `.\deploy-kvm.cmd --check` should show 200 for both addresses.

5. **Point the Google Ads final URLs** at `https://lp.tdmpoonamallee.in/`,
   then make one real Call click and one WhatsApp click from a phone and
   confirm both land in Google Ads → Goals → Conversions (or watch them fire in
   Google Tag Assistant).

If an office PC shows **ERR_SSL_PROTOCOL_ERROR** right after the switch while a
phone on mobile data loads the page fine, the office router is serving a cached
DNS answer. The site is fine. Compare `Resolve-DnsName <name> -Server 192.168.1.1`
with `-Server 8.8.8.8`.

---

## How the server was set up (19 September 2026)

Recorded so it can be rebuilt. It does not need running again.

```bash
# 1. vhost: the HTTP-only source; certbot adds :443 and the redirect itself
ssh root@187.127.149.216 'set -o noclobber; cat > /etc/nginx/sites-available/lp.tdmpoonamallee.in' < deploy/nginx/lp.tdmpoonamallee.in.conf

# 2. on the server: enable, test, reload
ln -s /etc/nginx/sites-available/lp.tdmpoonamallee.in /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 3. from this PC: the files
.\deploy-kvm.cmd

# 4. on the server: HTTPS for the review link (Profitcast's certbot account already exists)
certbot --nginx --non-interactive --redirect --cert-name lp.tdmpoonamallee.in -d tdmpoonamallee-preview.187.127.149.216.nip.io
certbot renew --dry-run --no-random-sleep-on-renew --cert-name lp.tdmpoonamallee.in
```

Verified after setup:

- `nginx -t`: no errors and no conflicting server names; no other vhost claims
  either name
- HTTP redirects to HTTPS; Let's Encrypt certificate valid to 18 December 2026,
  renewal dry run passes
- `nosniff` and `Referrer-Policy` on every response: page, CSS, JS and images
- gzip on HTML, CSS and JS
- Cache: page revalidated on every visit, CSS/JS 1 day, photos 30 days
- `X-Robots-Tag: noindex, nofollow` on the review link; the live name, tested
  by forcing it to this server, answers 200 with no `X-Robots-Tag`
- Dotfiles return 403; README, the audit report, this file, `deploy/`,
  `deploy-kvm.cmd` and the zip return 404
- All 21 files the page references return 200; the Google Ads tag and both
  conversion labels are in the served page, and every call and WhatsApp button
  fires its conversion (tested with Google blocked, so nothing reached the account)
- Rendered in Chrome from the review link at 390 and 1440 px: all photos load,
  no JavaScript errors, no sideways scroll
- Deploy, `--check` and `--rollback` (and its undo) all exercised from
  PowerShell; files owned by `www-data`, 644/755
- Eight neighbouring sites (karcare-preview, tdmecr-wash-preview,
  tdmecr-ppf-preview, lp.meditarina.in, lp.gentechcarcare.com, lp.slcarcare.com,
  ppf.tdmhyderabad.in, the bare IP) returned 200 before and after every change

---

## Rules for this server

It is shared production: about 60 live client sites.

- **`nginx -t` before every `systemctl reload nginx`.** Reloading a broken
  config takes every site down. If the test fails, remove what you just added
  before anything else.
- `nginx -t` may print *could not build optimal server_names_hash* warnings.
  They predate this site and are harmless; the last line (*test is
  successful*) is what counts.
- **Never add `default_server`.** `rentla-preview` holds it, and moving it
  changes where every unmatched hostname on the box lands.
- **Scope certbot dry runs** with `--cert-name lp.tdmpoonamallee.in`. Without
  it certbot simulates every certificate on the box, which takes many minutes
  and holds a lock. Add `--no-random-sleep-on-renew` as well: run over SSH
  without a terminal, certbot otherwise sits through a random delay of up to
  8 minutes before it starts.
- `grep -r` over `sites-enabled/` silently finds nothing, because the entries
  are symlinks. Use `grep -H pattern /etc/nginx/sites-enabled/*`.

### Taking the site offline

```bash
rm /etc/nginx/sites-enabled/lp.tdmpoonamallee.in
nginx -t && systemctl reload nginx
```

Files, vhost and certificate stay in place, so bringing it back is the `ln -s`
line from setup step 2, then `nginx -t` and reload.
