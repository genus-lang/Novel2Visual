# Novel2Visual

> Turn any web novel chapter into a visual storyboard using your existing Gemini session.

## Architecture Overview

```
SIDE PANEL (React)
      │
STATE LAYER (Zustand)
      │
CORE ENGINE (Chapter → Scenes → Characters → Prompts)
      │
GENERATION QUEUE (GenerationWorker)
      │
GEMINI CONTROLLER (content/gemini — isolated adapter)
      │
GEMINI WEB TAB (one existing tab, no new tabs)
```

## Key Design Principles

1. **One Gemini tab** — the extension never opens a new tab. It attaches to an existing `gemini.google.com` tab.
2. **DOM-change detection** — `MutationObserver` is used instead of `sleep()` timers to detect when Gemini finishes generating.
3. **Isolated adapter** — all Gemini DOM interaction lives in `src/content/gemini/`. If Gemini's UI changes, only `selectors.ts` needs updating.
4. **Provider-agnostic core** — `src/core/` knows nothing about Chrome, Gemini, or the DOM.

## Project Structure

```
novel2visual/
├── src/
│   ├── background/        Chrome service worker
│   ├── content/
│   │   ├── gemini/        Gemini tab automation (isolated adapter)
│   │   └── novel/         Novel page content extraction
│   ├── core/              Business logic — NO Chrome/DOM deps
│   │   ├── chapter/
│   │   ├── scenes/
│   │   ├── characters/
│   │   ├── prompts/
│   │   ├── generation/
│   │   └── projects/
│   ├── services/          Chrome API wrappers
│   ├── sidepanel/         React UI
│   ├── store/             Zustand state
│   ├── types/             Shared TypeScript interfaces
│   ├── constants/         Genres, styles, timeouts
│   └── utils/             Pure utility functions
├── tests/                 Vitest unit tests
└── manifest.json
```

## Getting Started

```bash
npm install
npm run dev      # Start Vite in watch mode
npm run build    # Production build → dist/
npm run test     # Run Vitest
```

Load `dist/` as an unpacked extension in `chrome://extensions`.

## Workflow

1. Open a Gemini tab
2. Click the Novel2Visual toolbar button → side panel opens
3. Click **Connect Gemini** → extension attaches to the open Gemini tab
4. Paste or extract a novel chapter
5. Adjust scene filters and review the extracted scene list
6. Click **Start Generation** → scenes are sent to Gemini one by one, images are saved automatically

## Supported Novel Genres

Fantasy · Cultivation · Romance · Horror · Sci-Fi · Martial Arts · Historical · Mystery · Apocalypse · LitRPG · Supernatural

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| UI | React 18 |
| Build | Vite |
| State | Zustand |
| Storage | chrome.storage + IndexedDB (idb) |
| Extension | Chrome Manifest V3 |
| Testing | Vitest |
| Zip export | JSZip |
