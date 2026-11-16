/**
 * Consent for Whop's measurement pixel.
 *
 * Whop's hosting adds its own pixel script to every page (<script data-whop-pixel="platform">, end of <head>). That script
 * only loads the pixel when `window.whop` does not exist yet; if it does, it just stores its settings in `window.whop.c`.
 * CONSENT_HEAD_SCRIPT runs earlier in <head> and, unless the visitor has agreed, puts a placeholder `window.whop` in place,
 * so nothing is loaded and no tracking cookie is set. When the visitor agrees, loadWhopPixel() removes the placeholder and
 * loads the pixel with Whop's own snippet. The choice is remembered in localStorage under CONSENT_KEY.
 */

export const CONSENT_KEY = 'mdxi_consent'
export type Consent = 'yes' | 'no'

/** Whop business id the pixel reports to (the same scope Whop's platform snippet uses). */
const WHOP_SCOPE = 'biz_1DA89Rn6FlaXXk'

const WHOP_SNIPPET = `!function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");`

/** Runs in <head> before Whop's platform script. Must stay tiny and must not throw. */
export const CONSENT_HEAD_SCRIPT = `(function(){var c=null;try{c=localStorage.getItem(${JSON.stringify(CONSENT_KEY)})}catch(e){}if(c!=='yes'&&!window.whop){window.whop={c:{},consentPending:true}}})();`

/** Cookies and storage the Whop pixel writes (seen in a browser on 16 Nov 2026). Cleared when consent is withdrawn. */
const PIXEL_COOKIES = ['_wuid', '_wuid_link', '_wuid_link_seen', '_wpd', '_wsc', 'whop_verify', 'whop_verify_expires_at']
const PIXEL_STORAGE = ['_wuid', '_wfp', '_wsc_probed_at', '_wsc_probed', '_wuid_link_seen']

type WhopGlobal = { c?: Record<string, unknown>; consentPending?: boolean; setScope?: (...s: string[]) => void; track?: (...a: unknown[]) => void }
const w = () => window as unknown as { whop?: WhopGlobal }

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    return v === 'yes' || v === 'no' ? v : null
  } catch {
    return null
  }
}

function saveConsent(v: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, v)
  } catch {
    /* storage blocked: the banner will simply ask again next time */
  }
}

/** Load the pixel now (after the visitor agreed on this page). Does nothing if it is already running. */
function loadWhopPixel() {
  const cur = w().whop
  if (cur && !cur.consentPending) return
  const settings = cur?.c ?? {}
  delete w().whop
  // Whop's own pixel snippet, exactly as Whop publishes it, run as an inline script.
  const el = document.createElement('script')
  el.text = WHOP_SNIPPET
  document.head.appendChild(el)
  const whop = w().whop
  if (!whop) return
  whop.c = settings
  whop.setScope?.(WHOP_SCOPE)
  whop.track?.('page')
}

function clearPixelData() {
  const host = location.hostname
  const parts = host.split('.')
  const domains = [''].concat(parts.map((_, i) => '; domain=.' + parts.slice(i).join('.')).filter((d) => d.split('.').length > 2))
  for (const name of PIXEL_COOKIES) for (const d of domains) document.cookie = `${name}=; path=/; max-age=0${d}`
  for (const k of PIXEL_STORAGE) {
    try { localStorage.removeItem(k) } catch { /* ignore */ }
    try { sessionStorage.removeItem(k) } catch { /* ignore */ }
  }
}

export function acceptMeasurement() {
  saveConsent('yes')
  loadWhopPixel()
}

/** Refuse (or withdraw) consent. If the pixel was already running on this page, reload so it stops. */
export function rejectMeasurement() {
  const wasRunning = !!w().whop && !w().whop!.consentPending
  saveConsent('no')
  clearPixelData()
  if (wasRunning) location.reload()
}

/** The footer's "Cookie settings" link fires this to show the banner again. */
export const OPEN_SETTINGS_EVENT = 'gaffster:cookie-settings'
