# Elroe Fikremariam — Portfolio

Portfolio site for photography and full-stack web development: a single page with
a floating 3D background, a photo gallery with a full-screen viewer, project
showcases and contact links.

Built with Next.js, TypeScript, Tailwind CSS, three.js (React Three Fiber) and Motion.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000.

## Add your photos

No code needed — drop image files (`.jpg`, `.png`, `.webp`, `.avif`) into folders:

| What | Where |
| --- | --- |
| Gallery photos | `public/photos/<category>/` — each folder becomes a filter, e.g. `public/photos/portraits/` |
| Your portrait (About section) | `public/portrait.jpg` |
| Project screenshot | `public/projects/siaab-mobile.jpg` (the file name matches the project's `slug`) |

- Photos are sorted by file name, so prefix them to set the order: `01-sunrise.jpg`, `02-market.jpg`.
- The file name becomes the caption (`02-market-day.jpg` → "Market day"). Camera names like `IMG_1234` get no caption.
- Folders can be ordered the same way: `01-portraits`, `02-street`.
- Export around 2400px on the long edge. The site serves smaller versions automatically.
- As soon as one real photo exists, the placeholder frames disappear.

The photos are indexed whenever `npm run dev` or `npm run build` starts. If you add
photos while the dev server is already running, run this in a second terminal:

```bash
npm run photos
```

## Change the text

Everything written on the site is in `src/content/`:

- `site.ts` — name, tagline, contact details, About text, "what's next" cards
- `projects.ts` — websites and apps in the Development section

## Change the look

- Colours and fonts: the top of `src/app/globals.css`
- Floating 3D shapes: the `FLOATERS` list in `src/components/background/Scene.tsx`

## Put it online

Import this repository at [vercel.com/new](https://vercel.com/new) — no settings needed.
Once the site has its own domain, set the environment variable `NEXT_PUBLIC_SITE_URL`
(for example `https://yourdomain.com`) so shared links show the right preview.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the site locally |
| `npm run build` | Build the production version |
| `npm run start` | Serve the production build |
| `npm run photos` | Re-index images in `public/` |
| `npm run lint` | Check the code with ESLint |
| `npm run typecheck` | Check types with TypeScript |
