# Google Play: store listing and app content answers

Everything Play Console asks for under **Dashboard → Finish setting up your app**, ready to paste or upload. Files in this
folder:

| File | Where it goes in Play Console | Play's rule |
| --- | --- | --- |
| `app-icon-512.png` | Store listing → App icon | 512 × 512 PNG |
| `feature-graphic.png` | Store listing → Feature graphic | 1024 × 500 PNG or JPEG |
| `phone-1-home.png` … `phone-4-squad.png` | Store listing → Phone screenshots (in that order) | 2 to 8, 9:16, 1080 × 1920 |

The screenshots are taken in app mode: no prices or buy buttons, as Google requires for an app that sells nothing.

The answers below are drafted from what the code does. **Read each one before submitting**: they are statements you
make to Google, and the data safety answers in particular should be checked against the Privacy page.

---

## 1. Store listing (Grow users → Store presence → Main store listing)

**App name** (max 30): `Gaffster: Football Line-ups`

**Short description** (max 80):

```
Pick your XI, set the formation and share your line-up as an image.
```

**Full description** (max 4000):

```
Pick your XI. Share it before kick-off.

Gaffster is a football line-up maker. Choose a club, pick a formation and drag your players into place, then download or share your predicted XI, starting line-up or dream team as an image, ready for your group chat or socials.

• All 20 Premier League clubs, with 2026/27 squads
• Every common formation, from 4-3-3 and 4-2-3-1 to back threes
• Drag players anywhere, swap them, name a captain and set the manager
• A dugout for your substitutes
• Home, away and third kits, shirt or dot markers, and stadium styles
• Home v Away mode to put two teams on one pitch
• Gameweek and label (Predicted XI, Starting XI or My XI) printed on the image
• Square and 4:5 images, plus story, header and banner sizes on supported plans
• Your last line-up is kept for next time

Your first image needs no sign-up. Sign in with Whop for more images every week, and to use any Gaffster plan you already have.

Gaffster is an independent fan tool. It is not affiliated with, endorsed by or connected to the Premier League, any football club or any player. No club crests, badges or player photographs are used. Squad lists may be out of date.
```

**Graphics:** app icon, feature graphic and the four phone screenshots from this folder. Tablet screenshots are optional;
skip them for now.

**Foldable screenshots** (optional), in `foldable/`, in Google's required shapes, showing the real app in app mode:
`fold-1-square-unfolded.png` (1:1, unfolded), `fold-2-4x3-unfolded.png` (4:3, unfolded) and `fold-3-outer-portrait.png`
(10:16, outer screen). Do not use logo graphics as screenshots: Google requires screenshots to show the app in use.

**Logos as PNG** (for social posts and other uses, not for screenshot slots), in `logos/`: the icon-and-name lockup
(`gaffster-lockup-1800x1720.png`, plus a 1080 square version) and the wordmark (`gaffster-wordmark-1816x640.png`).

---

## 2. Store settings (Grow users → Store presence → Store settings)

- App category: **Sports**
- Tags: pick up to 5 of the closest football or sports tags Play offers (for example Football or Soccer, and Sports).
- Email: `lms.is@pm.me`
- Website: `https://gaffster.app`
- Phone: optional (if you add one it is shown publicly)

---

## 3. App content (Policy and programmes → App content)

### Privacy policy
`https://gaffster.app/privacy`

### Ads
**No, my app does not contain ads.**

### Sign-in details (was "App access")
Google's reviewers cannot create accounts or receive Whop's emailed sign-in codes, so the app has a separate reviewer
sign-in: **Reviewer sign-in** in the footer of the app (only shown inside the Android app), at `https://gaffster.app/review`.
It signs in one built-in reviewer account that has every feature (Creator) without paying.

Before filling this in, set the reviewer password on Whop hosting and deploy (it is switched off until the secret exists).
Make up a long password (20+ characters, letters and numbers) and keep it in your password manager:

```powershell
whop apps secrets set --secret REVIEW_PASSWORD=your-long-password-here
```

Then in Play Console: **Is any part of your app restricted? → Yes → Add details**:

- Name (the 0/60 field at the top): `Gaffster reviewer`
- Username, email address or phone number: `google-play-review`
- Password: the REVIEW_PASSWORD you set
- Any other information required to access your app:

```
Most of Gaffster works without signing in (building line-ups and the first image). To unlock everything, scroll to the bottom of any page in the app and tap "Reviewer sign-in", then enter the username and password above. This signs in a reviewer account with every paid feature (no watermark, all image sizes, saved line-ups). Ordinary users sign in with "Sign in with Whop" at the top of the board; the reviewer sign-in avoids Whop's emailed codes.
```

- Tick **Sign-in details in this declaration provide full access to all the features and content within this app,
  including premium or paid content**.

### Content rating (IARC questionnaire)
- Email: `lms.is@pm.me`. Category: **All other app types**.
- Violence, fear, sexuality, language, controlled substances, crude humour, gambling: **No** to all.
- Does the app allow users to interact or exchange content with each other? **No** (images are shared through other apps,
  not within Gaffster).
- Does the app share the user's current physical location with other users? **No**.
- Does the app allow users to purchase digital goods? **No** (nothing can be bought in the app in stage 1). Change this
  when Google Play Billing is added.
- Is the app a web browser or search engine? **No**.
- Expected result: rated for everyone / PEGI 3 or similar.

### Target audience and content
- Age groups: **13–15, 16–17, 18 and over** (the Terms say 13 or over). Do not tick any under-13 group.
- Could the store listing unintentionally appeal to children? **No**.

### News app: **No**. COVID-19 apps: **not** a COVID app. Government app: **No**. Financial features: **none**.
### Health apps: **none**. Advertising ID: **No** (the app does not use the Android advertising ID).

### Data safety
Draft answers. They follow the Privacy and Cookies pages; check them before submitting.

- Does your app collect or share any of the required user data types? **Yes**
- Is all of the user data collected by your app encrypted in transit? **Yes**
- Do you provide a way for users to request that their data is deleted? **Yes** (by email; delete-account web link:
  `https://gaffster.app/privacy`, section 7 "Your rights")

| Data type (Play's name) | Collected / shared | Optional? | Purposes |
| --- | --- | --- | --- |
| Personal info → **Name** (Whop display name) | Collected, not shared | Optional (only if you sign in) | Account management |
| Personal info → **User IDs** (Whop user ID) | Collected, not shared | Optional | Account management, App functionality |
| Financial info → **Purchase history** (which plan you have, payment reference) | Collected, not shared | Optional | App functionality, Account management |
| App activity → **Other user-generated content** (saved line-ups) | Collected, not shared | Optional | App functionality |
| App activity → **App interactions** (pages visited, via Cloudflare's cookie-free page speed tool; and Whop's measurement if you accept cookies) | Collected; shared with Whop only if you accept measurement cookies | Required for Cloudflare's count, optional for Whop's | Analytics; Advertising or marketing (Whop, with consent) |
| App info and performance → **Diagnostics** (page load timings) | Collected, not shared | Required | Analytics |
| Device or other IDs (Whop's measurement ID, only if you accept cookies) | Collected and shared with Whop | Optional | Analytics, Advertising or marketing |

Notes: Whop handles sign-in and payment as a service provider, which Google does not count as "sharing". Whop's
measurement pixel only runs after a visitor chooses Accept on the cookie banner, which also appears in the app.
