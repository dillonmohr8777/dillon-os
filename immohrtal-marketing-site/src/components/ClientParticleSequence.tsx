import { Canvas, useFrame } from '@react-three/fiber'
import { Component, useCallback, useEffect, useMemo, useRef, useState, type ErrorInfo, type ReactNode } from 'react'
import * as THREE from 'three'
import { clients as verifiedClients } from '../data'

export type ClientParticleBrand =
  | readonly [name: string, logo: string]
  | { name: string; logo: string; seed?: number }

export type ClientParticleSequenceProps = {
  brands?: readonly ClientParticleBrand[]
  className?: string
  logoDurationMs?: number
}

type NormalizedBrand = {
  name: string
  logo: string
  seed: number
}

type LogoCloud = {
  target: Float32Array
  colors: Float32Array
  opacity: Float32Array
}

type SequenceStage =
  | { kind: 'brand'; duration: number; cloudIndex: number }
  | { kind: 'intro'; duration: number }
  | { kind: 'logo'; duration: number; cloudIndex: number; name: string }
  | { kind: 'bridge'; duration: number }
  | { kind: 'you'; duration: number; cloudIndex: number }

type RuntimeState = {
  stageIndex: number
  elapsedMs: number
  paused: boolean
  complete: boolean
}

const DESKTOP_PARTICLE_COUNT = 17_000
const COMPACT_PARTICLE_COUNT = 10_500
const DEFAULT_LOGO_DURATION = 560
const BRAND_LOGO: NormalizedBrand = {
  name: 'IMMOHRTAL Marketing Solutions',
  logo: '/brand/immohrtal-logo.png',
  seed: 0x1a44a11,
}
const decodedImageCache = new Map<string, Promise<HTMLImageElement>>()
const cloudCache = new Map<string, Promise<LogoCloud>>()

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

class CanvasErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

const visuallyHidden: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

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

function hashString(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

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

function loadDecodedImage(source: string) {
  const cached = decodedImageCache.get(source)
  if (cached) return cached

  const pending = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Could not load client logo: ${source}`))
    image.src = source
    if (image.complete && image.naturalWidth > 0) resolve(image)
  }).then(async (image) => {
    try {
      await image.decode()
    } catch {
      // A completed image is still sampleable when decode() is unsupported.
    }
    return image
  })

  decodedImageCache.set(source, pending)
  return pending
}

function drawImageMask(image: HTMLImageElement) {
  const canvas = document.createElement('canvas')
  canvas.width = 960
  canvas.height = 380
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Client logo sampling canvas is unavailable.')

  const scale = Math.min(
    (canvas.width - 44) / Math.max(image.naturalWidth, 1),
    (canvas.height - 40) / Math.max(image.naturalHeight, 1),
  )
  const width = image.naturalWidth * scale
  const height = image.naturalHeight * scale
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)
  return { canvas, context }
}

async function drawYouMask() {
  const canvas = document.createElement('canvas')
  canvas.width = 960
  canvas.height = 380
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('YOU wordmark sampling canvas is unavailable.')

  try {
    await document.fonts.load('850 236px "Unbounded Variable"')
  } catch {
    // The system fallback remains deterministic if the brand font cannot load.
  }
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.font = '850 236px "Unbounded Variable", sans-serif'
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
  forceWhite = false,
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

  if (!candidates.length) throw new Error('A client logo produced an empty alpha mask.')

  const target = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const opacity = new Float32Array(count)
  const random = seededRandom(seed)
  const maskWidth = Math.max(maxX - minX, 1)
  const maskHeight = Math.max(maxY - minY, 1)
  const widthLimit = compact ? 4.45 : 8.65
  const heightLimit = compact ? 3.5 : 3.75
  const naturalHeight = widthLimit * (maskHeight / maskWidth)
  const fitScale = Math.min(1, heightLimit / naturalHeight)
  const fittedWidth = widthLimit * fitScale
  const fittedHeight = naturalHeight * fitScale

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

    // Client marks retain their sampled source pixels. The house mark is the
    // only exception: its exact alpha silhouette resolves in pure white.
    colors[targetOffset] = forceWhite ? 1 : pixels[pixelOffset] / 255
    colors[targetOffset + 1] = forceWhite ? 1 : pixels[pixelOffset + 1] / 255
    colors[targetOffset + 2] = forceWhite ? 1 : pixels[pixelOffset + 2] / 255
    opacity[index] = pixels[pixelOffset + 3] / 255
  }

  return { target, colors, opacity }
}

function getBrandCloud(count: number, compact: boolean) {
  const cacheKey = `__immohrtal_white__|${count}|${compact ? 'compact' : 'desktop'}`
  const cached = cloudCache.get(cacheKey)
  if (cached) return cached

  const pending = loadDecodedImage(BRAND_LOGO.logo).then((image) => {
    const { canvas, context } = drawImageMask(image)
    return sampleMask(canvas, context, count, compact, BRAND_LOGO.seed, true)
  })
  cloudCache.set(cacheKey, pending)
  return pending
}

function getLogoCloud(brand: NormalizedBrand, count: number, compact: boolean) {
  const cacheKey = `${brand.logo}|${brand.seed}|${count}|${compact ? 'compact' : 'desktop'}`
  const cached = cloudCache.get(cacheKey)
  if (cached) return cached

  const pending = loadDecodedImage(brand.logo).then((image) => {
    const { canvas, context } = drawImageMask(image)
    return sampleMask(canvas, context, count, compact, brand.seed)
  })
  cloudCache.set(cacheKey, pending)
  return pending
}

function getYouCloud(count: number, compact: boolean) {
  const cacheKey = `__you__|${count}|${compact ? 'compact' : 'desktop'}`
  const cached = cloudCache.get(cacheKey)
  if (cached) return cached

  const pending = drawYouMask().then(({ canvas, context }) => (
    sampleMask(canvas, context, count, compact, 0x8777c0de)
  ))
  cloudCache.set(cacheKey, pending)
  return pending
}

function makeScatter(count: number, compact: boolean) {
  const positions = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const random = seededRandom(0x1a44e77)
  const width = compact ? 6.4 : 11.2

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

function isTupleBrand(brand: ClientParticleBrand): brand is readonly [name: string, logo: string] {
  return Array.isArray(brand)
}

function normalizeBrands(brands: readonly ClientParticleBrand[]) {
  return brands.map((brand) => {
    const name = isTupleBrand(brand) ? brand[0] : brand.name
    const logo = isTupleBrand(brand) ? brand[1] : brand.logo
    const explicitSeed = isTupleBrand(brand) ? undefined : brand.seed
    return { name, logo, seed: explicitSeed ?? hashString(`${name}|${logo}`) }
  })
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia(query).matches
  ))

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  return matches
}

function ParticleField({
  clouds,
  scatter,
  stages,
  runtime,
  compact,
}: {
  clouds: readonly LogoCloud[]
  scatter: ReturnType<typeof makeScatter>
  stages: readonly SequenceStage[]
  runtime: React.MutableRefObject<RuntimeState>
  compact: boolean
}) {
  const points = useRef<THREE.Points>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const activeCloud = useRef(-1)
  const geometry = useMemo(() => {
    const next = new THREE.BufferGeometry()
    const initial = clouds[0]
    next.setAttribute('position', new THREE.BufferAttribute(scatter.positions, 3))
    next.setAttribute('aPhase', new THREE.BufferAttribute(scatter.phases, 1))
    next.setAttribute('aTarget', new THREE.BufferAttribute(initial.target.slice(), 3))
    next.setAttribute('aColor', new THREE.BufferAttribute(initial.colors.slice(), 3))
    next.setAttribute('aOpacity', new THREE.BufferAttribute(initial.opacity.slice(), 1))
    return next
  }, [clouds, scatter])
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolve: { value: 0 },
    uStageOpacity: { value: 0.5 },
    uPointSize: { value: compact ? 2.05 : 1.72 },
  }), [compact])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state) => {
    if (!material.current || !points.current) return
    const sequence = runtime.current
    const stage = stages[sequence.stageIndex]
    const fallbackCloud = stage.kind === 'bridge' || stage.kind === 'you' ? clouds.length - 1 : 0
    const cloudIndex = stage.kind === 'brand' || stage.kind === 'logo' || stage.kind === 'you' ? stage.cloudIndex : fallbackCloud

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

    const duration = Math.max(stage.duration, 1)
    const progress = Math.min(sequence.elapsedMs / duration, 1)
    let resolve = 0
    let stageOpacity = 0.48

    if (stage.kind === 'brand' || stage.kind === 'logo') {
      const convergeEnd = Math.min(0.24, 132 / duration)
      const dissolveStart = stage.kind === 'brand'
        ? Math.max(convergeEnd + 0.32, 1 - 300 / duration)
        : Math.max(convergeEnd + 0.18, 1 - 205 / duration)
      if (progress < convergeEnd) resolve = THREE.MathUtils.smoothstep(progress, 0, convergeEnd)
      else if (progress < dissolveStart) resolve = 1
      else resolve = 1 - THREE.MathUtils.smoothstep(progress, dissolveStart, 1)
      stageOpacity = 1
    } else if (stage.kind === 'you') {
      resolve = THREE.MathUtils.smoothstep(progress, 0, Math.min(0.12, 340 / duration))
      stageOpacity = 1
    }

    material.current.uniforms.uTime.value = state.clock.elapsedTime
    material.current.uniforms.uResolve.value = resolve
    material.current.uniforms.uStageOpacity.value = stageOpacity
    points.current.rotation.y += ((state.pointer.x * 0.025 * (1 - resolve)) - points.current.rotation.y) * 0.04
    points.current.rotation.x += ((state.pointer.y * -0.018 * (1 - resolve)) - points.current.rotation.x) * 0.04
  })

  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  )
}

function ReducedMotionSequence({ brands, className }: { brands: readonly NormalizedBrand[]; className: string }) {
  return (
    <section className={`${className} client-particle-sequence--reduced`} aria-label="Client work and an invitation to work together" tabIndex={0}>
      <img className="client-particle-sequence__brand-static brand-logo--white" src={BRAND_LOGO.logo} alt="IMMOHRTAL Marketing Solutions" decoding="async" />
      <p className="client-particle-sequence__phrase">I did this for</p>
      <ul className="client-particle-sequence__static-grid">
        {brands.map((brand) => (
          <li key={`${brand.name}-${brand.logo}`}>
            <img src={brand.logo} alt={brand.name} decoding="async" />
          </li>
        ))}
      </ul>
      <p className="client-particle-sequence__phrase">
        I could do it for <strong className="client-particle-sequence__you">YOU</strong>
      </p>
    </section>
  )
}

export function ClientParticleSequence({
  brands = verifiedClients,
  className = '',
  logoDurationMs = DEFAULT_LOGO_DURATION,
}: ClientParticleSequenceProps) {
  const compact = useMediaQuery('(max-width: 760px)')
  const narrow = useMediaQuery('(max-width: 480px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const brandSignature = brands.map((brand) => (
    isTupleBrand(brand) ? `${brand[0]}|${brand[1]}` : `${brand.name}|${brand.logo}|${brand.seed ?? ''}`
  )).join('::')
  const normalizedBrands = useMemo(() => normalizeBrands(brands), [brandSignature])
  const count = compact ? COMPACT_PARTICLE_COUNT : DESKTOP_PARTICLE_COUNT
  const [clouds, setClouds] = useState<LogoCloud[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [webglFailed, setWebglFailed] = useState(() => !supportsWebGL())
  const [stageIndex, setStageIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [complete, setComplete] = useState(false)
  const runtime = useRef<RuntimeState>({ stageIndex: 0, elapsedMs: 0, paused: false, complete: false })
  const stages = useMemo<SequenceStage[]>(() => [
    { kind: 'brand', duration: 1_450, cloudIndex: 0 },
    { kind: 'intro', duration: 1_050 },
    ...normalizedBrands.map((brand, cloudIndex) => ({
      kind: 'logo' as const,
      duration: Math.max(460, logoDurationMs),
      cloudIndex: cloudIndex + 1,
      name: brand.name,
    })),
    { kind: 'bridge', duration: 1_000 },
    { kind: 'you', duration: 3_600, cloudIndex: normalizedBrands.length + 1 },
  ], [brandSignature, logoDurationMs])
  const scatter = useMemo(() => makeScatter(count, compact), [compact, count])
  const rootClassName = `client-particle-sequence${className ? ` ${className}` : ''}`

  useEffect(() => {
    if (reducedMotion) return
    let cancelled = false
    setClouds(null)
    setLoadError(false)

    // Decode every source in parallel, then sample sequentially to avoid 21 large
    // temporary ImageData candidate lists existing at the same time.
    Promise.all([loadDecodedImage(BRAND_LOGO.logo), ...normalizedBrands.map((brand) => loadDecodedImage(brand.logo))])
      .then(async () => {
        const nextClouds: LogoCloud[] = [await getBrandCloud(count, compact)]
        for (const brand of normalizedBrands) {
          nextClouds.push(await getLogoCloud(brand, count, compact))
        }
        nextClouds.push(await getYouCloud(count, compact))
        if (!cancelled) setClouds(nextClouds)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })

    return () => { cancelled = true }
  }, [brandSignature, compact, count, reducedMotion])

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
  }, [clouds, reducedMotion, replay])

  useEffect(() => {
    if (!clouds || reducedMotion) return
    let frame = 0
    let previous = performance.now()

    const tick = (now: number) => {
      const elapsed = now - previous
      previous = now
      const sequence = runtime.current

      if (!document.hidden && !sequence.paused && !sequence.complete) {
        sequence.elapsedMs += elapsed
        let stage = stages[sequence.stageIndex]
        while (sequence.elapsedMs >= stage.duration && !sequence.complete) {
          sequence.elapsedMs -= stage.duration
          if (sequence.stageIndex >= stages.length - 1) {
            sequence.elapsedMs = stage.duration
            sequence.complete = true
            setComplete(true)
            break
          }
          sequence.stageIndex += 1
          stage = stages[sequence.stageIndex]
          setStageIndex(sequence.stageIndex)
        }
      }

      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [clouds, reducedMotion, stages])

  if (reducedMotion || loadError || webglFailed || normalizedBrands.length === 0) {
    return <ReducedMotionSequence brands={normalizedBrands} className={rootClassName} />
  }

  const currentStage = stages[stageIndex]
  const liveText = currentStage.kind === 'brand'
    ? 'IMMOHRTAL Marketing Solutions'
    : currentStage.kind === 'logo'
    ? currentStage.name
    : currentStage.kind === 'intro'
      ? 'I did this for'
      : 'I could do it for you'

  return (
    <section className={`${rootClassName} client-particle-sequence--${currentStage.kind}`} aria-label="Client logo particle sequence">
      <span role="status" aria-live="polite" aria-atomic="true" style={visuallyHidden}>{liveText}</span>

      <div className="client-particle-sequence__viewport" aria-hidden="true">
        <CanvasErrorBoundary onError={() => setWebglFailed(true)}>
          <Canvas
            className="client-particle-sequence__canvas"
            dpr={[1, 1.45]}
            camera={{ position: [0, 0, compact ? 7.4 : 8], fov: narrow ? 58 : compact ? 42 : 38 }}
            gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
          >
            {clouds && (
              <ParticleField
                clouds={clouds}
                scatter={scatter}
                stages={stages}
                runtime={runtime}
                compact={compact}
              />
            )}
          </Canvas>
        </CanvasErrorBoundary>
        {!clouds && (
          <div className="client-particle-sequence__loading-brand">
            <img className="brand-logo--white" src={BRAND_LOGO.logo} alt="" />
            <p className="client-particle-sequence__loading">Preparing the particle sequence…</p>
          </div>
        )}
        {(currentStage.kind === 'intro' || currentStage.kind === 'bridge') && (
          <p className="client-particle-sequence__phrase">
            {currentStage.kind === 'intro' ? 'I did this for' : 'I could do it for'}
          </p>
        )}
      </div>

      <div className="client-particle-sequence__controls" aria-label="Logo sequence controls">
        <button type="button" onClick={togglePause} aria-pressed={paused} disabled={!clouds || complete}>
          {paused ? 'Resume sequence' : 'Pause sequence'}
        </button>
        <button type="button" onClick={replay} disabled={!clouds}>
          Replay sequence
        </button>
      </div>
    </section>
  )
}

export default ClientParticleSequence
