document.addEventListener('DOMContentLoaded', function () {
  // ---------- Nav: scroll state + mobile menu ----------
  (function () {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const isHome = document.body.classList.contains('home');
    const hero = document.querySelector('.hero');
    const revealThreshold = isHome && hero ? hero.offsetHeight / 2 : 40;

    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > revealThreshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const burger = document.querySelector('.nav-burger');
    const links = document.querySelector('.nav-links');
    if (burger && links) {
      burger.addEventListener('click', () => {
        burger.classList.toggle('open');
        links.classList.toggle('open');
        if (!links.classList.contains('open')) closeAllDropdowns();
      });
      links.querySelectorAll('a').forEach((a) =>
        a.addEventListener('click', () => {
          burger.classList.remove('open');
          links.classList.remove('open');
          closeAllDropdowns();
        })
      );
    }

    // highlight active nav link
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link[data-page]:not([data-section])').forEach((a) => {
      if (a.dataset.page === path) a.classList.add('active');
    });
    document.querySelectorAll('.nav-dropdown a[data-page]').forEach((a) => {
      if (a.dataset.page === path) a.classList.add('active');
    });
    document.querySelectorAll('[data-page-group]').forEach((el) => {
      const group = el.dataset.pageGroup.split(',');
      if (group.includes(path)) el.classList.add('active');
    });

    // scroll-spy: only mark Projects/About active while their section is in view
    const sectionLinks = document.querySelectorAll('.nav-link[data-section]');
    if (isHome && sectionLinks.length) {
      const sections = Array.from(sectionLinks)
        .map((a) => document.getElementById(a.dataset.section))
        .filter(Boolean);
      const setActiveSection = (id) => {
        sectionLinks.forEach((a) => a.classList.toggle('active', a.dataset.section === id));
      };
      const spyObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((e) => e.isIntersecting);
          if (visible.length) {
            visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
            setActiveSection(visible[0].target.id);
          } else {
            setActiveSection(null);
          }
        },
        { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
      );
      sections.forEach((s) => spyObserver.observe(s));
    }

    // hobbies dropdown: click-to-toggle (works for touch, mouse also gets CSS hover)
    function closeAllDropdowns() {
      document.querySelectorAll('.nav-item-dropdown.open').forEach((item) => {
        item.classList.remove('open');
        const t = item.querySelector('.nav-dropdown-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
    document.querySelectorAll('.nav-item-dropdown').forEach((item) => {
      const toggle = item.querySelector('.nav-dropdown-toggle');
      if (!toggle) return;
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = !item.classList.contains('open');
        closeAllDropdowns();
        item.classList.toggle('open', willOpen);
        toggle.setAttribute('aria-expanded', String(willOpen));
      });
    });
    document.addEventListener('click', closeAllDropdowns);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllDropdowns();
    });
  })();

  // ---------- Hero parallax: background slowest, text a bit faster, the
  // Selected Work section (normal flow, sticky hero pinned beneath it)
  // effectively fastest since it overlays the hero as the page scrolls ----------
  (function () {
    const hero = document.querySelector('.hero');
    const bgLayer = document.querySelector('.hero-bg-layer');
    const textLayer = document.querySelector('.hero-text-layer');
    const scrollCue = document.querySelector('.scroll-cue');
    if (!hero || !bgLayer || !textLayer) return;

    const BG_RATE = 0.3;
    const TEXT_RATE = 0.6;
    const SCROLL_CUE_RATE = 1;

    const onScroll = () => {
      const y = Math.min(window.scrollY, hero.offsetHeight);
      bgLayer.style.transform = `translateY(${-y * BG_RATE}px)`;
      textLayer.style.transform = `translateY(${-y * TEXT_RATE}px)`;
      if (scrollCue) scrollCue.style.transform = `translateX(-50%) translateY(${-y * SCROLL_CUE_RATE}px)`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  // ---------- Reveal on scroll ----------
  (function () {
    const targets = document.querySelectorAll('.reveal, .reveal-stagger');
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    targets.forEach((t) => io.observe(t));
  })();

  // ---------- Smooth scroll for in-page anchors ----------
  (function () {
    document.querySelectorAll('a[href*="#"]').forEach((a) => {
      const url = new URL(a.href, location.href);
      if (url.pathname === location.pathname && url.hash) {
        a.addEventListener('click', (e) => {
          const target = document.querySelector(url.hash);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    });
  })();

  // ---------- Color swatch copy-to-clipboard ----------
  (function () {
    document.querySelectorAll('.swatch').forEach((sw) => {
      sw.addEventListener('click', async () => {
        const hex = sw.dataset.hex;
        try {
          await navigator.clipboard.writeText(hex);
        } catch (e) {
          /* clipboard unavailable, ignore */
        }
        sw.classList.remove('swatch-copied');
        void sw.offsetWidth;
        sw.classList.add('swatch-copied');
      });
    });
  })();

  // ---------- Lightbox (used on masonry / mockup / card grids) ----------
  (function () {
    const triggers = Array.from(document.querySelectorAll('[data-lightbox]'));
    if (!triggers.length) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Close">&#10005;</button>
      <button class="lightbox-prev" aria-label="Previous">&#8249;</button>
      <img alt="" />
      <button class="lightbox-next" aria-label="Next">&#8250;</button>
      <div class="lightbox-count"></div>
    `;
    document.body.appendChild(lightbox);

    const imgEl = lightbox.querySelector('img');
    const countEl = lightbox.querySelector('.lightbox-count');
    let index = 0;

    function show(i) {
      index = (i + triggers.length) % triggers.length;
      imgEl.src = triggers[index].dataset.lightbox;
      countEl.textContent = `${index + 1} / ${triggers.length}`;
    }
    function open(i) {
      show(i);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    triggers.forEach((t, i) => t.addEventListener('click', () => open(i)));
    lightbox.querySelector('.lightbox-close').addEventListener('click', close);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => show(index - 1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => show(index + 1));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });
    window.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'ArrowLeft') show(index - 1);
    });
  })();

  // ---------- Contact form ----------
  (function () {
    const form = document.querySelector('#contact-form');
    if (!form) return;

    const status = form.querySelector('.form-status');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('[required]').forEach((field) => {
        const wrap = field.closest('.field');
        const filled = field.value.trim().length > 0;
        const emailOk = field.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        const ok = filled && emailOk;
        wrap.classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        status.textContent = 'Please fill out all required fields.';
        return;
      }

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const subject = form.subject.value.trim();
      const message = form.message.value.trim();

      const body = `${message}\n\n— ${name} (${email})`;
      const mailto = `mailto:timchaang@gmail.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      window.location.href = mailto;
      status.textContent = 'Opening your email client to send this message…';
    });

    form.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('input', () => {
        field.closest('.field').classList.remove('invalid');
      });
    });
  })();

  // ---------- Contact page decorative background letters ----------
  (function () {
    const layers = document.querySelectorAll('.contact-bg-letters');
    if (!layers.length) return;
    const word = 'CONTACT';
    let out = '';
    for (let i = 0; i < 3; i++) out += word + ' ';
    layers.forEach((el) => {
      el.textContent = out;
    });

    // orange blob that trails the mouse with a bit of lag, revealing the
    // accent-colored copy of the text only within a radius around the cursor
    const hero = document.querySelector('.contact-hero');
    const glow = document.querySelector('.contact-bg-letters-glow');
    if (!hero || !glow) return;

    const EASE = 0.05; // lower = more lag before the blob catches up
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let started = false;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      if (!started) {
        // snap on first move so it doesn't drift in from a stale 0,0 start
        currentX = targetX;
        currentY = targetY;
        started = true;
      }
      hero.classList.add('mouse-active');
    });
    hero.addEventListener('mouseleave', () => {
      hero.classList.remove('mouse-active');
    });

    function tick() {
      currentX += (targetX - currentX) * EASE;
      currentY += (targetY - currentY) * EASE;
      glow.style.setProperty('--mx', `${currentX}px`);
      glow.style.setProperty('--my', `${currentY}px`);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  // ---------- Orphan control ----------
  // CSS has no way to count words on a rendered line, so every <p> is measured
  // at runtime: if its last line has fewer than MIN_LAST_LINE_WORDS words, we
  // tighten letter-spacing (tracking) in small steps until either enough words
  // wrap up onto that line or we hit the tightening floor.
  (function () {
    const paragraphs = Array.from(document.querySelectorAll('p'));
    if (!paragraphs.length) return;

    const MIN_LAST_LINE_WORDS = 5;
    const TRACKING_STEP = -0.006; // em, per attempt
    const MAX_TRACKING = -0.06; // em, floor — keeps text from getting illegibly tight
    const MAX_ATTEMPTS = 12;

    function wrapWords(p) {
      const text = p.textContent.trim();
      if (!text) return null;
      const words = text.split(/\s+/);
      if (words.length < MIN_LAST_LINE_WORDS) return null; // can never reach the minimum
      p.innerHTML = words.map((w) => `<span class="ow-word">${w}</span>`).join(' ');
      p.dataset.owWrapped = '1';
      return Array.from(p.querySelectorAll('.ow-word'));
    }

    function lastLineWordCount(spans) {
      const tops = spans.map((s) => s.offsetTop);
      const maxTop = Math.max(...tops);
      return tops.filter((t) => t === maxTop).length;
    }

    function fixParagraph(p) {
      const spans = p.dataset.owWrapped
        ? Array.from(p.querySelectorAll('.ow-word'))
        : wrapWords(p);
      if (!spans || !spans.length) return;

      let tracking = 0;
      p.style.letterSpacing = '0em';
      let count = lastLineWordCount(spans);
      let attempts = 0;
      while (
        count < MIN_LAST_LINE_WORDS &&
        count < spans.length &&
        tracking > MAX_TRACKING &&
        attempts < MAX_ATTEMPTS
      ) {
        tracking += TRACKING_STEP;
        p.style.letterSpacing = tracking + 'em';
        count = lastLineWordCount(spans);
        attempts++;
      }
    }

    function fixAll() {
      paragraphs.forEach(fixParagraph);
    }

    fixAll();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fixAll);
    }
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fixAll, 200);
    });
  })();
});
