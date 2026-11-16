import { createFileRoute } from '@tanstack/react-router'
import { LINEUP_LIMIT, deleteLineup, getEntitlement, listLineups, saveLineup } from '#/lib/server/db'
import { getSession } from '#/lib/server/session'
import { CAPS } from '#/lib/credits'

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })

/** The signed-in account, if its plan includes saved line-ups (Plus, Creator, Founder). Otherwise an error response. */
async function owner(request: Request): Promise<string | Response> {
  const s = await getSession(request)
  if (!s) return json({ error: 'signed_out' }, 401)
  const e = await getEntitlement(s.uid)
  if (!CAPS[e.tier].saveLineups) return json({ error: 'plan' }, 403)
  return s.uid
}

/**
 * Saved line-ups for the signed-in account.
 * GET: the list. POST { name, gameweek, data }: save (the same name replaces). DELETE ?id=: remove one.
 */
// The `server` option's types come from TanStack Start; the cast keeps this file independent of its type augmentation.
export const Route = createFileRoute('/api/lineups')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const uid = await owner(request)
          if (uid instanceof Response) return uid
          return json({ limit: LINEUP_LIMIT, lineups: await listLineups(uid) })
        } catch {
          return json({ error: 'unavailable' }, 503)
        }
      },
      POST: async ({ request }: { request: Request }) => {
        try {
          const uid = await owner(request)
          if (uid instanceof Response) return uid
          const b = (await request.json().catch(() => null)) as { name?: unknown; gameweek?: unknown; data?: unknown } | null
          const name = typeof b?.name === 'string' ? b.name.trim().slice(0, 60) : ''
          const gameweek = typeof b?.gameweek === 'string' ? b.gameweek.slice(0, 6) : ''
          const data = typeof b?.data === 'string' ? b.data : ''
          if (!name || !data || data.length > 10000 || !/^[A-Za-z0-9_-]+$/.test(data)) return json({ error: 'invalid' }, 400)
          const r = await saveLineup(uid, name, gameweek, data)
          if (r === 'full') return json({ error: 'full', limit: LINEUP_LIMIT }, 409)
          return json({ ok: true, lineups: await listLineups(uid) })
        } catch {
          return json({ error: 'unavailable' }, 503)
        }
      },
      DELETE: async ({ request }: { request: Request }) => {
        try {
          const uid = await owner(request)
          if (uid instanceof Response) return uid
          const id = Number(new URL(request.url).searchParams.get('id'))
          if (!Number.isInteger(id) || id <= 0) return json({ error: 'invalid' }, 400)
          await deleteLineup(uid, id)
          return json({ ok: true, lineups: await listLineups(uid) })
        } catch {
          return json({ error: 'unavailable' }, 503)
        }
      },
    },
  },
} as never)
