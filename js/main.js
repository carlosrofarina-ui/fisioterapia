/* ══════════════════════════════════════
   VIVA+ FISIOTERAPIA — main.js
══════════════════════════════════════ */

/* ── Header scroll ── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ── Mobile nav ── */
const navToggle = document.getElementById('nav-toggle');
const navClose  = document.getElementById('nav-close');
const navMenu   = document.getElementById('nav-menu');

navToggle?.addEventListener('click', () => {
  navMenu.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
});
navClose?.addEventListener('click', closeMenu);

document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Fechar ao clicar fora
document.addEventListener('click', e => {
  if (navMenu?.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)) {
    closeMenu();
  }
});

function closeMenu() {
  navMenu?.classList.remove('open');
  navToggle?.setAttribute('aria-expanded', 'false');
}

/* ── Intersection Observer — animações ── */
const animEls = document.querySelectorAll('[data-anim]');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

animEls.forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.06}s`;
  io.observe(el);
});

/* ── Nav link active em scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__link');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 100;
  sections.forEach(sec => {
    if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
      navLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === `#${sec.id}`);
      });
    }
  });
}, { passive: true });