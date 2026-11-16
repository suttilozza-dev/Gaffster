import { createFileRoute } from '@tanstack/react-router'
import { founderSold } from '#/lib/server/db'
import { FOUNDER } from '#/lib/config'

const json = (b: unknown, status = 200, cache = 'public, max-age=60') => new Response(JSON.stringify(b), { status, headers: { 'content-type': 'application/json', 'cache-control': cache } })

/** How many Founder Lifetime places are left. The pricing card hides the buy button when none are. */
// The `server` option's types come from TanStack Start; the cast keeps this file independent of its type augmentation.
export const Route = createFileRoute('/api/founder')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const sold = await founderSold(FOUNDER.variant, FOUNDER.onSaleFrom)
          return json({ cap: FOUNDER.cap, sold, left: Math.max(0, FOUNDER.cap - sold), soldOut: sold >= FOUNDER.cap })
        } catch {
          return json({ error: 'unavailable' }, 503, 'no-store')
        }
      },
    },
  },
} as never)
