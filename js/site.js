/* ══════════════════════════════════════
   VIVA+ FISIOTERAPIA — site.js (todas as páginas)
══════════════════════════════════════ */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Cabeçalho que encolhe + barra fixa do celular ── */
  const hdr = $('#hdr');
  const bar = $('#wa-bar');
  const onScroll = () => {
    const y = scrollY;
    hdr?.classList.toggle('scrolled', y > 24);
    bar?.classList.toggle('show', y > 420);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Menu mobile em tela cheia ── */
  const menu = $('#mnav');
  const tog = $('#nav-tog');
  const page = $$('main, footer, #wa-bar');
  const setMenu = open => {
    if (!menu || !tog) return;
    menu.classList.toggle('open', open);
    menu.inert = !open;
    page.forEach(el => { el.inert = open; });
    document.documentElement.classList.toggle('menu-open', open);
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

  /* ── Animação de entrada ── */
  const els = $$('[data-a]');
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('vis'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ── Contadores ── */
  const counters = $$('[data-count]');
  const run = el => {
    const end = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = end + suffix; return; }
    const t0 = performance.now();
    const dur = 1400;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(el => cio.observe(el));
  }

  /* ── Link ativo do menu conforme a seção ── */
  const links = $$('.nav-link[href^="#"]');
  const secs = links.map(l => $(l.getAttribute('href'))).filter(Boolean);
  if (secs.length && 'IntersectionObserver' in window) {
    const sio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(s => sio.observe(s));
  }

  /* ── Mapa: destaca a cidade ao passar pela etiqueta (e vice-versa) ── */
  const pair = (el, on) => {
    const k = el.dataset.city;
    $$(`[data-city="${k}"]`).forEach(x => x.classList.toggle('on', on));
  };
  $$('[data-city]').forEach(el => {
    ['pointerenter', 'focus'].forEach(ev => el.addEventListener(ev, () => pair(el, true)));
    ['pointerleave', 'blur'].forEach(ev => el.addEventListener(ev, () => pair(el, false)));
  });
})();
