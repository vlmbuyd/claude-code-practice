# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build    # Production build → dist/
npm run watch    # Build in watch mode (rebuild on file change)
npm run dev      # Vite dev server (browser-only, NOT usable as extension — see note below)
```

To load as a Chrome extension: open `chrome://extensions`, enable Developer mode, click "Load unpacked", select the `dist/` folder.

## Dev vs Extension testing

**Never test via `npm run dev` in Chrome's extension loader.** Vite's dev server injects inline scripts which are blocked by Manifest V3's Content Security Policy. Always run `npm run build` (or `npm run watch`) and load the `dist/` folder as an unpacked extension.

`npm run dev` is only useful for UI prototyping in a regular browser tab, where the `chrome.*` APIs are not available (the code falls back to `localStorage` and `window.open`).

## Architecture

```
src/
  lib/
    storage.js     # chrome.storage.local with localStorage fallback for dev
    favicon.js     # Google favicon URL builder + URL normalization helpers
  hooks/
    useShortcuts.js  # Single source of truth for shortcut CRUD + persistence
  popup/
    main.jsx         # React mount
    App.jsx          # Root component: grid + add form toggle
    App.css          # All styles (fixed 340px width, max 500px height)
    components/
      ShortcutItem.jsx    # Icon + name button; delete button on hover
      AddShortcutForm.jsx # URL/name inputs, icon upload, favicon preview
popup.html           # Vite entry point → built to dist/popup.html
public/
  manifest.json    # Copied verbatim to dist/ by Vite
```

### Key design decisions

- **`base: './'` in vite.config.js** — required so built asset paths are relative, not absolute. Chrome extensions load from `chrome-extension://<id>/`, not `/`.
- **Manifest in `public/`** — Vite copies `public/` contents to `dist/` as-is. `popup.html` at project root is built to `dist/popup.html`, matching `"default_popup": "popup.html"` in the manifest.
- **Favicon via Google's service** — `https://www.google.com/s2/favicons?domain=<host>&sz=64`. No `host_permissions` needed; the browser fetches it as a plain `<img>` src.
- **Custom icon upload** — converted to a base64 data URL via `FileReader` and stored directly in the shortcut object in `chrome.storage.local`.
- **No background service worker** — all logic lives in the popup; no persistent background process needed.

### Permissions

Only `"storage"` is declared. `chrome.tabs.create` does not require the `"tabs"` permission for basic tab creation.
