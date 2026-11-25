import { Link, createFileRoute } from '@tanstack/react-router'
import { HeaderLogo } from '#/components/Logo'

/** Sign-in page for app store reviewers (Google Play). Not linked from the website; in the app it is in the footer. */
export const Route = createFileRoute('/review')({
  head: () => ({ meta: [{ title: 'Reviewer sign-in · Gaffster' }, { name: 'robots', content: 'noindex' }] }),
  component: Review,
})

function Review() {
  const failed = typeof location !== 'undefined' && new URLSearchParams(location.search).has('failed')
  return (
    <div>
      <header className="mx-auto max-w-[1100px] px-4 py-5">
        <Link to="/" aria-label="Gaffster home"><HeaderLogo /></Link>
      </header>
      <main className="mx-auto max-w-[420px] px-4 pt-6 pb-16">
        <h1 className="font-display font-bold text-3xl mb-2">Reviewer sign-in</h1>
        <p className="text-sm text-[#A9B4D0] mb-6">For app store reviewers only. Everyone else signs in with Whop on the board.</p>
        <form method="post" action="/api/auth/review" className="flex flex-col gap-3">
          <label className="text-xs text-[#A9B4D0]">Username
            <input className="field mt-1 w-full" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
          </label>
          <label className="text-xs text-[#A9B4D0]">Password
            <input className="field mt-1 w-full" name="password" type="password" autoComplete="current-password" required />
          </label>
          {failed && <p className="text-sm text-[#FF8A8A]" role="alert">That username or password is not right.</p>}
          <button className="btn btn-lime mt-2" type="submit">Sign in</button>
        </form>
      </main>
    </div>
  )
}
