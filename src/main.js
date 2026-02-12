// On-scroll reveal behavior
ScrollReveal({reset: true, distance: '20px'})
ScrollReveal().reveal('hgroup h1', {interval: 90});
ScrollReveal().reveal('section > *:not(hgroup)', { delay: 200, distance: '10px' });
ScrollReveal().reveal('#testimonials')

const sr = ScrollReveal({ distance: '18px', duration: 650, origin: 'bottom' });

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

/*************/
// Always start at the top on reload (dev + prod)
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.addEventListener("load", () => {
  // If you want to ignore hashes too, uncomment the next 2 lines:
  // if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  window.scrollTo(0, 0);
});
/*************/