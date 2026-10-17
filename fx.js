(() => {
  const root = document.documentElement;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Signal entrance immediately if boot is bypassed
  const enter = () => {
    if (root.classList.contains("entered")) return;
    root.classList.add("entered");
    window.dispatchEvent(new Event("rj:enter"));
  };
  if (root.classList.contains("skip-boot") || !document.getElementById("boot")) enter();
  setTimeout(enter, 8000);

  // Split hero name cleanly for 3D staggered flip
  const name = document.querySelector(".hero__name");
  if (name) {
    const text = name.textContent.replace(/\u00a0/g, " ").trim();
    name.setAttribute("aria-label", text);
    name.textContent = "";
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "ch" + (ch === " " ? " ch--sp" : "");
      s.style.setProperty("--i", i);
      s.setAttribute("aria-hidden", "true");
      s.textContent = ch === " " ? "\u00a0" : ch;
      name.appendChild(s);
    });
  }

  // Scroll Progress Bar
  const bar = document.getElementById("scroll-progress");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty("--p", max > 0 ? Math.min(scrollY / max, 1) : 0);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // -------------------------------------------------------------
  // Live Cybernetic Interactive Background for Main Page
  // -------------------------------------------------------------
  const canvas = document.getElementById("bg-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, nodes = [], running = false;
    let targetMx = 0.5, targetMy = 0.5, curMx = 0.5, curMy = 0.5;

    const setup = () => {
      W = innerWidth;
      H = innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Node density
      const count = Math.min(95, Math.max(35, Math.floor((W * H) / 14000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        z: 0.3 + Math.random() * 0.7,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: 1.5 + Math.random() * 2,
        pulse: Math.random() * 6.28,
        pulseSpeed: 0.02 + Math.random() * 0.04
      }));
    };

    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      // Smooth mouse interpolation
      curMx += (targetMx - curMx) * 0.06;
      curMy += (targetMy - curMy) * 0.06;

      const style = getComputedStyle(root);
      const accent = style.getPropertyValue("--accent").trim() || "#3dff8b";
      const rgb = style.getPropertyValue("--accent-rgb").trim() || "61, 255, 139";

      const ox = (curMx - 0.5) * 60;
      const oy = (curMy - 0.5) * 36 - (scrollY * 0.08);

      // 1. Draw glowing connecting lines
      const maxDist = 135;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        a.pulse += a.pulseSpeed;

        // Wrap around viewport with margin
        if (a.x < -30) a.x = W + 30;
        if (a.x > W + 30) a.x = -30;
        if (a.y < -30) a.y = H + 30;
        if (a.y > H + 30) a.y = -30;

        const ax = a.x + (ox * a.z);
        const ay = a.y + (oy * a.z);

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const bx = b.x + (ox * b.z);
          const by = b.y + (oy * b.z);
          const dx = ax - bx;
          const dy = ay - by;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDist) {
            const alpha = (1 - (dist / maxDist)) * 0.28 * Math.min(a.z, b.z);
            ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }

      // 2. Draw glowing constellation nodes
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i];
        const px = p.x + (ox * p.z);
        const py = p.y + (oy * p.z);
        const pSin = Math.sin(p.pulse);
        const dynamicAlpha = 0.4 + (pSin * 0.3) + (p.z * 0.3);

        ctx.fillStyle = `rgba(${rgb}, ${Math.min(dynamicAlpha, 0.95)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size * (0.85 + (pSin * 0.2)), 0, Math.PI * 2);
        ctx.fill();

        // Extra soft outer halo on closer nodes
        if (p.z > 0.7) {
          ctx.fillStyle = `rgba(${rgb}, ${dynamicAlpha * 0.2})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      requestAnimationFrame(frame);
    };

    setup();
    addEventListener("resize", setup);

    if (!reduced) {
      running = true;
      requestAnimationFrame(frame);
      document.addEventListener("visibilitychange", () => {
        running = !document.hidden;
        if (running) requestAnimationFrame(frame);
      });
    }

    // Pointer events for background parallax & glow
    addEventListener("pointermove", (e) => {
      targetMx = e.clientX / innerWidth;
      targetMy = e.clientY / innerHeight;
    }, { passive: true });
  }

  // -------------------------------------------------------------
  // Desktop Cursor Glow & Interactive 3D Card Tilts
  // -------------------------------------------------------------
  const glow = document.getElementById("cursor-glow");
  if (fine && !reduced) {
    if (glow) {
      addEventListener("pointermove", (e) => {
        glow.style.setProperty("--cx", e.clientX + "px");
        glow.style.setProperty("--cy", e.clientY + "px");
        glow.classList.add("is-on");
      }, { passive: true });
    }

    // 3D Tilt with smooth mouse physics
    const tiltEls = document.querySelectorAll(".term, .card, .cell");
    tiltEls.forEach((el) => {
      if (el.closest(".boot")) return;
      const maxAngle = el.classList.contains("cell") ? 8 : el.classList.contains("project") ? 2.5 : 4;
      el.classList.add("tiltable");

      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.classList.add("is-tilting");
        el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        el.style.transform = `perspective(1000px) rotateX(${((0.5 - py) * maxAngle).toFixed(2)}deg) rotateY(${((px - 0.5) * maxAngle * 1.3).toFixed(2)}deg) translateZ(8px)`;
      });

      el.addEventListener("pointerleave", () => {
        el.classList.remove("is-tilting");
        el.style.transform = "";
      });
    });

    // Magnetic Interactive Buttons
    document.querySelectorAll(".btn").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.setProperty("--tx", ((e.clientX - r.left - (r.width / 2)) * 0.16).toFixed(1) + "px");
        b.style.setProperty("--ty", ((e.clientY - r.top - (r.height / 2)) * 0.25).toFixed(1) + "px");
      });
      b.addEventListener("pointerleave", () => {
        b.style.removeProperty("--tx");
        b.style.removeProperty("--ty");
      });
    });
  }
})();
