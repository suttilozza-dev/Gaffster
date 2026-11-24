import { neon } from '@neondatabase/serverless'
import { env } from './env'
import { OWNER_USER_IDS } from './plans'
import { FREE_PER_WEEK, PASS_PER_DAY } from '../config'

const sql = () => neon(env('DATABASE_URL'))

/** Schema, created on first use (idempotent). */
let ready: Promise<void> | null = null
export function ensureSchema() {
  ready ??= (async () => {
    const q = sql()
    await q`CREATE TABLE IF NOT EXISTS grants (
      id bigserial PRIMARY KEY,
      payment_id text UNIQUE NOT NULL,
      user_id text NOT NULL,
      plan_key text NOT NULL,
      images_total integer,
      images_used integer NOT NULL DEFAULT 0,
      expires_at timestamptz,
      refunded boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    )`
    await q`CREATE INDEX IF NOT EXISTS grants_user_idx ON grants (user_id)`
    // Added 16 Nov 2026: which Whop plan variant was bought (to count Founder sales), and whether the payment is under a
    // bank dispute (access is paused while it is). Existing rows get variant_id NULL and disputed false.
    await q`ALTER TABLE grants ADD COLUMN IF NOT EXISTS variant_id text`
    await q`ALTER TABLE grants ADD COLUMN IF NOT EXISTS disputed boolean NOT NULL DEFAULT false`
    // First free images made without signing in: one running total per UK day. Nothing that identifies a person or a
    // browser is stored here (no user id, IP address, cookie or other identifier), only the date and the count.
    await q`CREATE TABLE IF NOT EXISTS anon_images_day (
      day text PRIMARY KEY,
      images integer NOT NULL DEFAULT 0
    )`
    // Saved line-ups (Plus, Creator and Founder). `data` is the board's own encoded line-up, the same format as a share link.
    await q`CREATE TABLE IF NOT EXISTS saved_lineups (
      id bigserial PRIMARY KEY,
      user_id text NOT NULL,
      name text NOT NULL,
      gameweek text,
      data text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (user_id, name)
    )`
    // The free plan: FREE_PER_WEEK watermarked exports per signed-in account per week, counted here, not in the browser.
    await q`CREATE TABLE IF NOT EXISTS free_usage_week (
      user_id text NOT NULL,
      week text NOT NULL,
      used integer NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, week)
    )`
    // Gameweek Pass: PASS_PER_DAY clean images per account per UK day. A new day starts a new row, so nothing rolls over.
    await q`CREATE TABLE IF NOT EXISTS pass_usage_day (
      user_id text NOT NULL,
      day text NOT NULL,
      used integer NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, day)
    )`
  })().catch((e) => {
    ready = null
    throw e
  })
  return ready
}

export type Tier = 'free' | 'pass' | 'trial' | 'credits' | 'plus' | 'lifetime' | 'creator'

/** Today's date in UK time (e.g. 2026-11-05): the Gameweek Pass daily allowance resets at midnight there. */
export function dayKey(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

/** The week the free allowance resets on: Monday to Sunday, UTC, as e.g. 2026-11-02 (the Monday). */
export function weekKey(now = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}
export type Entitlement = { tier: Tier; remaining: number | null }

type Row = { plan_key: string; images_total: number | null; images_used: number; expires_at: string | null }

export async function getEntitlement(userId: string): Promise<Entitlement> {
  // Owners need no payment record, so this check comes first and works even if the database is down.
  if (OWNER_USER_IDS.includes(userId)) return { tier: 'creator', remaining: null }
  await ensureSchema()
  const rows = (await sql()`SELECT plan_key, images_total, images_used, expires_at FROM grants WHERE user_id = ${userId} AND NOT refunded AND NOT disputed`) as Row[]
  const now = Date.now()
  const live = (r: Row) => !r.expires_at || new Date(r.expires_at).getTime() > now
  if (rows.some((r) => r.plan_key.startsWith('creator') && live(r))) return { tier: 'creator', remaining: null }
  if (rows.some((r) => r.plan_key.startsWith('plus') && live(r))) return { tier: 'plus', remaining: null }
  if (rows.some((r) => r.plan_key === 'lifetime')) return { tier: 'lifetime', remaining: null }
  if (rows.some((r) => r.plan_key === 'pass' && live(r))) {
    const u = (await sql()`SELECT used FROM pass_usage_day WHERE user_id = ${userId} AND day = ${dayKey()}`) as { used: number }[]
    return { tier: 'pass', remaining: Math.max(0, PASS_PER_DAY - (u[0]?.used ?? 0)) }
  }
  const left = (keys: (r: Row) => boolean) => rows.filter(keys).reduce((n, r) => n + Math.max(0, (r.images_total ?? 0) - r.images_used), 0)
  const trial = left((r) => r.plan_key === 'trial')
  const packs = left((r) => r.plan_key.startsWith('pack-'))
  if (trial > 0) return { tier: 'trial', remaining: trial + packs }
  if (packs > 0) return { tier: 'credits', remaining: packs }
  // Bought something, used it all: report the last tier with zero left so the UI says "used up" rather than "free".
  if (rows.some((r) => r.plan_key === 'trial')) return { tier: 'trial', remaining: 0 }
  if (rows.some((r) => r.plan_key.startsWith('pack-'))) return { tier: 'credits', remaining: 0 }
  const used = (await sql()`SELECT used FROM free_usage_week WHERE user_id = ${userId} AND week = ${weekKey()}`) as { used: number }[]
  return { tier: 'free', remaining: Math.max(0, FREE_PER_WEEK - (used[0]?.used ?? 0)) }
}

/** Atomically use one of the signed-in account's free images this week. Returns false once this week's allowance is gone. */
export async function spendFree(userId: string): Promise<boolean> {
  await ensureSchema()
  const r = await sql()`INSERT INTO free_usage_week (user_id, week, used) VALUES (${userId}, ${weekKey()}, 1)
    ON CONFLICT (user_id, week) DO UPDATE SET used = free_usage_week.used + 1 WHERE free_usage_week.used < ${FREE_PER_WEEK}
    RETURNING used`
  return r.length > 0
}

/** Atomically use one of today's Gameweek Pass images. Returns false once today's allowance is gone. */
export async function spendPassDay(userId: string): Promise<boolean> {
  await ensureSchema()
  const r = await sql()`INSERT INTO pass_usage_day (user_id, day, used) VALUES (${userId}, ${dayKey()}, 1)
    ON CONFLICT (user_id, day) DO UPDATE SET used = pass_usage_day.used + 1 WHERE pass_usage_day.used < ${PASS_PER_DAY}
    RETURNING used`
  return r.length > 0
}

/** Atomically take one image from the buyer's oldest usable grant (trial first). Returns false if none left. */
export async function spendOne(userId: string): Promise<boolean> {
  await ensureSchema()
  const r = await sql()`UPDATE grants SET images_used = images_used + 1 WHERE id = (
      SELECT id FROM grants
      WHERE user_id = ${userId} AND NOT refunded AND NOT disputed AND images_total IS NOT NULL AND images_used < images_total
      ORDER BY (plan_key = 'trial') DESC, id
      LIMIT 1 FOR UPDATE SKIP LOCKED
    ) RETURNING id`
  return r.length > 0
}

export async function recordGrant(g: { paymentId: string; userId: string; planKey: string; variantId: string; images: number | null; days: number | null }) {
  await ensureSchema()
  const expires = g.days ? new Date(Date.now() + g.days * 864e5).toISOString() : null
  await sql()`INSERT INTO grants (payment_id, user_id, plan_key, variant_id, images_total, expires_at)
    VALUES (${g.paymentId}, ${g.userId}, ${g.planKey}, ${g.variantId}, ${g.images}, ${expires})
    ON CONFLICT (payment_id) DO NOTHING`
}

/** Pause (or restore) access for a payment under a bank dispute. */
export async function markDisputed(paymentId: string, disputed: boolean) {
  await ensureSchema()
  await sql()`UPDATE grants SET disputed = ${disputed} WHERE payment_id = ${paymentId}`
}

/**
 * Founder Lifetime sales that still count towards the limit (refunded ones do not).
 * Rows recorded before variant_id existed are counted if they are lifetime grants made after Founder went on sale
 * (FOUNDER_ON_SALE_FROM); the retired 30-pound Unlimited plan, also a lifetime grant, was withdrawn at that point.
 */
export async function founderSold(founderVariant: string, onSaleFrom: string): Promise<number> {
  await ensureSchema()
  const r = (await sql()`SELECT count(*)::int AS n FROM grants WHERE plan_key = 'lifetime' AND NOT refunded
    AND (variant_id = ${founderVariant} OR (variant_id IS NULL AND created_at >= ${onSaleFrom}))`) as { n: number }[]
  return r[0]?.n ?? 0
}

export async function markRefunded(paymentId: string) {
  await ensureSchema()
  await sql()`UPDATE grants SET refunded = true WHERE payment_id = ${paymentId}`
}

/** How many line-ups one account can keep. */
export const LINEUP_LIMIT = 20

export type SavedLineup = { id: number; name: string; gameweek: string | null; data: string; updated_at: string }

export async function listLineups(userId: string): Promise<SavedLineup[]> {
  await ensureSchema()
  return (await sql()`SELECT id, name, gameweek, data, updated_at FROM saved_lineups WHERE user_id = ${userId} ORDER BY updated_at DESC`) as SavedLineup[]
}

/** Save a line-up under a name. The same name replaces the earlier save. 'full' when the account already has LINEUP_LIMIT others. */
export async function saveLineup(userId: string, name: string, gameweek: string, data: string): Promise<'saved' | 'full'> {
  await ensureSchema()
  const others = (await sql()`SELECT count(*)::int AS n FROM saved_lineups WHERE user_id = ${userId} AND name <> ${name}`) as { n: number }[]
  if ((others[0]?.n ?? 0) >= LINEUP_LIMIT) {
    const same = (await sql()`SELECT 1 FROM saved_lineups WHERE user_id = ${userId} AND name = ${name}`) as unknown[]
    if (same.length === 0) return 'full'
  }
  await sql()`INSERT INTO saved_lineups (user_id, name, gameweek, data) VALUES (${userId}, ${name}, ${gameweek}, ${data})
    ON CONFLICT (user_id, name) DO UPDATE SET gameweek = EXCLUDED.gameweek, data = EXCLUDED.data, updated_at = now()`
  return 'saved'
}

export async function deleteLineup(userId: string, id: number) {
  await ensureSchema()
  await sql()`DELETE FROM saved_lineups WHERE user_id = ${userId} AND id = ${id}`
}

/** Add one to today's count of free first images made without signing in (UK date). */
export async function countAnonImage() {
  await ensureSchema()
  await sql()`INSERT INTO anon_images_day (day, images) VALUES (${dayKey()}, 1)
    ON CONFLICT (day) DO UPDATE SET images = anon_images_day.images + 1`
}
