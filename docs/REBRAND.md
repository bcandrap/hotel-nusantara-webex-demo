# Rebranding Guide

This demo was built as a generic hotel landing page (Hotel Nusantara), but the architecture is fully decoupled — you can rebrand to **any vertical** in about 15-30 minutes.

## Quick rebrand checklist

- [ ] Update `<title>` in `public/index.html`
- [ ] Update all brand text in `public/copy.js`
- [ ] Swap colors in `public/styles.css` (`:root` variables)
- [ ] Replace brand mark SVG in `public/app.jsx`
- [ ] Replace hero photo (`HERO_PHOTO` constant)
- [ ] Update WhatsApp number (`WA_NUMBER` constant)
- [ ] Update room/service data (`ROOMS` array)
- [ ] Update Auto Attendant guest name in Netlify env var

---

## 1. Text content (`public/copy.js`)

Every visible string is in this file as a bilingual dictionary:

```javascript
window.COPY = {
  brand_name: { id: "Hotel Nusantara",       en: "Hotel Nusantara" },
  brand_sub:  { id: "Jakarta · Sejak 1962",  en: "Jakarta · Since 1962" },
  // ... 150+ more entries
};
```

**To rebrand**:

```javascript
// Example: rebrand to a hospital
brand_name:  { id: "RS Mount Princess",    en: "Mount Princess Hospital" },
brand_sub:   { id: "Premier Healthcare",   en: "Premier Healthcare" },
nav_stay:    { id: "Layanan",              en: "Services" },
nav_dine:    { id: "Spesialis",            en: "Specialists" },
nav_heritage:{ id: "Tentang Kami",         en: "About Us" },
call_pill:   { id: "Call Center",          en: "Call Center" },
// ... etc
```

The English entries are **optional** — if a key has no `en`, the language toggle in the top bar will fall back to `id`. Always include both for the best experience.

---

## 2. Brand colors (`public/styles.css`)

Open `public/styles.css` and find the `:root` block at the top:

```css
:root {
  --paper:    oklch(0.97 0.005 80);    /* Background */
  --bg-elev:  oklch(0.94 0.008 80);    /* Elevated surfaces */
  --ink:      oklch(0.18 0.015 200);   /* Primary text */
  --ink-2:    oklch(0.42 0.012 200);   /* Secondary text */
  --ink-3:    oklch(0.58 0.012 200);   /* Tertiary text */
  --brass:    oklch(0.72 0.10 80);     /* Accent (golden/brass) */
  --accent:   oklch(0.58 0.13 145);    /* Live indicator (green) */
  --rouge:    oklch(0.48 0.15 30);     /* Error/end-call (red) */
  --rule:     oklch(0.85 0.005 80);    /* Borders */
  --rule-soft: oklch(0.90 0.005 80);   /* Soft borders */
  /* ... */
}
```

Colors use [OKLCH](https://oklch.com) format. To recolor:

| Vertical | Brass replacement | Accent | Notes |
|---|---|---|---|
| Hospital | Teal `oklch(0.65 0.12 195)` | Mint green | Trustworthy, clinical |
| Bank | Navy `oklch(0.35 0.10 250)` | Gold | Premium, secure |
| Hotel (alt) | Burgundy `oklch(0.40 0.12 20)` | Cream | Luxurious |
| Tech/SaaS | Cyan `oklch(0.70 0.15 220)` | Magenta | Modern |
| Retail | Coral `oklch(0.70 0.15 30)` | Lime | Energetic |

**Tool**: use [oklch.com/picker](https://oklch.com/picker) to pick colors visually.

---

## 3. Brand mark / logo (`public/app.jsx`)

The brand mark is a single-letter SVG in the `Topbar` component. Find this around line 81:

```jsx
<div className="brand">
  <div className="brand-mark">N</div>   {/* ← Letter shown in the round badge */}
  <div>
    <div className="brand-name">{t("brand_name")}</div>
    <div className="brand-sub">{t("brand_sub")}</div>
  </div>
</div>
```

**Options for the mark**:

### Option A: Single letter (simplest)

Just change `N` to your brand initial:

```jsx
<div className="brand-mark">K</div>
```

### Option B: Custom SVG (for actual logos)

Replace the entire `<div className="brand-mark">N</div>` with:

```jsx
<div className="brand-mark">
  <svg viewBox="0 0 40 40" width="100%" height="100%">
    {/* Your SVG paths here */}
  </svg>
</div>
```

The container is `~40×40px`, so design your SVG accordingly.

### Option C: PNG/JPG logo

```jsx
<div className="brand-mark">
  <img src="logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
</div>
```

Put `logo.png` in the `public/` folder.

Also update the **avatar** in the call modal (around line 700+):

```jsx
<div className={`avatar ${phase !== "live" ? "ringing" : ""}`}>HN</div>
{/*                                                            ^^ change initials */}
```

---

## 4. Hero photo (`public/app.jsx`)

Find this constant near the top of `app.jsx` (around line 21):

```javascript
const HERO_PHOTO = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80";
```

**Replace with**:

- **Free stock**: search [unsplash.com](https://unsplash.com) → right-click photo → copy image address → add `?auto=format&fit=crop&w=1400&q=80` for optimal loading
- **Self-hosted**: put `hero.jpg` in `public/` and use `const HERO_PHOTO = "hero.jpg";`

Recommended dimensions: **1400×900** or larger, landscape orientation, focal point in upper-left (the right side is overlaid with text on mobile).

Also update the **room photos** in the `ROOMS` array right below:

```javascript
const ROOMS = [
  {
    id: "heritage",
    // ...
    photoUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80",
  },
  // ... etc
];
```

---

## 5. Service items / catalog (`public/app.jsx`)

The reservation wizard shows 3 room options (in `ROOMS` array). For non-hotel use cases, **repurpose this** to show:

- **Hospital**: appointment types (consultation, checkup, surgery)
- **Bank**: account types (savings, premium, business)
- **Retail**: pickup tiers (in-store, curbside, delivery)

```javascript
const ROOMS = [   // ← rename to ITEMS if you want
  {
    id: "general-consultation",
    nameKey: "item_a_name",   // ← add to copy.js
    descKey: "item_a_desc",
    bedKey: "duration_30min",
    guestsKey: "for_one_patient",
    viewKey: "specialist_general",
    price: 350000,
    photo: "General Consultation",
    photoUrl: "https://your-image.jpg",
  },
  // ...
];
```

Update all referenced keys in `copy.js`. The keys ending in `_k`, `_v`, etc. are flexible — name them however you want.

---

## 6. WhatsApp fallback number (`public/app.jsx`)

```javascript
const WA_NUMBER = "6281382032506";   // ← change to your number (no + sign)
const WA_MSG = encodeURIComponent("Halo, saya ingin menanyakan reservasi di Hotel Nusantara.");
```

Format: country code + number, no spaces, no `+`. For Indonesia: `62` + remove leading `0` from the mobile number.

---

## 7. Auto Attendant guest name (Netlify env vars)

In Netlify dashboard → **Environment variables**:

```
WEBEX_GUEST_NAME_DEFAULT = Hotel Nusantara Guest
```

Change to match your brand (e.g., `Mount Princess Patient`, `XYZ Bank Customer`). This shows up in the receptionist's caller ID on the answering end.

You can also override per-call from the frontend by editing this line in `app.jsx`:

```javascript
body: JSON.stringify({ guestName: "Nusantara Guest" }),
//                                  ^^^^^^^^^^^^^^^^ override here
```

---

## 8. Browser tab title & favicon

Update `public/index.html`:

```html
<title>Hotel Nusantara · Reservasi</title>
<!-- ↓ Change to: -->
<title>Mount Princess Hospital · Booking</title>

<!-- Add favicon (optional but recommended): -->
<link rel="icon" type="image/svg+xml" href="favicon.svg">
```

---

## 9. Footer details (`public/copy.js`)

```javascript
foot_addr:  { id: "Jl. M.H. Thamrin No. 1, Jakarta", en: "Jl. M.H. Thamrin No. 1, Jakarta" },
foot_phone: { id: "+62 21 2358 3800", en: "+62 21 2358 3800" },
foot_email: { id: "stay@hotelnusantara.id", en: "stay@hotelnusantara.id" },
foot_legal: { id: "© 2026 · Sebuah konsep desain", en: "© 2026 · A design concept" },
```

Change to your real address, phone, email, and copyright.

---

## Vertical-specific examples

### Hospital rebrand

```javascript
// copy.js
brand_name: { id: "RS Mount Princess",     en: "Mount Princess Hospital" },
brand_sub:  { id: "Premier Healthcare",    en: "Premier Healthcare" },
call_pill:  { id: "Call Center",           en: "Call Center" },
hero_title_a: { id: "Pelayanan yang",      en: "Care that" },
hero_title_em:{ id: "berempati",           en: "cares" },
hero_title_b: { id: "untuk Anda.",         en: "for you." },
hero_cta_book:{ id: "Daftar Rawat",        en: "Book appointment" },
// ... etc
```

### Bank rebrand

```javascript
brand_name: { id: "Bank Nusantara",        en: "Nusantara Bank" },
brand_sub:  { id: "Trusted Since 1962",    en: "Trusted Since 1962" },
call_pill:  { id: "Customer Service",      en: "Customer Service" },
hero_title_a: { id: "Bank yang",           en: "Banking that" },
hero_title_em:{ id: "mengerti",            en: "understands" },
hero_title_b: { id: "kebutuhan Anda.",     en: "your needs." },
hero_cta_book:{ id: "Buka Rekening",       en: "Open account" },
// ... etc
```

---

## Test after rebranding

After all changes:

1. Commit and push to GitHub
2. Netlify auto-deploys (if connected) — or trigger manual deploy
3. Hard-refresh browser (Cmd/Ctrl+Shift+R)
4. Check that:
   - Brand name appears correctly in top bar
   - Colors look right
   - Photos load (no broken images)
   - Call still works (the backend logic is brand-agnostic)
   - Language toggle switches all text

If something breaks, check browser DevTools Console for errors.
