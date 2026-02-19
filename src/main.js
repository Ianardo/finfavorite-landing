const sr = ScrollReveal({
  reset: false,        
  duration: 650,
  distance: '18px',
  origin: 'bottom',
  easing: 'cubic-bezier(0.2, 0.65, 0.3, 1)',
  cleanup: true,
});

// Headings
sr.reveal('hgroup > *', { interval: 90 });

// Generic reveal for sections, but EXCLUDE testimonials-wrap so it doesn't shift down
sr.reveal('section > *:not(hgroup):not(.testimonials-wrap)', {
  delay: 200,
  distance: '10px',
});

// Testimonials: stagger in your custom interleaved order
window.addEventListener('DOMContentLoaded', () => {
  const left = [...document.querySelectorAll('#testimonials .testimonials-col:nth-child(1) .testimonial-card')];
  const right = [...document.querySelectorAll('#testimonials .testimonials-col:nth-child(2) .testimonial-card')];

  const ordered = [];
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    if (left[i]) ordered.push(left[i]);
    if (right[i]) ordered.push(right[i]);
  }

  const base = 120;
  const step = 120;

  ordered.forEach((el, i) => {
    sr.reveal(el, {
      delay: base + i * step,
      distance: '0px',   // IMPORTANT: no translate => no overlap at bottom
      opacity: 0,
    });
  });
});

const spotlight = document.querySelector('[data-feature-spotlight]');

if (spotlight) {
  const tabs = [...spotlight.querySelectorAll('[data-feature-tab]')];
  const panel = spotlight.querySelector('.feature-spotlight-panel');
  const title = spotlight.querySelector('[data-feature-title]');
  const description = spotlight.querySelector('[data-feature-description]');
  const link = spotlight.querySelector('[data-feature-link]');
  const media = spotlight.querySelector('[data-feature-media]');
  const mediaLabel = spotlight.querySelector('[data-feature-media-label]');

  const featureCopy = {
    watchlists: {
      title: 'Watchlists',
      description:
        'Keep your best ideas in one place, with quick views of price action, momentum, and next events before you open a full stock overview.',
      linkText: 'Try Watchlists →',
      mediaText: 'Screenshot coming soon',
      mediaAriaLabel: 'Watchlists screenshot placeholder',
    },
    'indicator-overlays': {
      title: 'Indicator Overlays',
      description:
        'Layer moving averages, RSI, and volume context directly on your chart so you can compare setup quality before and after each trade.',
      linkText: 'Preview Indicator Overlays →',
      mediaText: 'Overlay view coming soon',
      mediaAriaLabel: 'Indicator overlays screenshot placeholder',
    },
    'trading-reports': {
      title: 'Trading Reports',
      description:
        'Generate clean weekly and monthly snapshots of return, hit rate, and exposure shifts so performance reviews stay objective and repeatable.',
      linkText: 'Open Trading Reports →',
      mediaText: 'Report preview coming soon',
      mediaAriaLabel: 'Trading reports screenshot placeholder',
    },
    'custom-assets': {
      title: 'Custom Assets',
      description:
        'Track private positions, options models, or synthetic baskets alongside equities to keep a complete view of your risk across every idea.',
      linkText: 'See Custom Assets →',
      mediaText: 'Custom asset view coming soon',
      mediaAriaLabel: 'Custom assets screenshot placeholder',
    },
    'price-alerts': {
      title: 'Price Alerts',
      description:
        'Set alerts around levels that matter to your thesis and get reminded when momentum, pullbacks, or breakouts hit your watch criteria.',
      linkText: 'Try Price Alerts →',
      mediaText: 'Alert center coming soon',
      mediaAriaLabel: 'Price alerts screenshot placeholder',
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
    mediaLabel.textContent = nextData.mediaText;
    media.setAttribute('aria-label', nextData.mediaAriaLabel);
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
