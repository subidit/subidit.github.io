# subidit.com

The personal site of Subidit Nandy, an enthusiastic amateur.

It's a single static page with no build step and no JavaScript of its own. GitHub Pages serves it from the `master` branch at [subidit.com](https://subidit.com).

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page: a hero, four sections (About, Type, Things, Amateur) and a footer |
| `style.css` | All styles and animations |
| `404.html` | The page shown for missing addresses |
| `favicon.svg`, `favicon.png` | Browser tab icons |
| `og-image.png` | The preview image for links shared on social media |
| `CNAME` | Points GitHub Pages at the custom domain |

## How it works

- **Type:** EB Garamond for the writing and DM Mono for labels, both from Google Fonts.
- **Colour:** each section has a muted pastel background (rose, sage, mist, lilac) with text in a deep shade of the same hue. The hero and footer use a warm paper colour.
- **Motion:** the name fills the first screen, shrinks into the header as you scroll, and grows back in the footer. This uses CSS scroll-driven animations (`animation-timeline`). Browsers without them, such as Firefox today, show the name in the first screen only. All motion stops when the visitor has reduced motion turned on.
- **Drawings:** the icons and illustrations are inline SVG line drawings. They use `currentColor`, so each one takes its section's ink colour.
- **Analytics:** PostHog and Cloudflare Web Analytics, loaded on both pages.

## Editing

Open `index.html` in a browser to preview it. To see the 404 page with its styles, serve the folder locally, because it loads `/style.css` from the site root:

```sh
python3 -m http.server
```

Then visit `http://localhost:8000/404.html`.
