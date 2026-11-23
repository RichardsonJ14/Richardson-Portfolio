(() => {
  const root = document.documentElement;
  root.classList.add("js");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme (persisted)
  const saved = localStorage.getItem("rj-theme");
  if (saved) root.dataset.theme = saved;
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = root.dataset.theme === "green" ? "amber" : "green";
    root.dataset.theme = next;
    localStorage.setItem("rj-theme", next);
  });

  // Clock (IST) + year
  const clock = document.getElementById("clock");
  const tick = () => {
    clock.textContent = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
    }) + " IST";
  };
  tick();
  setInterval(tick, 30000);
  document.getElementById("year").textContent = new Date().getFullYear();

  // Run something once the loading screen hands over to the page
  const onEnter = (fn) => {
    if (root.classList.contains("skip-boot") || !document.getElementById("boot")) fn();
    else window.addEventListener("rj:enter", fn, { once: true });
  };

  // Typing effect
  const typed = document.getElementById("typed");
  const words = JSON.parse(typed.dataset.words);
  if (!reduced) {
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
        if (c > words[w].length) { deleting = true; c = words[w].length; return setTimeout(step, 1800); }
        setTimeout(step, 70);
      }
    };
    onEnter(() => setTimeout(step, 2600));
  }

  // Reveal on scroll
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 60}ms`; io.observe(el); });

  // Count-up stats
  const counters = document.querySelectorAll("[data-count]");
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, suffix = el.dataset.suffix || "";
      if (reduced) { el.textContent = end + suffix; return; }
      const t0 = performance.now(), dur = 1100;
      const run = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suffix : "");
        if (p < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    });
  }, { threshold: 0.6 });
  onEnter(() => setTimeout(() => counters.forEach((el) => cio.observe(el)), 900));

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

