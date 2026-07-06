import { useRef } from 'react'
import { PlayerProvider } from './audio/PlayerContext'
import { useReveal } from './hooks/useReveal'
import type { SpineEngine } from './spine/config'
import { Nav } from './components/Nav'
import { Hero, MarqueeDivider } from './components/Hero'
import { SpineStage } from './components/SpineStage'
import { SpineRail } from './components/SpineRail'
import { Loader } from './components/Loader'
import { Listen } from './components/Listen'
import { Tracklist } from './components/Tracklist'
import { PlayerBar } from './components/PlayerBar'
import { Story } from './components/Story'
import { Visualizer } from './components/Visualizer'
import { Contact, Footer } from './components/Contact'

export default function App() {
  useReveal()
  const engineRef = useRef<SpineEngine | null>(null)

  return (
    <PlayerProvider>
      <div className="grain">
        <a className="skip-link" href="#listen">
          Skip to content
        </a>
        <SpineStage engineRef={engineRef} />
        <SpineRail engineRef={engineRef} />
        <Loader engineRef={engineRef} />
        <Nav />
        <main>
          <Hero />
          <MarqueeDivider />
          <Listen />
          <Tracklist />
          <Story />
          <Visualizer />
          <Contact />
        </main>
        <Footer />
        <PlayerBar />
      </div>
    </PlayerProvider>
  )
}
