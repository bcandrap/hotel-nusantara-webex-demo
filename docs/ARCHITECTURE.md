# System Architecture

```
┌──────────────────────────────────────────┐         ┌──────────────────────────────────────┐
│        Browser (End User)                │         │   Webex Cloud (Cisco)                │
│                                          │         │                                      │
│  ┌────────────────────────────────────┐  │   ❸     │  ┌────────────────────────────────┐  │
│  │  index.html → app.jsx (React)      │  │ Token   │  │  Guest Token API               │  │
│  │  ─────────────────────────────     │◄─┼─────────┼──┤  POST /v1/guests/token         │  │
│  │  • Reservation wizard (UI)         │  │ exchange│  └────────────────────────────────┘  │
│  │  • Webex Calling SDK (loaded)      │  │         │  ┌────────────────────────────────┐  │
│  │  • CallModal component             │  │         │  │  Click2Call Token API          │  │
│  └─────────────┬──────────────────────┘  │   ❹     │  │  POST /v1/telephony/.../       │  │
│                │                         │  Init   │  │       callToken                │  │
│                │  ❺ makeCall().dial()    │   SDK   │  └────────────────────────────────┘  │
│                ▼                         │         │  ┌────────────────────────────────┐  │
│  ┌────────────────────────────────────┐  │   ❻     │  │  Voice Edge / SBC              │  │
│  │  WebRTC Audio (peer)               │◄─┼─────────┼──┤  (signaling + media)           │  │
│  └────────────────────────────────────┘  │  Audio  │  └────────────┬───────────────────┘  │
│                                          │  call   │               │                      │
└──────────────────┬───────────────────────┘         │               ▼                      │
                   │                                 │  ┌────────────────────────────────┐  │
                   │ ❶ POST                          │  │  Auto Attendant                │  │
                   │   /.netlify/functions/          │  │  ─────────────────────────     │  │
                   │   get-call-token                │  │  Plays greeting, routes to     │  │
                   │                                 │  │  agents / queues / mailbox     │  │
                   ▼                                 │  └────────────────────────────────┘  │
┌──────────────────────────────────────────┐         │                                      │
│  Netlify Functions (serverless)          │         └──────────────────────────────────────┘
│  ────────────────────────────────────────│
│                                          │                            ▲
│  netlify/functions/get-call-token.js     │                            │
│                                          │  ❷ Server-to-server        │
│  Env vars (kept SECRET, server-side):    │     POST with              │
│    WEBEX_SERVICE_APP_TOKEN ━━━━━━━━━━━━━━┼──── Bearer token ──────────┘
│    WEBEX_CALLED_NUMBER                   │
│    WEBEX_GUEST_NAME_DEFAULT              │
│                                          │
│  Returns to browser:                     │
│    {                                     │
│      guestAccessToken: "..." (~15min),   │
│      callToken: "..." (JWE, ~15min),     │
│      calledNumber: "...",                │
│      guestName: "..."                    │
│    }                                     │
└──────────────────────────────────────────┘
```

## Flow walkthrough

1. **Browser → Netlify Function** (HTTPS POST)
   - User clicks "Speak to concierge" → frontend fires `POST /.netlify/functions/get-call-token`
   - Request body: `{ guestName: "Nusantara Guest" }` (optional)

2. **Netlify Function → Webex Cloud** (server-to-server)
   - Function reads `WEBEX_SERVICE_APP_TOKEN` from env (never exposed to client)
   - Uses it to authenticate to Webex APIs

3. **Webex returns guest access token**
   - Short-lived (~15 min), scoped to one guest session
   - Function then makes a second call...

4. **Webex returns JWE call token**
   - JWE encrypts the destination (called number)
   - Scoped to a specific call, expires quickly

5. **Both tokens flow back to browser**
   - Frontend initializes Webex Calling SDK with these tokens
   - SDK is now ready to make ONE specific call to ONE specific destination

6. **WebRTC audio call established**
   - Peer-to-peer between browser and Webex's edge servers (NOT routed through Netlify)
   - Auto Attendant answers, plays greeting, routes call as configured

## Why this design

| Decision | Reason |
|---|---|
| Service App token on server only | Long-lived secret. Exposing = full org takeover |
| Short-lived guest/JWE tokens to browser | Even if intercepted, useless after expiry & only good for one specific call |
| WebRTC peer-to-peer (not proxied) | Lower latency, lower cost, better audio quality |
| Static frontend + serverless backend | Zero infrastructure, scales to zero, costs ~$0 |
| No database / no session state | Each call is independent. Simpler architecture, no GDPR/data residency concerns |

## Security threat model

What's protected:

- ✅ Service App token never exposed to client or in URLs/logs
- ✅ Browser cannot make arbitrary calls — only the pre-configured destination
- ✅ Tokens expire quickly (minutes, not hours)
- ✅ Function returns 4xx on missing/bad env vars instead of crashing

What's NOT protected (out of scope for demo):

- ❌ No rate limiting on `/get-call-token` — anyone can spam the endpoint
- ❌ No CAPTCHA — bot could trigger many simultaneous calls to your AA
- ❌ No authentication — anyone on the internet can hit "call concierge"

For production, add:

- Rate limiting (Netlify Edge Functions or external service)
- CAPTCHA before allowing call
- Optional: require booking submission first, then enable call button
- Optional: log every call attempt with IP/UA for audit trail
```
