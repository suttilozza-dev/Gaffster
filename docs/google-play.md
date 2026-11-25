# Gaffster on Google Play (stage 1: no purchases in the app)

The Android app is gaffster.app packaged as a Trusted Web Activity (TWA): the app opens the website full screen in Chrome,
with no address bar. All features come from the website, so every deploy updates the app too.

Stage 1 sells nothing inside the app. People sign in with Whop and use any plan they already have. Google requires such an
app to show no prices, buy buttons or prompts to buy elsewhere, so the site has an "app mode" (src/lib/appMode.ts) that
hides them when it is opened from the app. Stage 2 will add Google Play Billing.

## How the app turns app mode on

The app must open **https://gaffster.app/board?app=android**. The `?app=android` part switches app mode on for that app
session. Do not put it in public/manifest.webmanifest: that would also hide prices for people who add the website to
their home screen from a browser.

## 1. Build the app files (PWABuilder)

1. Go to https://www.pwabuilder.com and enter `https://gaffster.app`.
2. Choose **Package for stores**, then **Android**, then **Generate Package** with these options (Options / All settings):
   - Package ID: `app.gaffster.twa` (this can never be changed once the app is on Google Play)
   - App name: `Gaffster`; Launcher name: `Gaffster`
   - Start URL: `/board?app=android`
   - Display mode: Standalone. Status bar and navigation colour: `#0A1020`
   - Signing key: **Create new**. Fill in your name and location.
3. Download the zip. It contains:
   - an `.aab` file: this is what you upload to Google Play;
   - an `.apk` file: install this on your own phone to test;
   - `signing.keystore` and `signing-key-info.txt`: **keep both safe and private** (password manager plus a backup
     outside OneDrive). Without them you cannot publish updates;
   - `assetlinks.json`: send its fingerprint (the long `sha256_cert_fingerprints` value) to Build.

### Fingerprints in public/.well-known/assetlinks.json

| Key | SHA-256 fingerprint | Added |
| --- | --- | --- |
| Upload key (PWABuilder, 24 Nov 2026; CN=Laurence Sutcliffe, O=Gaffster, C=NZ) | `9E:1F:67:C7:13:51:E0:E3:69:50:9F:F8:CE:84:6F:46:08:BE:0C:93:FD:11:03:87:1C:26:79:90:DE:98:DE:09` | Yes |
| Google Play app signing key (Play Console → Protected with Play → Play App Signing) | `F0:8D:0B:6F:5D:5A:01:4B:49:86:74:24:08:36:3C:FF:5C:AD:9C:C8:EB:0E:DE:9C:E6:00:53:10:FE:EC:6A:5C` | Yes (25 Nov 2026) |
| Second certificate shown in Play Console (to be confirmed which) | `E9:3E:08:77:5A:30:76:47:18:7D:CD:90:18:3D:42:12:E0:61:2F:68:D3:C0:F7:6C:54:4F:6A:28:D8:8D:1B:68` | Yes (25 Nov 2026); remove once confirmed unneeded |

### Rebuilding the app (new icons, new version)

The app's icon and name are built into the app file, so after changing them on the site, build a new package in
PWABuilder. Use the same settings as before, plus:

- Version: raise both numbers (for example version name `1.0.1`, version code `2`). Google Play refuses an upload whose
  version code is not higher than the last one.
- Signing key: **Use mine**. Upload `signing.keystore` and type the key alias and the two passwords from
  `signing-key-info.txt`. Never choose "New" again: a new key gives a new fingerprint, and Google Play will refuse the
  update.
- Icon URL `https://gaffster.app/brand/icon-512.png`, maskable icon URL `https://gaffster.app/brand/icon-maskable-512.png`,
  monochrome icon URL `https://gaffster.app/brand/icon-monochrome-512.png`.

## 2. Test on your phone

Copy the `.apk` to your Android phone and open it (allow "install unknown apps" for your file manager when asked).

If Android says the install is **blocked by Advanced Protection**, the phone has Android's Advanced Protection mode on,
which stops all installs from outside Google Play. Rather than turning that protection off, test through Google Play
instead: upload the `.aab` to the **Internal testing** track in Play Console, add your own Google account as a tester, and
install from the opt-in link. Internal testing is available straight away and is not affected by the 12-tester rule.

Until the fingerprint is in `public/.well-known/assetlinks.json` on the live site, the app shows a browser address bar
at the top. That is expected. Once Build adds the fingerprint and the site is deployed, the bar disappears.

Check: no prices or buy buttons anywhere, sign in with Whop works and comes back to the board, saved line-ups load (if
your plan has them), and downloading and sharing an image works.

## 3. Google Play Console

1. Create the app in Play Console (name Gaffster, free app, app not game).
2. Upload the `.aab` to the **Closed testing** track (personal accounts need at least 12 testers opted in for 14 days in
   a row before production; see Google's "App testing requirements for new personal developer accounts").
3. Google re-signs the app ("Play App Signing"). In Play Console go to **Test and release → App integrity → App signing**
   and copy the **App signing key certificate SHA-256 fingerprint**. Send it to Build too: assetlinks.json needs both
   fingerprints (yours from PWABuilder for the test `.apk`, and Google's for the Play version).
4. Store listing: privacy policy URL `https://gaffster.app/privacy`; complete the Data safety form, content rating and
   target audience (13+).

## Known review risks

- The Terms page lists plan prices and says Whop takes payments. It is reachable from the footer in the app. Legal pages
  are usually acceptable, but a reviewer could object; if so, Build can hide the price table in app mode.
- "Sign in with Whop" opens whop.com. If Whop's sign-in page shows anything for sale, a reviewer could object.
