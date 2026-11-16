import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '#/components/LegalPage'
import text from '#/content/legal/privacy.md?raw'

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [{ title: 'Privacy notice · Gaffster' }] }),
  component: () => <LegalPage markdown={text} />,
})
