# Elroe Fikremariam — Portfolio

Portfolio site for photography and full-stack web development: a single page
in English and Amharic, with a floating 3D background, light and dark themes,
a photo gallery with a full-screen viewer, project showcases, and an admin page
for editing everything without touching code.

Built with Next.js, TypeScript, Tailwind CSS, three.js (React Three Fiber) and Motion.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000 (English), http://localhost:3000/am (Amharic)
or http://localhost:3000/admin (admin page).

## The admin page

Go to `/admin` on your site and log in with your password. From there you can:

- **Photos**: add photos to a category (or create a new one), retitle them,
  delete them, and star up to 3 to float at the top of the page. Photos are
  resized in your browser before upload, so large camera files are fine.
  You can also replace your portrait.
- **Text**: edit every word on the site, in English and Amharic.
- **Projects**: add, edit, reorder and remove projects, with a screenshot each.
- **Settings**: your name, the "available" badge and your contact links.

Nothing changes until you press **Publish**. Each publish becomes one commit in
the GitHub repository, and Vercel rebuilds the live site from it — the changes
appear in about a minute.

### Set it up on Vercel (once)

1. **Create a GitHub token** the admin can save with:
   GitHub → Settings → Developer settings → Personal access tokens →
   **Fine-grained tokens** → Generate new token.
   - Repository access: **Only select repositories** → `Portfolio`
   - Permissions → Repository permissions → **Contents: Read and write**
   - Copy the token.
2. **Add two environment variables** in Vercel → your project → Settings →
   Environment Variables:
   - `ADMIN_PASSWORD` — a long password of your choice
   - `ADMIN_GITHUB_TOKEN` — the token from step 1
3. **Redeploy** (Deployments → ⋯ → Redeploy) so the new variables take effect.

Vercel tells the site which repository and branch it was deployed from, so the
admin saves to the same place. Outside Vercel, also set `GITHUB_REPO`
(e.g. `elroe-e/Portfolio`) and `GITHUB_BRANCH`.

The token can only change this one repository. Keep the password private; if it
ever leaks, change `ADMIN_PASSWORD` in Vercel and redeploy — that also logs
everyone out.

### Use it on your own computer

Copy `.env.example` to `.env.local` and set `ADMIN_PASSWORD`. Leave
`ADMIN_GITHUB_TOKEN` empty: running `npm run dev`, the admin then writes the
files straight into the project folder, and you commit them yourself.

## Add photos without the admin

You can also drop image files (`.jpg`, `.png`, `.webp`, `.avif`) into folders:

| What | Where |
| --- | --- |
| Gallery photos | `public/photos/<category>/` — each folder becomes a filter, e.g. `public/photos/portraits/` |
| Your portrait (About section) | `public/portrait.jpg` |
| Project screenshot | `public/projects/<project short name>.jpg`, e.g. `public/projects/siaab-mobile.jpg` |

- Photos are sorted by file name, so prefix them to set the order: `01-sunrise.jpg`, `02-market.jpg`.
- The file name becomes the caption (`02-market-day.jpg` → "Market day"). Camera names like `IMG_1234` get no caption.
- Folders can be ordered the same way: `01-portraits`, `02-street`.
- Export around 2400px on the long edge. The site serves smaller versions automatically.
- As soon as one real photo exists, the placeholder frames disappear, and the
  first two photos float in the hero (or the ones you star in the admin).

Photos are indexed whenever `npm run dev` or `npm run build` starts. If you add
photos while the dev server is already running, run this in a second terminal:

```bash
npm run photos
```

## Where things live

All content is in `src/content/` — the admin page edits these same files:

- `settings.json` — name, availability badge, hero photos, contact links
- `copy.en.json` / `copy.am.json` — every piece of text, in English and Amharic
- `projects.json` — the projects in the Development section

And for the look:

- Colours for both themes: the top of `src/app/globals.css`
- Floating 3D shapes: the `FLOATERS` list in `src/components/background/Scene.tsx`

## Features at a glance

- **Two languages**: English at `/`, Amharic at `/am`, switch in the top bar.
- **Light and dark themes**: the sun/moon button in the top bar; the choice is
  remembered. Dark is the default.
- **Page transitions**: moving between pages closes a camera-shutter over the
  page and opens it on the next one.
- **Reduced motion**: visitors who turn on "reduce motion" get a still 3D scene,
  no intro and no transitions.

## Put it online

Import this repository at [vercel.com/new](https://vercel.com/new) — no settings
needed for the site itself. Add the two admin variables above to use `/admin`.
Once the site has its own domain, set `NEXT_PUBLIC_SITE_URL`
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
