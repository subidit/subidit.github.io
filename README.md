# subidit.com

The personal site of Subidit Nandy, an enthusiastic amateur.

It's a single static page with no build step. Its only JavaScript is a short script in the page head and `hero.js`. GitHub Pages serves it from the `master` branch at [subidit.com](https://subidit.com).

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page: a hero, four sections (About, Type, Things, Amateur) and a footer |
| `style.css` | All styles and animations |
| `hero.js` | The hero's doodle confetti |
| `fonts/` | EB Garamond (roman and italic) and DM Mono, Latin subsets, self-hosted |
| `404.html` | The page shown for missing addresses |
| `favicon.svg`, `favicon.png` | Browser tab icons |
| `og-image.png` | The preview image for links shared on social media |
| `CNAME` | Points GitHub Pages at the custom domain |

## How it works

- **Type:** EB Garamond for the writing and DM Mono for labels. Both are self-hosted in `fonts/`, and EB Garamond is preloaded.
- **Colour:** the hero and footer are warm paper. The four sections between are deep shades of rose, sage, mist and lilac, with text in the pastel of each hue.
- **Hero:** one-colour doodle confetti. The cursor or a finger pushes the pieces aside, a click or tap throws them outward, and springs bring them home. `hero.js` moves them with transforms only, and only while the hero is on screen. They pop in on load, then the name and tagline arrive.
- **No flash of the wrong font:** the head script adds `is-ready` to the page once the fonts have loaded (or after 2.5 seconds at most), and only then is the name shown. Without JavaScript, everything shows at once.
- **Motion:** the name fills the first screen, shrinks into the header as you scroll, and grows back in the footer. This uses CSS scroll-driven animations (`animation-timeline`) that only move and scale the text, so the browser never has to re-lay it out mid-scroll. The head script measures one number for this, `--k`, the docked size as a fraction of the full size. Browsers without scroll-driven animations show the name in the first screen only. All motion stops when the visitor has reduced motion turned on.
- **Drawings:** the illustrations are from [Miroodles](https://miro.com/miroverse/miroodles/), converted from the Sketch file to inline SVG. They're one colour: the ink takes each section's text colour, and what was coloured becomes a light wash of the same. Pieces pop in as a drawing scrolls into view, and the wash drifts slightly off the ink. The list icons are inline SVG line drawings in `currentColor`.
- **Analytics:** PostHog and Cloudflare Web Analytics, loaded on both pages.

## Editing

Serve the folder locally, because both pages load `/style.css` and `/fonts/` from the site root:

```sh
python3 -m http.server
```

Then visit `http://localhost:8000` and `http://localhost:8000/404.html`.
