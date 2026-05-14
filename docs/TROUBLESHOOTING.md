# Troubleshooting Guide

Common issues when deploying or running the demo, and how to fix them.

---

## 🚨 Frontend Issues

### "Webex SDK: gagal load" (SDK badge red)

**Symptom**: The SDK status pill in the hero section shows red dot with "gagal load" / "failed to load".

**Causes & fixes**:

1. **CDN blocked by network firewall**
   - Check browser DevTools → Network tab → look for `calling.min.js` request
   - If it's blocked, try a different network (mobile hotspot)
   - For corporate networks, whitelist `unpkg.com`

2. **SDK version pulled from registry**
   - The repo pins to `webex@3.5.0-next.25` (prerelease) because stable versions lack Click-to-Call methods
   - If this version has been yanked from unpkg, find a newer prerelease:
     ```bash
     npm view webex versions --json | grep "next"
     ```
   - Update `<script src=...>` in `public/index.html` to the new version

3. **JavaScript error before SDK load completes**
   - Open DevTools Console, look for red errors
   - Most common: missing comma in `copy.js` from rebrand edits

---

### "callingClient.getLines is not a function"

**Symptom**: Call modal shows error after "Inisialisasi SDK" phase.

**Cause**: SDK version doesn't include Click-to-Call methods (you're on a stable release).

**Fix**: Ensure `index.html` uses prerelease version:

```html
<script src="https://unpkg.com/webex@3.5.0-next.25/umd/calling.min.js"></script>
```

NOT:

```html
<script src="https://unpkg.com/webex/umd/calling.min.js"></script>   <!-- latest = stable, no C2C -->
<script src="https://unpkg.com/webex@3.5.0/umd/calling.min.js"></script>   <!-- stable, no C2C -->
```

---

### "outputStream.getAudioTracks is undefined"

**Symptom**: Call connects briefly then immediately fails with this error in console.

**Cause**: SDK version mismatch — different versions return mic stream in different shapes.

**Fix**: This repo uses defensive coding in `stopAudioStream()` function to handle multiple shapes. If you see this error, the version may have changed its API. Check `public/app.jsx` around line 496 — the function tries 4 different access patterns:

```javascript
const stopAudioStream = (stream) => {
  if (typeof stream.stop === "function") { stream.stop(); return; }
  if (stream.outputStream?.getTracks) { ... }
  if (stream.getTracks) { ... }
  if (stream.outputStream?.getAudioTracks) { ... }
};
```

If none of these work, add a fifth pattern by inspecting the actual SDK object via DevTools.

---

### Call connects but no audio

**Symptoms**: Modal shows "Terhubung · 00:15" but you hear silence.

**Causes**:

1. **Browser mic permission denied**
   - Click the padlock icon in browser address bar
   - Find Microphone → set to "Allow"
   - Refresh page

2. **HTTPS not used**
   - Browsers require HTTPS for `getUserMedia` (mic access)
   - Localhost (`localhost:8888`) is exempt — works without HTTPS
   - For dev: use `netlify dev --live` for HTTPS tunnel

3. **Auto Attendant not configured to play audio**
   - Call your Auto Attendant from a regular Webex client first
   - Verify the greeting plays
   - If silent there too, fix in Control Hub (Auto Attendant settings → Greeting)

4. **Hidden audio element missing**
   - Verify `<audio id="remote-audio" autoplay></audio>` exists in `public/index.html`
   - This is where the remote stream attaches

---

### Hang up button doesn't end the call

**Symptom**: Click red end-call button, modal closes, but the call object on Webex side is still active (you can see "ringing/active" in Control Hub for several seconds).

**Cause**: SDK method name varies between versions — `end()` may not exist on this version.

**Fix**: The code already tries 6 method names in order. Check console after clicking end:

```
[Webex] Trying currentCall.end()        ← failed
[Webex] Trying currentCall.disconnect() ← works ✓
```

If **none** of the 6 methods work (`end`, `disconnect`, `hangup`, `terminate`, `close`, `bye`), add more candidates to the `methodsToTry` array in `endCall()` (around line 658 in `app.jsx`).

---

## 🚨 Backend (Netlify Function) Issues

### "HTTP 401" or "HTTP 403" from `/get-call-token`

**Symptom**: Modal shows "HTTP 401" or "HTTP 403" error during "Mendapatkan token" phase.

**Cause**: Service App token is **invalid or expired**.

**Fix**:

1. Go to [developer.webex.com](https://developer.webex.com/my-apps)
2. Find your Service App → click it
3. Click **Generate** under Access Token
4. Copy the new token
5. In Netlify → Site settings → Environment variables → edit `WEBEX_SERVICE_APP_TOKEN`
6. Paste new token → save
7. **Trigger a redeploy** (Deploys tab → Trigger deploy → Deploy site)

> ⏰ Service App tokens expire every **14 days**. Set a calendar reminder, or implement a refresh token rotation for production.

---

### "HTTP 502" — "Webex guest token API returned ..."

**Symptom**: Backend forwards error from Webex API.

**Causes**:

1. **Service App missing scopes**
   - Required: `spark:calls_write`, `spark:calls_read`, `guest-issuer:read`
   - Check at [developer.webex.com/my-apps](https://developer.webex.com/my-apps) → your app → Scopes
   - If missing, request them and re-approve in Control Hub

2. **Service App not approved**
   - Even if you created it, an admin must approve in Control Hub
   - Control Hub → **Apps** → **Service Apps** → find yours → approve

3. **Customer Assist license not active**
   - Verify your Webex org has Customer Assist license attached
   - Talk to your Cisco partner or account exec

---

### "HTTP 502" — "Webex call token API returned 400"

**Symptom**: Guest token succeeds but call token fails with 400.

**Causes**:

1. **`WEBEX_CALLED_NUMBER` is wrong**
   - Must be either an extension (e.g., `4500`) or E.164 (e.g., `+622112345678`)
   - Must be a number that exists in your Webex Calling org
   - Test by calling it from a regular Webex client first

2. **Auto Attendant not configured for Click-to-Call**
   - Control Hub → **Calling** → **Service Settings** → **Click-to-Call**
   - Add your Auto Attendant to allowed destinations list

3. **Click-to-Call not enabled**
   - Same place as above — toggle the master switch ON

---

### Function returns immediately with "Missing env vars"

**Symptom**: Modal fails immediately, no Webex API call attempted.

**Cause**: Required env vars not set in Netlify.

**Fix**:

1. Netlify dashboard → **Site settings** → **Environment variables**
2. Verify all 3 are present:
   - `WEBEX_SERVICE_APP_TOKEN`
   - `WEBEX_CALLED_NUMBER`
   - `WEBEX_GUEST_NAME_DEFAULT` (optional but recommended)
3. After adding/editing, **trigger a redeploy** — env vars only load on deploy, not on save!

---

## 🚨 Deploy / Build Issues

### Netlify build fails with "publish directory not found"

**Cause**: `netlify.toml` not in repo root, or `publish` directory misnamed.

**Fix**:

```toml
# netlify.toml must be at repo root, NOT in a subfolder
[build]
  publish = "public"
  functions = "netlify/functions"
```

Verify structure:

```
your-repo/
├── netlify.toml            ← must be here
├── public/                 ← must match publish setting
│   └── index.html
└── netlify/functions/      ← must match functions setting
    └── get-call-token.js
```

---

### Function not deployed / 404 on `/.netlify/functions/get-call-token`

**Cause**: Function file in wrong location or wrong file extension.

**Fix**: Must be `netlify/functions/get-call-token.js` (exact path). File must export a `handler` function:

```javascript
exports.handler = async (event) => {
  // ...
};
```

---

### Local `netlify dev` doesn't load Function

**Cause**: Missing `.env` file or wrong env var names.

**Fix**:

```bash
cp .env.example .env
# Edit .env with real values
netlify dev
```

`netlify dev` reads `.env` automatically and exposes vars to functions.

---

## 🚨 React / JSX Issues

### Page is blank / white screen

**Cause**: JSX syntax error preventing React from mounting.

**Fix**:

1. Open browser DevTools Console
2. Look for errors with "Unexpected token" or "SyntaxError"
3. Common culprits:
   - Missing closing tag in JSX
   - Mismatched braces in template literals
   - Missing comma in `copy.js`

If still stuck, restore `app.jsx` from `git` and re-do changes incrementally.

---

### Babel compilation slow / page loads slowly

**Cause**: Babel Standalone compiles JSX in-browser on every load.

**Why it's like this**: This demo intentionally uses no build step — drop into Netlify, deploy in 30 seconds. Tradeoff is slower load (~500ms-1s for Babel).

**For production**: pre-compile JSX:

```bash
npx babel public/app.jsx --presets=@babel/preset-react -o public/app.js
```

Then change `<script type="text/babel" data-presets="react" src="app.jsx">` to `<script src="app.js">`.

---

## 🚨 Webex Calling Org Issues

### Auto Attendant doesn't answer at all

1. **Test from regular Webex client first** — if it doesn't answer there either, the issue is in your AA config, not this demo
2. Check Control Hub → **Calling** → **Features** → **Auto Attendant** → your AA → verify schedule, greeting, and routing

### Call answers but immediately drops

- Check AA → **Settings** → maximum call duration
- Check user/agent availability if AA routes to a call queue
- Look at Webex Calling logs in Control Hub for SIP errors

---

## 🆘 Still stuck?

1. **Open DevTools Console** and capture all `[Webex] ...` log lines — they're verbose by design to aid debugging
2. **Check Netlify Functions logs**: Netlify dashboard → Functions → click `get-call-token` → see invocation logs with stack traces
3. **Test the function directly** via curl:
   ```bash
   curl -X POST https://YOUR-SITE.netlify.app/.netlify/functions/get-call-token \
     -H "Content-Type: application/json" \
     -d '{"guestName": "Test"}'
   ```
   - Success: returns JSON with `guestAccessToken` and `callToken`
   - Failure: error message tells you what's wrong
4. **Compare against official sample**: [WebexSamples/webex-js-sdk-calling-demo](https://github.com/WebexSamples/webex-js-sdk-calling-demo) — if their sample works for you but this repo doesn't, diff the relevant files

---

## Reporting bugs

If you find an issue not covered here, please:

1. Capture browser Console logs
2. Capture Netlify Function logs
3. Note your Webex SDK version (`<script src=...>` line in index.html)
4. Open an issue with all the above
