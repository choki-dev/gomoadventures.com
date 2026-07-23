/* ═══════════════════════════════════════════════════════════════
   GOMO ADVENTURES — script.js
═══════════════════════════════════════════════════════════════ */

/* ─── Header scroll state (transparent-over-hero pages) ─── */
const mainHeader = document.getElementById('mainHeader');

function updateHeaderScrolled() {
  if (!mainHeader) return;
  mainHeader.classList.toggle('scrolled', window.scrollY > 40);
}

if (mainHeader) {
  updateHeaderScrolled();
  window.addEventListener('scroll', updateHeaderScrolled, { passive: true });
}

/* ─── Header search toggle ─── */
const headerSearchToggle = document.getElementById('headerSearchToggle');
const headerSearchBar    = document.getElementById('headerSearchBar');

if (headerSearchToggle && headerSearchBar) {
  headerSearchToggle.addEventListener('click', () => {
    const open = headerSearchBar.classList.toggle('open');
    headerSearchToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      const input = headerSearchBar.querySelector('input');
      if (input) input.focus();
    }
  });
}

/* ─── Hamburger / Mobile Drawer ─── */
const hamburger       = document.getElementById('hamburger');
const mobileDrawer    = document.getElementById('mobileDrawer');
const drawerBackdrop  = document.getElementById('drawerBackdrop');
const drawerCloseBtn  = document.getElementById('drawerCloseBtn');

function closeDrawer() {
  mobileDrawer.classList.remove('open');
  drawerBackdrop.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const open = mobileDrawer.classList.toggle('open');
  if (open) {
    drawerBackdrop.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  } else {
    closeDrawer();
  }
});

drawerCloseBtn.addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);

mobileDrawer.querySelectorAll('a').forEach(a => {
  if (a.matches('.drawer-dropdown > .drawer-link')) return;
  a.addEventListener('click', closeDrawer);
});

/* ─── Mobile Drawer Dropdown Toggle ─── */
const drawerDropdowns = document.querySelectorAll('.drawer-dropdown');

drawerDropdowns.forEach(dropdown => {
  const link = dropdown.querySelector('.drawer-link');
  link.addEventListener('click', (e) => {
    e.preventDefault();
    dropdown.classList.toggle('active');
  });
});

/* ─── Hero Slideshow ─── */
const heroSlides  = document.querySelectorAll('.hero-slide');
let currentHero   = 0;
let heroTimer;

function showHeroSlide(idx) {
  heroSlides[currentHero].classList.remove('active');
  currentHero = (idx + heroSlides.length) % heroSlides.length;
  heroSlides[currentHero].classList.add('active');
}

function startHero() {
  heroTimer = setInterval(() => showHeroSlide(currentHero + 1), 6000);
}

if (heroSlides.length) {
  startHero();
}

/* ─── Bhutan Quote Slider ─── */
const quoteSlides = document.querySelectorAll('.quote-slide');
const quoteDots   = document.querySelectorAll('.quote-dot');
let currentQuote  = 0;
let quoteTimer;

function showQuoteSlide(idx) {
  quoteSlides[currentQuote].classList.remove('active');
  quoteDots[currentQuote].classList.remove('active');
  currentQuote = (idx + quoteSlides.length) % quoteSlides.length;
  quoteSlides[currentQuote].classList.add('active');
  quoteDots[currentQuote].classList.add('active');
}

function startQuoteSlider() {
  quoteTimer = setInterval(() => showQuoteSlide(currentQuote + 1), 5000);
}

if (quoteSlides.length) {
  quoteDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showQuoteSlide(i);
      clearInterval(quoteTimer); startQuoteSlider();
    });
  });

  startQuoteSlider();
}

/* ─── Trip Types Carousel ─── */
const tripTrack = document.getElementById('tripTrack');
if (tripTrack) {
  const tripCards = tripTrack.querySelectorAll('.trip-type-card');
  let tripOffset = 0;

  function getVisibleCount() {
    const w = window.innerWidth;
    if (w < 480) return 2;
    if (w < 768) return 3;
    if (w < 1024) return 4;
    return 6;
  }

  function getCardWidth() {
    if (!tripCards[0]) return 0;
    return tripCards[0].getBoundingClientRect().width + 12; // + gap
  }

  function maxOffset() {
    const visible = getVisibleCount();
    const total = tripCards.length;
    return Math.max(0, total - visible);
  }

  const tripNext = document.getElementById('tripNext');
  const tripPrev = document.getElementById('tripPrev');

  if (tripNext) {
    tripNext.addEventListener('click', () => {
      if (tripOffset < maxOffset()) {
        tripOffset++;
        tripTrack.style.transform = `translateX(-${tripOffset * getCardWidth()}px)`;
      }
    });
  }

  if (tripPrev) {
    tripPrev.addEventListener('click', () => {
      if (tripOffset > 0) {
        tripOffset--;
        tripTrack.style.transform = `translateX(-${tripOffset * getCardWidth()}px)`;
      }
    });
  }

  window.addEventListener('resize', () => {
    tripOffset = Math.min(tripOffset, maxOffset());
    tripTrack.style.transform = tripOffset > 0
      ? `translateX(-${tripOffset * getCardWidth()}px)` : '';
  });
}

/* ─── Specials Peek Carousel ─── */
const specialsTrack = document.getElementById('specialsTrack');
if (specialsTrack) {
  const specialsSlides  = Array.from(specialsTrack.querySelectorAll('.specials-slide'));
  const specialsTotal   = specialsSlides.length;
  const specialsCounter = document.getElementById('specialsCounter');
  const specialsDesc    = document.getElementById('specialsDesc');
  const specialsNext    = document.getElementById('specialsNext');
  const specialsPrev    = document.getElementById('specialsPrev');
  let specialsPos = 0;
  let specialsResetHandler = null;

  // Clone the first slide onto the end so the last real slide always has
  // something to peek at, then snap back to the real slide once it passes —
  // keeps every view framed the same way the first slide is.
  const specialsClone = specialsSlides[0].cloneNode(true);
  specialsClone.classList.remove('is-active');
  specialsClone.setAttribute('aria-hidden', 'true');
  specialsClone.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', '-1'));
  specialsTrack.appendChild(specialsClone);

  const specialsTrackItems = Array.from(specialsTrack.children);

  function getSpecialsStep() {
    return specialsSlides[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(specialsTrack).columnGap) || 0);
  }

  function moveSpecialsTrack(withTransition) {
    specialsTrack.style.transition = withTransition ? '' : 'none';
    specialsTrack.style.transform = `translateX(-${specialsPos * getSpecialsStep()}px)`;
    specialsTrackItems.forEach((slide, i) => slide.classList.toggle('is-active', i === specialsPos));
  }

  function updateSpecialsMeta() {
    const realIndex = specialsPos % specialsTotal;
    if (specialsCounter) specialsCounter.textContent = `${realIndex + 1}/${specialsTotal}`;
    if (specialsDesc) specialsDesc.textContent = specialsSlides[realIndex].dataset.desc || '';
    if (specialsPrev) specialsPrev.classList.toggle('is-visible', specialsPos > 0);
  }

  if (specialsNext) {
    specialsNext.addEventListener('click', () => {
      if (specialsResetHandler) {
        specialsTrack.removeEventListener('transitionend', specialsResetHandler);
        specialsResetHandler = null;
      }

      specialsPos++;
      moveSpecialsTrack(true);
      updateSpecialsMeta();

      if (specialsPos === specialsTotal) {
        specialsResetHandler = () => {
          specialsResetHandler = null;
          specialsPos = 0;
          moveSpecialsTrack(false);
        };
        specialsTrack.addEventListener('transitionend', specialsResetHandler, { once: true });
      }
    });
  }

  if (specialsPrev) {
    specialsPrev.addEventListener('click', () => {
      if (specialsPos === 0) return;

      if (specialsResetHandler) {
        specialsTrack.removeEventListener('transitionend', specialsResetHandler);
        specialsResetHandler = null;
      }

      specialsPos--;
      moveSpecialsTrack(true);
      updateSpecialsMeta();
    });
  }

  window.addEventListener('resize', () => moveSpecialsTrack(false));
}

/* ─── Newsletter Form ─── */
const nlForm    = document.getElementById('newsletterForm');
const nlSuccess = document.getElementById('formSuccess');

if (nlForm) {
  nlForm.addEventListener('submit', e => {
    e.preventDefault();
    nlForm.style.display = 'none';
    nlSuccess.style.display = 'flex';
  });
}

/* ─── Contact Form ─── */
const contactForm    = document.getElementById('contactForm');
const contactSuccess = document.getElementById('contactFormSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    contactForm.style.display = 'none';
    contactSuccess.style.display = 'flex';
  });
}

/* ─── Back to Top ─── */
const backTop = document.getElementById('backTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 480) {
    backTop.classList.add('visible');
  } else {
    backTop.classList.remove('visible');
  }
}, { passive: true });

backTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ─── Smooth-scroll anchors ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 115;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ─── Active nav highlight on scroll ─── */
const navItems  = document.querySelectorAll('.nav-item');
const sections  = document.querySelectorAll('main section[id]');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(item => {
        item.style.borderBottom = '';
        if (item.getAttribute('href') === '#' + entry.target.id) {
          item.style.borderBottom = '2px solid #A9714F';
        }
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => navObserver.observe(s));

/* ─── Travel Info: sticky TOC active highlight ─── */
const tiItems = document.querySelectorAll('.ti-item');
const tiLinks = document.querySelectorAll('.ti-toc-link');

if (tiItems.length && tiLinks.length) {
  const tiObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tiLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-140px 0px -70% 0px' });

  tiItems.forEach(item => tiObserver.observe(item));
}

/* ─── Trip detail: open/close all itinerary days ─── */
const itinToggleAll = document.getElementById('itinToggleAll');
const itinList = document.getElementById('itinList');

if (itinToggleAll && itinList) {
  itinToggleAll.addEventListener('click', () => {
    const days = itinList.querySelectorAll('.itin-day');
    const shouldOpen = itinToggleAll.classList.toggle('all-open');
    days.forEach(day => { day.open = shouldOpen; });
    itinToggleAll.textContent = shouldOpen ? 'Close All Days' : 'Open All Days';
  });
}

/* ─── Trip detail: route map expand ─── */
const tripMapExpand = document.getElementById('tripMapExpand');
if (tripMapExpand) {
  tripMapExpand.addEventListener('click', () => {
    const mapImg = document.querySelector('.trip-map-img');
    if (mapImg) openLightbox(mapImg);
  });
}

/* ─── Trip detail: sticky sidebar active-link highlight ─── */
const tripSidebarLinks = document.querySelectorAll('#tripSidebarNav a');
const tripSections = document.querySelectorAll('.trip-section');

if (tripSidebarLinks.length && tripSections.length) {
  const tripObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tripSidebarLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-160px 0px -70% 0px' });

  tripSections.forEach(section => tripObserver.observe(section));
}

/* ─── Header search ─── */
document.getElementById('headerSearchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const q = e.target.value.trim();
    if (q) {
      document.querySelector('#search-bar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

/* ─── Lightbox ─── */
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

function lbSrc(src) {
  return src.includes('unsplash.com')
    ? src.replace(/w=\d+/, 'w=1600').replace(/q=\d+/, 'q=90')
    : src;
}

function openLightbox(img) {
  lightboxImg.src = lbSrc(img.src);
  lightboxImg.alt = img.alt;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

document.querySelectorAll('.brochure-img, .wt-main-img, .founder-photo, .newsletter-img, .gallery-item img')
  .forEach(img => {
    img.classList.add('lb-target');
    img.addEventListener('click', () => openLightbox(img));
  });

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* ─── Gallery filter ─── */
const galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

galleryFilterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    galleryFilterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    galleryItems.forEach(item => {
      const show = filter === 'all' || item.getAttribute('data-category') === filter;
      item.style.display = show ? '' : 'none';
    });
  });
});

/* ─── Scroll reveal ─── */

/* Auto-tag testimonial avatars (opacity-only: inside circular clip) */
document.querySelectorAll('.testimonial-avatar img').forEach(el => {
  el.classList.add('img-reveal');
  el.setAttribute('data-fade-only', '');
});

const revealEls = document.querySelectorAll('.img-reveal');

/* Set initial hidden state via JS — images visible if JS never runs */
revealEls.forEach(el => {
  el.style.opacity = '0';
  /* data-fade-only elements keep their CSS transform (rotation etc.) intact */
  if (!el.hasAttribute('data-fade-only')) {
    el.style.transform = 'translateY(14px)';
  }
});

/* Stagger tour cards by column */
document.querySelectorAll('.tours-cards .img-reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 0.09}s`;
});

/* Stagger brochure fan images */
document.querySelectorAll('.brochure-img.img-reveal').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.13}s`;
});

/* Stagger testimonial avatars */
document.querySelectorAll('.testimonial-avatar img.img-reveal').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.07}s`;
});

/* Stagger gallery masonry items by column */
document.querySelectorAll('.gallery-masonry .img-reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
});

/* Stagger welcome section copy (text lines in after the image) */
document.querySelectorAll('.welcome-copy-cell .img-reveal').forEach((el, i) => {
  el.style.transitionDelay = `${0.15 + i * 0.1}s`;
});

/* Stagger why-travel copy */
document.querySelectorAll('.why-travel-text .img-reveal').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.1}s`;
});

/* Stagger stories copy */
document.querySelectorAll('.stories-copy .img-reveal').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.1}s`;
});

/* Stagger tours heading (title, then subtitle) */
document.querySelectorAll('.tours-heading .img-reveal').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.1}s`;
});

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '';
      if (!entry.target.hasAttribute('data-fade-only')) {
        entry.target.style.transform = '';
      }
      setTimeout(() => { entry.target.style.transitionDelay = ''; }, 900);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => revealObs.observe(el));
