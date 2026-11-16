import { Link } from '@tanstack/react-router'
import { OPEN_SETTINGS_EVENT } from '#/lib/consent'

const LINK = 'text-[#A9B4D0] hover:text-[#C8FF3D] underline-offset-4 hover:underline'

/** Footer links shown on every page (rendered once, in the root layout). */
export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-[1100px] px-4 pb-10 pt-4">
      <nav aria-label="Legal and contact" className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <Link to="/terms" className={LINK}>Terms</Link>
        <Link to="/privacy" className={LINK}>Privacy</Link>
        <Link to="/cookies" className={LINK}>Cookies</Link>
        <Link to="/refunds" className={LINK}>Refunds</Link>
        <a href="mailto:lms.is@pm.me" className={LINK}>Contact</a>
        <button type="button" className={LINK} onClick={() => dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}>Cookie settings</button>
      </nav>
      <p className="mt-3 text-xs text-[#A9B4D0]">gaffster.app</p>
    </footer>
  )
}
