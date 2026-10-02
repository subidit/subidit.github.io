# subidit.com

The personal site of Subidit Nandy, an enthusiastic amateur.

It's a static site with no build step: a home page, a page for each of the things in its third section, and a 404. Its only JavaScript is a short script in the page head, `hero.js` and `reveal.js`. GitHub Pages serves it from the `master` branch at [subidit.com](https://subidit.com).

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page: a hero, four sections (About, Type, Things, Amateur) and a footer |
| `watches/`, `fountain-pens/`, `keyboards/`, `chairs/`, `jokes/` | One page for each item in "Things made with care"; each list row on the home page links to its page |
| `style.css` | All styles and animations |
| `hero.js` | The hero's doodle confetti |
| `reveal.js` | Marks text and drawings to animate in as they come on screen |
| `fonts/` | EB Garamond (roman and italic) and DM Mono, Latin subsets, self-hosted |
| `404.html` | The page shown for missing addresses |
| `favicon.svg`, `favicon.png` | Browser tab icons |
| `og-image.png` | The preview image for links shared on social media |
| `CNAME` | Points GitHub Pages at the custom domain |

## How it works

- **Type:** EB Garamond for the writing and DM Mono for labels. Both are self-hosted in `fonts/`, and EB Garamond is preloaded.
- **Colour:** the hero and footer are warm paper. The four sections between are deep shades of rose, sage, mist and lilac, with text in the pastel of each hue.
- **Hero:** one-colour doodle confetti. The cursor or a finger pushes the pieces aside, a click or tap throws them outward, and springs bring them home. `hero.js` moves them with transforms only, and only while the hero is on screen. They pop in on load, then the name and tagline arrive word by word.
- **No flash of the wrong font:** the head script adds `is-ready` to the page once the fonts have loaded (or after 2.5 seconds at most), and only then is the name shown. Without JavaScript, everything shows at once.
- **Motion:** the name fills the first screen, shrinks into the header as you scroll, and grows back in the footer. This uses CSS scroll-driven animations (`animation-timeline`) that only move and scale the text, so the browser never has to re-lay it out mid-scroll. The head script measures two numbers: `--k`, the docked size as a fraction of the full size, and `--screen`, one screen's height. On phones `--screen` is only re-measured when the width changes, so the panes don't resize as the browser's toolbar slides in and out (Mobile Safari's `svh` can follow the toolbar). Browsers without scroll-driven animations show the name in the first screen only. All motion stops when the visitor has reduced motion turned on.
- **Drawings:** the illustrations are from [Miroodles](https://miro.com/miroverse/miroodles/), converted from the Sketch file to inline SVG. They're one colour: the ink takes each section's text colour, and what was coloured becomes a light wash of the same. Once a drawing is well into view, `reveal.js` has its pieces pop in one after another over a couple of seconds, and again each time it comes back on screen; the wash drifts slightly off the ink. The list icons are inline SVG line drawings in `currentColor`.
- **Text:** as each section comes on screen, `reveal.js` wraps its statement's words in spans and they come into focus one after another; labels and list items rise in. Without JavaScript nothing is hidden.
- **Arrows:** drawn with CSS masks rather than typed, because neither font has ↗ or ↩ and iOS fills the gap with colour emoji.
- **Thing pages:** each one takes a colour from the home page and has a big title, its icon drawing itself, three short notes, a "Mine" list and links to the previous and next thing. The dashed boxes in "Mine" (`<span class="fill">`) are gaps to fill in with real picks. Each page carries its own copy of its icon's `<symbol>`.
- **Analytics:** PostHog and Cloudflare Web Analytics, loaded on both pages.

## Editing

Serve the folder locally, because both pages load `/style.css` and `/fonts/` from the site root:

```sh
python3 -m http.server
```

Then visit `http://localhost:8000` and `http://localhost:8000/404.html`.
