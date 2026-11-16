import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '#/components/LegalPage'
import text from '#/content/legal/refunds.md?raw'

export const Route = createFileRoute('/refunds')({
  head: () => ({ meta: [{ title: 'Refunds and cancelling · Gaffster' }] }),
  component: () => <LegalPage markdown={text} />,
})
