/** Saved line-ups on the account (Plus, Creator and Founder). See src/routes/api/lineups.ts. */

export type SavedLineup = { id: number; name: string; gameweek: string | null; data: string; updated_at: string }
export type LineupsResult = { ok: true; lineups: SavedLineup[] } | { ok: false; error: 'signed_out' | 'plan' | 'full' | 'invalid' | 'unavailable' }

async function call(init?: RequestInit, query = ''): Promise<LineupsResult> {
  try {
    const r = await fetch('/api/lineups' + query, { credentials: 'same-origin', ...init })
    const b = (await r.json().catch(() => ({}))) as { lineups?: SavedLineup[]; error?: string }
    if (r.ok && b.lineups) return { ok: true, lineups: b.lineups }
    const e = b.error
    return { ok: false, error: e === 'signed_out' || e === 'plan' || e === 'full' || e === 'invalid' ? e : 'unavailable' }
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}

export const fetchLineups = () => call()
export const saveLineupToAccount = (name: string, gameweek: string, data: string) =>
  call({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, gameweek, data }) })
export const deleteLineupFromAccount = (id: number) => call({ method: 'DELETE' }, `?id=${id}`)
