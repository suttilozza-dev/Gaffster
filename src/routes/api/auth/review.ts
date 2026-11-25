import { createFileRoute } from '@tanstack/react-router'
import { sessionCookie } from '#/lib/server/session'
import { SITE_URL, optionalEnv } from '#/lib/server/env'
import { REVIEWER_USERNAME, REVIEWER_USER_ID } from '#/lib/server/plans'

const enc = new TextEncoder()
/** Compare two strings without leaking where they differ (both are hashed first, so lengths do not matter). */
async function same(a: string, b: string): Promise<boolean> {
  const [x, y] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))])
  const p = new Uint8Array(x), q = new Uint8Array(y)
  let d = 0
  for (let i = 0; i < p.length; i++) d |= p[i] ^ q[i]
  return d === 0
}

const go = (path: string, cookie?: string) => {
  const h = new Headers({ Location: SITE_URL + path })
  if (cookie) h.append('Set-Cookie', cookie)
  return new Response(null, { status: 303, headers: h })
}

/**
 * Reviewer sign-in (form POST from /review). Only the built-in reviewer account can sign in here, and only while the
 * REVIEW_PASSWORD secret is set. See REVIEWER_USERNAME in src/lib/server/plans.ts.
 */
// The `server` option's types come from TanStack Start; the cast keeps this file independent of its type augmentation.
export const Route = createFileRoute('/api/auth/review')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const secret = optionalEnv('REVIEW_PASSWORD')
        if (!secret) return new Response('Not found', { status: 404 })
        const form = await request.formData().catch(() => null)
        const username = String(form?.get('username') ?? '').trim()
        const password = String(form?.get('password') ?? '')
        const ok = (await same(username, REVIEWER_USERNAME)) && (await same(password, secret))
        if (!ok) {
          await new Promise((r) => setTimeout(r, 800)) // slow down guessing
          return go('/review?failed=1')
        }
        return go('/board?signin=ok', await sessionCookie(REVIEWER_USER_ID, 'App reviewer'))
      },
    },
  },
} as never)
