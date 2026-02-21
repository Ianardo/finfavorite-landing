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
  const mediaImage = spotlight.querySelector('[data-feature-media-image]');

  const featureCopy = {
    reports: {
      title: 'Reports',
      description:
        'Generate clean weekly and monthly snapshots across return, win rate, and exposure so performance reviews stay objective and repeatable.',
      linkText: 'Open Reports →',
      mediaSrc: '../img/screenshots/Reports.png',
      mediaAlt: 'Reports screenshot',
    },
    dividends: {
      title: 'Dividends',
      description:
        'Track payouts, dividend growth, and yield consistency across holdings so your income strategy stays transparent and easy to monitor.',
      linkText: 'View Dividends →',
      mediaSrc: '../img/screenshots/Dividends.png',
      mediaAlt: 'Dividends screenshot',
    },
    charting: {
      title: 'Charting',
      description:
        'Customize indicators and overlays to compare momentum, structure, and context directly on chart so setup quality is easier to validate.',
      linkText: 'Explore Charting →',
      mediaSrc: '../img/screenshots/Custom.png',
      mediaAlt: 'Charting screenshot',
    },
    watchlists: {
      title: 'Watchlists',
      description:
        'Keep your best ideas in one place, with quick views of price action, momentum, and next events before you open a full stock overview.',
      linkText: 'Open Watchlists →',
      mediaSrc: '../img/screenshots/Watchlists.png',
      mediaAlt: 'Watchlists screenshot',
    },
    calendar: {
      title: 'Calendar',
      description:
        'Keep earnings dates, dividend events, and key market timings in one timeline so planning and execution stay synchronized.',
      linkText: 'Open Calendar →',
      mediaSrc: '../img/screenshots/Calendar.png',
      mediaAlt: 'Calendar screenshot',
    },
  };

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
    if (mediaImage) {
      mediaImage.src = nextData.mediaSrc;
      mediaImage.alt = nextData.mediaAlt;
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
