# Mermaid Pan & Zoom for GitHub

A Chrome extension for reading mermaid diagrams on github.com.

GitHub's mermaid viewer only pans and zooms through small buttons that sit on top of the diagram.
With this extension:

- **On the page**, a diagram stays still. The mouse wheel scrolls the page as usual.
- **Click a diagram** to open it in a full-window viewer.
- **In the viewer**, drag to pan, use the mouse wheel to zoom, and double-click to reset.
  Close it with `Esc`, a click outside the diagram, or the ✕ in the corner.
- GitHub's pan and zoom buttons on the diagram are hidden.

## Install

The extension is not in the Chrome Web Store. Load it from this repository:

1. Download this repository: **Code → Download ZIP**, then unzip it. No GitHub sign-in is needed.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the `extension` folder inside the unzipped repository.

This works the same on Windows and macOS. Microsoft Edge also works: use `edge://extensions` in step 2.

Keep the unzipped folder where it is. Chrome loads the extension from that folder each time it starts.

If your organization manages Chrome, Developer mode can be turned off by policy.
Check `chrome://policy` for `ExtensionInstallAllowlist`, `ExtensionInstallBlocklist` or `DeveloperToolsAvailability`.

## Update

Download the ZIP again, replace the old folder, and click the reload icon on the extension card in `chrome://extensions`.

## How it works

GitHub draws each mermaid diagram in an iframe on `viewscreen.githubusercontent.com`.

- `extension/mermaid.js` runs inside that iframe. It hides GitHub's buttons and, when you click the diagram, sends the rendered SVG to the page with `postMessage`.
- `extension/page.js` runs on `github.com`. It receives the SVG and shows it in its own viewer. Pan and zoom change the SVG's `viewBox`, so text stays sharp at any zoom level.

## Privacy

The extension runs only on `github.com` and `viewscreen.githubusercontent.com`.
It makes no network requests, stores nothing, and collects no data.

## Limits

- If GitHub changes how it embeds mermaid diagrams, the extension can stop working.
- Only mermaid diagrams are handled. Images and other embedded viewers are left alone.

## License

MIT
