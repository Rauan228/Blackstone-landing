// ===== BLACKSTONE BARBERSHOP — Script =====
document.addEventListener('DOMContentLoaded', () => {

  // ===== STATE =====
  const state = {
    lang: 'ru',
    master: 0,
    svc: 0,
    day: null,
    time: '15:00',
    menuOpen: false
  };

  const prices = [5000];
  const masterNames = ['Алексей', 'Арман'];
  const svcNames = {
    ru: ['Комплексная стрижка (Всё включено)'],
    kz: ['Комплекстік қию (Барлығы кіреді)']
  };
  const dayNames = {
    ru: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
    kz: ['Дс','Сс','Ср','Бс','Жм','Сб','Жс']
  };
  const timeSlots = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];
  const busySlots = new Set(['11:00', '16:00']);

  // ===== ELEMENTS =====
  const navbar = document.getElementById('navbar');
  const heroImage = document.getElementById('hero-image');
  const cursorGlow = document.getElementById('cursor-glow');
  const burgerBtn = document.getElementById('burger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const masterTabs = document.getElementById('master-tabs');
  const svcStatic = document.getElementById('svc-static');
  const dayTabsEl = document.getElementById('day-tabs');
  const timeSlotsEl = document.getElementById('time-slots');
  const bookSummary = document.getElementById('book-summary');
  const bookTotal = document.getElementById('book-total');
  const bookConfirm = document.getElementById('book-confirm');
  // ===== INIT =====
  initDays();
  initTimeSlots();
  updateBookingSummary();

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

  document.querySelectorAll('.masters-grid, .gallery-grid, .book-days').forEach(lockCarouselAxis);

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
      state.lang = btn.dataset.lang;
      document.querySelectorAll('[data-lang]').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === state.lang);
      });
      applyLanguage();
      updateBookingSummary();
      initDays();

      const label = burgerBtn.querySelector('.burger-label');
      if (!state.menuOpen) {
        label.textContent = state.lang === 'kz' ? 'Мәзір' : 'Меню';
      }
    });
  });

  function applyLanguage() {
    const kz = state.lang === 'kz';
    document.querySelectorAll('[data-kz]').forEach(el => {
      if (el.__ru === undefined) el.__ru = el.textContent;
      const next = kz ? el.dataset.kz : el.__ru;
      if (el.textContent !== next) el.textContent = next;
    });

    // Update select options
    if (svcStatic) {
      if (svcStatic.__ru === undefined) svcStatic.__ru = svcStatic.textContent;
      const next = kz ? svcStatic.dataset.kz : svcStatic.__ru;
      if (svcStatic.textContent !== next) svcStatic.textContent = next;
    }
  }

  // ===== MASTER TABS =====
  masterTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-master]');
    if (!tab) return;
    state.master = parseInt(tab.dataset.master);
    masterTabs.querySelectorAll('.book-tab').forEach((t, i) => {
      t.classList.toggle('active', i === state.master);
    });
    updateBookingSummary();
  });

  // ===== SERVICE SELECT =====
  // ===== DAY TABS =====
  function initDays() {
    dayTabsEl.innerHTML = '';
    const today = new Date();
    const kz = state.lang === 'kz';

    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayNum = d.getDate();
      const dayOfWeek = d.getDay();
      const names = kz ? dayNames.kz : dayNames.ru;
      const dayName = names[dayOfWeek === 0 ? 6 : dayOfWeek - 1];

      const btn = document.createElement('button');
      btn.className = 'book-day';
      if (state.day === null && i === 0) {
        state.day = dayNum;
        btn.classList.add('active');
      } else if (state.day === dayNum) {
        btn.classList.add('active');
      }
      btn.dataset.day = dayNum;
      btn.innerHTML = `<span class="day-num">${dayNum}</span><span class="day-name">${dayName}</span>`;
      btn.addEventListener('click', () => {
        state.day = dayNum;
        dayTabsEl.querySelectorAll('.book-day').forEach(b => {
          b.classList.toggle('active', parseInt(b.dataset.day) === state.day);
        });
        updateBookingSummary();
      });
      dayTabsEl.appendChild(btn);
    }
  }

  // ===== TIME SLOTS =====
  function initTimeSlots() {
    timeSlotsEl.innerHTML = '';
    timeSlots.forEach(time => {
      const btn = document.createElement('button');
      btn.className = 'book-time';
      btn.textContent = time;

      if (busySlots.has(time)) {
        btn.classList.add('busy');
      } else if (state.time === time) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => {
        if (busySlots.has(time)) return;
        state.time = time;
        timeSlotsEl.querySelectorAll('.book-time').forEach(b => {
          b.classList.remove('active');
          if (b.textContent === time && !b.classList.contains('busy')) {
            b.classList.add('active');
          }
        });
        updateBookingSummary();
      });
      timeSlotsEl.appendChild(btn);
    });
  }

  // ===== BOOKING SUMMARY =====
  function updateBookingSummary() {
    const kz = state.lang === 'kz';
    const master = masterNames[state.master];
    const svcName = kz ? svcNames.kz[state.svc] : svcNames.ru[state.svc];
    const price = prices[state.svc];

    const monthName = kz ? getKzMonth() : getRuMonth();
    const summary = `${master} · ${svcName} · ${state.day} ${monthName}, ${state.time}`;
    bookSummary.textContent = summary;
    bookTotal.textContent = price.toLocaleString('ru-RU').replace(/\s/g, '\u00A0') + '\u00A0₸';
  }

  function getRuMonth() {
    const months = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
    return months[new Date().getMonth()];
  }

  function getKzMonth() {
    const months = ['қаңтар','ақпан','наурыз','сәуір','мамыр','маусым','шілде','тамыз','қыркүйек','қазан','қараша','желтоқсан'];
    return months[new Date().getMonth()];
  }

  // ===== CONFIRM BOOKING (WhatsApp redirect) =====
  bookConfirm.addEventListener('click', () => {
    const kz = state.lang === 'kz';
    const master = masterNames[state.master];
    const svcName = kz ? svcNames.kz[state.svc] : svcNames.ru[state.svc];
    const monthName = kz ? getKzMonth() : getRuMonth();

    const message = encodeURIComponent(
      `Здравствуйте! Хочу записаться в Blackstone:\n` +
      `Мастер: ${master}\n` +
      `Услуга: ${svcName}\n` +
      `Дата: ${state.day} ${monthName}\n` +
      `Время: ${state.time}`
    );
    window.open(`https://wa.me/77020000000?text=${message}`, '_blank');
  });


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
