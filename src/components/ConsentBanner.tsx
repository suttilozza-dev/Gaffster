import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { OPEN_SETTINGS_EVENT, acceptMeasurement, readConsent, rejectMeasurement } from '#/lib/consent'

/**
 * Asks once whether Whop may measure visits. Shown until the visitor chooses; "Cookie settings" in the footer shows it
 * again. Accept and Reject are equally easy, and nothing is loaded before Accept (see src/lib/consent.ts).
 */
export function ConsentBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (readConsent() === null) setOpen(true)
    const show = () => setOpen(true)
    addEventListener(OPEN_SETTINGS_EVENT, show)
    return () => removeEventListener(OPEN_SETTINGS_EVENT, show)
  }, [])

  if (!open) return null
  return (
    <div role="dialog" aria-modal="false" aria-labelledby="consent-title" className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4">
      <div className="panel mx-auto max-w-[760px] p-4 flex flex-col gap-3" style={{ background: '#0F1730', boxShadow: '0 -10px 40px rgba(0,0,0,.5)' }}>
        <div id="consent-title" className="font-display tracking-widest text-sm">Cookies</div>
        <p className="text-sm text-[#A9B4D0]">
          Gaffster works without tracking. Our host, Whop, can also count visits and measure which links and adverts bring
          people here, using cookies and details of your device. We only switch that on if you agree. You can change your
          mind at any time with Cookie settings at the bottom of the page.{' '}
          <Link to="/cookies" className="text-[#C8FF3D] underline">Read about cookies</Link>
        </p>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-ghost" onClick={() => { acceptMeasurement(); setOpen(false) }}>Accept</button>
          <button className="btn btn-ghost" onClick={() => { rejectMeasurement(); setOpen(false) }}>Reject</button>
        </div>
      </div>
    </div>
  )
}
