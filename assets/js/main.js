/* ==========================================================================
   The Detailing Mafia Poonamallee | Landing Page
   --------------------------------------------------------------------------
   >>> CLIENT DETAILS : EDIT THIS BLOCK ONLY <<<
   Change the values below and every phone, WhatsApp and map link on the page
   updates automatically (header, hero, FAQ, contact cards, footer, floating
   buttons, mobile bar).
   ========================================================================== */
const CLIENT = {
  // Phone. Digits only, with country code, no '+' and no spaces.
  phone:        '919677182090',
  phoneDisplay: '+91 96771 82090',

  // WhatsApp. Usually the same number.
  whatsapp:        '919677182090',
  whatsappMessage: "Hi, I'd like to book a free inspection at The Detailing Mafia Poonamallee.",

  // Address exactly as it should read on the page, one entry per line.
  addressLines: ['60/5b, Poonamallee Bypass Rd,', 'Senneer Kuppam, Chennai - 600056'],

  // What Google Maps is asked to find. Leading with the business name lands
  // the pin on the Google Business Profile rather than on the street.
  mapQuery: 'The Detailing Mafia Poonamallee, 60/5b, Poonamallee Bypass Rd, Senneer Kuppam, Chennai 600056',

  // Optional: the profile's short link (https://maps.app.goo.gl/...). When set,
  // it replaces the generated directions link everywhere on the page.
  mapShortLink: ''
};

CLIENT.mapLink = CLIENT.mapShortLink ||
  ('https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(CLIENT.mapQuery));
CLIENT.mapEmbed = 'https://www.google.com/maps?q=' +
  encodeURIComponent(CLIENT.mapQuery) + '&z=16&output=embed';
/* ====================== END OF CLIENT DETAILS BLOCK ====================== */


/* ==========================================================================
   GOOGLE ADS CONVERSION TRACKING (account AW-17512378912, tdmpoonamallee.in)
   The Google tag (gtag.js) itself is in the <head> of index.html. The two
   conversion actions live here as data and fire through one click handler
   (section 10) for every phone and WhatsApp link on the page.

   NOTE: Google hands out the same function name (`gtag_report_conversion`)
   in every event snippet. Pasting both snippets as-is means the second
   silently overwrites the first, and every click would count as that one
   conversion. So never paste the snippets; change the labels here instead.
   ========================================================================== */
const ADS = {
  id: 'AW-17512378912',
  conversions: {
    // PC - LP - Phone Call Click
    phone:    { send_to: 'AW-17512378912/TEzwCJOaqv0cEKDkxp5B', value: 1.0, currency: 'INR' },
    // PC - LP - WhatsApp Click
    whatsapp: { send_to: 'AW-17512378912/4VS2CJzWqv0cEKDkxp5B', value: 1.0, currency: 'INR' }
  },
  // Optional GA4 measurement ID ('G-XXXXXXXXXX'). When set, and its
  // gtag('config', ...) line is added in <head>, each click also sends
  // click_call / click_whatsapp to GA4 with the button's location.
  ga4: ''
};
/* ==================== END OF CONVERSION TRACKING BLOCK ==================== */


(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const motionQuery  = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduceMotion = () => motionQuery.matches;

  const waLink = () =>
    'https://wa.me/' + CLIENT.whatsapp + '?text=' + encodeURIComponent(CLIENT.whatsappMessage);

  /* ----------------------------------------------------------------------
     1. Client details into every link
     ---------------------------------------------------------------------- */
  function applyClientDetails() {
    $$('a[href^="tel:"]').forEach(a => { a.href = 'tel:+' + CLIENT.phone; });
    $$('a[href*="wa.me/"]').forEach(a => { a.href = waLink(); });
    $$('[data-maplink]').forEach(a => { a.href = CLIENT.mapLink; });
    $$('[data-client="phone"]').forEach(el => { el.textContent = CLIENT.phoneDisplay; });
    // Each line wraps only at its last comma, so "Chennai - 600056" never
    // leaves the postcode on a line of its own. (A no-break space cannot do
    // this: line breaking still allows a break straight after a hyphen.)
    const renderLine = line => {
      const cut = line.lastIndexOf(', ');
      if (cut < 0) return [line];
      const keep = document.createElement('span');
      keep.className = 'nowrap';
      keep.textContent = line.slice(cut + 2);
      return [line.slice(0, cut + 2), keep];
    };
    $$('[data-client="address-lines"]').forEach(el => {
      el.replaceChildren(...CLIENT.addressLines.flatMap((line, i) =>
        (i ? [document.createElement('br')] : []).concat(renderLine(line))));
    });

    // only reassign when it differs, so the iframe is not fetched twice
    const map = $('[data-map]');
    if (map && map.getAttribute('src') !== CLIENT.mapEmbed) map.src = CLIENT.mapEmbed;

    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ----------------------------------------------------------------------
     2. One rAF-throttled scroll loop for everything scroll-linked.
        Measurements are read once per frame before any handler writes,
        so the handlers never force a layout between them.
     ---------------------------------------------------------------------- */
  const scrollHandlers = [];
  let frameQueued = false;
  const metrics = { y: 0, max: 0, vh: 0, vw: 0, rowTop: Infinity, rowLeft: 0 };
  let footerRow = null;   // set by initFloatingCTAs

  function measure() {
    metrics.y   = window.scrollY;
    metrics.vh  = window.innerHeight;
    metrics.vw  = window.innerWidth;
    metrics.max = document.documentElement.scrollHeight - metrics.vh;
    if (footerRow) {
      const r = footerRow.getBoundingClientRect();
      metrics.rowTop  = r.top;
      metrics.rowLeft = r.left;
    }
  }
  function runFrame() {
    frameQueued = false;
    measure();
    scrollHandlers.forEach(fn => fn(metrics));
  }
  function queueFrame() {
    if (frameQueued) return;
    frameQueued = true;
    requestAnimationFrame(runFrame);
  }
  const onScroll = fn => scrollHandlers.push(fn);
  window.addEventListener('scroll', queueFrame, { passive: true });
  window.addEventListener('resize', queueFrame, { passive: true });

  /* ----------------------------------------------------------------------
     3. Header state + reading progress bar
     ---------------------------------------------------------------------- */
  function initHeader() {
    const header = $('#siteHeader');
    const bar = $('.scroll-progress span');

    onScroll(m => {
      if (header) header.classList.toggle('is-scrolled', m.y > 24);
      if (bar) {
        const p = m.max > 0 ? Math.min(1, Math.max(0, m.y / m.max)) : 0;
        bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      }
    });
  }

  /* ----------------------------------------------------------------------
     4. Smooth scroll for in-page anchors
        Hand-rolled rather than `behavior:'smooth'`: the native curve is
        short and stops abruptly. This eases in and out over a distance-
        scaled duration, and hands control back the moment the visitor
        scrolls themselves.
     ---------------------------------------------------------------------- */
  const easeInOutCubic = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let scrollRaf = 0;

  function scrollToY(targetY) {
    cancelAnimationFrame(scrollRaf);
    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) return;

    const duration = Math.min(1250, Math.max(650, Math.abs(distance) * .45));
    const t0 = performance.now();

    const step = now => {
      const t = Math.min(1, (now - t0) / duration);
      window.scrollTo(0, startY + distance * easeInOutCubic(t));
      if (t < 1) scrollRaf = requestAnimationFrame(step);
    };
    scrollRaf = requestAnimationFrame(step);
  }

  function initSmoothScroll() {
    const stop = () => cancelAnimationFrame(scrollRaf);
    ['wheel', 'touchstart', 'keydown'].forEach(ev =>
      window.addEventListener(ev, stop, { passive: true }));

    // height of the compact (scrolled) header
    const headerOffset = () => (window.innerWidth < 768 ? 74 : 92);

    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const hash = link.getAttribute('href');
        if (!hash || hash.length < 2) return;
        const target = document.getElementById(hash.slice(1));
        if (!target) return;

        e.preventDefault();
        const y = target.id === 'top' ? 0 :
          Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset());

        if (reduceMotion()) window.scrollTo(0, y);
        else scrollToY(y);

        // keep keyboard focus in step, without a second jump
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ----------------------------------------------------------------------
     5. Hero: the banner wipes in on load, then the service names under the
        hero tick through on a timer. If more banners are ever added as extra
        .slide elements, they rotate with the names automatically.
     ---------------------------------------------------------------------- */
  const SLIDE_MS = 5200;

  // drop a class without its transition, so the element snaps back to rest
  function resetInstant(el, cls) {
    el.style.transition = 'none';
    el.classList.remove(cls);
    void el.offsetWidth;
    el.style.transition = '';
  }

  function initHero() {
    const hero = $('.hero');
    if (!hero) return;

    const slides = $$('.slide', hero);
    const labels = $$('.indicator-list span', hero);
    const rule   = $('.indicator-rule i', hero);

    // The banner is visible from the first paint (style.css); marking it
    // active starts its slow settle from the zoomed-in start. The copy's
    // entrance is pure CSS and does not wait for this script.
    if (slides[0]) void slides[0].offsetWidth;
    requestAnimationFrame(() => {
      if (slides[0]) slides[0].classList.add('is-active');
    });

    const rotateSlides = slides.length > 1;
    const rotateLabels = labels.length > 1;
    if ((!rotateSlides && !rotateLabels) || reduceMotion()) return;

    hero.style.setProperty('--slide-ms', SLIDE_MS + 'ms');
    let step = 0;
    let timer = 0;
    let running = false;
    let heroInView = true;

    const restartRule = () => {
      if (!rule) return;
      rule.classList.remove('is-running');
      void rule.offsetWidth;
      rule.classList.add('is-running');
    };

    const swap = (items, leaveMs) => {
      const prev = items[step % items.length];
      const next = items[(step + 1) % items.length];
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
      next.classList.add('is-active');
      setTimeout(() => resetInstant(prev, 'is-leaving'), leaveMs);
    };

    const advance = () => {
      if (rotateSlides) swap(slides, 1500);
      if (rotateLabels) swap(labels, 800);
      step += 1;
      restartRule();
    };

    const play = () => {
      if (running) return;
      running = true;
      restartRule();
      timer = setInterval(advance, SLIDE_MS);
    };
    const pause = () => {
      running = false;
      clearInterval(timer);
      if (rule) rule.classList.remove('is-running');
    };
    const sync = () => (heroInView && !document.hidden ? play() : pause());

    document.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        heroInView = entry.isIntersecting;
        sync();
      }).observe(hero);
    } else {
      play();
    }
  }

  /* ----------------------------------------------------------------------
     6. Scroll-linked hero depth: the image drifts slower than the page and
        the copy eases back as it leaves. Motion-safe only.
     ---------------------------------------------------------------------- */
  function initHeroParallax() {
    const hero    = $('.hero');
    const media   = $('.hero-slides');
    const content = $('.hero-content');
    if (!hero || !media || reduceMotion()) return;

    let heroH = hero.offsetHeight;
    window.addEventListener('resize', () => { heroH = hero.offsetHeight; }, { passive: true });

    onScroll(m => {
      if (m.y > heroH) return;
      media.style.transform = 'translate3d(0,' + (m.y * .28).toFixed(1) + 'px,0)';

      if (content) {
        if (m.vw >= 768) {
          const p = Math.min(1, m.y / (heroH * .8));
          content.style.transform = 'translate3d(0,' + (m.y * .12).toFixed(1) + 'px,0)';
          content.style.opacity = (1 - p * .9).toFixed(3);
        } else if (content.style.transform) {
          content.style.transform = '';
          content.style.opacity = '';
        }
      }
    });
  }

  /* ----------------------------------------------------------------------
     7. Scroll reveals
        Everything is visible by default; the hidden starting state only
        exists under html.js with motion allowed (see style.css). Items that
        enter together are staggered in reading order, so a grid cascades
        but a lone item never waits on siblings it has no relation to.
     ---------------------------------------------------------------------- */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;

    const revealAll = () => items.forEach(el => el.classList.add('is-in'));
    window.addEventListener('beforeprint', revealAll);

    if (reduceMotion() || !('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    // once the entrance has played, hand the element back to its own
    // hover transitions
    const release = (el, delay) => {
      setTimeout(() => {
        el.removeAttribute('data-reveal');
        el.style.removeProperty('--d');
      }, delay + 2100);
    };

    const io = new IntersectionObserver(entries => {
      const entering = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => ({ el: entry.target, r: entry.boundingClientRect }))
        .sort((a, b) => (a.r.top - b.r.top) || (a.r.left - b.r.left));

      entering.forEach(({ el }, k) => {
        const delay = Math.min(k * 90, 540);
        el.style.setProperty('--d', delay + 'ms');
        el.classList.add('is-in');
        io.unobserve(el);
        release(el, delay);
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });

    items.forEach(el => io.observe(el));
  }

  /* ----------------------------------------------------------------------
     8. FAQ accordion, one open at a time.
         The height animation is pure CSS (grid-template-rows 0fr to 1fr);
         this toggles the class and keeps aria in sync.
     ---------------------------------------------------------------------- */
  function initFaq() {
    const items = $$('.faq-item');

    const setOpen = (item, open) => {
      item.classList.toggle('is-open', open);
      const btn = $('.faq-q button', item);
      if (btn) btn.setAttribute('aria-expanded', String(open));
    };

    items.forEach(item => {
      const btn = $('.faq-q button', item);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        items.forEach(other => { if (other !== item) setOpen(other, false); });
        setOpen(item, willOpen);
      });
    });
  }

  /* ----------------------------------------------------------------------
     9. Floating Call + WhatsApp (every screen size) and, on phones, the
        sticky Book / Directions bar. Their entrance is pure CSS; this only
        adds .is-visible once they have arrived, which starts the ripple
        rings and the sheen. On phones the floating buttons sit in the
        corners just above the bar.

        Tablet and desktop: at the end of the page the floating buttons rise
        just enough to clear the copyright line, instead of covering it. They
        settle in the gap between the footer content and that line (the
        row's margin keeps that gap wider than a button). This only happens
        where the row's text reaches under a button (screens narrower than
        about 1380px); on wider screens the page margin already keeps them
        apart, so they never move. Uses the CSS `translate` property, which
        the entrance transition does not touch, so the rise tracks the
        scroll exactly.

        Phones: the buttons always stay beside the sticky bar. The footer's
        bottom padding (style.css) keeps its last line above them instead.
     ---------------------------------------------------------------------- */
  const FAB_GAP = 10;   // clearance between a raised button and the copyright text
  const PHONE_MAX = 767.98;   // below this the sticky bar shows and the buttons never rise

  function initFloatingCTAs() {
    const fabs = $$('.fab');
    const targets = fabs.concat($$('#mobileBar'));
    const show = () => targets.forEach(el => el.classList.add('is-visible'));
    setTimeout(show, reduceMotion() ? 0 : 1000);

    footerRow = $('.footer-bottom');
    if (!footerRow || !fabs.length) return;

    // position and size differ per breakpoint, so re-read them on resize
    const readLayout = () => {
      const cs = getComputedStyle(fabs[0]);
      return {
        bottom: parseFloat(cs.bottom) || 28,                                     // resting offset
        reach:  (parseFloat(cs.left) || 28) + (parseFloat(cs.height) || 60),     // far edge
        rowPad: parseFloat(getComputedStyle(footerRow).paddingTop) || 0
      };
    };
    let layout = readLayout();
    window.addEventListener('resize', () => { layout = readLayout(); }, { passive: true });
    let lastRise = -1;

    onScroll(m => {
      const overlaps = m.vw > PHONE_MAX && m.rowLeft < layout.reach + FAB_GAP;
      const textTop = m.rowTop + layout.rowPad;
      const rise = overlaps
        ? Math.max(0, Math.round((m.vh - layout.bottom) - (textTop - FAB_GAP)))
        : 0;
      if (rise === lastRise) return;
      lastRise = rise;
      const value = rise ? '0 ' + (-rise) + 'px' : '';
      fabs.forEach(f => { f.style.translate = value; });
    });
  }

  /* ----------------------------------------------------------------------
     10. Conversion tracking
         Fires for every phone and WhatsApp link on the page, found by href,
         so links added later are covered with no inline onclick handlers.
         tel: hands off to the dialer and WhatsApp opens a new tab, so
         neither unloads this page and the ping has time to send.
     ---------------------------------------------------------------------- */
  function initConversionTracking() {
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href') || '';
      const type = href.startsWith('tel:') ? 'phone'
                 : href.includes('wa.me/') ? 'whatsapp'
                 : null;
      if (!type || typeof window.gtag !== 'function') return;

      // GA4 event with the button's location, only when a GA4 property is set
      // (addressed to it, so the Ads account never receives these)
      if (ADS.ga4) {
        window.gtag('event', type === 'phone' ? 'click_call' : 'click_whatsapp', {
          send_to: ADS.ga4,
          cta_location: link.dataset.cta || 'unknown'
        });
      }

      // Google Ads conversion
      const conv = ADS.conversions[type];
      if (ADS.id && conv && conv.send_to) {
        window.gtag('event', 'conversion', {
          send_to: conv.send_to,
          value: conv.value,
          currency: conv.currency
        });
      }
    }, true);
  }

  /* ----------------------------------------------------------------------
     Boot
     ---------------------------------------------------------------------- */
  function init() {
    applyClientDetails();
    initHeader();
    initSmoothScroll();
    initHero();
    initHeroParallax();
    initReveal();
    initFaq();
    initFloatingCTAs();
    initConversionTracking();
    runFrame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
