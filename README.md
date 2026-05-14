# Hotel Nusantara — Webex Calling Click-to-Call Demo

A hotel reservation landing page with an **embedded Webex Calling Click-to-Call** integration. Guests can speak with the front desk directly from their browser — no phone number, no app download, just a real audio call powered by [Webex Calling](https://www.webex.com/calling.html).

Built as a **Cisco Indonesia Solutions Engineering demo** to showcase Webex Click-to-Call capability for partner presentations and enterprise prospects. Branded as a fictional hotel (Hotel Nusantara) but easily rebrandable to any vertical — healthcare, retail, hospitality, banking.

> 📘 See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for a full system diagram and security threat model.

---

## ✨ Features

- 🏨 **Production-quality reservation landing page** — multi-step wizard, calendar picker, room selection, bilingual ID/EN
- ☎️ **Real Webex Click-to-Call** from browser — connects to your Webex Calling Auto Attendant or Call Queue
- 🎤 **Live audio call** with mute, end call, and call timer
- 🔒 **Server-side token generation** — Service App secret never reaches the browser
- 📱 **WhatsApp fallback** built-in for users without browser audio
- 🌐 **Static frontend + serverless backend** — deploys to Netlify free tier
- 🎨 **Easily rebrandable** — single `copy.js` file for all text (bilingual)
- 📱 **Optionally packageable as native APK/iOS app** via Capacitor — see [docs/MOBILE_APP.md](docs/MOBILE_APP.md)

---

## 📋 Prerequisites

Before you deploy, you'll need:

| Requirement | Why | Where to get it |
|---|---|---|
| **Webex Calling org** (paid) | Click-to-Call target | Provided by your Cisco partner or Webex sales |
| **Customer Assist license** | Required for Click-to-Call feature | Add to your Webex org (talk to Cisco) |
| **Service App in Webex** | Issues guest tokens | [developer.webex.com](https://developer.webex.com) → My Apps |
| **Auto Attendant or Call Queue** | The destination phone number | Webex Control Hub |
| **Click-to-Call enabled** | Toggle in Control Hub | Control Hub → Services → Calling |
| **Netlify account** (free) | Hosting + serverless functions | [netlify.com](https://netlify.com) |
| **GitHub account** | Source hosting | [github.com](https://github.com) |
| **Node.js 18+** | Local dev (optional) | [nodejs.org](https://nodejs.org) |

---

## 🚀 Quick Deploy (15 minutes)

### Step 1 — Webex Control Hub setup

1. **Verify Customer Assist license** is active on your Webex org
2. **Create an Auto Attendant**:
   - Control Hub → **Calling** → **Features** → **Auto Attendant** → **Create Auto Attendant**
   - Note its phone number or extension (e.g., `4500`)
3. **Enable Click-to-Call**:
   - Control Hub → **Calling** → **Service Settings** → **Click-to-Call** → toggle **ON**
   - Add your Auto Attendant to the allowed destinations
4. **Test the Auto Attendant** by calling its number from a regular Webex client first — confirm it answers and routes correctly

> 📘 Full reference: [Webex Click-to-Call setup guide](https://help.webex.com/en-us/article/ndzk21eb/)

### Step 2 — Create a Service App

1. Go to [developer.webex.com](https://developer.webex.com/my-apps) → sign in
2. Click **Create a New App** → **Service App**
3. Fill in details:
   - **App name**: `Hotel Nusantara Click-to-Call`
   - **Scopes**: `spark:calls_write`, `spark:calls_read`, `guest-issuer:read`
4. **Submit for admin approval** in your org (Control Hub → Apps → Service Apps → approve)
5. After approval, generate an **Access Token** — copy it (you'll need it as `WEBEX_SERVICE_APP_TOKEN`)

> ⚠️ Service App tokens expire every **14 days**. You'll need to regenerate manually unless you implement a refresh flow. For production use, build a proper refresh token rotation.

### Step 3 — Fork & deploy this repo to Netlify

#### Option A: One-click deploy (easiest)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/bcandrap/hotel-nusantara-webex-demo)

> Replace `YOUR_USERNAME` with the actual repo URL after you fork it

#### Option B: Manual deploy

1. **Fork this repo** to your GitHub (top-right corner)
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
3. Connect your GitHub → select the forked repo
4. **Build settings** (should auto-detect from `netlify.toml`):
   - Build command: *(leave empty)*
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
5. Click **Deploy site**

### Step 4 — Configure environment variables

1. In your Netlify dashboard → **Site settings** → **Environment variables**
2. Add the following three variables:

   | Variable | Value | Example |
   |---|---|---|
   | `WEBEX_SERVICE_APP_TOKEN` | The token from Step 2 | `NjIzMDAxNjAt...` (very long) |
   | `WEBEX_CALLED_NUMBER` | Your Auto Attendant number | `4500` |
   | `WEBEX_GUEST_NAME_DEFAULT` | Default display name | `Hotel Nusantara Guest` |

3. After saving, trigger a **redeploy**: Deploys tab → **Trigger deploy** → **Deploy site**

### Step 5 — Test the deployment

1. Open your Netlify site URL (e.g., `https://radiant-baklava-123456.netlify.app`)
2. The hero section should load with the SDK status badge showing **Webex SDK: ready**
3. Click **Bicara dengan resepsionis** (or **Speak to the concierge** in EN)
4. Allow microphone access when prompted
5. You should see the call modal: **Memulai** → **Menyambungkan ke meja depan** → **Terhubung** ✅
6. Your Auto Attendant should answer with its configured greeting

---

## 🛠️ Local development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/hotel-nusantara-webex-demo.git
cd hotel-nusantara-webex-demo

# Install Netlify CLI globally (one-time)
npm install -g netlify-cli

# Create local env file
cp .env.example .env
# Edit .env with your real values

# Start local dev server (with Functions support)
netlify dev
```

Local site will be served at `http://localhost:8888` with the Function available at `/.netlify/functions/get-call-token`.

> ⚠️ For Webex Click-to-Call to work locally, you need **HTTPS** (browser policy for microphone access). Use `netlify dev` with `--live` flag, or test via the deployed Netlify URL.

---

## 🏗️ Architecture

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│        Browser (User)       │         │   Webex Cloud (Cisco)        │
│                             │         │                              │
│  ┌───────────────────────┐  │         │  ┌────────────────────────┐  │
│  │  index.html / app.jsx │  │   3.    │  │  Guest Token API       │  │
│  │  (React + Webex SDK)  │◄─┼─────────┼──┤  /v1/guests/token      │  │
│  └──────────┬────────────┘  │         │  └────────────────────────┘  │
│             │ 4. SDK init   │         │  ┌────────────────────────┐  │
│             │    + dial()   │         │  │  Call Token API        │  │
│             ▼               │   5.    │  │  /v1/telephony/...     │  │
│  ┌───────────────────────┐  │ Audio   │  └────────────────────────┘  │
│  │  WebRTC Audio Stream  │◄─┼─────────┼──┐                           │
│  └───────────────────────┘  │  call   │  │  ┌────────────────────┐  │
└─────────────┬───────────────┘         │  └──┤  Auto Attendant    │  │
              │ 1. POST                 │     │  (your destination)│  │
              │    /functions/          │     └────────────────────┘  │
              │    get-call-token       │                              │
              ▼                         └──────────────────────────────┘
┌─────────────────────────────┐                       ▲
│   Netlify Functions (Node)  │                       │
│                             │  2. POST + Bearer     │
│  get-call-token.js          ├───────────────────────┘
│  - Reads SERVICE_APP_TOKEN  │     (Service App auth)
│  - Calls Webex APIs         │
│  - Returns 2 short-lived    │
│    tokens to browser        │
└─────────────────────────────┘
```

**Why this design**:

1. **Service App token never leaves the server** — it's a long-lived secret, exposing it = full org takeover
2. **Frontend only receives** the short-lived guest token + JWE call token, both scoped to one specific call
3. **WebRTC audio** is peer-to-peer between browser and Webex SBC, not proxied through Netlify
4. **No state needed** — each call request is independent, scales horizontally with Netlify Functions

---

## 📁 Project structure

```
hotel-nusantara-webex-demo/
├── README.md                          ← You are here
├── LICENSE
├── .gitignore
├── .env.example                       ← Template for env vars
├── netlify.toml                       ← Netlify build config
├── package.json
├── public/                            ← Static site root
│   ├── index.html                     ← Entry point, loads Webex SDK
│   ├── app.jsx                        ← React app (single file, ~840 lines)
│   ├── styles.css                     ← All styling
│   └── copy.js                        ← Bilingual ID/EN text registry
├── netlify/
│   └── functions/
│       └── get-call-token.js          ← Server-side token generator
└── docs/
    ├── ARCHITECTURE.md                ← System diagram + security model
    ├── REBRAND.md                     ← How to customize branding
    ├── TROUBLESHOOTING.md             ← Common issues & fixes
    └── MOBILE_APP.md                  ← Package as Android APK / iOS app
```

---

## 🎨 Rebranding

The entire UI text lives in `public/copy.js` as a bilingual dictionary. To rebrand to a different vertical (hospital, bank, retail, etc.):

1. **Text changes**: Edit `public/copy.js` — every visible string is keyed in `id` (Indonesian) and `en` (English)
2. **Colors**: Edit CSS variables at the top of `public/styles.css` (`:root { --brass: ...; --ink: ...; }`)
3. **Logo**: Edit the brand mark SVG in `app.jsx` (search for `brand-mark`)
4. **Hero photo**: Change `HERO_PHOTO` constant in `app.jsx` (line ~21)
5. **WhatsApp number**: Change `WA_NUMBER` constant in `app.jsx` (line ~17)

📘 See [docs/REBRAND.md](docs/REBRAND.md) for detailed walkthrough.

---

## 🐛 Troubleshooting

Common issues:

- **"Webex SDK: gagal load"** → CDN block or version pinned to nonexistent version. Check browser console.
- **"callingClient.getLines is not a function"** → SDK version mismatch. Repo uses `webex@3.5.0-next.25` (prerelease) because stable versions don't have Click-to-Call methods yet.
- **HTTP 401 from token endpoint** → Service App token expired (14-day limit). Regenerate in Webex Developer Portal.
- **Call connects but no audio** → Check browser mic permission. Some browsers require HTTPS even on localhost.
- **Hang up button doesn't work** → Code uses defensive method detection (tries `end`, `disconnect`, `hangup`, etc.) because the SDK API varies between versions.

📘 Full troubleshooting guide: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

## 📚 References

- [Webex Calling Web SDK documentation](https://developer.webex.com/docs/webex-calling-web-sdk)
- [Click-to-Call setup guide](https://help.webex.com/en-us/article/ndzk21eb/)
- [Official sample: WebexSamples/webex-js-sdk-calling-demo](https://github.com/WebexSamples/webex-js-sdk-calling-demo)
- [Webex Service Apps documentation](https://developer.webex.com/docs/service-apps)
- [Netlify Functions docs](https://docs.netlify.com/functions/overview/)

---

## ⚠️ Disclaimers

- This is a **demo project**, not production-ready software. Security review is required before exposing to real customers.
- **Service App tokens are long-lived secrets** — rotate regularly and never commit to git.
- Webex Click-to-Call SDK API surface may change; we pin to `webex@3.5.0-next.25` for that reason.
- This project is **not affiliated with or endorsed by Cisco Systems Inc.** — it's an independent technical demo by a Cisco SE or partner SE.

---

## 📄 License

MIT — see [LICENSE](LICENSE) file. Use it however you want, but no warranties.

---

## 🙌 Credits

- **Design**: hand-crafted hotel landing page concept by [Bagus Pratama](https://github.com/bcandrap/hotel-nusantara-webex-demo/)
- **Webex integration**: based on patterns from the official `WebexSamples/webex-js-sdk-calling-demo` sample
- **Built with**: React (via Babel standalone, no build step), Netlify Functions, Webex Calling SDK

---

**Questions or issues?** Open an issue on this repo or contact the maintainer.
