/* Live grid background: data pulses travel along the grid lines, cells
   flicker, pixel bits drift upward, and the cell under the cursor lights up.
   Runs on every <canvas class="live"> (boot screen + main page). */
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GRID = 56;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const root = document.documentElement;
  const mouse = { x: -999, y: -999, trail: [] };
  addEventListener("pointermove", (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    const cx = Math.floor(e.clientX / GRID), cy = Math.floor(e.clientY / GRID);
    const last = mouse.trail[mouse.trail.length - 1];
    if (!last || last.cx !== cx || last.cy !== cy) mouse.trail.push({ cx, cy, a: 1 });
    if (mouse.trail.length > 14) mouse.trail.shift();
  }, { passive: true });

  const colour = () => getComputedStyle(root).getPropertyValue("--accent-rgb").trim() || "61, 214, 140";
  const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

  const mount = (canvas) => {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, pulses = [], bits = [], cells = [], raf = 0, last = 0;

    const newPulse = () => ({
      x: Math.round(Math.random() * (W / GRID)) * GRID,
      y: Math.round(Math.random() * (H / GRID)) * GRID,
      d: Math.floor(Math.random() * 4),
      v: 0.9 + Math.random() * 1.6,
      len: 60 + Math.random() * 110,
      trail: [],
      nextTurn: GRID,
    });
    const setup = () => {
      W = canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(26, Math.max(8, Math.floor(W / 70)));
      pulses = Array.from({ length: n }, newPulse);
      bits = Array.from({ length: Math.min(60, Math.floor(W / 24)) }, () => ({
        x: Math.random() * W, y: Math.random() * H, s: 2 + Math.floor(Math.random() * 3),
        v: 0.12 + Math.random() * 0.35, p: Math.random() * 6.28,
      }));
      cells = [];
    };

    const frame = (t) => {
      if (!canvas.isConnected) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min((t - last) / 16.67 || 1, 3); last = t;
      const rgb = colour();
      ctx.clearRect(0, 0, W, H);

      // flickering grid cells
      if (Math.random() < 0.06 * dt) cells.push({ cx: Math.floor(Math.random() * (W / GRID)), cy: Math.floor(Math.random() * (H / GRID)), a: 0, up: true, m: 0.05 + Math.random() * 0.09 });
      for (let i = cells.length - 1; i >= 0; i--) {
        const c = cells[i];
        c.a += (c.up ? 0.006 : -0.004) * dt;
        if (c.a >= c.m) c.up = false;
        if (c.a <= 0 && !c.up) { cells.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(${rgb}, ${c.a})`;
        ctx.fillRect(c.cx * GRID + 1, c.cy * GRID + 1, GRID - 1, GRID - 1);
      }

      // cursor trail cells
      for (let i = mouse.trail.length - 1; i >= 0; i--) {
        const c = mouse.trail[i];
        c.a -= 0.012 * dt;
        if (c.a <= 0) { mouse.trail.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(${rgb}, ${c.a * 0.13})`;
        ctx.fillRect(c.cx * GRID + 1, c.cy * GRID + 1, GRID - 1, GRID - 1);
        ctx.strokeStyle = `rgba(${rgb}, ${c.a * 0.4})`;
        ctx.strokeRect(c.cx * GRID + 0.5, c.cy * GRID + 0.5, GRID, GRID);
      }

      // rising pixel bits
      for (const b of bits) {
        b.y -= b.v * dt;
        if (b.y < -6) { b.y = H + 6; b.x = Math.random() * W; }
        ctx.fillStyle = `rgba(${rgb}, ${0.1 + 0.28 * (0.5 + 0.5 * Math.sin(t / 700 + b.p))})`;
        ctx.fillRect(Math.round(b.x), Math.round(b.y), b.s, b.s);
      }

      // pulses along grid lines
      for (const p of pulses) {
        const [dx, dy] = DIRS[p.d];
        const step = p.v * dt;
        p.x += dx * step; p.y += dy * step; p.nextTurn -= step;
        p.trail.push([p.x, p.y]);
        let total = 0, keep = 0;
        for (let i = p.trail.length - 1; i > 0; i--) {
          total += Math.hypot(p.trail[i][0] - p.trail[i - 1][0], p.trail[i][1] - p.trail[i - 1][1]);
          if (total > p.len) { keep = i; break; }
        }
        if (keep > 0) p.trail.splice(0, keep);
        if (p.nextTurn <= 0) {
          // snap to the intersection, maybe turn
          p.x = Math.round(p.x / GRID) * GRID; p.y = Math.round(p.y / GRID) * GRID;
          if (Math.random() < 0.4) p.d = (p.d + (Math.random() < 0.5 ? 1 : 3)) % 4;
          p.nextTurn = GRID;
        }
        if (p.x < -GRID || p.x > W + GRID || p.y < -GRID || p.y > H + GRID) { Object.assign(p, newPulse()); continue; }
        if (p.trail.length > 1) {
          const a = p.trail[0], b = p.trail[p.trail.length - 1];
          const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
          g.addColorStop(0, `rgba(${rgb}, 0)`); g.addColorStop(1, `rgba(${rgb}, 0.7)`);
          ctx.strokeStyle = g; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(p.trail[0][0], p.trail[0][1]);
          for (let i = 1; i < p.trail.length; i++) ctx.lineTo(p.trail[i][0], p.trail[i][1]);
          ctx.stroke();
        }
        ctx.fillStyle = `rgba(${rgb}, 0.95)`;
        ctx.shadowColor = `rgba(${rgb}, 0.9)`; ctx.shadowBlur = 10;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        ctx.shadowBlur = 0;
      }
    };

    setup();
    addEventListener("resize", setup);
    if (!reduced) raf = requestAnimationFrame(frame);
  };

  const run = () => document.querySelectorAll("canvas.live").forEach(mount);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
