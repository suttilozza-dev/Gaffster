import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '#/components/LegalPage'
import text from '#/content/legal/cookies.md?raw'

export const Route = createFileRoute('/cookies')({
  head: () => ({ meta: [{ title: 'Cookies · Gaffster' }] }),
  component: () => <LegalPage markdown={text} />,
})
