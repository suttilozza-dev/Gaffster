import { useEffect, useState } from 'react'
import { renderCard, CARD_SIZES, type CardFormat } from '#/lib/pitch'
import { sampleCardInput } from '#/lib/sampleCard'

/** Four example cards: different clubs, formations and image sizes. */
const EXAMPLES: { club: string; formation: string; format: CardFormat; size: string }[] = [
  { club: 'Arsenal', formation: '4-3-3', format: 'square', size: 'Square' },
  { club: 'Newcastle United', formation: '4-2-3-1', format: 'portrait', size: 'Portrait 4:5' },
  { club: 'Brighton and Hove Albion', formation: '3-4-2-1', format: 'story', size: 'Story 9:16' },
  { club: 'Aston Villa', formation: '4-4-2', format: 'banner', size: 'Banner 16:9' },
]

const SHADOW = '0 18px 50px rgba(0,0,0,.55), 0 0 0 1px rgba(200,255,61,.35)'

/**
 * The example cards are drawn in the visitor's browser by the same code as a real export (renderCard), so they always
 * show the current squads and kits. A placeholder of the right shape shows until each one is ready.
 */
export function ExampleCards() {
  const [urls, setUrls] = useState<(string | null)[]>(() => EXAMPLES.map(() => null))
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    let dead = false
    const made: string[] = []
    ;(async () => {
      for (let k = 0; k < EXAMPLES.length; k++) {
        const e = EXAMPLES[k]
        try {
          const blob = await renderCard(sampleCardInput(e.club, e.formation, e.format))
          if (dead) return
          const url = URL.createObjectURL(blob)
          made.push(url)
          setUrls((u) => u.map((x, i) => (i === k ? url : x)))
        } catch {
          /* leave the placeholder if a card fails to draw */
        }
        await new Promise((r) => setTimeout(r, 40)) // keep the page responsive between cards
      }
    })()
    return () => {
      dead = true
      made.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  useEffect(() => {
    if (open == null) return
    const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape') setOpen(null) }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [open])

  const tile = (k: number) => {
    const e = EXAMPLES[k]
    const [w, h] = CARD_SIZES[e.format]
    const url = urls[k]
    const label = `${e.club} · ${e.formation} · ${e.size}`
    return (
      <figure key={e.format} className="m-0 flex flex-col gap-1.5 min-w-0">
        <button
          type="button"
          className="block w-full rounded-xl overflow-hidden"
          style={{ aspectRatio: `${w} / ${h}`, boxShadow: SHADOW, background: '#0A1020', cursor: url ? 'zoom-in' : 'default' }}
          disabled={!url}
          aria-label={`Show the full-size example: ${label}`}
          onClick={() => setOpen(k)}
        >
          {url && <img src={url} alt={`Example line-up card: ${e.club} in a ${e.formation}, ${e.size}`} width={w} height={h} className="w-full h-full block" />}
        </button>
        <figcaption className="font-display text-[10px] sm:text-[11px] tracking-widest text-[#A9B4D0] leading-tight">
          {e.club}<br />{e.formation} · {e.size}
        </figcaption>
      </figure>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[460px]">
      <div className="grid grid-cols-3 gap-3 items-end">
        {tile(0)}
        {tile(1)}
        {tile(2)}
      </div>
      <div className="mt-4">{tile(3)}</div>

      {open != null && urls[open] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${EXAMPLES[open].club} · ${EXAMPLES[open].formation} · ${EXAMPLES[open].size}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(5,8,16,.88)' }}
          onClick={() => setOpen(null)}
        >
          <img src={urls[open]!} alt="" className="max-w-full max-h-full rounded-xl" style={{ boxShadow: SHADOW }} />
          <button type="button" className="chip absolute top-4 right-4" aria-label="Close" onClick={() => setOpen(null)}>✕</button>
        </div>
      )}
    </div>
  )
}
