/**
 * Netlify Function: get-call-token
 *
 * Purpose:
 *   Generates the two tokens that the browser needs to make a Webex
 *   Click-to-Call to an Auto Attendant:
 *     1. guestAccessToken — a Webex SDK guest credential
 *     2. callToken        — a JWE token scoped to the destination number
 *
 * Why this lives on the server (and not in the browser):
 *   The Service App token is a long-lived secret. It must NEVER ship to
 *   the client. We only forward to the browser the two narrowly-scoped,
 *   short-lived tokens it actually needs.
 *
 * Env vars (set in Netlify dashboard → Site settings → Environment variables):
 *   - WEBEX_SERVICE_APP_TOKEN     (required) — generate in Webex Developer Portal
 *   - WEBEX_CALLED_NUMBER         (required) — destination, e.g. "4500" or "+6221..."
 *   - WEBEX_GUEST_NAME_DEFAULT    (optional) — fallback if frontend doesn't send one
 *
 * Reference:
 *   - Sample resmi: github.com/WebexSamples/webex-js-sdk-calling-demo
 *   - Click-to-Call docs: help.webex.com/article/ndzk21eb
 */

exports.handler = async (event) => {
  // CORS preflight (in case you call this from a different origin during dev)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const serviceAppToken = process.env.WEBEX_SERVICE_APP_TOKEN;
  const calledNumber = process.env.WEBEX_CALLED_NUMBER;
  const defaultGuestName = process.env.WEBEX_GUEST_NAME_DEFAULT || "Guest";

  if (!serviceAppToken || !calledNumber) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Missing env vars. Required: WEBEX_SERVICE_APP_TOKEN, WEBEX_CALLED_NUMBER.",
      }),
    };
  }

  // Optional guest name from frontend body
  let guestName = defaultGuestName;
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    if (body.guestName && typeof body.guestName === "string") {
      guestName = body.guestName.slice(0, 80); // cap length
    }
  } catch (e) {
    // body is optional; ignore parse errors
  }

  try {
    // Step 1: exchange Service App token → short-lived guest access token
    const guestRes = await fetch("https://webexapis.com/v1/guests/token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceAppToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: `guest-${Date.now()}`,
        displayName: guestName,
      }),
    });

    if (!guestRes.ok) {
      const errText = await guestRes.text();
      console.error("Guest token API failed:", guestRes.status, errText);
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: `Webex guest token API returned ${guestRes.status}`,
          detail: errText,
        }),
      };
    }

    const guestData = await guestRes.json();
    const guestAccessToken = guestData.accessToken;

    if (!guestAccessToken) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "No accessToken in guest token response", detail: guestData }),
      };
    }

    // Step 2: request a JWE call token for the specific Auto Attendant number
    const callTokenRes = await fetch("https://webexapis.com/v1/telephony/click2call/callToken", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${guestAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        calledNumber: calledNumber,
        guestName: guestName,
      }),
    });

    if (!callTokenRes.ok) {
      const errText = await callTokenRes.text();
      console.error("Call token API failed:", callTokenRes.status, errText);
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: `Webex call token API returned ${callTokenRes.status}`,
          detail: errText,
        }),
      };
    }

    const callTokenData = await callTokenRes.json();
    const callToken = callTokenData.callToken || callTokenData.token;

    if (!callToken) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "No callToken in response", detail: callTokenData }),
      };
    }

    // Success — return tokens + metadata the frontend needs
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({
        guestAccessToken,
        callToken,
        calledNumber,
        guestName,
      }),
    };
  } catch (err) {
    console.error("Unexpected error in get-call-token:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal error generating call token",
        detail: err.message,
      }),
    };
  }
};
