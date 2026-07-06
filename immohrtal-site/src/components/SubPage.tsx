import type { ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'
import { Nav } from './Nav'
import { Footer } from './Contact'

/**
 * Shared shell for About / Blog / Contact — lighter than the home
 * page: static gradient backdrop instead of the WebGL world.
 */
export function SubPage({ children }: { children: ReactNode }) {
  useReveal()
  return (
    <div className="grain">
      <div aria-hidden="true" className="stage-fallback" />
      <Nav home={false} />
      <main className="relative z-10 mx-auto min-h-[80svh] w-full max-w-4xl px-5 pb-24 pt-36">{children}</main>
      <Footer />
    </div>
  )
}
