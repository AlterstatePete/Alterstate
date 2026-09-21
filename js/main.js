/* ALTERSTATE Studio. No packages, no build step, no server required. */
(() => {
  'use strict';

  // Replace these placeholder nature films and their YouTube thumbnails with studio work.
  const films = [
    {
        "id": "CxwJrzEdw1U",
        "name": "Norway",
        "nameFi": "Norja",
        "title": "Norway — Scenic Relaxation"
    },
    {
        "id": "g1QR0RO1pbw",
        "name": "Faroe Islands",
        "nameFi": "Färsaaret",
        "title": "Faroe Islands — Scenic Relaxation"
    },
    {
        "id": "fyOVKyaKJq4",
        "name": "Switzerland",
        "nameFi": "Sveitsi",
        "title": "Switzerland — Scenic Relaxation"
    },
    {
        "id": "Pbzn79TSRO0",
        "name": "Iceland",
        "nameFi": "Islanti",
        "title": "Iceland — Scenic Relaxation"
    },
    {
        "id": "eoTpdTU8nTA",
        "name": "The Ocean",
        "nameFi": "Valtameri",
        "title": "The Ocean — Scenic Relaxation"
    },
    {
        "id": "vtxVK3sbZ0o",
        "name": "New Zealand",
        "nameFi": "Uusi-Seelanti",
        "title": "New Zealand — Scenic Relaxation"
    }
];
  // The URL and static document determine the language, never a stored preference.
  const language = document.documentElement.lang === 'fi' ? 'fi' : 'en';
  // Clean URLs are served by the host. Direct file previews use actual HTML files.
  if (location.protocol === 'file:') {
    const script = document.querySelector('script[src$="js/main.js"]');
    const root = new URL('../', script.src);
    document.querySelectorAll('a[href^="/"]').forEach(anchor => {
      const path = anchor.getAttribute('href');
      if (!/^\/(?:fi\/)?(?:(?:work|services|about|contact)\/)?$/.test(path)) return;
      const file = `${path}index.html`;
      anchor.href = new URL(file.slice(1), root).href;
    });
  }
  let slideIndex = 0;
  let previousFocus = null;
  // Preserve links shared before the separate Finnish pages were introduced.
  const legacyUrl = new URL(location.href);
  const legacyLanguage = legacyUrl.searchParams.get('lang');
  if (legacyLanguage === 'en' || legacyLanguage === 'fi') {
    const target = document.querySelector(`[data-lang-choice="${legacyLanguage}"]`);
    const destination = new URL(target.href);
    legacyUrl.searchParams.delete('lang');
    destination.search = legacyUrl.search;
    destination.hash = legacyUrl.hash;
    if (legacyLanguage !== language) {
      location.replace(destination.href);
      return;
    }
    try { history.replaceState(null, '', destination.href); }
    catch { /* Some file:// browsers restrict history changes. Content still works. */ }
  }
  // GitHub Pages cannot configure server redirects for legacy .html addresses.
  // Real directory pages support direct visits; old URLs redirect here and carry
  // the same canonical tag as their destination even when JavaScript is disabled.
  if (location.protocol !== 'file:' && /\.html$/.test(location.pathname)) {
    const destination = new URL(document.querySelector('link[rel="canonical"]').href);
    destination.protocol = location.protocol;
    destination.host = location.host;
    destination.search = location.search;
    destination.hash = location.hash;
    location.replace(destination.href);
    return;
  }
  const choose = (en, fi) => language === 'fi' ? fi : en;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  function initializeLabels() {
    const labels = [
      ['.desktop-nav', 'Main navigation', 'Päänavigaatio'],
      ['.mobile-nav', 'Mobile navigation', 'Mobiilinavigaatio'],
      ['.video-gallery', 'Video carousel', 'Videokaruselli'],
      ['.slide-tabs', 'Choose video', 'Valitse video'],
      ['.carousel-prev', 'Previous video', 'Edellinen video'],
      ['.carousel-next', 'Next video', 'Seuraava video'],
      ['.hero-prev', 'Previous video', 'Edellinen video'],
      ['.hero-next', 'Next video', 'Seuraava video'],
      ['.dialog-close', 'Close video', 'Sulje video'],
    ];
    labels.forEach(([selector, en, fi]) => $(selector)?.setAttribute('aria-label', choose(en, fi)));
    $$('.slide-tab').forEach((button, index) => button.setAttribute('aria-label', `${choose('Select video', 'Valitse video')} ${index + 1}: ${choose(films[index].name, films[index].nameFi)}`));
    $$('.project-card').forEach(card => {
      const titleElement = card.querySelector('h2');
      card.querySelector('[data-film]').setAttribute('aria-label', `${choose('Play video', 'Toista video')}: ${titleElement.textContent}`);
    });
    $('.brand').setAttribute('aria-label', choose('ALTERSTATE Studio — home', 'ALTERSTATE Studio — etusivu'));
    updateMenuLabel();
    renderSlide(false);
  }

  // Transform-based logo animation keeps glyphs stable while a short, time-based
  // easing absorbs wheel/trackpad steps. The document spacer never changes on scroll.
  const header = $('.site-header');
  const headerSpace = $('.header-space');
  const brandWord = $('.brand-wordmark');
  const brandStudio = $('.brand-studio');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let headerMetrics;
  let headerFrame = 0;
  let displayedProgress = 0;
  let previousFrameTime = 0;

  function targetHeaderProgress() {
    const distance = headerMetrics.expandedHeight - headerMetrics.compactHeight;
    return Math.min(1, Math.max(0, window.scrollY) / distance);
  }

  function paintHeader(progress) {
    const { largeSize, smallSize, largeStudio, smallStudio, expandedHeight,
      compactHeight, smallTop, wordWidth, studioWidth } = headerMetrics;
    const mix = (from, to) => from + (to - from) * progress;
    const wordScale = mix(1, smallSize / largeSize);
    const studioScale = mix(1, smallStudio / largeStudio);
    const wordHeight = largeSize * .9 * wordScale;
    header.style.setProperty('--header-height', `${mix(expandedHeight, compactHeight)}px`);
    header.style.setProperty('--brand-y', `${mix(24, smallTop)}px`);
    header.style.setProperty('--word-scale', String(wordScale));
    header.style.setProperty('--studio-scale', String(studioScale));
    header.style.setProperty('--studio-y', `${wordHeight + 9}px`);
    header.style.setProperty('--brand-width', `${Math.max(wordWidth * wordScale, studioWidth * studioScale)}px`);
    header.style.setProperty('--brand-height', `${wordHeight + 9 + largeStudio * .9 * studioScale}px`);
    header.style.setProperty('--header-border-opacity', String(progress * .12));
  }

  function animateHeader(timestamp) {
    headerFrame = 0;
    const target = targetHeaderProgress();
    const elapsed = previousFrameTime ? Math.min(timestamp - previousFrameTime, 64) : 16.67;
    previousFrameTime = timestamp;
    // About 95ms of smoothing: responsive, with a gentle finish instead of a snap.
    displayedProgress += (target - displayedProgress) * (1 - Math.exp(-elapsed / 95));
    if (Math.abs(target - displayedProgress) < .0001) displayedProgress = target;
    paintHeader(displayedProgress);
    if (displayedProgress !== target) headerFrame = requestAnimationFrame(animateHeader);
    else previousFrameTime = 0;
  }

  function updateHeader() {
    if (reducedMotion.matches) {
      cancelAnimationFrame(headerFrame);
      headerFrame = 0;
      previousFrameTime = 0;
      displayedProgress = window.scrollY > 0 ? 1 : 0;
      paintHeader(displayedProgress);
    } else if (!headerFrame) {
      headerFrame = requestAnimationFrame(animateHeader);
    }
  }

  function measureHeader() {
    cancelAnimationFrame(headerFrame);
    headerFrame = 0;
    previousFrameTime = 0;
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const largeSize = parseFloat(getComputedStyle($('.footer-wordmark')).fontSize);
    const smallSize = mobile ? 23 : 26;
    const smallStudio = mobile ? 9 : 11;
    const largeStudio = mobile ? 14 : Math.max(18, Math.min(24, largeSize * .12));
    const compactHeight = mobile ? 88 : 112;
    const expandedHeight = 24 + largeSize * .9 + 9 + largeStudio * .9 + 18 + compactHeight;
    const smallTop = (compactHeight - (smallSize * .9 + 9 + smallStudio * .9)) / 2;
    header.style.setProperty('--brand-large-size', `${largeSize}px`);
    header.style.setProperty('--studio-large-size', `${largeStudio}px`);
    headerMetrics = { largeSize, smallSize, largeStudio, smallStudio,
      expandedHeight, compactHeight, smallTop,
      wordWidth: brandWord.offsetWidth, studioWidth: brandStudio.offsetWidth };
    headerSpace.style.setProperty('--masthead-height', `${expandedHeight}px`);
    displayedProgress = reducedMotion.matches ? (window.scrollY > 0 ? 1 : 0) : targetHeaderProgress();
    paintHeader(displayedProgress);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', measureHeader);
  window.addEventListener('pageshow', measureHeader);
  reducedMotion.addEventListener('change', updateHeader);
  measureHeader();

  // Mobile navigation remains an ordinary, keyboard-accessible list of links.
  const menuButton = $('.menu-toggle');
  const mobileNavigation = $('.mobile-nav');
  function updateMenuLabel() {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-label', isOpen ? choose('Close menu', 'Sulje valikko') : choose('Open menu', 'Avaa valikko'));
  }
  function closeMenu(restoreFocus = false) {
    menuButton.setAttribute('aria-expanded', 'false');
    mobileNavigation.hidden = true;
    updateMenuLabel();
    if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    mobileNavigation.hidden = isOpen;
    updateMenuLabel();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNavigation.hidden) closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!mobileNavigation.hidden && !event.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('focusin', event => {
    if (!mobileNavigation.hidden && !event.target.closest('.site-header')) closeMenu();
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });


  // Manual navigation avoids unwanted motion and leaves people time to explore.
  function renderSlide(announce = true) {
    const carousel = $('.video-gallery');
    if (!carousel) return;
    const film = films[slideIndex];
    const img = $('.hero-image');
    img.src = `https://i.ytimg.com/vi/${film.id}/hqdefault.jpg`;
    img.alt = `${choose(film.name, film.nameFi)} — ${choose('nature video preview', 'luontovideon esikatselukuva')}`;
    img.draggable = false;
    $('.hero-index').textContent = `${String(slideIndex + 1).padStart(2, '0')} / ${String(films.length).padStart(2, '0')}`;
    $('.hero-project-title').textContent = choose(film.name, film.nameFi);
    $('.gallery-position').textContent = $('.hero-index').textContent;
    $('[data-play-current]').setAttribute('aria-label', `${choose('Play video', 'Toista video')}: ${choose(film.name, film.nameFi)}`);
    $$('.slide-tab').forEach((button, index) => {
      const active = index === slideIndex;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (announce) $('.carousel-announcement').textContent = `${slideIndex + 1} / ${films.length}: ${choose(film.name, film.nameFi)}`;
  }
  function changeSlide(index) {
    slideIndex = (index + films.length) % films.length;
    renderSlide();
    const strip = $('.slide-tabs');
    const selected = $(`.slide-tab[data-slide="${slideIndex}"]`);
    if (strip && selected) {
      const position = selected.getBoundingClientRect();
      const bounds = strip.getBoundingClientRect();
      if (position.left < bounds.left || position.right > bounds.right) {
        strip.scrollTo({ left: strip.scrollLeft + position.left - bounds.left,
          behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      }
    }
  }
  $('.carousel-prev')?.addEventListener('click', () => changeSlide(slideIndex - 1));
  $('.carousel-next')?.addEventListener('click', () => changeSlide(slideIndex + 1));
  $('.hero-prev')?.addEventListener('click', () => changeSlide(slideIndex - 1));
  $('.hero-next')?.addEventListener('click', () => changeSlide(slideIndex + 1));
  $$('.slide-tab').forEach(button => button.addEventListener('click', () => changeSlide(Number(button.dataset.slide))));
  // Keep native touch/trackpad scrolling and add mouse dragging without accidental selection.
  const thumbnailStrip = $('.slide-tabs');
  let stripDrag = null;
  let suppressStripClickUntil = 0;
  thumbnailStrip?.addEventListener('dragstart', event => event.preventDefault());
  thumbnailStrip?.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button === 0) {
      stripDrag = { x: event.clientX, left: thumbnailStrip.scrollLeft, moved: false };
    }
  });
  thumbnailStrip?.addEventListener('pointermove', event => {
    if (!stripDrag) return;
    const distance = event.clientX - stripDrag.x;
    if (!stripDrag.moved && Math.abs(distance) > 6) {
      stripDrag.moved = true;
      thumbnailStrip.setPointerCapture(event.pointerId);
      thumbnailStrip.classList.add('is-dragging');
    }
    if (stripDrag.moved) {
      event.preventDefault();
      thumbnailStrip.scrollLeft = stripDrag.left - distance;
    }
  });
  function finishStripDrag(event) {
    if (stripDrag?.moved) suppressStripClickUntil = Date.now() + 400;
    stripDrag = null;
    thumbnailStrip.classList.remove('is-dragging');
    if (thumbnailStrip.hasPointerCapture(event.pointerId)) thumbnailStrip.releasePointerCapture(event.pointerId);
  }
  thumbnailStrip?.addEventListener('pointerup', finishStripDrag);
  thumbnailStrip?.addEventListener('pointercancel', finishStripDrag);
  thumbnailStrip?.addEventListener('pointerleave', event => {
    if (!stripDrag?.moved) finishStripDrag(event);
  });
  thumbnailStrip?.addEventListener('click', event => {
    if (Date.now() < suppressStripClickUntil) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
  $('.video-gallery')?.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      changeSlide(slideIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });

  // Horizontal swipes change videos; vertical gestures still scroll the page.
  // Suppress the ensuing click so swiping over the play button never starts a video.
  const videoSurface = $('.hero-carousel');
  let gestureStart = null;
  let swipeFinishedAt = 0;
  videoSurface?.addEventListener('pointerdown', event => {
    if (event.isPrimary && event.button === 0) {
      gestureStart = { x: event.clientX, y: event.clientY };
    }
  });
  videoSurface?.addEventListener('pointerup', event => {
    if (!gestureStart) return;
    const dx = event.clientX - gestureStart.x;
    const dy = event.clientY - gestureStart.y;
    gestureStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swipeFinishedAt = Date.now();
      changeSlide(slideIndex + (dx < 0 ? 1 : -1));
    }
  });
  videoSurface?.addEventListener('pointercancel', () => { gestureStart = null; });
  videoSurface?.addEventListener('pointerleave', () => { gestureStart = null; });
  videoSurface?.addEventListener('click', event => {
    if (Date.now() - swipeFinishedAt < 400) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  // YouTube is only contacted after an explicit play action.
  const dialog = $('.film-dialog');
  function openFilm(id) {
    const film = films.find(item => item.id === id);
    if (!film) return;
    previousFocus = document.activeElement;
    $('#film-title').textContent = film.title;
    $('.youtube-fallback').href = `https://www.youtube.com/watch?v=${film.id}`;
    if (location.protocol === 'file:') {
      const note = document.createElement('p');
      note.className = 'local-video-note';
      note.textContent = choose(
        'YouTube needs a web address to play here. Use Watch on YouTube above, or open the site through a localhost preview.',
        'Videota ei voi toistaa suoraan tiedostona avatulla sivulla. Avaa video yllä olevasta Katso YouTubessa -linkistä.'
      );
      $('.video-frame').replaceChildren(note);
      document.body.classList.add('modal-open');
      dialog.showModal();
      $('.dialog-close').focus();
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.title = film.title;
    const playerUrl = new URL(`https://www.youtube-nocookie.com/embed/${film.id}`);
    playerUrl.search = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1', origin: location.origin }).toString();
    iframe.src = playerUrl.href;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    $('.video-frame').replaceChildren(iframe);
    document.body.classList.add('modal-open');
    dialog.showModal();
    $('.dialog-close').focus();
  }
  $('[data-play-current]')?.addEventListener('click', () => openFilm(films[slideIndex].id));
  $$('[data-film]').forEach(button => button.addEventListener('click', () => openFilm(button.dataset.film)));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    $('.video-frame').replaceChildren(); // Removing the iframe stops sound immediately.
    document.body.classList.remove('modal-open');
    previousFocus?.focus();
  });

  $$('.year').forEach(element => { element.textContent = new Date().getFullYear(); });
  initializeLabels();
})();
