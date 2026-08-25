import { Canvas, useFrame } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

type LogoCloud = {
  target: Float32Array
  colors: Float32Array
  opacity: Float32Array
}

type Stage = {
  kind: 'intro' | 'align' | 'bridge' | 'you'
  duration: number
}

type RuntimeState = {
  stageIndex: number
  elapsedMs: number
  paused: boolean
  complete: boolean
}

const STAGES: readonly Stage[] = [
  { kind: 'intro', duration: 1_350 },
  { kind: 'align', duration: 4_250 },
  { kind: 'bridge', duration: 1_450 },
  { kind: 'you', duration: 4_400 },
]
const ALIGN_LOGO = '/clients/align-hcm.png'
const DESKTOP_PARTICLE_COUNT = 16_000
const COMPACT_PARTICLE_COUNT = 9_500

const vertexShader = `
  uniform float uTime;
  uniform float uResolve;
  uniform float uStageOpacity;
  uniform float uPointSize;
  attribute vec3 aTarget;
  attribute vec3 aColor;
  attribute float aPhase;
  attribute float aOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vResolved;

  void main() {
    float resolved = smoothstep(0.0, 1.0, uResolve);
    float freedom = 1.0 - resolved;
    vec3 p = mix(position, aTarget, resolved);
    p.x += sin(uTime * 1.34 + aPhase * 18.1) * 0.075 * freedom;
    p.y += cos(uTime * 1.12 + aPhase * 13.7) * 0.09 * freedom;
    p.z += sin(uTime * 0.88 + aPhase * 24.3) * 0.12 * freedom;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    float perspective = clamp(7.6 / -mvPosition.z, 0.72, 1.85);
    gl_PointSize = (uPointSize + aPhase * 0.72 + resolved * 0.36) * perspective;
    gl_Position = projectionMatrix * mvPosition;
    vColor = aColor;
    vAlpha = mix(0.52, aOpacity, resolved) * uStageOpacity;
    vResolved = resolved;
  }
`

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vResolved;

  void main() {
    vec2 centered = gl_PointCoord - 0.5;
    float distanceToCenter = length(centered);
    if (distanceToCenter > 0.5) discard;
    float edge = 1.0 - smoothstep(mix(0.2, 0.31, vResolved), 0.5, distanceToCenter);
    gl_FragColor = vec4(vColor, edge * vAlpha);
  }
`

function seededRandom(seed: number) {
  let value = seed >>> 0
  return () => {
    value += 0x6d2b79f5
    let result = value
    result = Math.imul(result ^ (result >>> 15), result | 1)
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])
  return matches
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Could not load proof logo: ${source}`))
    image.src = source
    if (image.complete && image.naturalWidth > 0) resolve(image)
  })
}

function drawImageMask(image: HTMLImageElement) {
  const canvas = document.createElement('canvas')
  canvas.width = 960
  canvas.height = 420
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Proof logo sampling canvas is unavailable.')
  const scale = Math.min((canvas.width - 44) / image.naturalWidth, (canvas.height - 44) / image.naturalHeight)
  const width = image.naturalWidth * scale
  const height = image.naturalHeight * scale
  context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)
  return { canvas, context }
}

async function drawYouMask() {
  const canvas = document.createElement('canvas')
  canvas.width = 960
  canvas.height = 420
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('YOU sampling canvas is unavailable.')
  try {
    await document.fonts.load('850 236px "IMMOHRTAL Display"')
  } catch {
    // The deterministic fallback still produces a readable final state.
  }
  context.font = '850 236px "IMMOHRTAL Display", sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.lineJoin = 'round'
  context.strokeStyle = '#18c8ff'
  context.lineWidth = 10
  context.strokeText('YOU', canvas.width / 2, canvas.height / 2 + 10)
  context.fillStyle = '#f4f7fb'
  context.fillText('YOU', canvas.width / 2, canvas.height / 2 + 10)
  return { canvas, context }
}

function sampleMask(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  count: number,
  compact: boolean,
  seed: number,
  liftDarkPixels: boolean,
): LogoCloud {
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  const candidates: number[] = []
  let minX = canvas.width
  let minY = canvas.height
  let maxX = 0
  let maxY = 0

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const pixelOffset = (y * canvas.width + x) * 4
      if (pixels[pixelOffset + 3] < 28) continue
      candidates.push(pixelOffset)
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }
  if (!candidates.length) throw new Error('A proof mark produced an empty alpha mask.')

  const target = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const opacity = new Float32Array(count)
  const random = seededRandom(seed)
  const maskWidth = Math.max(maxX - minX, 1)
  const maskHeight = Math.max(maxY - minY, 1)
  const widthLimit = compact ? 4.7 : 5.2
  const heightLimit = compact ? 3.35 : 3.65
  const naturalHeight = widthLimit * (maskHeight / maskWidth)
  const fitScale = Math.min(1, heightLimit / naturalHeight)
  const fittedWidth = widthLimit * fitScale
  const fittedHeight = naturalHeight * fitScale
  const light = new THREE.Color('#eaf6fc')

  for (let index = 0; index < count; index += 1) {
    const binStart = Math.floor((index * candidates.length) / count)
    const binEnd = Math.max(binStart + 1, Math.floor(((index + 1) * candidates.length) / count))
    const candidateIndex = candidates.length >= count
      ? Math.min(candidates.length - 1, binStart + Math.floor(random() * (binEnd - binStart)))
      : index % candidates.length
    const pixelOffset = candidates[candidateIndex]
    const pixelIndex = pixelOffset / 4
    const x = pixelIndex % canvas.width
    const y = Math.floor(pixelIndex / canvas.width)
    const targetOffset = index * 3

    target[targetOffset] = ((x - minX) / maskWidth - 0.5) * fittedWidth + (random() - 0.5) * 0.0025
    target[targetOffset + 1] = -((y - minY) / maskHeight - 0.5) * fittedHeight + (random() - 0.5) * 0.0025
    target[targetOffset + 2] = (random() - 0.5) * 0.018

    const color = new THREE.Color(
      pixels[pixelOffset] / 255,
      pixels[pixelOffset + 1] / 255,
      pixels[pixelOffset + 2] / 255,
    )
    if (liftDarkPixels && color.getHSL({ h: 0, s: 0, l: 0 }).l < 0.23) color.lerp(light, 0.78)
    colors[targetOffset] = color.r
    colors[targetOffset + 1] = color.g
    colors[targetOffset + 2] = color.b
    opacity[index] = pixels[pixelOffset + 3] / 255
  }
  return { target, colors, opacity }
}

function makeScatter(count: number, compact: boolean) {
  const positions = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const random = seededRandom(0x242825734)
  const width = compact ? 6.3 : 11
  for (let index = 0; index < count; index += 1) {
    const progress = index / count
    const strand = index % 5
    const looseness = 0.35 + Math.pow(random(), 1.8)
    const offset = index * 3
    positions[offset] = (progress - 0.5) * width + (random() - 0.5) * looseness * 1.8
    positions[offset + 1] = Math.sin(progress * Math.PI * (2.2 + strand * 0.34)) * (0.46 + strand * 0.18)
      + (random() - 0.5) * looseness * 1.55
    positions[offset + 2] = (random() - 0.5) * (1.8 + looseness * 2.4)
    phases[index] = random()
  }
  return { positions, phases }
}

function ParticleField({
  clouds,
  compact,
  runtime,
}: {
  clouds: readonly LogoCloud[]
  compact: boolean
  runtime: React.MutableRefObject<RuntimeState>
}) {
  const points = useRef<THREE.Points>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const scatter = useMemo(() => makeScatter(clouds[0].opacity.length, compact), [clouds, compact])
  const activeCloud = useRef(-1)
  const geometry = useMemo(() => {
    const next = new THREE.BufferGeometry()
    next.setAttribute('position', new THREE.BufferAttribute(scatter.positions, 3))
    next.setAttribute('aPhase', new THREE.BufferAttribute(scatter.phases, 1))
    next.setAttribute('aTarget', new THREE.BufferAttribute(clouds[0].target.slice(), 3))
    next.setAttribute('aColor', new THREE.BufferAttribute(clouds[0].colors.slice(), 3))
    next.setAttribute('aOpacity', new THREE.BufferAttribute(clouds[0].opacity.slice(), 1))
    return next
  }, [clouds, scatter])
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolve: { value: 0 },
    uStageOpacity: { value: 0.45 },
    uPointSize: { value: compact ? 2.02 : 1.7 },
  }), [compact])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state) => {
    if (!material.current || !points.current) return
    const sequence = runtime.current
    const stage = STAGES[sequence.stageIndex]
    const cloudIndex = stage.kind === 'you' || stage.kind === 'bridge' ? 1 : 0
    if (activeCloud.current !== cloudIndex) {
      const cloud = clouds[cloudIndex]
      const target = geometry.getAttribute('aTarget') as THREE.BufferAttribute
      const color = geometry.getAttribute('aColor') as THREE.BufferAttribute
      const opacity = geometry.getAttribute('aOpacity') as THREE.BufferAttribute
      target.copyArray(cloud.target)
      color.copyArray(cloud.colors)
      opacity.copyArray(cloud.opacity)
      target.needsUpdate = true
      color.needsUpdate = true
      opacity.needsUpdate = true
      activeCloud.current = cloudIndex
    }

    const progress = Math.min(sequence.elapsedMs / Math.max(stage.duration, 1), 1)
    let resolve = 0
    let stageOpacity = 0.42
    if (stage.kind === 'align' || stage.kind === 'you') {
      const convergeEnd = 0.2
      const dissolveStart = stage.kind === 'align' ? 0.82 : 1.1
      if (progress < convergeEnd) resolve = THREE.MathUtils.smoothstep(progress, 0, convergeEnd)
      else if (progress < dissolveStart) resolve = 1
      else resolve = 1 - THREE.MathUtils.smoothstep(progress, dissolveStart, 1)
      stageOpacity = 1
    }
    material.current.uniforms.uTime.value = state.clock.elapsedTime
    material.current.uniforms.uResolve.value = resolve
    material.current.uniforms.uStageOpacity.value = stageOpacity
    points.current.rotation.y += ((state.pointer.x * 0.028 * (1 - resolve)) - points.current.rotation.y) * 0.04
    points.current.rotation.x += ((state.pointer.y * -0.02 * (1 - resolve)) - points.current.rotation.x) * 0.04
  })

  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={THREE.NormalBlending} />
    </points>
  )
}

function StaticSequence({ pending = false }: { pending?: boolean }) {
  return (
    <div className={`hero-proof-sequence hero-proof-sequence--reduced${pending ? ' hero-proof-sequence--pending' : ''}`} role="img" aria-label="I did this for Align HCM. I can do it for you.">
      <p>I did this for</p>
      <img src={ALIGN_LOGO} alt="Align HCM" />
      {!pending && <><p>I can do it for</p><strong>YOU</strong></>}
    </div>
  )
}

export function HeroProofSequence() {
  const compact = useMediaQuery('(max-width: 760px)')
  const narrow = useMediaQuery('(max-width: 480px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const count = compact ? COMPACT_PARTICLE_COUNT : DESKTOP_PARTICLE_COUNT
  const [clouds, setClouds] = useState<LogoCloud[] | null>(null)
  const [failed, setFailed] = useState(() => !supportsWebGL())
  const [stageIndex, setStageIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [complete, setComplete] = useState(false)
  const runtime = useRef<RuntimeState>({ stageIndex: 0, elapsedMs: 0, paused: false, complete: false })

  useEffect(() => {
    if (reducedMotion || failed) return
    let cancelled = false
    Promise.all([loadImage(ALIGN_LOGO), drawYouMask()])
      .then(([alignImage, youMask]) => {
        const alignMask = drawImageMask(alignImage)
        const nextClouds = [
          sampleMask(alignMask.canvas, alignMask.context, count, compact, 242825734, true),
          sampleMask(youMask.canvas, youMask.context, count, compact, 0x8777c0de, false),
        ]
        if (!cancelled) setClouds(nextClouds)
      })
      .catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [compact, count, failed, reducedMotion])

  const replay = useCallback(() => {
    runtime.current = { stageIndex: 0, elapsedMs: 0, paused: false, complete: false }
    setStageIndex(0)
    setPaused(false)
    setComplete(false)
  }, [])

  const togglePause = useCallback(() => {
    if (runtime.current.complete) return
    runtime.current.paused = !runtime.current.paused
    setPaused(runtime.current.paused)
  }, [])

  useEffect(() => {
    if (!clouds || reducedMotion) return
    replay()
    let frame = 0
    let previous = performance.now()
    const tick = (now: number) => {
      const elapsed = now - previous
      previous = now
      const sequence = runtime.current
      if (!document.hidden && !sequence.paused && !sequence.complete) {
        sequence.elapsedMs += elapsed
        let stage = STAGES[sequence.stageIndex]
        while (sequence.elapsedMs >= stage.duration && !sequence.complete) {
          sequence.elapsedMs -= stage.duration
          if (sequence.stageIndex >= STAGES.length - 1) {
            sequence.elapsedMs = stage.duration
            sequence.complete = true
            setComplete(true)
            break
          }
          sequence.stageIndex += 1
          stage = STAGES[sequence.stageIndex]
          setStageIndex(sequence.stageIndex)
        }
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [clouds, reducedMotion, replay])

  if (reducedMotion || failed) return <StaticSequence />
  if (!clouds) return <StaticSequence pending />

  const stage = STAGES[stageIndex]
  const announcement = stage.kind === 'intro'
    ? 'I did this for'
    : stage.kind === 'align'
      ? 'Align HCM'
      : stage.kind === 'bridge'
        ? 'I can do it for'
        : 'You'

  return (
    <section className={`hero-proof-sequence hero-proof-sequence--${stage.kind}`} aria-label="I did this for Align HCM. I can do it for you.">
      <span className="sr-only" aria-live="polite">{announcement}</span>
      <div className="hero-proof-sequence__viewport" aria-hidden="true">
        <Canvas dpr={[1, 1.45]} camera={{ position: [0, 0, compact ? 7.3 : 8], fov: narrow ? 58 : compact ? 43 : 38 }} gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}>
          <ParticleField clouds={clouds} compact={compact} runtime={runtime} />
        </Canvas>
        {(stage.kind === 'intro' || stage.kind === 'bridge') && (
          <p className="hero-proof-sequence__phrase">{stage.kind === 'intro' ? 'I did this for' : 'I can do it for'}</p>
        )}
      </div>
      <div className="hero-proof-sequence__controls" aria-label="Proof sequence controls">
        <button type="button" onClick={togglePause} aria-pressed={paused} disabled={complete}>{paused ? 'Resume' : 'Pause'}</button>
        <button type="button" onClick={replay}>Replay</button>
      </div>
    </section>
  )
}
