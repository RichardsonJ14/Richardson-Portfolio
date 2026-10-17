(() => {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const ring = document.createElement("div"); ring.className = "cur"; ring.setAttribute("aria-hidden", "true");
  const dot = document.createElement("div"); dot.className = "cur-dot"; dot.setAttribute("aria-hidden", "true");
  document.body.append(ring, dot);
  let x = -100, y = -100, rx = -100, ry = -100, on = false;
  addEventListener("pointermove", (e) => {
    x = e.clientX; y = e.clientY;
    if (!on) { on = true; rx = x; ry = y; ring.classList.add("is-on"); dot.classList.add("is-on"); }
    ring.classList.toggle("is-link", !!e.target.closest("a, button, summary, .btn, .icon, .tags span"));
  }, { passive: true });
  addEventListener("pointerdown", () => ring.classList.add("is-down"));
  addEventListener("pointerup", () => ring.classList.remove("is-down"));
  document.addEventListener("pointerleave", () => { on = false; ring.classList.remove("is-on"); dot.classList.remove("is-on"); });
  const loop = () => {
    rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    requestAnimationFrame(loop);
  };
  loop();
})();