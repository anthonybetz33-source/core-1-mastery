# Core 1 Mastery

CompTIA A+ **Core 1 (220-1201)** study app — adaptive practice, PBQs, visual ID, flashcards, and mastery tracking.

## Production build

This repository is configured for a static GitHub Pages deployment at:

`https://anthonybetz33-source.github.io/core-1-mastery/`

The study engine works entirely in the browser and preserves progress locally when browser storage is available.

## What's inside

- 170+ exam-style questions across all 27 Core 1 objectives
- Domain-weighted adaptive practice
- PBQ labs (laser process, tools, T568B, parts)
- Timed 90-question / 90-minute simulation
- Visual ID with technical diagrams
- Flip-card study surfaces
- Adaptive weak-spot engine + miss bank
- PERFECTION 100 objective tracking
- Searchable glossary and study references

## Local development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Content audit:

```bash
npm run audit:content
```

## Stack

Vite + React 19 + TanStack Router + Zustand + Tailwind v4.

## Mastery rules

- **Confidence mastery:** accuracy weighted by sample confidence; full weight after 5 attempts.
- **PERFECTION 100:** an objective requires at least 5 attempts with 100% pure accuracy.

## Content note

This is an independent study aid and is not affiliated with or endorsed by CompTIA.

## GitHub Pages deployment

This repository is configured for GitHub Pages through `.github/workflows/deploy-pages.yml`.
Push to `main`, then GitHub Actions builds the TanStack Start app, runs type/content checks, creates the Pages fallback, and deploys `dist`.
