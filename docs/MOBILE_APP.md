# Mobile App Guide (APK & iOS)

This guide walks through packaging the Hotel Nusantara web demo as a **native Android APK and iOS app** using [Capacitor](https://capacitorjs.com). The web app is wrapped in a native shell — no rewrite required.

> **Scope of this guide**: Internal demo distribution only. Not for App Store / Play Store public release. See "Production considerations" at the end.

---

## ✅ What you'll end up with

- **`app.apk`** — installable on any Android device (Android 11+)
- **`Hotel Nusantara.ipa`** — installable on iPhone/iPad via Xcode (iOS 17+ recommended)
- Both apps make **real Webex Click-to-Call** calls to your Auto Attendant
- App icon, splash screen, native permission prompts — looks and feels like a real native app

---

## 📋 Prerequisites

### For Android build (works on any OS)

| Tool | Version | Where to get |
|---|---|---|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Android Studio | Hedgehog (2023) or newer | [developer.android.com/studio](https://developer.android.com/studio) |
| JDK 17 | Bundled with Android Studio | (auto-installed) |
| Capacitor CLI | 6.x | `npm install -g @capacitor/cli` |

### For iOS build (Mac only)

| Tool | Version | Where to get |
|---|---|---|
| macOS | 13+ | (your Mac) |
| Xcode | 15+ | App Store |
| CocoaPods | 1.13+ | `sudo gem install cocoapods` |
| Apple Developer account | Free tier OK for personal devices | [developer.apple.com](https://developer.apple.com) |

### Target device requirements

| Platform | Minimum | Recommended |
|---|---|---|
| Android | 11+ | 13+ |
| iOS | 15+ | 17+ (better WebRTC support) |

> ⚠️ **iOS 15-16 has a known bug** with `getUserMedia` in WKWebView pages loaded from `capacitor://localhost`. Apple fixed it in iOS 17. If you must support iOS 15-16, expect to do extra work patching the Capacitor iOS plugin (see Troubleshooting section).

---

## 🚀 Step-by-step

### Phase 1: Setup Capacitor project (15 minutes)

1. **Clone or download** your `hotel-nusantara-webex-demo` repo

2. **In project root**, install Capacitor dependencies:

   ```bash
   npm init -y    # if package.json doesn't exist yet
   npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
   ```

3. **Initialize Capacitor**:

   ```bash
   npx cap init
   ```

   When prompted:
   - **App name**: `Hotel Nusantara` (atau brand kamu)
   - **App ID**: `com.yourdomain.hotelnusantara` (reverse domain notation, no dashes)
   - **Web directory**: `public` (THIS IS IMPORTANT — match your `netlify.toml`)

4. **Update `capacitor.config.json`** to use HTTPS scheme (required for WebRTC):

   ```json
   {
     "appId": "com.yourdomain.hotelnusantara",
     "appName": "Hotel Nusantara",
     "webDir": "public",
     "server": {
       "androidScheme": "https",
       "iosScheme": "https",
       "cleartext": false
     },
     "android": {
       "allowMixedContent": false
     },
     "ios": {
       "contentInset": "always",
       "limitsNavigationsToAppBoundDomains": false
     }
   }
   ```

### Phase 2: Configure for backend access

The web app calls `/.netlify/functions/get-call-token` (relative path). In a Capacitor app, "relative" means `capacitor://localhost`, which won't reach Netlify. You have two options:

#### Option A (recommended): Point to your live Netlify URL

Update `public/app.jsx`, find this line (around line 493):

```javascript
const CALL_TOKEN_ENDPOINT = "/.netlify/functions/get-call-token";
```

Change to your full Netlify URL:

```javascript
const CALL_TOKEN_ENDPOINT = "https://YOUR-SITE.netlify.app/.netlify/functions/get-call-token";
```

Then add CORS to your Netlify Function — already done in `get-call-token.js` (look for `Access-Control-Allow-Origin: *`).

#### Option B: Set as Capacitor server URL

In `capacitor.config.json`, add:

```json
"server": {
  "url": "https://YOUR-SITE.netlify.app",
  "androidScheme": "https",
  "iosScheme": "https"
}
```

This loads your entire site from Netlify (online-only). Simpler but requires internet for the app to even open.

> 💡 **For demo use**, Option B is fine — easier setup, instant updates without rebuilding APK. **For offline-capable app**, use Option A and bundle static files locally.

### Phase 3: Build Android APK

1. **Add Android platform**:

   ```bash
   npx cap add android
   ```

2. **Copy web assets**:

   ```bash
   npx cap sync android
   ```

3. **Edit Android manifest** to add microphone permission:

   Open `android/app/src/main/AndroidManifest.xml` and add inside `<manifest>`:

   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   <uses-feature android:name="android.hardware.microphone" android:required="true" />
   ```

4. **Allow WebView mic permission automatically** (skip prompt every time):

   Edit `android/app/src/main/java/com/yourdomain/hotelnusantara/MainActivity.java`:

   ```java
   package com.yourdomain.hotelnusantara;

   import android.os.Bundle;
   import android.webkit.PermissionRequest;
   import android.webkit.WebChromeClient;
   import com.getcapacitor.BridgeActivity;

   public class MainActivity extends BridgeActivity {
     @Override
     public void onCreate(Bundle savedInstanceState) {
       super.onCreate(savedInstanceState);
       this.bridge.getWebView().setWebChromeClient(new WebChromeClient() {
         @Override
         public void onPermissionRequest(final PermissionRequest request) {
           request.grant(request.getResources());
         }
       });
     }
   }
   ```

5. **Open in Android Studio**:

   ```bash
   npx cap open android
   ```

6. In Android Studio:
   - Wait for Gradle sync (5-10 min on first open)
   - Connect Android device via USB (enable Developer Mode + USB Debugging on device)
   - Click **Run ▶** → select your device
   - APK installs and launches automatically

7. **Build standalone APK file** for distribution:
   - Android Studio menu: **Build** → **Build App Bundle(s) / APK(s)** → **Build APK(s)**
   - Wait for build (~2-5 min)
   - Click **locate** in the notification → grab `app-debug.apk`
   - This APK can be shared and sideloaded on any Android device

### Phase 4: Build iOS app (Mac required)

1. **Add iOS platform**:

   ```bash
   npx cap add ios
   ```

2. **Copy web assets**:

   ```bash
   npx cap sync ios
   ```

3. **Edit `ios/App/App/Info.plist`** to add microphone usage description:

   Open in text editor, add inside `<dict>` block:

   ```xml
   <key>NSMicrophoneUsageDescription</key>
   <string>Microphone access is required to make calls to our concierge.</string>
   ```

4. **Patch WebViewDelegationHandler** to auto-grant mic permission (avoids repeat prompts):

   Open `ios/App/Pods/Capacitor/Capacitor/Capacitor/WebViewDelegationHandler.swift`

   Find the function `webView(_:didStartProvisionalNavigation:)`. After that function, add:

   ```swift
   @available(iOS 15, *)
   func webView(
     _ webView: WKWebView,
     requestMediaCapturePermissionFor origin: WKSecurityOrigin,
     initiatedByFrame frame: WKFrameInfo,
     type: WKMediaCaptureType,
     decisionHandler: @escaping (WKPermissionDecision) -> Void
   ) {
     decisionHandler(.grant)
   }
   ```

   > ⚠️ **Note**: This is patching a Pod-managed file. If you run `pod install` later, this change will be lost. For permanent fix, see "Production considerations" → patch via Podfile script_phase, or use a Capacitor plugin.

5. **Open in Xcode**:

   ```bash
   npx cap open ios
   ```

6. In Xcode:
   - Select your target device (your iPhone connected via cable)
   - Top-left: select project → "Signing & Capabilities" → set Team to your Apple ID
   - Bundle Identifier should match: `com.yourdomain.hotelnusantara`
   - Click **▶ Run**
   - On first install, iPhone will say "Untrusted Developer" → Settings → General → VPN & Device Management → trust your dev profile
   - App installs and launches

7. **Build IPA for distribution** (optional, requires paid Apple Developer account for ad-hoc):
   - Xcode menu: **Product** → **Archive**
   - In Organizer window: **Distribute App** → **Ad Hoc** or **Development**
   - Save `.ipa` file → can be installed via Apple Configurator 2 or TestFlight

### Phase 5: App icon & splash screen (10 minutes)

1. **Install icon generator**:

   ```bash
   npm install -g @capacitor/assets
   ```

2. **Prepare source images** in project root:
   - `assets/icon-only.png` — 1024×1024px, transparent background, just your logo
   - `assets/icon-foreground.png` — 1024×1024px, logo with safe area (logo in center 60%)
   - `assets/icon-background.png` — 1024×1024px, solid background color
   - `assets/splash.png` — 2732×2732px, logo centered

3. **Generate all sizes automatically**:

   ```bash
   npx @capacitor/assets generate --android --ios
   ```

4. **Sync to platforms**:

   ```bash
   npx cap sync
   ```

5. Rebuild APK / IPA — new icon and splash will appear.

---

## 🎨 Branding tweaks for native shell

### Status bar color (Android)

Edit `android/app/src/main/res/values/styles.xml`:

```xml
<item name="android:statusBarColor">@color/colorPrimary</item>
```

Where `colorPrimary` is defined in `colors.xml`:

```xml
<color name="colorPrimary">#0B2447</color>   <!-- match your hero panel color -->
```

### Status bar style (iOS)

In `ios/App/App/Info.plist`:

```xml
<key>UIStatusBarStyle</key>
<string>UIStatusBarStyleLightContent</string>
<key>UIViewControllerBasedStatusBarAppearance</key>
<false/>
```

### Hide bottom navigation gestures (full immersion)

Add Capacitor plugin:

```bash
npm install @capacitor/status-bar
npx cap sync
```

In `app.jsx`, near the top:

```javascript
// Detect if running in Capacitor (native shell)
if (window.Capacitor && window.Capacitor.isNativePlatform()) {
  // Hide status bar or style it
  import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
    StatusBar.setStyle({ style: Style.Light });
    StatusBar.setBackgroundColor({ color: '#0B2447' });
  });
}
```

---

## 🧪 Testing checklist

Before considering it "done", verify on real device:

- [ ] App icon shows correctly on home screen
- [ ] Splash screen appears for 1-2 seconds on launch
- [ ] Landing page loads (online — needs internet)
- [ ] SDK status badge shows green "Webex SDK: ready"
- [ ] Clicking "Speak to concierge" → mic permission prompt appears
- [ ] After granting → call modal shows "Connecting" → "Reaching front desk" → "Connected · 00:01"
- [ ] Audio is audible (both directions — say "test test", verify Auto Attendant responds)
- [ ] Mute button works
- [ ] End call button closes modal + ends call (verify in Webex Control Hub call logs)
- [ ] No crashes when switching apps and coming back
- [ ] Works on cellular data (not just WiFi)

---

## 🔧 Troubleshooting

### "Could not start audio source" on Android

**Cause**: Microphone permission not granted at OS level.

**Fix**:
1. Settings → Apps → Hotel Nusantara → Permissions → Microphone → Allow
2. Restart app

### iOS: "The operation was aborted" when starting call

**Cause**: Either iOS 15-16 bug, or `Info.plist` missing `NSMicrophoneUsageDescription`, or app loaded from non-HTTPS scheme.

**Fix in order**:
1. Verify `Info.plist` has `NSMicrophoneUsageDescription` key
2. Verify `capacitor.config.json` has `"iosScheme": "https"`
3. Upgrade test device to iOS 17+
4. Apply WebViewDelegationHandler.swift patch (see Phase 4 step 4)

### App opens then immediately closes (Android)

**Cause**: Usually a JavaScript error during page init.

**Fix**:
1. Connect device via USB
2. Open Chrome browser → `chrome://inspect` → find your app's WebView → click "inspect"
3. DevTools opens — check Console tab for red errors
4. Fix the JS error in your `public/` files
5. `npx cap sync android` and rebuild

### App works on WiFi but not on cellular

**Cause**: Carrier blocking WebRTC ports (rare but happens).

**Fix**: Test on different carrier. This is outside your control — Webex Cloud uses standard STUN/TURN, so most carriers allow it.

### "Not allowed by the user agent" error

**Cause**: HTTPS not actually being served.

**Fix**: Open WebView DevTools (Chrome inspect or Safari Web Inspector), check `window.location.protocol`. Should be `https:`. If it's `capacitor:` or `http:`, your `capacitor.config.json` scheme settings aren't being applied. Re-run `npx cap sync` and rebuild from scratch.

### Capacitor plugin "X" not found

**Cause**: Plugin installed in `node_modules` but not synced to native projects.

**Fix**:
```bash
npx cap sync
```

Always run after installing any `@capacitor/*` package.

---

## 📦 Distribution for internal demo

### Android: Sideload APK

1. Copy `app-debug.apk` to a shared drive / cloud (Google Drive, Dropbox)
2. Recipient downloads on Android device
3. Open file manager → tap APK → "Install"
4. May need to enable "Install from unknown sources" first (Settings → Security)

### iOS: Distribution options

**Option 1 — TestFlight (recommended)**:
- Requires paid Apple Developer Program ($99/year)
- Upload via Xcode → TestFlight
- Invite up to 10,000 testers via email
- Apps expire after 90 days (need re-upload)

**Option 2 — Ad-hoc IPA install**:
- Requires paid Apple Developer Program
- Add target devices' UDIDs to your provisioning profile (max 100/year)
- Archive in Xcode → Distribute → Ad Hoc → Save IPA
- Install via Apple Configurator 2 or Diawi.com

**Option 3 — Direct from Xcode (simplest, free)**:
- Free Apple ID works
- Connect device via cable, install via Xcode "Run"
- Limits: app expires every 7 days, max 3 apps per Apple ID, requires re-build to renew
- Good for: your own demo on your own device

---

## 🚨 Production considerations (read before publishing publicly)

This guide assumes **internal demo distribution only**. If you ever want to publish to Play Store / App Store, address these first:

### App Store rejection risk

Apple Guideline 4.2 (Minimum Functionality) explicitly states apps that are "primarily a marketing materials or web view" will be rejected. To pass review:

- Add at least **one substantial native feature** (push notifications, biometric login, calendar integration, offline support, native UI elements)
- Justify why this can't be a website (e.g., "needed for VoIP call quality" — defensible)
- Consider building a thin React Native shell with WebView as one screen, plus native screens for booking confirmation, profile, etc.

### Webex Calling SDK stability

The Click-to-Call API is **still in beta** (as of late 2025). Production app risks:

- SDK API may change → broken calls in shipped app
- Service App tokens expire every 14 days → need refresh token rotation
- No SLA from Cisco for beta features

**For production**: migrate to [Webex Mobile SDK](https://developer.webex.com/docs/sdks/webex-calling-sdk) (native iOS/Android), which is stable and supports CallKit/ConnectionService integration.

### Privacy & compliance

- Add Privacy Policy URL in app store listings
- For EU users: GDPR consent before any tracking
- For Indonesia: comply with UU 27/2022 (already mentioned in app footer, but production needs more — actual data processing agreement, retention policy, user rights)
- Audio call recording (if added later) requires explicit consent + secure storage

### Code signing & certificates

- Android: generate proper release keystore (NOT the debug.keystore), store securely
- iOS: enroll in Apple Developer Program, manage signing certificates and provisioning profiles
- Both: never commit signing credentials to git

### Update strategy

Once an APK/IPA is installed on a device, fixing bugs requires either:
- Pushing a new APK/IPA (user must reinstall)
- Or, if Option B (live URL) was used: just update Netlify, app auto-reflects on next open

Live URL approach is much more flexible — recommended for early iterations.

---

## 📚 References

- [Capacitor official docs](https://capacitorjs.com/docs)
- [Capacitor WebRTC discussion thread](https://forum.ionicframework.com/t/use-getusermedia-in-capacitor/218807)
- [iOS WKWebView mic permission patch](https://forum.ionicframework.com/t/prevent-for-reprompting-webrtc-webview-permissions-ios15/215240/2)
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [Webex Calling Mobile SDK (for native upgrade path)](https://developer.webex.com/docs/sdks/webex-calling-sdk)

---

## ⏱️ Estimated time

| Task | Time |
|---|---|
| Capacitor setup + first APK build | 30-60 min |
| iOS build (first time) | 1-2 hours (Xcode setup, signing) |
| Icons + splash | 15-30 min (depends on design assets) |
| Testing + fixes | 1-2 hours |
| **Total** | **3-5 hours for both platforms** |

Much faster than the 2-4 weeks for proper native SDK implementation.
