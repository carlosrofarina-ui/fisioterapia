/* ══════════════════════════════════════
   VIVA+ FISIOTERAPIA — site.js (todas as páginas)
══════════════════════════════════════ */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasIO = 'IntersectionObserver' in window;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ── Botão de modo claro/escuro (lembra a escolha) ── */
  const themeBtn = $('#theme-tog');
  const isDark = () => root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  const syncTheme = () => themeBtn?.setAttribute('aria-label', isDark() ? 'Mudar para modo claro' : 'Mudar para modo escuro');
  themeBtn?.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncTheme();
  });
  syncTheme();

  /* ── Menu mobile em tela cheia ── */
  const menu = $('#mnav');
  const tog = $('#nav-tog');
  const page = $$('main, footer, #wa-bar');
  const setMenu = open => {
    if (!menu || !tog) return;
    menu.classList.toggle('open', open);
    menu.inert = !open;
    page.forEach(el => { el.inert = open; });
    root.classList.toggle('menu-open', open);
    tog.setAttribute('aria-expanded', String(open));
    (open ? $('#mnav-close') : tog)?.focus();
  };
  if (menu) menu.inert = true;
  tog?.addEventListener('click', () => setMenu(true));
  $('#mnav-close')?.addEventListener('click', () => setMenu(false));
  $$('a', menu || document.createElement('div')).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu?.classList.contains('open')) setMenu(false);
  });
  matchMedia('(min-width: 1024px)').addEventListener('change', e => {
    if (e.matches && menu?.classList.contains('open')) setMenu(false);
  });

  /* ── Títulos revelados palavra por palavra ── */
  const split = el => {
    let n = 0;
    const walk = node => {
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const s = document.createElement('span');
            s.className = 'w';
            s.style.setProperty('--w', n++);
            s.textContent = part;
            frag.append(s);
          });
          ch.replaceWith(frag);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR') walk(ch);
      });
    };
    walk(el);
    el.classList.add('split');
  };
  if (!reduced) $$('.s-title, .cta-title').forEach(split);

  /* ── Animação de entrada ── */
  const els = $$('[data-a]');
  const reveal = el => {
    el.classList.add('vis');
    // depois de revelado, libera o elemento das regras de entrada (hover e 3D sem atraso)
    setTimeout(() => el.removeAttribute('data-a'), 1600);
  };
  if (reduced || !hasIO) {
    els.forEach(el => el.classList.add('vis'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ── Contadores ── */
  const run = el => {
    const end = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = end + suffix; return; }
    const t0 = performance.now();
    const tick = t => {
      const p = Math.min((t - t0) / 1400, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (hasIO) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(el => cio.observe(el));
  }

  /* ── Link ativo do menu conforme a seção ── */
  const links = $$('.nav-link[href^="#"]');
  const secs = links.map(l => $(l.getAttribute('href'))).filter(Boolean);
  if (secs.length && hasIO) {
    const sio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(s => sio.observe(s));
  }

  /* ── Rolagem: barra de progresso, cabeçalho, linha dos passos e parallax ── */
  const hdr = $('#hdr');
  const bar = $('#wa-bar');
  const steps = $('.steps');
  const stepEls = $$('.step');
  const pxEls = reduced ? [] : $$('.about-img img, .hero-frame img');
  pxEls.forEach(el => el.classList.add('px'));
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    const vh = innerHeight;
    hdr?.classList.toggle('scrolled', y > 24);
    bar?.classList.toggle('show', y > 420);
    hdr?.style.setProperty('--sp', clamp(y / Math.max(1, root.scrollHeight - vh)).toFixed(4));
    if (steps) {
      const r = steps.getBoundingClientRect();
      const p = reduced ? 1 : clamp((vh * 0.8 - r.top) / (r.height + vh * 0.3));
      steps.style.setProperty('--p', p.toFixed(3));
      stepEls.forEach((s, i) => s.classList.toggle('lit', p >= i / (stepEls.length - 1 || 1) * 0.92 + 0.04));
    }
    pxEls.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh; // -0.5 … 0.5
      el.style.transform = `translateY(${(p * -26).toFixed(1)}px)`;
    });
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ── Corpo interativo: região ↔ especialidade ── */
  const wrap = $('#svc-wrap');
  if (wrap) {
    const grid = $('.svc-grid', wrap);
    const info = $('.fig-info', wrap);
    const tabs = $$('.fig-tab', wrap);
    const keys = tabs.map(t => t.dataset.spec);
    let current = keys[0];
    let touched = false;
    const setSpec = (k, { scroll = false } = {}) => {
      if (!k || k === current) return;
      current = k;
      $$('[data-spec]', wrap).forEach(el => el.classList.toggle('on', el.dataset.spec === k));
      tabs.forEach(t => t.setAttribute('aria-pressed', String(t.dataset.spec === k)));
      const tab = tabs.find(t => t.dataset.spec === k);
      if (tab && info) {
        $('.fig-region', info).textContent = tab.dataset.region;
        $('.fig-name', info).textContent = tab.dataset.name;
        info.classList.remove('swap');
        void info.offsetWidth;
        info.classList.add('swap');
      }
      if (scroll && grid.scrollWidth > grid.clientWidth + 4) {
        const card = $(`.svc-card[data-spec="${k}"]`, grid);
        const pad = parseFloat(getComputedStyle(grid).paddingLeft) || 0;
        grid.scrollTo({ left: card.offsetLeft - grid.offsetLeft - pad, behavior: reduced ? 'auto' : 'smooth' });
      }
    };
    const pick = (k, opts) => { touched = true; setSpec(k, opts); };
    $$('.fig-tab, .b-dot', wrap).forEach(el => el.addEventListener('click', () => pick(el.dataset.spec, { scroll: true })));
    $$('.svc-card', wrap).forEach(card => {
      if (fine) card.addEventListener('pointerenter', () => pick(card.dataset.spec));
      card.addEventListener('focusin', () => pick(card.dataset.spec));
    });
    // no celular, o cartão visível no carrossel acende a região correspondente
    if (hasIO) {
      const cio = new IntersectionObserver(entries => {
        if (grid.scrollWidth <= grid.clientWidth + 4) return;
        entries.forEach(e => { if (e.isIntersecting) setSpec(e.target.dataset.spec); });
      }, { root: grid, threshold: 0.75 });
      $$('.svc-card', grid).forEach(c => cio.observe(c));
      grid.addEventListener('pointerdown', () => { touched = true; }, { passive: true });
      // passeio automático pelas regiões até a pessoa interagir
      let inView = false;
      new IntersectionObserver(es => { inView = es[0].isIntersecting; }, { threshold: 0.2 }).observe(wrap);
      if (!reduced) setInterval(() => {
        if (touched || !inView || document.hidden) return;
        setSpec(keys[(keys.indexOf(current) + 1) % keys.length], { scroll: true });
      }, 3400);
    }
  }

  /* ── 3D: inclinação seguindo o cursor ── */
  if (fine && !reduced) {
    $$('[data-tilt]').forEach(el => {
      const max = el.classList.contains('svc-card') ? 5 : 7;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.classList.add('tilting');
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        el.style.transform = `perspective(900px) rotateX(${((0.5 - py) * 2 * max).toFixed(2)}deg) rotateY(${((px - 0.5) * 2 * max).toFixed(2)}deg) translateY(-4px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('tilting');
        el.style.transform = '';
      });
    });

    /* ── Botões magnéticos ── */
    $$('.btn-lg, .wa-float, .theme-tog').forEach(el => {
      el.classList.add('magnet');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = `translate(${(dx * 10).toFixed(1)}px, ${(dy * 8 - 2).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ── Onda ao clicar nos botões ── */
  if (!reduced) {
    document.addEventListener('pointerdown', e => {
      const btn = e.target.closest?.('.btn');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2;
      const s = document.createElement('span');
      s.className = 'ripple';
      s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
      btn.append(s);
      s.addEventListener('animationend', () => s.remove());
    }, { passive: true });
  }

  /* ── Mapa: destaca a cidade ao passar pela etiqueta (e vice-versa) ── */
  const pair = (el, on) => {
    $$(`[data-city="${el.dataset.city}"]`).forEach(x => x.classList.toggle('on', on));
  };
  $$('[data-city]').forEach(el => {
    ['pointerenter', 'focus'].forEach(ev => el.addEventListener(ev, () => pair(el, true)));
    ['pointerleave', 'blur'].forEach(ev => el.addEventListener(ev, () => pair(el, false)));
  });
})();
