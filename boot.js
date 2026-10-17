(() => {
  const root = document.documentElement;
  const boot = document.getElementById("boot");
  if (!boot || root.classList.contains("skip-boot")) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const linesEl = document.getElementById("boot-lines");
  const fill = document.getElementById("boot-fill");
  const pct = document.getElementById("boot-pct");
  const status = document.getElementById("boot-status");

  const steps = [
    "booting richardson-j",
    "loading profile \u2014 Data Science & Analytics",
    "mounting 3 projects \u2014 ML, BI, IoT",
    "importing python \u00b7 sql \u00b7 power bi \u00b7 xgboost",
  ];
  const total = reduced ? 400 : 3000;
  let finished = false, timers = [], raf;

  document.body.classList.add("is-booting");

  const enter = () => {
    root.classList.add("entered");
    window.dispatchEvent(new Event("rj:enter"));
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    cancelAnimationFrame(raf);
    fill.style.width = "100%"; pct.textContent = "100"; status.textContent = "READY";
    try { sessionStorage.setItem("rj-booted", "1"); } catch (e) {}
    const cleanup = () => { document.body.classList.remove("is-booting"); boot.remove(); };
    if (reduced) { enter(); cleanup(); return; }
    boot.classList.add("is-leaving");
    timers.push(setTimeout(() => { boot.classList.add("is-opening"); document.body.classList.remove("is-booting"); enter(); }, 480));
    timers.push(setTimeout(cleanup, 1250));
  };

  steps.forEach((text, i) => {
    timers.push(setTimeout(() => {
      const li = document.createElement("li");
      li.textContent = text;
      linesEl.appendChild(li);
    }, (total / (steps.length + 1)) * (i + 0.4)));
  });

  const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min((t - t0) / total, 1);
    const v = Math.round((1 - Math.pow(1 - p, 1.5)) * 100);
    fill.style.width = v + "%";
    pct.textContent = v;
    if (p < 1) raf = requestAnimationFrame(tick);
    else {
      status.textContent = "READY";
      const li = document.createElement("li");
      li.className = "is-status";
      li.innerHTML = "STATUS: <span>OPEN_TO_WORK</span>";
      linesEl.appendChild(li);
      timers.push(setTimeout(finish, reduced ? 100 : 600));
    }
  };
  raf = requestAnimationFrame(tick);

  document.getElementById("boot-skip").addEventListener("click", finish);
  addEventListener("keydown", finish, { once: true });
})();
