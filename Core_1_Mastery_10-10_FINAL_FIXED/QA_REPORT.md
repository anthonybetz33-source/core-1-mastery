# Core 1 Mastery — Release QA

## Release gates

- Content integrity: automated audit required.
- Type safety: `npm run typecheck` required.
- Static deployment structure: automated audit required.
- Production build: `npm run build` required.
- Browser smoke test: `npm run test:e2e` required against the built `dist/client` artifact.
- GitHub Pages artifact: only `dist/client` is uploaded.

## Browser smoke coverage

The CI browser smoke test discovers every prerendered `index.html`, opens each route at a mobile viewport, verifies a successful response and the expected app title, and fails on page exceptions or browser console errors. This is intentionally run after the production build and before the Pages artifact is uploaded.

## Known deployment design

- GitHub Pages base path: `/core-1-mastery/`
- SPA fallback: `dist/client/404.html`
- Jekyll disabled with `dist/client/.nojekyll`
- TanStack Start source directory: project root (`.`)
- SVG IDs are deterministic for SSR/hydration safety.
- Randomized learning content is deferred until the client is ready.

## Reproducibility note

The repository intentionally uses `npm install` in CI because this release archive does not include a generated lockfile. CI still gates the release on typecheck, content/static audits, production build, and browser smoke tests. A future release can strengthen reproducibility further by committing a lockfile generated in a network-enabled development environment.
