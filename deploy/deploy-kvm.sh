#!/usr/bin/env bash
# TDM Poonamallee landing page -> Profitcast KVM (root@187.127.149.216)
#
#   bash deploy/deploy-kvm.sh              upload, swap in, verify
#   bash deploy/deploy-kvm.sh --check      is the KVM running exactly this page? (changes nothing)
#   bash deploy/deploy-kvm.sh --rollback   swap the previous release back in (run again to undo)
#
# PowerShell and cmd have no bash on PATH here: run deploy-kvm.cmd from the
# project root instead, with the same arguments.
#
# Content only. The nginx vhost and SSL certificate are one-time server setup
# (deploy/nginx/, DEPLOYMENT.md) and this script never touches them: the KVM
# hosts ~60 live client sites, so nothing here edits nginx or reloads it.
set -euo pipefail

HOST="root@187.127.149.216"
DOCROOT="/var/www/lp.tdmpoonamallee.in"
LIVE_URL="https://lp.tdmpoonamallee.in"
PREVIEW_URL="https://tdmpoonamallee-preview.187.127.149.216.nip.io"
MODE="${1:-deploy}"

cd "$(dirname "$0")/.."        # project root, wherever this is run from
export COPYFILE_DISABLE=1      # macOS tar: don't ship ._AppleDouble files

ssh_kvm() { ssh -o BatchMode=yes -o ConnectTimeout=15 "$HOST" "$@"; }

# Every file that is served, and nothing else. An allowlist, not a list of
# excludes: this repo also holds README.md, audit-report.md, DEPLOYMENT.md,
# deploy/ and the deploy zip, none of which belong on a public server.
# hero-banner.jpg does ship: it is the og:image that WhatsApp and Facebook fetch
# for link previews.
ship_files() {
  { echo index.html
    find assets -type f ! -name '.*' ! -name Thumbs.db ! -name desktop.ini
  } | LC_ALL=C sort
}

# "hash  path" per file, sorted. Git Bash's md5sum prints "hash *path" and macOS
# only has `md5 -r`, so both are normalised to the Linux form.
normalise() { sed -E 's/^([0-9a-f]{32})[[:space:]]+\*?/\1  /' | LC_ALL=C sort -k2; }
local_sums() {
  ship_files | while IFS= read -r f; do
    if command -v md5sum >/dev/null 2>&1; then md5sum "$f"; else md5 -r "$f"; fi
  done | normalise
}
remote_sums() {
  ssh_kvm "cd $DOCROOT && find . -type f | sed 's|^[.]/||' | LC_ALL=C sort | xargs -d '\n' md5sum" | normalise
}

# The page states its own address in canonical, og:url and og:image. Shipping it
# with a different address than the one it is served on breaks WhatsApp link
# previews and splits search ranking, so refuse.
check_page_urls() {
  local tag
  for tag in 'rel="canonical" href' 'property="og:url" content' 'property="og:image" content'; do
    grep -qF "${tag}=\"${LIVE_URL}/" index.html \
      || { echo "!! index.html: ${tag%% *} does not point at ${LIVE_URL}/ - nothing uploaded"; exit 1; }
  done
}

preflight() {
  echo "-> connecting to $HOST"
  ssh_kvm "test -L /etc/nginx/sites-enabled/${DOCROOT##*/}" \
    || { echo "!! ${DOCROOT##*/} is not enabled on the KVM - see DEPLOYMENT.md, one-time setup"; exit 1; }
  echo "   connected; vhost enabled"
}

verify() {
  echo "-> comparing local files with $DOCROOT"
  if diff -q <(local_sums) <(remote_sums) >/dev/null; then
    echo "   identical ($(ship_files | wc -l | tr -d ' ') files)"
  else
    echo "!! the KVM is NOT running this version of the page:"; diff <(local_sums) <(remote_sums) | head -20
    return 1
  fi
  for url in "$PREVIEW_URL" "$LIVE_URL"; do
    code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$url/" 2>/dev/null) \
      || code="not reachable yet (DNS record or SSL certificate missing)"
    echo "   $url -> $code"
  done
}

case "$MODE" in
  --check)
    preflight
    verify
    ;;
  --rollback)
    preflight
    ssh_kvm "set -e; D=$DOCROOT
      [ -d \$D.prev ] || { echo '!! no previous release to roll back to - nothing changed'; exit 1; }
      mv \$D \$D.swap && mv \$D.prev \$D && mv \$D.swap \$D.prev
      echo '   swapped: the previous release is live, the one it replaced is now .prev'"
    ;;
  deploy)
    check_page_urls
    preflight
    echo "-> uploading $(ship_files | wc -l | tr -d ' ') files"
    ship_files | tar -czf - -T - | ssh_kvm "set -e; D=$DOCROOT
      T=\$(mktemp -d /var/www/.tdmpoonamallee-new.XXXX)
      trap '[ -d \"\$T\" ] && rm -rf \"\$T\"' EXIT
      tar -xzf - -C \"\$T\" --no-same-owner --warning=no-unknown-keyword
      [ -f \"\$T/index.html\" ] || { echo '!! upload has no index.html - nothing changed'; exit 1; }
      chown -R www-data:www-data \"\$T\"
      find \"\$T\" -type d -exec chmod 755 {} +
      find \"\$T\" -type f -exec chmod 644 {} +
      if [ -d \"\$D\" ]; then
        rm -rf \"\$D.prev\"
        mv \"\$D\" \"\$D.prev\"
        mv \"\$T\" \"\$D\" || { mv \"\$D.prev\" \"\$D\"; echo '!! swap failed - previous release restored, nothing changed'; exit 1; }
        echo \"   swapped in; previous release kept at \$D.prev\"
      else
        mv \"\$T\" \"\$D\"
        echo \"   first release is live at \$D\"
      fi"
    verify
    ;;
  *)
    echo "usage: bash deploy/deploy-kvm.sh [--check | --rollback]"; exit 2
    ;;
esac
