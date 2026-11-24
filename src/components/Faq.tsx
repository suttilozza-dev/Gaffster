import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { FREE_PER_WEEK } from '#/lib/config'

/**
 * Landing page FAQ. Each answer describes what the code does today:
 * - free allowance: src/lib/credits.ts and src/lib/server/db.ts (FREE_PER_WEEK, weekKey)
 * - watermark: src/lib/pitch.ts (renderCard) and CAPS in src/lib/credits.ts
 * - lifetime: the same sentence as the Founder card and the Terms
 * - refunds: a summary of /refunds, adding nothing that page does not say
 */
const QA: { q: string; a: ReactNode }[] = [
  {
    q: 'Is it free?',
    a: (
      <>
        Yes. Building line-ups is free, and your first image needs no sign-up. After that, sign in with a free Whop account
        for {FREE_PER_WEEK} watermarked images every week (the week runs Monday to Sunday, UTC). Free images come in square
        and 4:5 sizes. A paid plan gives you images with no watermark and more sizes.
      </>
    ),
  },
  {
    q: 'What is the watermark?',
    a: (
      <>
        On free images, “GAFFSTER · GAFFSTER.APP” is printed faintly in diagonal rows across the whole image. The Gameweek
        Pass, Plus, Creator and Founder Lifetime export without it. Every image also carries a small gaffster.app link in
        the bottom corner, unless you are on Creator and add your own handle in its place.
      </>
    ),
  },
  {
    q: 'Does it work on my phone?',
    a: (
      <>
        Yes, in your phone’s web browser, with nothing to install. Tap a shirt to select it, then pick a player from the
        squad list below the pitch. Drag shirts with your finger to move them, then download your image. If your phone’s
        browser can share files, you also get a Share button that sends the image straight to your apps.
      </>
    ),
  },
  {
    q: 'What does lifetime mean?',
    a: <>Lifetime means for as long as Gaffster runs. It is not a promise that Gaffster will run forever.</>,
  },
  {
    q: 'How do refunds work?',
    a: (
      <>
        Cancelling a Plus or Creator subscription stops future payments, and you keep access until the end of the period
        you have paid for. If a plan does not do what it promises and we cannot fix it within a reasonable time, or you were charged by mistake, we
        refund you. If you change your mind, tell us within 14 days of your first payment for a plan: we refund in full if
        you have not downloaded a paid image.{' '}
        <Link to="/refunds" className="text-[#C8FF3D] underline">Read the full refund rules</Link>.
      </>
    ),
  },
]

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-[1100px] px-4 pb-16 app-hide" aria-labelledby="faq-title">
      <h2 id="faq-title" className="font-display font-bold text-3xl mb-5">Questions</h2>
      <div className="flex flex-col gap-3 max-w-3xl">
        {QA.map(({ q, a }) => (
          <details key={q} className="panel p-4 group">
            <summary className="font-display text-lg cursor-pointer list-none flex items-center justify-between gap-3">
              {q}
              <span aria-hidden="true" className="text-[#C8FF3D] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-[#A9B4D0]">{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
