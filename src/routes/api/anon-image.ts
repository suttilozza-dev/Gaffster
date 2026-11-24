import { createFileRoute } from '@tanstack/react-router'
import { countAnonImage } from '#/lib/server/db'

/**
 * Counts one free first image made without signing in. Stores only today's date and a running total
 * (anon_images_day): the request's cookies, IP address and headers are not read or stored.
 */
// The `server` option's types come from TanStack Start; the cast keeps this file independent of its type augmentation.
export const Route = createFileRoute('/api/anon-image')({
  server: {
    handlers: {
      POST: async () => {
        try {
          await countAnonImage()
        } catch {
          /* counting is best effort */
        }
        return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } })
      },
    },
  },
} as never)
