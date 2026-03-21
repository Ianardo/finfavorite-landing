// On-scroll reveal behavior
const sr = typeof ScrollReveal === 'function'
  ? ScrollReveal({
      reset: false,
      distance: '18px',
      duration: 650,
      origin: 'bottom',
    })
  : { reveal: () => {} };

[...document.querySelectorAll('hgroup')].forEach((group) => {
  const items = [...group.children];
  if (!items.length) return;

  sr.reveal(items, {
    interval: 90,
    distance: '20px',
  });
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const testimonialMobileQuery = window.matchMedia('(max-width: 900px)');

const topNav = document.querySelector('.top-nav');
const inPageLinks = [...document.querySelectorAll('a[href^="#"]:not([href="#"])')]
  .filter((link) => !link.classList.contains('skip-link'));
const topNavLinks = [...document.querySelectorAll('.top-nav__links a[href^="#"]')];
const topNavSections = topNavLinks
  .map((link) => {
    const hash = link.getAttribute('href');
    const section = hash ? document.querySelector(hash) : null;
    return section ? { link, section } : null;
  })
  .filter(Boolean);

const getHeaderOffset = () => (topNav ? topNav.offsetHeight : 0);
const smoothScrollToSection = (section) => {
  const targetY = section.getBoundingClientRect().top + window.scrollY - getHeaderOffset() + 2;
  window.scrollTo({
    top: Math.max(targetY, 0),
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  });
};

const setActiveTopNavLink = (activeId = '') => {
  topNavLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${activeId}`;
    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

if (topNav) {
  const updateNavGlassState = () => {
    topNav.classList.toggle('top-nav--glassy', window.scrollY > 2);
  };

  updateNavGlassState();
  window.addEventListener('scroll', updateNavGlassState, { passive: true });
}

inPageLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    const target = hash ? document.querySelector(hash) : null;
    if (!target) return;
    event.preventDefault();
    smoothScrollToSection(target);
    window.history.replaceState(null, '', hash);
  });
});

if (topNavSections.length > 0) {
  const syncActiveTopNavLink = () => {
    const y = window.scrollY + getHeaderOffset() + 18;
    let activeId = '';

    topNavSections.forEach(({ section }) => {
      if (y >= section.offsetTop) {
        activeId = section.id;
      }
    });

    setActiveTopNavLink(activeId);
  };

  syncActiveTopNavLink();
  window.addEventListener('scroll', syncActiveTopNavLink, { passive: true });
  window.addEventListener('resize', syncActiveTopNavLink, { passive: true });
}

const getTestimonialsInAlternatingOrder = () => {
  const columns = [...document.querySelectorAll('#testimonials .testimonials-col')]
    .map((column) => [...column.querySelectorAll('.testimonial-card')]);
  const ordered = [];

  for (let i = 0; i < Math.max(...columns.map((column) => column.length), 0); i++) {
    columns.forEach((column) => {
      if (column[i]) ordered.push(column[i]);
    });
  }

  return ordered;
};

const normalizeInlineText = (value) => value.replace(/\s+/g, ' ').trim();

const getFirstSentence = (text) => {
  const sentenceMatch = text.match(/.*?[.!?](?=\s|$)/);
  return normalizeInlineText(sentenceMatch ? sentenceMatch[0] : text);
};

const getExcerptMeta = (fullText, summaryText) => {
  const startIndex = fullText.indexOf(summaryText);
  const fallbackEndIndex = startIndex >= 0 ? startIndex + summaryText.length : -1;

  return {
    startsMidThought: startIndex > 0,
    endsMidThought: fallbackEndIndex > -1 && fallbackEndIndex < fullText.length,
  };
};

const formatExcerptText = (summaryText, { startsMidThought, endsMidThought }) => {
  let excerpt = normalizeInlineText(summaryText);

  if (endsMidThought) {
    excerpt = excerpt.replace(/[.!?]+$/, '');
    excerpt = `${excerpt}…`;
  }

  if (startsMidThought) {
    excerpt = `…${excerpt}`;
  }

  return excerpt;
};

const syncTestimonialCardState = (card) => {
  const quote = card.querySelector('.testimonial-quote');
  const preview = card.querySelector('.testimonial-toggle');
  const action = preview?.querySelector('.testimonial-toggle__action');

  if (!quote || !preview || !action) return;

  if (!testimonialMobileQuery.matches) {
    card.classList.remove('is-expanded');
  }

  const isExpanded = testimonialMobileQuery.matches && card.classList.contains('is-expanded');

  quote.hidden = testimonialMobileQuery.matches && !isExpanded;
  action.textContent = isExpanded ? 'show less' : 'read more';

  if (testimonialMobileQuery.matches) {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-controls', quote.id);
    card.setAttribute('aria-expanded', String(isExpanded));
  } else {
    card.removeAttribute('role');
    card.removeAttribute('tabindex');
    card.removeAttribute('aria-controls');
    card.removeAttribute('aria-expanded');
  }
};

const setupMobileTestimonialToggles = () => {
  const cards = [...document.querySelectorAll('#testimonials .testimonial-card')];
  if (!cards.length) return;

  cards.forEach((card, index) => {
    const quote = card.querySelector('.testimonial-quote');
    const quoteParagraph = quote?.querySelector('p');
    const meta = card.querySelector('.testimonial-meta');

    if (!quote || !quoteParagraph || !meta) return;

    const fullText = normalizeInlineText(quoteParagraph.textContent ?? '');
    if (!fullText) return;

    const summaryText = normalizeInlineText(card.dataset.mobileSummary ?? getFirstSentence(fullText));
    if (!summaryText || summaryText === fullText) return;

    card.classList.add('testimonial-card--collapsible');
    quote.id = quote.id || `testimonial-quote-${index + 1}`;

    let toggle = card.querySelector('.testimonial-toggle');

    if (!toggle) {
      toggle = document.createElement('div');
      toggle.className = 'testimonial-toggle';
      toggle.innerHTML = `
        <span class="testimonial-toggle__summary"></span>
        <span class="testimonial-toggle__action"></span>
      `;
      card.insertBefore(toggle, meta);
    }

    const summary = toggle.querySelector('.testimonial-toggle__summary');
    if (summary) {
      summary.textContent = formatExcerptText(summaryText, getExcerptMeta(fullText, summaryText));
    }

    if (!card.dataset.testimonialToggleBound) {
      card.addEventListener('click', () => {
        if (!testimonialMobileQuery.matches) return;
        card.classList.toggle('is-expanded');
        syncTestimonialCardState(card);
      });

      card.addEventListener('keydown', (event) => {
        if (!testimonialMobileQuery.matches) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;

        event.preventDefault();
        card.classList.toggle('is-expanded');
        syncTestimonialCardState(card);
      });

      card.dataset.testimonialToggleBound = 'true';
    }

    syncTestimonialCardState(card);
  });

  const syncAllCards = () => {
    cards.forEach((card) => {
      if (card.classList.contains('testimonial-card--collapsible')) {
        syncTestimonialCardState(card);
      }
    });
  };

  if (typeof testimonialMobileQuery.addEventListener === 'function') {
    testimonialMobileQuery.addEventListener('change', syncAllCards);
  } else if (typeof testimonialMobileQuery.addListener === 'function') {
    testimonialMobileQuery.addListener(syncAllCards);
  }
};

const revealCardsOnce = (sectionSelector, getCards, options = {}) => {
  const section = document.querySelector(sectionSelector);
  if (!section) return;

  const {
    baseDelay = 100,
    step = 100,
    distance = 12,
    duration = 600,
  } = options;

  let hasRevealed = false;

  const runReveal = () => {
    if (hasRevealed) return;
    hasRevealed = true;

    const cards = getCards();
    if (!cards.length || prefersReducedMotion || typeof cards[0]?.animate !== 'function') return;

    cards.forEach((card, index) => {
      card.animate(
        [
          { opacity: 0, transform: `translateY(${distance}px)` },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        {
          duration,
          delay: baseDelay + index * step,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        }
      );
    });
  };

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    runReveal();
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      currentObserver.disconnect();
      runReveal();
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  observer.observe(section);
};

sr.reveal('#trust .trust-card', {
  delay: 140,     // gives the header a beat
  interval: 90,
  distance: '12px',
  duration: 600,
});

revealCardsOnce('#testimonials', getTestimonialsInAlternatingOrder, {
  baseDelay: 100,
  step: 120,
  distance: 12,
  duration: 640,
});

setupMobileTestimonialToggles();

revealCardsOnce('#pricing', () => [...document.querySelectorAll('#pricing .pricing-card')], {
  baseDelay: 80,
  step: 90,
  distance: 10,
  duration: 560,
});

/* ── Compare-features toggle ── */
const compareToggle = document.querySelector('.compare-toggle');
const compareCollapse = document.getElementById('compare-table');

if (compareToggle && compareCollapse) {
  compareCollapse.inert = true;

  compareToggle.addEventListener('click', () => {
    const isExpanded = compareToggle.getAttribute('aria-expanded') === 'true';
    compareToggle.setAttribute('aria-expanded', String(!isExpanded));
    compareCollapse.setAttribute('aria-hidden', String(isExpanded));
    compareCollapse.inert = isExpanded;

    if (!isExpanded) {
      compareToggle.querySelector('.compare-toggle__text').textContent = 'Hide comparison';
    } else {
      compareToggle.querySelector('.compare-toggle__text').textContent = 'Compare all features';
    }
  });
}

sr.reveal('#features .feature', {
  delay: 140,     // gives the header a beat
  interval: 90,
  distance: '12px',
  duration: 600,
});

const imagePreloadCache = new Map();
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const preloadImage = (src) => {
  if (!src) return Promise.resolve(false);
  if (imagePreloadCache.has(src)) return imagePreloadCache.get(src);

  const preloadPromise = new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.loading = 'eager';
    image.onload = () => {
      if (typeof image.decode === 'function') {
        image.decode().then(() => resolve(true)).catch(() => resolve(true));
        return;
      }
      resolve(true);
    };
    image.onerror = () => resolve(false);
    image.src = src;
  });

  imagePreloadCache.set(src, preloadPromise);
  return preloadPromise;
};

const createFeatureCarousel = (carousel) => {
  const track = carousel.querySelector('[data-feature-track]');
  const dotsWrap = carousel.querySelector('.feature-carousel-dots');
  const prevButton = carousel.querySelector('[data-feature-prev]');
  const nextButton = carousel.querySelector('[data-feature-next]');

  if (!track) return null;

  let slides = [];
  let dots = [];
  let activeIndex = 0;
  let rafId = 0;
  let setSlidesToken = 0;

  const clamp = (index) => {
    const maxIndex = Math.max(slides.length - 1, 0);
    return Math.min(Math.max(index, 0), maxIndex);
  };

  const slideWidth = () => Math.max(track.clientWidth, 1);
  const isSingle = () => slides.length <= 1;

  const updateNavState = () => {
    const single = isSingle();
    carousel.classList.toggle('is-single', single);

    if (prevButton) {
      prevButton.hidden = single;
      prevButton.disabled = single || activeIndex === 0;
    }

    if (nextButton) {
      nextButton.hidden = single;
      nextButton.disabled = single || activeIndex === slides.length - 1;
    }

    if (dotsWrap) {
      dotsWrap.hidden = single;
    }
  };

  const setActiveState = (index) => {
    activeIndex = clamp(index);

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    updateNavState();
  };

  const indexFromScroll = () => clamp(Math.round(track.scrollLeft / slideWidth()));

  const goTo = (index, behavior = 'smooth') => {
    if (!slides.length) return;
    const next = clamp(index);
    track.scrollTo({ left: next * slideWidth(), behavior });
    setActiveState(next);
  };

  const rebuildDots = () => {
    if (!dotsWrap) return;

    dotsWrap.replaceChildren();
    dots = [];

    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'feature-carousel-dot';
      dot.dataset.featureDot = '';
      dot.dataset.featureIndex = String(index);
      dot.setAttribute('aria-label', `Go to image ${index + 1} of ${slides.length}`);
      dot.setAttribute('aria-current', 'false');
      dot.addEventListener('click', () => goTo(index));
      dotsWrap.append(dot);
      dots.push(dot);
    });
  };

  const refresh = (index = 0, behavior = 'auto') => {
    slides = [...track.querySelectorAll('[data-feature-slide]')];
    rebuildDots();
    setActiveState(index);
    goTo(activeIndex, behavior);
  };

  const setSlides = async (mediaItems = []) => {
    if (!Array.isArray(mediaItems) || mediaItems.length === 0) return;

    const nextItems = mediaItems.filter((media) => media?.src);
    if (!nextItems.length) return;

    const requestToken = ++setSlidesToken;
    await Promise.all(nextItems.map((media) => preloadImage(media.src)));
    if (requestToken !== setSlidesToken) return;

    track.replaceChildren();

    nextItems.forEach((media) => {
      const image = document.createElement('img');
      image.className = 'feature-carousel-slide';
      image.dataset.featureSlide = '';
      image.src = media.src;
      image.alt = media.alt ?? '';
      image.loading = 'lazy';
      image.decoding = 'async';
      track.append(image);
    });

    refresh(0, 'auto');
  };

  track.addEventListener('scroll', () => {
    if (isSingle() || rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      setActiveState(indexFromScroll());
    });
  }, { passive: true });

  if (prevButton) prevButton.addEventListener('click', () => goTo(activeIndex - 1));
  if (nextButton) nextButton.addEventListener('click', () => goTo(activeIndex + 1));

  window.addEventListener('resize', () => {
    if (!slides.length) return;
    goTo(activeIndex, 'auto');
  });

  refresh(0, 'auto');

  return {
    setSlides,
  };
};

const carouselControllers = new Map();

[...document.querySelectorAll('[data-feature-carousel]')].forEach((carousel) => {
  const controller = createFeatureCarousel(carousel);
  if (controller) {
    carouselControllers.set(carousel, controller);
  }
});


sr.reveal('#how-it-works .step', {
  delay: 140,     // gives the header a beat
  interval: 90,
  distance: '12px',
  duration: 600,
});

sr.reveal('#macro-micro .macro-micro__zoom-line', {
  delay: 640,
  distance: '10px',
  duration: 540,
  origin: 'bottom',
});

const spotlight = document.querySelector('[data-feature-spotlight]');

if (spotlight) {
  const tabs = [...spotlight.querySelectorAll('[data-feature-tab]')];
  const panel = spotlight.querySelector('.feature-spotlight-panel');
  const title = spotlight.querySelector('[data-feature-title]');
  const description = spotlight.querySelector('[data-feature-description]');
  const spotlightCarousel = spotlight.querySelector('[data-spotlight-carousel]');
  const spotlightCarouselController = spotlightCarousel ? carouselControllers.get(spotlightCarousel) : null;
  let spotlightTransitionToken = 0;

  const featureCopy = {
    // Use 1 item in `media` for a single image, or 2 items for a double carousel.
    reports: {
      title: 'Reports',
      description:
        'View metrics from basic win rate to drawdown, excursion, hold-time, and edge-quality analytics.',
      media: [{ src: '../img/screenshots/Reports.png', alt: 'Reports screenshot' }],
    },
    dividends: {
      title: 'Dividends',
      description:
        'Turn income investing into a planned system with yield metrics, ex-date visibility, and projected payout timelines.',
      media: [{ src: '../img/screenshots/Dividends.png', alt: 'Dividends screenshot' }],
    },
    charting: {
      title: 'Charting',
      description:
        'Customize indicators and overlays to compare momentum, structure, and context directly on chart so setup quality is easier to validate.',
      media: [
        { src: '../img/screenshots/charting.png', alt: 'Charting screenshot' },
        { src: '../img/screenshots/charting-2.png', alt: 'Charting secondary screenshot' },
      ],
    },
    screener: {
      title: 'Screener',
      description:
        'Filter your watchlist with technical and fundamental criteria so strong setups surface faster and stay grounded in context.',
      media: [
        { src: '../img/screenshots/screener.png', alt: 'Screener overview screenshot' },
        { src: '../img/screenshots/screener-2.png', alt: 'Screener performance filter screenshot' },
      ],
    },
    watchlists: {
      title: 'Watchlist',
      description:
        'Organize ideas with tags, imports, and quick filtering so research stays actionable instead of scattered.',
      media: [{ src: '../img/screenshots/Watchlists.png', alt: 'Watchlists screenshot' }],
    },
    calendar: {
      title: 'Calendar',
      description:
        'Review performance by day, week, or month with a calendar view that keeps trading context tied to each result.',
      media: [
        { src: '../img/screenshots/Calendar.png', alt: 'Calendar screenshot' },
        { src: '../img/screenshots/calendar-2.png', alt: 'Calendar secondary screenshot' },
      ],
    },
    events: {
      title: 'Events',
      description:
        'Stay ahead of catalysts with earnings and economic calendars, event details, and journal context that surfaces what mattered on the day.',
      media: [
        { src: '../img/screenshots/events.png', alt: 'Earnings calendar screenshot' },
        { src: '../img/screenshots/events-2.png', alt: 'Economic calendar screenshot' },
        { src: '../img/screenshots/events-3.png', alt: 'Journal view with upcoming events screenshot' },
        { src: '../img/screenshots/events-4.png', alt: 'Journal economic events panel screenshot' },
      ],
    },
    customAssets: {
      title: 'Custom Assets',
      description:
        'Track private financial instruments and tangible assets in one place with dedicated views for both asset types.',
      media: [
        { src: '../img/screenshots/custom.png', alt: 'Custom assets financial tab screenshot' },
        { src: '../img/screenshots/custom-2.png', alt: 'Custom assets tangible tab screenshot' },
      ],
    },
  };

  Object.values(featureCopy).forEach((feature) => {
    feature.media.forEach((media) => {
      void preloadImage(media.src);
    });
  });

  const activateTab = async (tab, options = {}) => {
    const shouldAnimate = options.animate ?? !prefersReducedMotion;
    const nextData = featureCopy[tab.dataset.featureKey];
    if (!nextData) return;
    const transitionToken = ++spotlightTransitionToken;

    if (shouldAnimate) {
      panel.classList.add('is-transitioning');
      await wait(90);
      if (transitionToken !== spotlightTransitionToken) return;
    }

    if (spotlightCarouselController) {
      await spotlightCarouselController.setSlides(nextData.media);
      if (transitionToken !== spotlightTransitionToken) return;
    }

    tabs.forEach((item) => {
      const isActive = item === tab;
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      item.tabIndex = isActive ? 0 : -1;
      if (isActive) {
        panel.setAttribute('aria-labelledby', item.id);
      }
    });

    title.textContent = nextData.title;
    description.textContent = nextData.description;

    if (shouldAnimate) {
      window.requestAnimationFrame(() => {
        if (transitionToken !== spotlightTransitionToken) return;
        panel.classList.remove('is-transitioning');
      });
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      void activateTab(tab);
    });

    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();

      const activeIndex = tabs.findIndex((item) => item.getAttribute('aria-selected') === 'true');
      if (activeIndex < 0) return;

      let nextIndex = activeIndex;
      if (event.key === 'ArrowRight') nextIndex = (activeIndex + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;

      tabs[nextIndex].focus();
      void activateTab(tabs[nextIndex]);
    });
  });

  const selectedTab = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabs[0];
  if (selectedTab) void activateTab(selectedTab, { animate: false });
}
