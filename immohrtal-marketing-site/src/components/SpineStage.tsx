import { useEffect, useRef, useState } from 'react'
import { createSpineEngine } from '../spine/engine'
import { SPINE_PALETTE, SPINE_SECTIONS, type SpineEngine } from '../spine/config'

export function SpineStage({ engineRef }: { engineRef: { current: SpineEngine | null } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const engine = createSpineEngine(canvas, {
      sections: SPINE_SECTIONS,
      palette: SPINE_PALETTE,
      dark: true,
    })
    engineRef.current = engine
    if (!engine) setFallback(true)

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return
      engineRef.current?.destroy()
      engineRef.current = null
      setFallback(true)
    }
    motion.addEventListener('change', onChange)
    return () => {
      motion.removeEventListener('change', onChange)
      engine?.destroy()
      engineRef.current = null
    }
  }, [engineRef])

  if (fallback) return <div className="spine-fallback" aria-hidden="true" />
  return <canvas ref={canvasRef} className="spine-canvas" aria-hidden="true" />
}
