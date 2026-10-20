// Runs inside the iframe GitHub renders each mermaid diagram in (viewscreen.githubusercontent.com).
// Inline the diagram stays still (wheel scrolls the page, drag does nothing); a click hands the
// rendered SVG to page.js on github.com, which opens its own viewer with pan and zoom.
(() => {
  const PARENT = "https://github.com";

  // GitHub's own pan/zoom buttons cover the diagram's corners and are not needed any more.
  const style = document.createElement("style");
  style.textContent = "button { display: none !important; }";
  document.documentElement.appendChild(style);

  function attach(svg) {
    if (svg.dataset.pzAttached) return;
    svg.dataset.pzAttached = "1";
    svg.style.cursor = "zoom-in";
    let start = null;
    svg.addEventListener("pointerdown", (e) => {
      if (e.button === 0) start = { x: e.clientX, y: e.clientY };
    });
    svg.addEventListener("pointerup", (e) => {
      if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) <= 5) {
        window.parent.postMessage({ type: "pz-open", svg: svg.outerHTML }, PARENT);
      }
      start = null;
    });
  }

  // Mermaid output carries aria-roledescription (flowchart-v2, sequence, ...); toolbar icons do not.
  const scan = () => document.querySelectorAll("svg[aria-roledescription]").forEach(attach);
  scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
