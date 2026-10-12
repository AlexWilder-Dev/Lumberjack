# Lumberjack, Camberwell (concept site)

A speculative one-page website for Lumberjack, the speciality coffee shop, general store and deli at 70 Camberwell Church Street, London SE5 8QZ. It was made to show the owners what a new site could look like. It is not the official website.

It is a plain static site (HTML, CSS and a little JavaScript) with no build step, no backend and no tracking beyond the demo ping noted below.

## What's on the page

- **Live open/closed badge.** Worked out in Europe/London time from the opening hours (Mon–Fri 8am–4pm, Sat–Sun 9am–4pm). It shows "Closing soon" in the last 30 minutes and highlights today's row in the hours table.
- **The trainee story.** How the café connects to London Reclaimed's paid traineeships and the joinery trainees who made the furniture.
- **The shelves.** Browse the stock shelf by shelf (Coffee, Counter, Meat & dairy, The back room, Pantry, Drinks, Makers). Each shelf lists its producers, and a search box covers every shelf ("burrata", "cider", "vegan").
- **Visit.** Address, hours, how to get there, and a Google Maps link.
- **Contact.** Name, email and message, with validation and a success message. Nothing is sent; the success message says so. The phone number is a tap-to-call link.

## Photos

Their own photos could not be pulled from the Internet Archive while this was being built, because web.archive.org was unreachable from the build environment. So the page uses six clearly marked **photo slots** instead of stock images:

| Slot (`data-slot`) | What should go there |
| --- | --- |
| `shopfront` | The big glass shopfront on Camberwell Church Street (hero) |
| `handmade-furniture` | Tables, chairs and shelving made by the joinery trainees |
| `coffee-mug` | Coffee in one of the locally made ceramic mugs |
| `counter-shelves` | The counter and the stocked shelves |
| `downstairs` | Seating downstairs |
| `art-walls` | Local art on the walls |

To fill a slot, put the photo in `images/` and add an `<img>` inside that `<figure>`. The image covers the slot automatically, and you can then delete the `.slot-label` block:

```html
<figure class="photo-slot hero-photo" data-slot="shopfront">
  <img src="images/shopfront.jpg" alt="The Lumberjack shopfront on Camberwell Church Street" width="1200" height="1500">
</figure>
```

The wordmark and the tree-ring mark are stand-ins, because the real logo hasn't been seen.

## Preview locally

Any static file server will do, run from the repo root:

```sh
python3 -m http.server 8080
# then open http://localhost:8080/#me
```

Adding `#me` to the URL once marks your browser so the demo ping below ignores your own visits.

## Deploy to GitHub Pages

Live at https://alexwilder-dev.github.io/Lumberjack/

Pages is set to deploy from **GitHub Actions**. `.github/workflows/pages.yml` publishes `index.html`, `css/`, `js/` and `images/` on every push to `main` or `claude/tender-bardeen-s2zqf8`, and you can also run it by hand from the Actions tab. There's no build step, and all paths are relative.

## Demo ping

Every page has a tiny script that posts "`<v> opened <path>`" to an ntfy topic once per browser session, so you can tell when the pitch link gets opened. Tag a link with `?v=name` to see who opened it. Before sharing, replace `TOPIC` in `index.html` with your own ntfy topic.

## Files

```
index.html          the page
css/styles.css      all styles (mobile first)
js/main.js          status badge, menu, shelves, search, form
images/             mark, favicon, wood-grain and paper textures
```

Fonts (Fraunces and DM Sans) load from Google Fonts. Georgia and the system sans are the fallbacks.
