import { Fragment, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { HeaderLogo } from '#/components/Logo'

/**
 * Renders one of the legal pages from its Markdown file in src/content/legal. Only the small subset those files use is
 * supported: "#" and "##" headings, paragraphs, "-" and "1." lists, tables and **bold**. Email addresses become mailto links.
 * The wording lives in the .md files so it can be checked against the approved text without reading code.
 */

const EMAIL = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-[#F5F7FF]">{part.slice(2, -2)}</strong>
    return (
      <Fragment key={i}>
        {part.split(EMAIL).map((bit, j) =>
          j % 2 === 1 ? <a key={j} href={`mailto:${bit}`} className="text-[#C8FF3D] underline">{bit}</a> : bit,
        )}
      </Fragment>
    )
  })
}

const cells = (row: string) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())

function blocks(md: string): ReactNode[] {
  const out: ReactNode[] = []
  const chunks = md.trim().split(/\n\s*\n/)
  chunks.forEach((chunk, k) => {
    const lines = chunk.split('\n')
    const first = lines[0]
    if (first.startsWith('# ')) out.push(<h1 key={k} className="font-display font-bold text-4xl mb-2">{first.slice(2)}</h1>)
    else if (first.startsWith('## ')) out.push(<h2 key={k} className="font-display font-bold text-2xl mt-8 mb-2">{first.slice(3)}</h2>)
    else if (first.startsWith('|')) {
      const [head, , ...rows] = lines
      out.push(
        <div key={k} className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>{cells(head).map((c, i) => <th key={i} className="text-left font-display tracking-wide p-2 border-b border-[rgba(245,247,255,.2)]">{inline(c)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>{cells(r).map((c, i) => <td key={i} className="align-top p-2 border-b border-[rgba(245,247,255,.08)] text-[#A9B4D0]">{inline(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
    } else if (first.startsWith('- ')) {
      out.push(<ul key={k} className="list-disc pl-6 my-3 flex flex-col gap-1 text-[#A9B4D0]">{lines.map((l, i) => <li key={i}>{inline(l.slice(2))}</li>)}</ul>)
    } else if (/^\d+\. /.test(first)) {
      out.push(<ol key={k} className="list-decimal pl-6 my-3 flex flex-col gap-1 text-[#A9B4D0]">{lines.map((l, i) => <li key={i}>{inline(l.replace(/^\d+\. /, ''))}</li>)}</ol>)
    } else out.push(<p key={k} className="my-3 text-[#A9B4D0]">{inline(lines.join(' '))}</p>)
  })
  return out
}

export function LegalPage({ markdown }: { markdown: string }) {
  return (
    <div>
      <header className="mx-auto max-w-[1100px] px-4 py-5 flex items-center justify-between">
        <Link to="/" aria-label="Gaffster home"><HeaderLogo /></Link>
        <Link to="/board" className="font-display text-sm tracking-widest text-[#C8FF3D]">Open the board →</Link>
      </header>
      <main className="mx-auto max-w-[760px] px-4 pt-4 pb-12 leading-relaxed">{blocks(markdown)}</main>
    </div>
  )
}
