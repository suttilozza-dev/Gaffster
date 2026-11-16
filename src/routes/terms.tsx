import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '#/components/LegalPage'
import text from '#/content/legal/terms.md?raw'

export const Route = createFileRoute('/terms')({
  head: () => ({ meta: [{ title: 'Terms of use · Gaffster' }] }),
  component: () => <LegalPage markdown={text} />,
})
