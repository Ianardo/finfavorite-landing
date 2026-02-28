// On-scroll reveal behavior
ScrollReveal({reset: false, distance: '20px'})
ScrollReveal().reveal('hgroup > *', {interval: 90});
ScrollReveal().reveal('section > *:not(hgroup)', { delay: 200, distance: '10px' });
ScrollReveal().reveal('#testimonials')

const sr = ScrollReveal({ distance: '18px', duration: 650, origin: 'bottom' });

const topNav = document.querySelector('.top-nav');

if (topNav) {
  const updateNavGlassState = () => {
    topNav.classList.toggle('top-nav--glassy', window.scrollY > 2);
  };

  updateNavGlassState();
  window.addEventListener('scroll', updateNavGlassState, { passive: true });
}

/* testimonials */
window.addEventListener('DOMContentLoaded', () => {
  const left = [...document.querySelectorAll('#testimonials .testimonials-col:nth-child(1) .testimonial-card')];
  const right = [...document.querySelectorAll('#testimonials .testimonials-col:nth-child(2) .testimonial-card')];

  const ordered = [];
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    if (left[i]) ordered.push(left[i]);
    if (right[i]) ordered.push(right[i]);
  }

  const base = 120;   // ms before first
  const step = 120;   // ms between each

  ordered.forEach((el, i) => {
    el.style.setProperty('--stagger-delay', `${base + i * step}ms`);
  });

  ScrollReveal().reveal('#testimonials', {
    distance: '0px',
    duration: 1,
    opacity: 1,
    viewFactor: 0.2,
    viewOffset: { bottom: 80 },
    beforeReveal: (section) => section.classList.add('is-revealed'),
  });
});

/* /testimonials */

const cards = document.querySelectorAll('#testimonials .testimonial-card');

sr.reveal(cards, {
  delay: 100,     // initial wait before the first card
  interval: 120,  // stagger step between cards
  distance: '0px'
});

sr.reveal('#trust .trust-card', {
  delay: 140,     // gives the header a beat
  interval: 90,
  distance: '12px',
  duration: 600,
});

sr.reveal('#pricing .pricing-card', {
  delay: 140,     // gives the header a beat
  interval: 90,
  distance: '12px',
  duration: 600,
});

sr.reveal('#features .feature', {
  delay: 140,     // gives the header a beat
  interval: 90,
  distance: '12px',
  duration: 600,
});

const imagePreloadCache = new Map();

const preloadImage = (src) => {
  if (!src) return Promise.resolve(false);
  if (imagePreloadCache.has(src)) return imagePreloadCache.get(src);

  const preloadPromise = new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.loading = 'eager';
    image.onload = () => resolve(true);
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
  const link = spotlight.querySelector('[data-feature-link]');
  const spotlightCarousel = spotlight.querySelector('[data-spotlight-carousel]');
  const spotlightCarouselController = spotlightCarousel ? carouselControllers.get(spotlightCarousel) : null;

  const featureCopy = {
    // Use 1 item in `media` for a single image, or 2 items for a double carousel.
    reports: {
      title: 'Reports',
      description:
        'View metrics from basic win rate to drawdown, excursion, hold-time, and edge-quality analytics.',
      linkText: 'Open Reports →',
      media: [{ src: '../img/screenshots/Reports.png', alt: 'Reports screenshot' }],
    },
    dividends: {
      title: 'Dividends',
      description:
        'Turn income investing into a planned system with yield metrics, ex-date visibility, and projected payout timelines.',
      linkText: 'View Dividends →',
      media: [{ src: '../img/screenshots/Dividends.png', alt: 'Dividends screenshot' }],
    },
    charting: {
      title: 'Charting',
      description:
        'Customize indicators and overlays to compare momentum, structure, and context directly on chart so setup quality is easier to validate.',
      linkText: 'Explore Charting →',
      media: [
        { src: '../img/screenshots/Custom.png', alt: 'Charting screenshot' },
        { src: '../img/screenshots/custom-2.png', alt: 'Charting secondary screenshot' },
      ],
    },
    watchlists: {
      title: 'Watchlist',
      description:
        'Organize ideas with tags, imports, and quick filtering so research stays actionable instead of scattered.',
      linkText: 'Open Watchlist →',
      media: [{ src: '../img/screenshots/Watchlists.png', alt: 'Watchlists screenshot' }],
    },
    calendar: {
      title: 'Calendar',
      description:
        'Keep earnings dates, dividend events, and key market timings in one timeline so planning and execution stay synchronized.',
      linkText: 'Open Calendar →',
      media: [
        { src: '../img/screenshots/Calendar.png', alt: 'Calendar screenshot' },
        { src: '../img/screenshots/calendar-2.png', alt: 'Calendar secondary screenshot' },
      ],
    },
  };

  Object.values(featureCopy).forEach((feature) => {
    feature.media.forEach((media) => {
      void preloadImage(media.src);
    });
  });

  const activateTab = (tab) => {
    const nextData = featureCopy[tab.dataset.featureKey];
    if (!nextData) return;

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
    link.textContent = nextData.linkText;
    if (spotlightCarouselController) {
      spotlightCarouselController.setSlides(nextData.media);
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab));

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
      activateTab(tabs[nextIndex]);
    });
  });

  const selectedTab = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabs[0];
  if (selectedTab) activateTab(selectedTab);
}

/*************/
// Always start at the top on reload (dev + prod)
// if ("scrollRestoration" in history) {
//   history.scrollRestoration = "manual";
// }

window.addEventListener("load", () => {
  // If you want to ignore hashes too, uncomment the next 2 lines:
  // if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  window.scrollTo(0, 0);
});
/*************/
