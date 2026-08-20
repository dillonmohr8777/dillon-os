import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

type PointCloud = {
  scatter: Float32Array
  target: Float32Array
  colors: Float32Array
  phases: Float32Array
}

type ProspectBrand = 'align' | 'hrchitect'

const vertexShader = `
  uniform float uTime;
  uniform float uMorph;
  uniform float uDrift;
  uniform float uPointBase;
  uniform float uPointVariance;
  uniform float uPointSettle;
  attribute vec3 aTarget;
  attribute vec3 aColor;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vGlow;
  varying float vResolved;

  void main() {
    float settled = smoothstep(0.0, 1.0, uMorph);
    vec3 p = mix(position, aTarget, settled);
    float noise = sin(uTime * 0.72 + aPhase * 6.2831 + position.x * 0.72);
    float curl = cos(uTime * 0.54 + aPhase * 9.2 + position.y * 1.35);
    float freedom = 1.0 - settled;
    p.y += noise * 0.12 * freedom;
    p.x += curl * 0.07 * freedom;
    p.z += sin(uTime * 0.44 + aPhase * 13.0) * 0.13 * freedom;
    p.y += uDrift * (0.08 + aPhase * 0.06) * freedom;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    float depthScale = clamp(8.0 / -mvPosition.z, 0.55, 2.2);
    gl_PointSize = (uPointBase + aPhase * uPointVariance + settled * uPointSettle) * depthScale;
    gl_Position = projectionMatrix * mvPosition;
    vColor = aColor;
    vGlow = settled * 0.09 + (1.0 - settled) * (0.16 + aPhase * 0.18);
    vResolved = settled;
  }
`

const fragmentShader = `
  varying vec3 vColor;
  varying float vGlow;
  varying float vResolved;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float crispEdge = mix(0.13, 0.34, vResolved);
    float core = 1.0 - smoothstep(crispEdge, 0.5, d);
    float halo = (1.0 - smoothstep(0.22, 0.5, d)) * vGlow;
    gl_FragColor = vec4(vColor * (1.0 + halo), core * mix(0.88, 0.98, vResolved));
  }
`

function seededRandom(seed: number) {
  let value = seed >>> 0
  return () => {
    value += 0x6d2b79f5
    let t = value
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

async function buildImmortalCloud(count: number, compact: boolean): Promise<PointCloud> {
  const image = new Image()
  image.decoding = 'async'
  image.src = '/brand/immohrtal-logo.png'
  await image.decode()

  const canvas = document.createElement('canvas')
  canvas.width = 720
  canvas.height = 680
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Immortal logo sampling canvas is unavailable.')

  const scale = Math.min((canvas.width - 28) / image.naturalWidth, (canvas.height - 28) / image.naturalHeight)
  const width = image.naturalWidth * scale
  const height = image.naturalHeight * scale
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  const candidates: Array<[number, number, number, number, number]> = []
  let minX = canvas.width
  let minY = canvas.height
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      const offset = (y * canvas.width + x) * 4
      if (pixels[offset + 3] < 56) continue
      candidates.push([x, y, pixels[offset], pixels[offset + 1], pixels[offset + 2]])
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }
  if (!candidates.length) throw new Error('Immortal logo alpha mask is empty.')

  const random = seededRandom(8777)
  const scatter = new Float32Array(count * 3)
  const target = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const platinum = new THREE.Color('#f4f7fb')
  const silver = new THREE.Color('#aebed1')
  const cobalt = new THREE.Color('#287dff')
  const cyan = new THREE.Color('#18c8ff')
  const mint = new THREE.Color('#58edb2')
  const maskWidth = Math.max(maxX - minX, 1)
  const maskHeight = Math.max(maxY - minY, 1)
  const targetWidth = compact ? 4.15 : 4.8
  const targetHeight = targetWidth * (maskHeight / maskWidth)

  for (let index = 0; index < count; index += 1) {
    const t = index / count
    const strand = index % 4
    const spread = Math.pow(random(), 1.8)
    const sx = (t - 0.5) * (compact ? 8.2 : 10.4) + (random() - 0.5) * spread * 1.5
    const baseWave = strand < 2
      ? Math.sin(t * Math.PI * (2.25 + strand * 0.7))
      : Math.cos(t * Math.PI * (2.7 + strand * 0.35))
    const sy = baseWave * (0.72 + strand * 0.18) + (random() - 0.5) * spread * 1.45
    const sz = (random() - 0.5) * (2.1 + spread * 2.2)
    scatter.set([sx, sy, sz], index * 3)

    const binStart = (index * candidates.length) / count
    const binEnd = ((index + 1) * candidates.length) / count
    const candidateIndex = candidates.length >= count
      ? Math.min(candidates.length - 1, Math.floor(binStart + random() * Math.max(1, binEnd - binStart)))
      : index % candidates.length
    const sample = candidates[candidateIndex]
    const tx = ((sample[0] - minX) / maskWidth - 0.5) * targetWidth + (random() - 0.5) * 0.0035
    const ty = -((sample[1] - minY) / maskHeight - 0.5) * targetHeight + (random() - 0.5) * 0.0035
    const tz = (random() - 0.5) * 0.03
    target.set([tx, ty, tz], index * 3)

    const [red, green, blue] = [sample[2], sample[3], sample[4]]
    const isCyan = blue > red * 1.25 && green > red * 1.08
    const color = isCyan
      ? cyan.clone().lerp(mint, random() * 0.22)
      : random() > 0.9
        ? cobalt.clone().lerp(cyan, random() * 0.5)
        : platinum.clone().lerp(silver, random() * 0.42)
    colors.set([color.r, color.g, color.b], index * 3)
    phases[index] = random()
  }
  return { scatter, target, colors, phases }
}

async function buildProspectCloud(brand: ProspectBrand, count: number, compact: boolean): Promise<PointCloud> {
  const image = new Image()
  image.decoding = 'async'
  image.crossOrigin = 'anonymous'
  image.src = brand === 'align' ? '/clients/align-hcm.png' : '/clients/hrchitect.svg'
  await image.decode()

  const canvas = document.createElement('canvas')
  canvas.width = 1000
  canvas.height = 380
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Prospect logo sampling canvas is unavailable.')
  const scale = Math.min((canvas.width - 30) / image.naturalWidth, (canvas.height - 30) / image.naturalHeight)
  const width = image.naturalWidth * scale
  const height = image.naturalHeight * scale
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  const candidates: Array<[number, number, number, number, number]> = []
  let minX = canvas.width
  let minY = canvas.height
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      const offset = (y * canvas.width + x) * 4
      if (pixels[offset + 3] < 64) continue
      candidates.push([x, y, pixels[offset], pixels[offset + 1], pixels[offset + 2]])
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }
  if (!candidates.length) throw new Error(`${brand} logo alpha mask is empty.`)

  const random = seededRandom(brand === 'align' ? 242825734 : 5717074130)
  const scatter = new Float32Array(count * 3)
  const target = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const maskWidth = Math.max(maxX - minX, 1)
  const maskHeight = Math.max(maxY - minY, 1)
  const targetWidth = compact ? 5.4 : 9.2
  const targetHeight = targetWidth * (maskHeight / maskWidth)

  for (let index = 0; index < count; index += 1) {
    const t = index / count
    const strand = index % 4
    const spread = Math.pow(random(), 1.75)
    const sx = 4.8 + (t - 0.5) * (compact ? 8.8 : 12.4) + (random() - 0.5) * spread * 1.7
    const wave = strand < 2
      ? Math.sin(t * Math.PI * (2.1 + strand * 0.72))
      : Math.cos(t * Math.PI * (2.45 + strand * 0.4))
    const sy = wave * (0.68 + strand * 0.19) + (random() - 0.5) * spread * 1.35
    const sz = (random() - 0.5) * (2 + spread * 2.1)
    scatter.set([sx, sy, sz], index * 3)

    const binStart = (index * candidates.length) / count
    const binEnd = ((index + 1) * candidates.length) / count
    const candidateIndex = candidates.length >= count
      ? Math.min(candidates.length - 1, Math.floor(binStart + random() * Math.max(1, binEnd - binStart)))
      : index % candidates.length
    const sample = candidates[candidateIndex]
    const tx = ((sample[0] - minX) / maskWidth - 0.5) * targetWidth + (random() - 0.5) * 0.003
    const ty = -((sample[1] - minY) / maskHeight - 0.5) * targetHeight + (random() - 0.5) * 0.003
    target.set([tx, ty, (random() - 0.5) * 0.024], index * 3)

    const color = new THREE.Color().setRGB(sample[2] / 255, sample[3] / 255, sample[4] / 255)
    colors.set([color.r, color.g, color.b], index * 3)
    phases[index] = random()
  }
  return { scatter, target, colors, phases }
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

function LogoParticles({ compact, reducedMotion }: { compact: boolean; reducedMotion: boolean }) {
  const count = compact ? 24000 : 36000
  const [cloud, setCloud] = useState<PointCloud | null>(null)
  const points = useRef<THREE.Points>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorph: { value: reducedMotion ? 1 : 0 },
    uDrift: { value: 0 },
    uPointBase: { value: compact ? 1.12 : 1.08 },
    uPointVariance: { value: compact ? 1.4 : 1.28 },
    uPointSettle: { value: compact ? 0.82 : 0.64 },
  }), [compact, reducedMotion])

  useEffect(() => {
    let cancelled = false
    buildImmortalCloud(count, compact).then((next) => {
      if (!cancelled) setCloud(next)
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [compact, count])

  useFrame((state) => {
    if (!material.current || !points.current) return
    if (reducedMotion) {
      material.current.uniforms.uMorph.value = 1
      return
    }
    const elapsed = state.clock.elapsedTime
    const phase = elapsed % 10
    let morph = 0
    if (phase >= 3.8 && phase < 5) morph = THREE.MathUtils.smoothstep(phase, 3.8, 5)
    else if (phase >= 5 && phase < 8.2) morph = 1
    else if (phase >= 8.2 && phase < 9.3) morph = 1 - THREE.MathUtils.smoothstep(phase, 8.2, 9.3)
    material.current.uniforms.uTime.value = elapsed
    material.current.uniforms.uMorph.value = morph
    material.current.uniforms.uDrift.value = window.scrollY / Math.max(window.innerHeight, 1)
    points.current.rotation.y += ((state.pointer.x * 0.08 * (1 - morph)) - points.current.rotation.y) * 0.025
    points.current.rotation.x += ((state.pointer.y * -0.055 * (1 - morph)) - points.current.rotation.x) * 0.025
  })

  if (!cloud) return null
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[cloud.scatter, 3]} />
        <bufferAttribute attach="attributes-aTarget" args={[cloud.target, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[cloud.colors, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[cloud.phases, 1]} />
      </bufferGeometry>
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={THREE.NormalBlending} />
    </points>
  )
}

function ProspectParticles({ brand, compact }: { brand: ProspectBrand; compact: boolean }) {
  const count = compact ? 22000 : 32000
  const [cloud, setCloud] = useState<PointCloud | null>(null)
  const points = useRef<THREE.Points>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uDrift: { value: 0 },
    uPointBase: { value: compact ? 1.22 : 1.08 },
    uPointVariance: { value: compact ? 1.46 : 1.25 },
    uPointSettle: { value: compact ? 0.92 : 0.72 },
  }), [compact])

  useEffect(() => {
    let cancelled = false
    buildProspectCloud(brand, count, compact).then((next) => {
      if (!cancelled) setCloud(next)
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [brand, compact, count])

  useFrame((state) => {
    if (!material.current || !points.current) return
    const elapsed = state.clock.elapsedTime
    let morph = 0
    if (elapsed >= 0.08 && elapsed < 1.08) morph = THREE.MathUtils.smoothstep(elapsed, 0.08, 1.08)
    else if (elapsed >= 1.08 && elapsed < 4.15) morph = 1
    else if (elapsed >= 4.15) morph = 1 - THREE.MathUtils.smoothstep(elapsed, 4.15, 4.88)
    material.current.uniforms.uTime.value = elapsed
    material.current.uniforms.uMorph.value = morph
    points.current.rotation.y += ((state.pointer.x * 0.05 * (1 - morph)) - points.current.rotation.y) * 0.03
  })

  if (!cloud) return null
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[cloud.scatter, 3]} />
        <bufferAttribute attach="attributes-aTarget" args={[cloud.target, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[cloud.colors, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[cloud.phases, 1]} />
      </bufferGeometry>
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={THREE.NormalBlending} />
    </points>
  )
}

function SpineParticles() {
  const points = useRef<THREE.Points>(null)
  const { positions, colors } = useMemo(() => {
    const mobile = window.innerWidth < 760
    const count = mobile ? 1200 : 2600
    const random = seededRandom(9187)
    const nextPositions = new Float32Array(count * 3)
    const nextColors = new Float32Array(count * 3)
    const cobalt = new THREE.Color('#287dff')
    const cyan = new THREE.Color('#18c8ff')
    const mint = new THREE.Color('#58edb2')
    for (let index = 0; index < count; index += 1) {
      const y = (random() - 0.5) * 10.5
      const center = Math.sin(y * 0.74) * 1.2 + Math.sin(y * 0.21) * 0.6
      const radius = Math.pow(random(), 2.2) * (mobile ? 1.2 : 2.1)
      const angle = random() * Math.PI * 2
      nextPositions.set([center + Math.cos(angle) * radius, y, Math.sin(angle) * radius * 0.85], index * 3)
      const color = random() > 0.84 ? mint.clone().lerp(cyan, random() * 0.36) : cobalt.clone().lerp(cyan, random() * 0.72)
      nextColors.set([color.r, color.g, color.b], index * 3)
    }
    return { positions: nextPositions, colors: nextColors }
  }, [])

  useFrame((state) => {
    if (!points.current) return
    points.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.09) * 0.09
    points.current.rotation.y = state.clock.elapsedTime * 0.025
    points.current.position.y = -((window.scrollY / Math.max(document.documentElement.scrollHeight, 1)) - 0.5) * 0.8
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial vertexColors size={0.024} transparent opacity={0.68} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
    </points>
  )
}

export function ParticleLogo() {
  const compact = useMediaQuery('(max-width: 760px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  return (
    <div className={`particle-logo${reducedMotion ? ' particle-logo--static' : ''}`} role="img" aria-label="Complete Immortal logo rendered as particles">
      <Canvas dpr={[1, 1.55]} camera={{ position: [0, 0, compact ? 5.5 : 7.2], fov: 42 }} gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }} frameloop={reducedMotion ? 'demand' : 'always'}>
        <LogoParticles compact={compact} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}

function ProspectParticleLogo({ brand, compact }: { brand: ProspectBrand; compact: boolean }) {
  return (
    <div className="prospect-particle-logo" role="img" aria-label={brand === 'align' ? 'Align HCM logo rendered as particles' : 'HRchitect logo rendered as particles'}>
      <Canvas dpr={[1, 1.55]} camera={{ position: [0, 0, 6.8], fov: 38 }} gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}>
        <ProspectParticles brand={brand} compact={compact} />
      </Canvas>
    </div>
  )
}

const prospectStages = [
  { kind: 'copy', value: 'I did this for', duration: 1800 },
  { kind: 'logo', value: 'align', duration: 5000 },
  { kind: 'copy', value: 'I can do it for', duration: 1800 },
  { kind: 'logo', value: 'hrchitect', duration: 5000 },
  { kind: 'gap', value: '', duration: 900 },
] as const

export function ProspectSequence() {
  const [stage, setStage] = useState(0)
  const compact = useMediaQuery('(max-width: 760px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    if (reducedMotion) return
    const timer = window.setTimeout(() => setStage((current) => (current + 1) % prospectStages.length), prospectStages[stage].duration)
    return () => window.clearTimeout(timer)
  }, [reducedMotion, stage])

  if (reducedMotion) {
    return (
      <div className="prospect-sequence__reduced" aria-label="I did this for Align HCM. I can do it for HRchitect.">
        <span>I did this for</span><img src="/clients/align-hcm.png" alt="Align HCM" />
        <span>I can do it for</span><img src="/clients/hrchitect.svg" alt="HRchitect" />
      </div>
    )
  }

  const current = prospectStages[stage]
  return (
    <div className="prospect-sequence__stage" aria-live="polite">
      {current.kind === 'copy' && <p key={`${stage}-${current.value}`} className="prospect-sequence__copy">{current.value}</p>}
      {current.kind === 'logo' && <ProspectParticleLogo key={`${stage}-${current.value}`} brand={current.value} compact={compact} />}
    </div>
  )
}

export function AmbientParticleSpine() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  return (
    <div className="signal-particle-spine" aria-hidden="true">
      <Canvas dpr={[0.8, 1.2]} camera={{ position: [0, 0, 7.4], fov: 54 }} gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }} frameloop={reducedMotion ? 'demand' : 'always'}>
        <SpineParticles />
      </Canvas>
    </div>
  )
}
