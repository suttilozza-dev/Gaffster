import { createFileRoute } from '@tanstack/react-router'
import { unwrapWebhook } from '@whop/sdk/helpers'
import { markDisputed, markRefunded, recordGrant } from '#/lib/server/db'
import { env } from '#/lib/server/env'
import { VARIANT_PLANS } from '#/lib/server/plans'

type Event = { type: string; data: any }

/**
 * Whop calls this when a payment succeeds, on refunds and on bank disputes. The signature is checked before anything is trusted.
 * In the Whop dashboard the webhook must be subscribed to payment.succeeded, refund.created, dispute.created and dispute.updated.
 */
// The `server` option's types come from TanStack Start; the cast keeps this file independent of its type augmentation.
export const Route = createFileRoute('/api/webhooks/whop')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const raw = await request.text()
        let event: Event
        try {
          event = unwrapWebhook<Event>(raw, { headers: Object.fromEntries(request.headers), key: env('WHOP_WEBHOOK_SECRET') })
        } catch {
          return new Response('bad signature', { status: 400 })
        }
        // Delivery is at least once. Grants are keyed on payment id, so a repeat delivery changes nothing.
        if (event.type === 'payment.succeeded') {
          const p = event.data
          const plan = VARIANT_PLANS[p?.variant_id as string]
          const userId = p?.user?.id as string | undefined
          if (plan && userId && p?.id) {
            await recordGrant({ paymentId: p.id, userId, planKey: plan.key, variantId: p.variant_id, images: plan.images, days: plan.days })
          }
        } else if (event.type === 'refund.created') {
          const paymentId = (event.data?.payment_id ?? event.data?.payment?.id) as string | undefined
          if (paymentId) await markRefunded(paymentId)
        } else if (event.type === 'dispute.created' || event.type === 'dispute.updated') {
          // Access to the disputed purchase is paused while the dispute is open (needs_response, under_review) and stays
          // paused if it is lost (the money has gone back to the buyer, as with a refund). It comes back if we win.
          // Early warnings (warning_*), "closed" and "other" change nothing.
          const paymentId = (event.data?.payment?.id ?? event.data?.payment_id) as string | undefined
          const status = event.data?.status as string | undefined
          if (paymentId && (status === 'needs_response' || status === 'under_review' || status === 'lost')) await markDisputed(paymentId, true)
          else if (paymentId && status === 'won') await markDisputed(paymentId, false)
        }
        return new Response('ok', { status: 200 })
      },
    },
  },
} as never)
