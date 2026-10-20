// Runs on github.com. When a diagram frame (mermaid.js) sends its SVG, show it in a
// full-window viewer: wheel zooms, drag pans, double-click resets, Esc / backdrop / X closes.
// Also hides the inline expand and copy buttons next to each diagram.
(() => {
  const FRAME_ORIGIN = "https://viewscreen.githubusercontent.com";
  const STEP = 1.15;

  function open(markup) {
    const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
    if (doc.querySelector("parsererror")) return;
    const svg = document.importNode(doc.documentElement, true);
    svg.querySelectorAll("script").forEach((s) => s.remove());
    svg.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach((a) => { if (/^on/i.test(a.name)) el.removeAttribute(a.name); });
    });

    const backdrop = document.createElement("div");
    backdrop.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(1,4,9,.8);";
    const panel = document.createElement("div");
    panel.style.cssText = "position:absolute;inset:3vh 2vw;background:#0d1117;border:1px solid #3d444d;"
      + "border-radius:6px;overflow:hidden;cursor:grab;touch-action:none;";
    const close = document.createElement("div");
    close.textContent = "✕";
    close.style.cssText = "position:absolute;top:8px;right:14px;z-index:1;color:#9198a1;font-size:22px;cursor:pointer;";
    panel.append(svg, close);
    backdrop.appendChild(panel);

    svg.removeAttribute("style");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.display = "block";
    const scrollWas = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.appendChild(backdrop);

    if (!svg.viewBox.baseVal || svg.viewBox.baseVal.width === 0) {
      const b = svg.getBBox();
      svg.setAttribute("viewBox", `${b.x} ${b.y} ${b.width} ${b.height}`);
    }
    const vb = svg.viewBox.baseVal;
    const initial = { x: vb.x, y: vb.y, w: vb.width, h: vb.height };

    panel.addEventListener("wheel", (e) => {
      e.preventDefault();
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      const f = e.deltaY < 0 ? 1 / STEP : STEP;
      vb.x = p.x - (p.x - vb.x) * f;
      vb.y = p.y - (p.y - vb.y) * f;
      vb.width *= f;
      vb.height *= f;
    }, { passive: false });

    let last = null;
    panel.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target === close) return;
      last = { x: e.clientX, y: e.clientY };
      panel.setPointerCapture(e.pointerId);
      panel.style.cursor = "grabbing";
      e.preventDefault();
    });
    panel.addEventListener("pointermove", (e) => {
      if (!last) return;
      const ctm = svg.getScreenCTM();
      vb.x -= (e.clientX - last.x) / ctm.a;
      vb.y -= (e.clientY - last.y) / ctm.d;
      last = { x: e.clientX, y: e.clientY };
    });
    const end = () => {
      last = null;
      panel.style.cursor = "grab";
    };
    panel.addEventListener("pointerup", end);
    panel.addEventListener("pointercancel", end);
    panel.addEventListener("dblclick", () => {
      vb.x = initial.x;
      vb.y = initial.y;
      vb.width = initial.w;
      vb.height = initial.h;
    });

    const dismiss = () => {
      backdrop.remove();
      document.documentElement.style.overflow = scrollWas;
      document.removeEventListener("keydown", onKey);
    };
    const onKey = (e) => { if (e.key === "Escape") dismiss(); };
    document.addEventListener("keydown", onKey);
    close.addEventListener("click", dismiss);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) dismiss(); });
  }

  window.addEventListener("message", (e) => {
    if (e.origin !== FRAME_ORIGIN || !e.data || e.data.type !== "pz-open") return;
    open(e.data.svg);
  });

  // Inline toolbar: buttons in the diagram's own wrapper, never climbing into the article itself.
  function hideToolbar(frame) {
    let node = frame.parentElement;
    for (let depth = 0; node && depth < 4; depth++, node = node.parentElement) {
      if (node.classList.contains("markdown-body") || node.tagName === "ARTICLE") return;
      if (node.querySelectorAll(`iframe[src^="${FRAME_ORIGIN}"]`).length > 1) return;
      const buttons = node.querySelectorAll("button, clipboard-copy");
      if (buttons.length) {
        buttons.forEach((b) => { b.style.display = "none"; });
        return;
      }
    }
  }

  const scan = () => document.querySelectorAll(`iframe[src^="${FRAME_ORIGIN}"]`).forEach((f) => {
    if (!f.closest('dialog, [role="dialog"]')) hideToolbar(f);
  });
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; scan(); });
  }).observe(document.documentElement, { childList: true, subtree: true });
  scan();
})();
