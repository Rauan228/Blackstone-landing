// ===== BLACKSTONE BARBERSHOP — Script =====
document.addEventListener('DOMContentLoaded', () => {

  // ===== STATE =====
  const state = {
    lang: 'ru',
    menuOpen: false,
    langLock: false
  };

  const WA_NUMBER = '77751924036';

  // ===== ELEMENTS =====
  const navbar = document.getElementById('navbar');
  const heroImage = document.getElementById('hero-image');
  const cursorGlow = document.getElementById('cursor-glow');
  const burgerBtn = document.getElementById('burger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  // ===== INIT =====
  syncChromeInsets();
  refreshWaLinks();

  // In-app browsers (Instagram/Telegram) already sit below their chrome.
  // Extra --inapp-top created a dead gap under the IG URL bar.
  function syncChromeInsets() {
    document.documentElement.style.setProperty('--inapp-top', '0px');
  }

  window.addEventListener('orientationchange', syncChromeInsets);
  window.addEventListener('pageshow', syncChromeInsets);

  document.querySelectorAll('img').forEach((img) => {
    img.draggable = false;
  });

  // Horizontal rows (reviews, gallery, dates) used to trap the first
  // vertical pan: overflow-x:auto computes overflow-y to auto, and a
  // translateY reveal added a few px of nested scroll. If the gesture
  // is clearly vertical, temporarily lock x so the page can move.
  const lockCarouselAxis = (scroller) => {
    if (!scroller) return;
    let startX = 0;
    let startY = 0;
    let axis = null;
    const unlock = () => {
      axis = null;
      scroller.style.overflowX = '';
      scroller.style.touchAction = '';
    };
    scroller.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      axis = null;
    }, { passive: true });
    scroller.addEventListener('touchmove', (e) => {
      if (axis || !e.touches[0]) return;
      const dx = Math.abs(e.touches[0].clientX - startX);
      const dy = Math.abs(e.touches[0].clientY - startY);
      if (dx < 8 && dy < 8) return;
      axis = dy > dx ? 'y' : 'x';
      if (axis === 'y') {
        scroller.style.overflowX = 'hidden';
        scroller.style.touchAction = 'pan-y';
      }
    }, { passive: true });
    scroller.addEventListener('touchend', unlock, { passive: true });
    scroller.addEventListener('touchcancel', unlock, { passive: true });
  };

  document.querySelectorAll('.masters-grid, .gallery-grid').forEach(lockCarouselAxis);

  const reviewsSet = document.querySelector('.reviews-set');
  if (reviewsSet && reviewsSet.parentElement) {
    const clone = reviewsSet.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    reviewsSet.parentElement.appendChild(clone);
  }

  // ===== SCROLL — Navbar + Parallax =====
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        // Navbar shrink
        if (scrollY > 60) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }

        // Hero parallax (desktop only)
        if (heroImage && window.innerWidth > 900) {
          heroImage.style.transform = `translateY(${(scrollY * 0.09).toFixed(1)}px) scale(1.03)`;
        }

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ===== CURSOR GLOW =====
  if (cursorGlow) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
  }

  // ===== SCROLL REVEAL =====
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        entry.target.style.transitionDelay = `${delay}s`;
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-reveal]').forEach(el => {
    revealObserver.observe(el);
  });

  // ===== BURGER MENU =====
  burgerBtn.addEventListener('click', () => {
    state.menuOpen = !state.menuOpen;
    burgerBtn.classList.toggle('open', state.menuOpen);
    mobileMenu.classList.toggle('open', state.menuOpen);
    document.body.classList.toggle('menu-open', state.menuOpen);
    document.body.style.overflow = state.menuOpen ? 'hidden' : '';

    const label = burgerBtn.querySelector('.burger-label');
    if (state.menuOpen) {
      label.textContent = state.lang === 'kz' ? 'Жабу' : 'Закрыть';
    } else {
      label.textContent = state.lang === 'kz' ? 'Мәзір' : 'Меню';
    }
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      state.menuOpen = false;
      burgerBtn.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
      const label = burgerBtn.querySelector('.burger-label');
      label.textContent = state.lang === 'kz' ? 'Мәзір' : 'Меню';
    });
  });

  // ===== LANGUAGE SWITCHER =====
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.lang;
      if (next === state.lang || state.langLock) return;
      state.lang = next;
      state.langLock = true;
      document.querySelectorAll('[data-lang]').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === state.lang);
      });
      applyLanguage();
    });
  });

  function waHref(master) {
    const kz = state.lang === 'kz';
    let msg;
    if (master) {
      msg = kz
        ? `Сәлеметсіз бе! ${master} шеберіне комплекстік қиюға жазылғым келеді.`
        : `Здравствуйте! Хочу записаться к мастеру ${master} на комплексную стрижку.`;
    } else {
      msg = kz
        ? 'Сәлеметсіз бе! Blackstone барбершопына комплекстік қиюға жазылғым келеді.'
        : 'Здравствуйте! Хочу записаться в Blackstone на комплексную стрижку.';
    }
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  function refreshWaLinks() {
    document.querySelectorAll('[data-wa]').forEach((a) => {
      a.href = waHref(a.getAttribute('data-wa-master') || '');
    });
  }

  function applyLanguage() {
    const kz = state.lang === 'kz';
    const swap = () => {
      document.documentElement.lang = kz ? 'kk' : 'ru';
      document.title = kz
        ? 'Blackstone Barbershop — Астанадағы премиум барбершоп'
        : 'Blackstone Barbershop — Премиальный барбершоп в Астане';

      document.querySelectorAll('[data-kz]').forEach(el => {
        if (el.__ru === undefined) el.__ru = el.textContent;
        const next = kz ? el.dataset.kz : el.__ru;
        if (el.textContent !== next) el.textContent = next;
      });

      if (burgerBtn) {
        burgerBtn.setAttribute('aria-label', kz ? (state.menuOpen ? 'Жабу' : 'Мәзір') : (state.menuOpen ? 'Закрыть' : 'Меню'));
        const label = burgerBtn.querySelector('.burger-label');
        if (label) {
          label.textContent = kz
            ? (state.menuOpen ? 'Жабу' : 'Мәзір')
            : (state.menuOpen ? 'Закрыть' : 'Меню');
        }
      }
      refreshWaLinks();
      document.body.classList.remove('lang-switching');
      state.langLock = false;
    };

    document.body.classList.add('lang-switching');
    window.setTimeout(swap, 200);
  }


  // ===== SMOOTH SCROLL for anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});
