# dear.sidi — Ketut Sidi

Personal music portfolio: synced lyrics, dual audio engine (local + YouTube), Web Audio visualizer, Spotify thumbs.

## Stack
Vanilla JS · Web Audio API · YouTube IFrame · LRCLib · Spotify oEmbed · Service Worker

## Local Dev
```bash
python3 -m http.server 8000
# or
npx serve
```

## Deploy (GitHub Pages)
Pushes to `main` auto-deploys to:
**https://zeeforeall-pixel.github.io/**

## Structure
- `index.html` — single-file app
- `music-portfolio-component.js` / `.css` — track grid + hover effects
- `music-visualizer.js` / `.css` — Web Audio bars
- `landing-page.js` / `.css` — landing transition
- `sw.js` — service worker (cache: stale-while-revalidate)
- `assets/audio/` — 12 local tracks
- `assets/*.jpg` — Bali summit photos
- `.nojekyll` — disable Jekyll for GH Pages
