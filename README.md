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

To test the **contact form** locally (submissions to Google Sheets), use Vercel dev so the `/api/contact` route is available:

```bash
npx vercel dev
```

## Contact form → Google Sheets

Submissions are saved to **one Google Spreadsheet** with **four tabs** — routed by where the user came from:

| Tab | When it's used |
|-----|----------------|
| **Contact** | Home, About, or direct visit to Contact page |
| **Products** | User clicked from Products page (`?from=products`) |
| **Services** | User clicked from Services page (`?from=services`) |
| **Education** | User clicked from Education page (`?from=education`) |

### 1. Create the spreadsheet

1. In [Google Drive](https://drive.google.com), create a new **Google Sheet**.
2. (Optional) Create tabs named `Contact`, `Products`, `Services`, `Education` — or let the Apps Script create them on first submission.
3. Each tab uses these column headers (added automatically if missing):

   `Timestamp` | `Source` | `Full Name` | `Work Email` | `Company` | `Phone` | `Areas of Interest` | `Project Brief` | `Budget Range` | `Timeline`

### 2. Add the Apps Script

1. In the sheet: **Extensions → Apps Script**.
2. Delete any default code and paste the contents of [`google-apps-script/contact-form.gs`](google-apps-script/contact-form.gs).
3. Click **Save**, then **Deploy → New deployment**.
4. Type: **Web app**
5. **Execute as:** Me · **Who has access:** Anyone
6. Click **Deploy** and copy the **Web app URL** (ends in `/exec`).

### 3. Configure Vercel

In your Vercel project → **Settings → Environment Variables**, add:

| Name | Value |
|------|--------|
| `GOOGLE_SCRIPT_URL` | The Web app URL from step 2 |

Redeploy the site after saving the variable.

### Flow

```
User on Products → contact.html?from=products → form submits with source=products
  → /api/contact (Vercel) → Google Apps Script → new row in "Products" tab
```

The script URL stays server-side only; it is not exposed in the website code.

## Project structure

```
.
├── index.html / products.html / services.html / education.html / about.html / contact.html
├── assets/
│   ├── styles.css       # shared styles, animations
│   ├── site.js          # nav toggle, scroll-reveal, count-up
│   └── forms.js         # contact form submission
├── api/
│   └── contact.js       # Vercel serverless → Google Sheets
├── google-apps-script/
│   └── contact-form.gs  # paste into Google Apps Script
├── band_assets/         # logo and brand assets
├── serve.mjs            # local static dev server
└── screenshot.mjs       # optional Puppeteer screenshot helper
```

---

© 2026 SVC Tech AI Solutions Private Limited. All rights reserved.
