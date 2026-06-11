# SVC Tech AI Solutions — Website

Marketing and academy website for **SVC Tech AI Solutions Private Limited** — a static, multi-page site covering the company's enterprise AI products, services, academy and contact.

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | [`index.html`](index.html) | Hero, capabilities, why SVC, engagement model, industries, testimonial |
| Products | [`products.html`](products.html) | AI-native product suite and integrations |
| Services | [`services.html`](services.html) | Engineering practices and delivery process |
| Education | [`education.html`](education.html) | SVC Academy — career tracks, formats, faculty |
| About | [`about.html`](about.html) | Mission, principles, history, vision |
| Contact | [`contact.html`](contact.html) | Enquiry form and direct contact details |

## Tech stack

- Plain **HTML** + [Tailwind CSS](https://tailwindcss.com/) (via CDN)
- Shared styles in [`assets/styles.css`](assets/styles.css) and behaviour in [`assets/site.js`](assets/site.js)
- Fonts: **Sora** (display) + **Inter** (body) via Google Fonts
- No build step — the pages run directly in the browser

## Run locally

A minimal zero-dependency static server is included:

```bash
node serve.mjs
# → http://localhost:3000
```

## Project structure

```
.
├── index.html / products.html / services.html / education.html / about.html / contact.html
├── assets/
│   ├── styles.css       # shared styles, animations
│   └── site.js          # nav toggle, scroll-reveal, count-up
├── band_assets/         # logo and brand assets
├── serve.mjs            # local static dev server
└── screenshot.mjs       # optional Puppeteer screenshot helper
```

---

© 2026 SVC Tech AI Solutions Private Limited. All rights reserved.
