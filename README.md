# The Skills Advantage — RSVP page

A standalone, single-page RSVP site for Melsoft Academy's executive event
**"The Skills Advantage: Navigating Compliance, Tech & Talent in 2026"**.
Built with React + Vite, styled with melsoftacademy.com's palette (navy ink,
maroon accent, neutral lines) and fonts (Canela headings, Inter body).

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serves dist/ to check the build
```

## Where things live

| File | What it holds |
|---|---|
| `src/event.js` | All event copy: title, date, time, venue, attendance options |
| `src/App.jsx` | The page: top bar, hero, RSVP form, confirmation, footer |
| `src/registration.js` | Sends the RSVP to the Apps Script endpoint |
| `src/styles/base.css` | Fonts, colour tokens, reset |
| `src/styles/page.css` | Page layout and components |
| `apps-script/Code.gs` | Google Sheet backend for the form |
| `public/` | Logo, boardroom photo, Canela font, favicons |

## Connect the form

1. Set up the Google Sheet and Apps Script — steps are at the top of
   `apps-script/Code.gs`.
2. Copy `.env.example` to `.env` and paste the web app URL into
   `VITE_REGISTRATION_ENDPOINT`.
3. Set the same variable in your hosting provider, then redeploy.

Until the URL is set, the form validates but shows "Registration isn't live
yet" instead of submitting.

## Before going live

- [ ] **Date:** `src/event.js` still says "Thursday, November 2026" — add the day.
- [ ] **Venue and times:** confirm against the final event details.
- [ ] **Form endpoint:** set `VITE_REGISTRATION_ENDPOINT` (see above) and send a test RSVP.
- [ ] **Share image:** `og:image` in `index.html` is a relative path; make it the
      full `https://…/images/boardroom.webp` URL once the domain is known.
- [ ] **Confirmation email:** none is sent yet. Add one to `apps-script/Code.gs`
      once the event details are final.

## Deploy

Any static host works (Vercel, Netlify, Cloudflare Pages):

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_REGISTRATION_ENDPOINT`
