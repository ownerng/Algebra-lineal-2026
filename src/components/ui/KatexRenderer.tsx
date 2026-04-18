import { useMemo } from 'react'
import katex from 'katex'

interface Props {
  latex: string
  display?: boolean
  className?: string
}

export default function KatexRenderer({ latex, display = false, className = '' }: Props) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: display,
        output: 'html',
      })
    } catch {
      return `<span style="color:#D4884A">${latex}</span>`
    }
  }, [latex, display])

  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
