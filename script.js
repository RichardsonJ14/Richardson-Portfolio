(() => {
  const root = document.documentElement;
  root.classList.add("js");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Run something once the loading screen hands over to the page
  const onEnter = (fn) => {
    if (root.classList.contains("skip-boot") || !document.getElementById("boot")) fn();
    else window.addEventListener("rj:enter", fn, { once: true });
  };

  // Typing effect for the role line
  const typed = document.getElementById("typed");
  if (typed && !reduced) {
    const words = JSON.parse(typed.dataset.words);
    let w = 0, c = 0, deleting = false;
    const step = () => {
      const word = words[w];
      typed.textContent = word.slice(0, c);
      if (deleting) {
        c--;
        if (c < 0) { deleting = false; w = (w + 1) % words.length; c = 0; }
        setTimeout(step, 35);
      } else {
        c++;
        if (c > word.length) { deleting = true; c = word.length; return setTimeout(step, 1800); }
        setTimeout(step, 70);
      }
    };
    onEnter(() => setTimeout(step, 2800));
  }

  // Pixel headings: scramble-in when scrolled into view
  const glyphs = "01<>/_#$%&*+=?";
  const scramble = (el) => {
    const final = el.dataset.text;
    if (reduced) return;
    const t0 = performance.now(), dur = 750;
    el.classList.add("is-scrambling");
    const run = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const fixed = Math.floor(final.length * p);
      el.textContent = [...final].map((ch, i) => (i < fixed || ch === " " || ch === "_" || ch === "'" ? ch : glyphs[Math.floor(Math.random() * glyphs.length)])).join("");
      if (p < 1) requestAnimationFrame(run);
      else { el.textContent = final; el.classList.remove("is-scrambling"); }
    };
    requestAnimationFrame(run);
  };

  // Reveal on scroll (+ scramble headings, stagger siblings)
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      const h = e.target.querySelector(".pixel[data-text]");
      if (h) scramble(h);
      io.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => {
    const idx = [...el.parentElement.children].indexOf(el);
    el.style.transitionDelay = `${Math.min(idx, 5) * 70}ms`;
    io.observe(el);
  });

  // Count-up numbers
  const counters = document.querySelectorAll("[data-count]");
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, suffix = el.dataset.suffix || "";
      if (reduced) { el.textContent = end + suffix; return; }
      const t0 = performance.now(), dur = 1200;
      const run = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suffix : "");
        if (p < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => cio.observe(el));

  // Active nav link
  const links = [...document.querySelectorAll("[data-nav]")];
  const sections = links.map((a) => document.getElementById(a.dataset.nav));
  const nio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("is-active", a.dataset.nav === e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => s && nio.observe(s));
})();
