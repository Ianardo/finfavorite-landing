// On-scroll reveal behavior
ScrollReveal({reset: true})
ScrollReveal().reveal('hgroup h1');
ScrollReveal().reveal('hgroup p', { delay: 100 });

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