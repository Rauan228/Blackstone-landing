// ===== BLACKSTONE BARBERSHOP — Script =====
document.addEventListener('DOMContentLoaded', () => {

  // ===== STATE =====
  const state = {
    lang: (new URLSearchParams(location.search).get('lang') === 'kz'
      || new URLSearchParams(location.search).get('lang') === 'kk') ? 'kz' : 'ru',
    menuOpen: false,
    langLock: false
  };

  const META = {
    ru: {
      title: 'Blackstone — барбершоп в Астане | стрижка 5 000 ₸',
      description: 'Blackstone — два филиала в Астане: Асфендиярова, 7 и Е-36, 9, ЖК Республика. Комплекс 5 000 ₸: стрижка, борода, чёрная маска. Ежедневно 10:00–22:00. Запись в WhatsApp.'
    },
    kz: {
      title: 'Blackstone — Астанадағы барбершоп | шаш қию 5 000 ₸',
      description: 'Blackstone — Астанадағы екі филиал: Асфендияров, 7 және Е-36, 9, ЖК Республика. Кешенді шаш қию 5 000 ₸. Күн сайын 10:00–22:00. WhatsApp-қа жазылу.'
    }
  };

  const branches = {
    '1': { phone: '77751924036', display: '+7 775 192 40 36', address: 'Санжара Асфендиярова, 7, 2 этаж' },
    '2': { phone: '77082997261', display: '+7 708 299 72 61', address: 'Е-36, 9 · ЖК Республика · Орда, 2 этаж' }
  };
  let selectedBranch = '1';

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

  document.querySelectorAll('.gallery-grid').forEach(lockCarouselAxis);

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
      const url = new URL(location.href);
      if (state.lang === 'kz') url.searchParams.set('lang', 'kz');
      else url.searchParams.delete('lang');
      history.replaceState(null, '', url);
      applyLanguage();
    });
  });

  function waHref(el) {
    const kz = state.lang === 'kz';
    const master = el.getAttribute('data-wa-master') || '';
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
    const branchId = el.dataset.branch || (master ? '1' : selectedBranch);
    msg += ` (${branches[branchId].address})`;
    return `https://wa.me/${branches[branchId].phone}?text=${encodeURIComponent(msg)}`;
  }

  function refreshWaLinks() {
    document.querySelectorAll('[data-wa]').forEach((a) => {
      a.href = waHref(a);
    });
  }

  function setMeta() {
    const pack = META[state.lang === 'kz' ? 'kz' : 'ru'];
    document.title = pack.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', pack.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', pack.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', pack.description);
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', pack.title);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', pack.description);
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute('content', state.lang === 'kz' ? 'kk_KZ' : 'ru_RU');
  }

  function applyLanguage(immediate) {
    const kz = state.lang === 'kz';
    const swap = () => {
      document.documentElement.lang = kz ? 'kk' : 'ru';
      setMeta();

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
      if (!immediate) updateDirections();
      document.body.classList.remove('lang-switching');
      state.langLock = false;
    };

    if (immediate) {
      swap();
      return;
    }
    document.body.classList.add('lang-switching');
    window.setTimeout(swap, 200);
  }

  if (state.lang === 'kz') {
    document.querySelectorAll('[data-lang]').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === 'kz');
    });
    applyLanguage(true);
  }



  const bookingDialog = document.getElementById('booking-dialog');
  let bookingOpener;
  let previousOverflow = '';
  function closeBooking() { bookingDialog.close(); }
  document.querySelectorAll('a[href="#booking"]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      bookingOpener = link;
      const master = link.dataset.bookMaster || '';
      const call = link.dataset.bookAction === 'call';
      const masterNote = bookingDialog.querySelector('.booking-master');
      masterNote.hidden = !master;
      masterNote.textContent = (state.lang === 'kz' ? 'Шебер: ' : 'Мастер: ') + master;
      bookingDialog.querySelectorAll('[data-book-destination]').forEach(destination => {
        destination.dataset.branch = destination.dataset.bookDestination;
        destination.dataset.waMaster = master;
        destination.href = call ? `tel:+${branches[destination.dataset.branch].phone}` : waHref(destination);
        destination.querySelector('.destination-action').textContent = call
          ? (state.lang === 'kz' ? 'Қоңырау →' : 'Позвонить →') : 'WhatsApp →';
      });
      bookingDialog.querySelector('.booking-footnote').hidden = call;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      bookingDialog.showModal();
    });
  });
  bookingDialog.querySelector('.booking-close').addEventListener('click', closeBooking);
  bookingDialog.addEventListener('click', event => {
    if (event.target === bookingDialog) {
      const rect = bookingDialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeBooking();
    }
  });
  bookingDialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    bookingOpener?.focus({ preventScroll: true });
  });
  bookingDialog.querySelectorAll('[data-book-destination]').forEach(link => link.addEventListener('click', closeBooking));

  let mapBranch = '1';
  function updateDirections() {
    const second = mapBranch === '2';
    const kz = state.lang === 'kz';
    const frame = document.querySelector('.branch-map iframe');
    const mapUrl = new URL('https://maps.google.com/maps');
    mapUrl.searchParams.set('q', second ? '51.124324,71.383483' : '51.134445,71.379266');
    mapUrl.searchParams.set('z', '17');
    mapUrl.searchParams.set('output', 'embed');
    mapUrl.searchParams.set('hl', kz ? 'kk' : 'ru');
    if (frame.src !== mapUrl.href) frame.src = mapUrl.href;
    frame.title = second ? 'Карта Blackstone — ЖК Республика, Е-36, 9' : 'Карта Blackstone — Асфендиярова, 7';
    document.querySelector('[data-directions-title]').textContent = second ? 'ЖК Республика' : 'Асфендиярова, 7';
    document.querySelector('[data-directions-address]').textContent = second
      ? (kz ? 'Астана, Е-36, 9-үй · «Орда» минимаркеті, 2-қабат' : 'Астана, Е-36, дом 9 · Минимаркет Орда, 2 этаж')
      : (kz ? 'Астана, Санжар Асфендияров көшесі, 7, 2-қабат' : 'Астана, Санжара Асфендиярова, 7, 2 этаж');
    document.querySelector('[data-directions-link]').href = second
      ? 'https://2gis.kz/astana/search/' + encodeURIComponent('Астана Е-36 9 ЖК Республика')
      : 'https://2gis.kz/astana/firm/70000001089808898';
  }
  updateDirections();
  document.querySelectorAll('[data-map-branch]').forEach(control => {
    control.addEventListener('click', () => {
      const id = control.dataset.mapBranch;
      mapBranch = id;
      updateDirections();
      document.querySelectorAll('.map-switch button').forEach(button => {
        const active = button.dataset.mapBranch === id;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    });
  });

  // ===== SMOOTH SCROLL for anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (e.defaultPrevented || href === '#' || href === '#booking') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});
