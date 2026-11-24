import { useEffect, useState } from 'react'

/**
 * "App mode": the site running inside the Google Play app (a Trusted Web Activity).
 *
 * Google Play only allows an app with no purchases inside it if the app sells nothing and does not point people towards
 * buying elsewhere. So in app mode every price, buy button and "get a plan" prompt is hidden. Signed-in people still get
 * whatever plan they already have.
 *
 * The app opens /board?app=android (its start URL). APP_MODE_HEAD_SCRIPT runs first in <head>: it remembers app mode for
 * this tab in sessionStorage (so it survives moving between pages, but does not leak into ordinary Chrome browsing, which
 * shares localStorage with the app) and sets <html data-app="android"> before anything is drawn, so prices never flash.
 * CSS: `.app-hide` is hidden in app mode, `.app-only` is shown only in app mode (see styles.css).
 */
export const APP_MODE_KEY = 'mdxi_app'

export const APP_MODE_HEAD_SCRIPT = `(function(){try{var q=new URLSearchParams(location.search).get('app');var r=document.referrer||'';if(q==='android'||r.indexOf('android-app://')===0){sessionStorage.setItem(${JSON.stringify(APP_MODE_KEY)},'android')}if(sessionStorage.getItem(${JSON.stringify(APP_MODE_KEY)})==='android'){document.documentElement.setAttribute('data-app','android')}}catch(e){}})();`

export function inApp(): boolean {
  return typeof document !== 'undefined' && document.documentElement.getAttribute('data-app') === 'android'
}

/** True inside the Android app (false during server rendering and until the page has loaded). */
export function useInApp(): boolean {
  const [app, setApp] = useState(false)
  useEffect(() => setApp(inApp()), [])
  return app
}
