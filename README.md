# subidit.com

The personal site of Subidit Nandy, an enthusiastic amateur.

It's a static site with no build step: a home page, a page for each of the things in its third section, and a 404. The home page's only JavaScript is a short script in the page head, `hero.js` and `reveal.js`; each thing page has its own small script. GitHub Pages serves it from the `master` branch at [subidit.com](https://subidit.com).

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page: a hero, four sections (About, Type, Things, Amateur) and a footer |
| `watches/`, `fountain-pens/`, `keyboards/`, `chairs/`, `jokes/` | One page for each item in "Things made with care", each a self-contained project with its own `index.html`, stylesheet and script |
| `style.css` | The home page's and 404's styles and animations |
| `hero.js` | The hero's ink currents |
| `reveal.js` | Animates text and drawings in as they come on screen, and the footer's elastic edge |
| `fonts/` | Latin subsets, self-hosted: EB Garamond and DM Mono for the home page, and one face for each thing page (Bodoni Moda, Instrument Serif with Newsreader, Bricolage Grotesque, Archivo, Fraunces) |
| `404.html` | The page shown for missing addresses |
| `favicon.svg`, `favicon.png` | Browser tab icons |
| `og-image.png` | The preview image for links shared on social media |
| `CNAME` | Points GitHub Pages at the custom domain |

## How it works

- **Type:** EB Garamond for the writing and DM Mono for labels. Both are self-hosted in `fonts/`, and EB Garamond is preloaded.
- **Colour:** the hero and footer are warm paper. The four sections between are deep shades of rose, sage, mist and lilac, with text in the pastel of each hue.
- **Hero:** ink currents. Fine pen strokes drift across the paper on a slow, meandering current (a steady drift plus a few waves of a stream function, so the flow never bunches up) and part around the letters of the name like water around stones: each letter's ink is measured once on a canvas, and a `Range` over it says where the letter is as the name moves. Moving the cursor or a finger stirs the water, and a click or tap drops a blot of coloured ink, in the deep shade of one of the four sections, that the current carries away. `hero.js` draws it all on one canvas, and only while the hero is on screen. The water fades in on load, then the name and tagline arrive word by word.
- **No flash of the wrong font:** the head script adds `is-ready` to the page once the fonts have loaded (or after 2.5 seconds at most), and only then is the name shown. Without JavaScript, everything shows at once.
- **Motion:** the name fills the first screen, shrinks into the header as you scroll, and grows back in the footer. This uses CSS scroll-driven animations (`animation-timeline`) that only move and scale the text, so the browser never has to re-lay it out mid-scroll. The head script measures two numbers: `--k`, the docked size as a fraction of the full size, and `--screen`, one screen's height. On phones `--screen` is only re-measured when the width changes, so the panes don't resize as the browser's toolbar slides in and out (Mobile Safari's `svh` can follow the toolbar). Browsers without scroll-driven animations show the name in the first screen only. All motion stops when the visitor has reduced motion turned on.
- **Drawings:** the illustrations are from [Miroodles](https://miro.com/miroverse/miroodles/), converted from the Sketch file to inline SVG. They're one colour: the ink takes each section's text colour, and what was coloured becomes a light wash of the same. Once a drawing is well into view, `reveal.js` has its pieces pop in one after another over a couple of seconds, and again each time it comes back on screen; the wash drifts slightly off the ink. The list icons are inline SVG line drawings in `currentColor`.
- **Text:** statements rise line by line out of a mask as you scroll, like a responsive line split: `reveal.js` puts each word in a clipping `.mask`, groups the words into lines by where they sit (again on every resize), and moves each line up with the scroll. Lines already on screen when a page opens rise in by themselves. Labels and list items rise in. Without JavaScript nothing is hidden.
- **Footer:** its top edge is elastic. Scrolling into it bends the edge with the scroll, and it springs back flat with a bounce when the scroll stops (`reveal.js` draws it as an SVG curve).
- **Arrows:** drawn with CSS masks rather than typed, because neither font has ↗ or ↩ and iOS fills the gap with colour emoji.
- **Thing pages:** each is its own small portfolio project, with its own palette, typeface and one interactive centrepiece. They share only a top bar, a link back home, and previous/next links at the foot.
  - **Watches** (`watches/`): a night dial in navy, lume and gilt, set in Bodoni Moda. A live dial whose seconds hand steps eight times a second; a working movement (barrel, gear train, escapement, balance) that ticks at true ratios, with a slider to slow time down, highlighting each part as its step scrolls by; four seconds hands at different beat rates; and the quartz crisis as ninety dots, one per thousand jobs.
  - **Fountain pens** (`fountain-pens/`): laid paper in Instrument Serif and Newsreader. An animated cross-section of a feed (ink down, air up), a nib anatomy you can point at, and a writing pad: an italic nib is modelled as a short edge at a fixed angle, swept along the stroke, so thick and thin come from direction alone. Ink dries as you watch; iron gall goes on pale and darkens. The chosen ink becomes the whole page's accent through a registered `--ink` colour property that transitions.
  - **Mechanical keyboards** (`keyboards/`): charcoal, cream and orange, in Bricolage Grotesque. A 60% keyboard that follows your real keys (or taps), with linear, tactile and clicky switch sounds synthesised in WebAudio; a force curve with a dot that rides it on every press; and a switch that comes apart as you scroll.
  - **A good chair** (`chairs/`): a gallery wall in Archivo, whose width axis lets the title arrive condensed and sit down wide. Nine chairs from 1859 to 1994 in a track that moves sideways as you scroll down, each drawing itself in line; and a backrest you can recline, after Nachemson and Andersson's disc-pressure studies.
  - **A joke that lands** (`jokes/`): a stage at night in Fraunces, with its soft and wonky axes. A spotlight follows the cursor (and wanders on its own), a joke flips between its two readings, four theories of laughter each set in a different temperament of the same face, and a room where you deliver the punchline and the audience judges your pause.
  - All follow reduced motion: drawings and text show at once, the movement and spotlight hold still, and the chair gallery becomes a plain sideways scroll.
- **Analytics:** PostHog and Cloudflare Web Analytics, loaded on every page.

## Editing

Serve the folder locally, because the pages load their styles, scripts and `/fonts/` from the site root:

```sh
python3 -m http.server
```

Then visit `http://localhost:8000` and `http://localhost:8000/404.html`.
