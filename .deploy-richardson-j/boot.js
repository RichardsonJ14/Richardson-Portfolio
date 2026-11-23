(() => {
  const root = document.documentElement;
  const boot = document.getElementById("boot");
  if (!boot || root.classList.contains("skip-boot")) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const linesEl = document.getElementById("boot-lines");
  const fill = document.getElementById("boot-fill");
  const pct = document.getElementById("boot-pct");
  const status = document.getElementById("boot-status");
  const card = document.getElementById("boot-card");
  const canvas = document.getElementById("boot-canvas");
  const ctx = canvas.getContext("2d");

  const steps = [
    "booting richardson-j",
    "identity verified — Data Science & Analytics",
    "3 projects mounted — ML, BI, IoT",
    "internship loaded — ML Engineer @ NSIC",
    "python · sql · power bi · xgboost ready",
  ];
  const total = reduced ? 500 : 3200;
  let finished = false, timers = [], raf, bgRaf;

  document.body.classList.add("is-booting");

  /* ---- animated data-network background ---- */
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let W = 0, H = 0, nodes = [];
  const mouse = { x: 0.5, y: 0.5 };
  const accent = () => getComputedStyle(root).getPropertyValue("--accent").trim() || "#3dff8b";
  const setup = () => {
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.floor((W * H) / 16000));
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H * 0.75,
      z: 0.3 + Math.random() * 0.7,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      sq: Math.random() < 0.3,
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const col = accent();
    const ox = (mouse.x - 0.5) * 40, oy = (mouse.y - 0.5) * 24;
    for (const p of nodes) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H * 0.75; if (p.y > H * 0.75) p.y = -20;
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i], ax = a.x + ox * a.z, ay = a.y + oy * a.z;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], bx = b.x + ox * b.z, by = b.y + oy * b.z;
        const d = Math.hypot(ax - bx, ay - by);
        if (d < 130) {
          ctx.globalAlpha = (1 - d / 130) * 0.28;
          ctx.strokeStyle = col;
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        }
      }
    }
    ctx.fillStyle = col;
    for (const p of nodes) {
      const x = p.x + ox * p.z, y = p.y + oy * p.z, s = 1.5 + p.z * 2;
      ctx.globalAlpha = 0.35 + p.z * 0.5;
      if (p.sq) ctx.fillRect(x - s, y - s, s * 2, s * 2);
      else { ctx.beginPath(); ctx.arc(x, y, s, 0, 6.283); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    bgRaf = requestAnimationFrame(draw);
  };
  setup();
  addEventListener("resize", setup);
  if (!reduced) bgRaf = requestAnimationFrame(draw);

  /* ---- 3D tilt of the boot card ---- */
  if (!reduced) {
    addEventListener("pointermove", (e) => {
      mouse.x = e.clientX / innerWidth; mouse.y = e.clientY / innerHeight;
      card.style.setProperty("--ry", ((mouse.x - 0.5) * 14).toFixed(2) + "deg");
      card.style.setProperty("--rx", ((0.5 - mouse.y) * 10).toFixed(2) + "deg");
    });
  }

  /* ---- finish: card flies out -> shutter opens -> page enters ---- */
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
    const cleanup = () => {
      cancelAnimationFrame(bgRaf);
      removeEventListener("resize", setup);
      document.body.classList.remove("is-booting");
      boot.remove();
    };
    if (reduced) { enter(); cleanup(); return; }
    boot.classList.add("is-leaving");
    timers.push(setTimeout(() => { boot.classList.add("is-opening"); enter(); }, 520));
    timers.push(setTimeout(cleanup, 520 + 1000));
    timers.push(setTimeout(() => document.body.classList.remove("is-booting"), 520));
  };

  /* ---- log lines ---- */
  steps.forEach((text, i) => {
    timers.push(setTimeout(() => {
      const li = document.createElement("li");
      li.textContent = text;
      linesEl.appendChild(li);
    }, (total / (steps.length + 1)) * (i + 0.5)));
  });

  /* ---- progress 0 -> 100 ---- */
  const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min((t - t0) / total, 1);
    const v = Math.round((1 - Math.pow(1 - p, 1.4)) * 100);
    fill.style.width = v + "%";
    pct.textContent = v;
    if (p < 1) raf = requestAnimationFrame(tick);
    else {
      status.textContent = "READY";
      const li = document.createElement("li");
      li.className = "is-status";
      li.innerHTML = "STATUS: <span>READY</span><i class=\"caret\"></i>";
      linesEl.appendChild(li);
      timers.push(setTimeout(finish, reduced ? 100 : 650));
    }
  };
  raf = requestAnimationFrame(tick);

  document.getElementById("boot-skip").addEventListener("click", finish);
  addEventListener("keydown", finish, { once: true });
})();
