# Lumberjack, Camberwell (concept site)

A speculative one-page website for Lumberjack, the café, deli and general store at 70 Camberwell Church Street, London SE5 8QZ, made to pitch to the owners. It is not the official website.

Live preview: https://alexwilder-dev.github.io/Lumberjack/

## The idea

Everything on the page comes from the shop itself:

- **Their logo**, traced to a clean vector from their own social avatar: the bearded lumberjack in a beanie with an axe, inside a circle, over a geometric-sans wordmark (`images/logo-mark.svg`, `images/logo-wordmark.svg`).
- **Their colours**: the logo teal, white walls, pine joinery, the red bistro chairs, the black menu board, and the copper fascia lettering.
- **Their line-drawing style**, taken from the logo, the window vinyl and the side-wall mural. The illustrations are drawn from reference photos of the real shop: the shopfront, the A-frame ladder shelving behind the counter, a table, chair and log stool, the pourover, and a cross-section of the building (counter and deli upstairs, spiral stair down to the basement seating, back garden).
- **Their own words** ("Camberwell's local café & deli… coffee of course", "coffee, craftsmanship, community"), plus dated quotes from staff, trainees and press.

## What's on the page

- **Live open/closed status** in Europe/London time, from Mon–Fri 8am–4pm and Sat–Sun 9am–4pm. It shows "Closing soon" in the last 30 minutes and highlights today's row in the hours table.
- **On the shelves.** The A-frame shelving is the menu: tap a shelf to see its producers. This is keyboard accessible, and every shelf is listed when JavaScript is off.
- **Ask about the tables.** The trainee story, told through what's on record.
- **Since 2016.** A short timeline set on a carpenter's folding rule.
- **Visit, and Get in touch.** Map link, buses, tap-to-call, and a contact form. The form only shows a front-end success message, which says nothing was sent.

## Where the facts come from

Every quote is verbatim and attributed on the page. The main sources:

- Their X bio, @hellolumberjack
- Time Out, 2016
- Peckham Peculiar, "Caring cafe", February 2016 (Ann-Marie Yiannis)
- Camberwell Online, January 2016
- Double Skinny Macchiato, March 2016
- The Infatuation, 2019 and its laptop-friendly guide
- Assembly Coffee, "Serving Assembly: Lumberjack Coffee", June 2022 (Fraser, Tash, Steve)
- Southwark News, June 2023 (Mike Biddulph, Naliah)
- SE5 Forum, April 2020
- Camberwell Arts
- thatsup, 2026
- The Charity Commission register and Companies House (We Are Lumberjack C.I.C., no. 09816432)

**Note:** Companies House shows London Reclaimed in creditors' voluntary liquidation since 2 June 2026. We Are Lumberjack C.I.C. is still active. So the copy tells the London Reclaimed and Goldfinch story in the past tense, and makes no claims about current training arrangements or where profits go. The owners can update that in a line.

## Photos

The site has no photos yet. The only reachable photos of the shop are on social media (the café's and London Reclaimed's own posts) or belong to the press: Time Out (Sequoia Ziff, 2016), The Infatuation (Giulia Verdinelli, 2019), Assembly Coffee (2022) and the Double Skinny Macchiato blog (2016). None of them are cleared for reuse here. The illustrations are designed to stand on their own, and photos can be added once there's permission. A good fit:

- the counter and A-frame shelving
- the deli shelves
- the basement with its spiral stair
- the back room and garden
- a coffee in one of the local mugs

## Preview locally

```sh
python3 -m http.server 8080
# then open http://localhost:8080/#me
```

Adding `#me` once marks your browser so the demo ping ignores your visits.

## Deploy

GitHub Pages is set to deploy from **GitHub Actions**. `.github/workflows/pages.yml` publishes `index.html`, `css/`, `js/` and `images/` on every push to the repository's default branch, and you can also run it by hand from the Actions tab. There's no build step, and all paths are relative.

## Demo ping

The page posts "`<v> opened <path>`" to an ntfy topic once per browser session. Tag a link with `?v=name` to see who opened it. Replace `TOPIC` in `index.html` with your own topic before sharing.

## Files

```
index.html     the page, with the illustrations inline as SVG
css/styles.css styles (mobile first)
js/main.js     opening status, menu, shelves, contact form
images/        logo (traced), favicon, touch icon, link-preview image
```

Fonts: Montserrat (close to their wordmark) and Newsreader, from Google Fonts.
