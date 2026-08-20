import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

type PointCloud = {
  dispersed: Float32Array
  target: Float32Array
  colors: Float32Array
  phases: Float32Array
}

const vertexShader = `
uniform float uTime;
uniform float uMorph;
attribute vec3 aTarget;
attribute vec3 aColor;
attribute float aPhase;
varying vec3 vColor;
varying float vResolved;
void main() {
  float settled = smoothstep(0.0, 1.0, uMorph);
  vec3 p = mix(position, aTarget, settled);
  float freedom = 1.0 - settled;
  p.x += cos(uTime * .42 + aPhase * 6.283) * .035 * freedom;
  p.y += sin(uTime * .48 + aPhase * 6.283) * .045 * freedom;
  p.z += sin(uTime * .36 + aPhase * 9.0) * .06 * freedom;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float depthScale = clamp(8.0 / -mv.z, .55, 2.0);
  gl_PointSize = (1.45 + aPhase * 1.65 + settled * .5) * depthScale;
  gl_Position = projectionMatrix * mv;
  vColor = aColor;
  vResolved = settled;
}
`

const fragmentShader = `
varying vec3 vColor;
varying float vResolved;
void main() {
  vec2 uv = gl_PointCoord - .5;
  float d = length(uv);
  if (d > .5) discard;
  float core = 1.0 - smoothstep(mix(.13, .3, vResolved), .5, d);
  float halo = (1.0 - smoothstep(.18, .5, d)) * mix(.32, .08, vResolved);
  gl_FragColor = vec4(vColor * (1.0 + halo), core * mix(.84, .98, vResolved));
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

async function sampleLogo(count: number, compact: boolean): Promise<PointCloud> {
  const image = new Image()
  image.decoding = 'async'
  image.src = '/brand/immohrtal-logo.png'
  await image.decode()

  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 600
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Logo sampling canvas unavailable')
  const scale = Math.min((canvas.width - 34) / image.naturalWidth, (canvas.height - 34) / image.naturalHeight)
  const width = image.naturalWidth * scale
  const height = image.naturalHeight * scale
  context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  const candidates: Array<[number, number, number, number, number, number]> = []
  let minX = canvas.width
  let maxX = 0
  let minY = canvas.height
  let maxY = 0
  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      const offset = (y * canvas.width + x) * 4
      const alpha = pixels[offset + 3]
      if (alpha < 48) continue
      candidates.push([x, y, pixels[offset], pixels[offset + 1], pixels[offset + 2], alpha])
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }
  }

  if (!candidates.length) throw new Error('Immortal logo alpha mask is empty')

  const random = seededRandom(8777)
  const dispersed = new Float32Array(count * 3)
  const target = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const cobalt = new THREE.Color('#287dff')
  const cyan = new THREE.Color('#18c8ff')
  const mint = new THREE.Color('#58edb2')
  const silver = new THREE.Color('#dce4ed')

  for (let index = 0; index < count; index += 1) {
    const sample = candidates[Math.floor(random() * candidates.length)]
    const maskWidth = Math.max(maxX - minX, 1)
    const maskHeight = Math.max(maxY - minY, 1)
    const targetWidth = compact ? 3.7 : 3.85
    const targetHeight = targetWidth * (maskHeight / maskWidth)
    const tx = ((sample[0] - minX) / maskWidth - .5) * targetWidth + (random() - .5) * .004
    const ty = -((sample[1] - minY) / maskHeight - .5) * targetHeight + (random() - .5) * .004
    const tz = (random() - .5) * .025
    target.set([tx, ty, tz], index * 3)

    const angle = random() * Math.PI * 2
    const radius = .06 + Math.pow(random(), 2.2) * (compact ? .28 : .32)
    dispersed.set([
      tx + Math.cos(angle) * radius,
      ty + Math.sin(angle) * radius,
      tz + (random() - .5) * .38,
    ], index * 3)

    const isCyan = sample[2] < 125 && sample[3] > 115 && sample[4] > 145
    const color = isCyan
      ? cyan.clone().lerp(mint, random() * .22)
      : random() > .88
        ? cobalt.clone().lerp(cyan, random())
        : silver.clone().lerp(new THREE.Color('#9fb2c9'), random() * .38)
    const alpha = sample[5] / 255
    colors.set([color.r * alpha, color.g * alpha, color.b * alpha], index * 3)
    phases[index] = random()
  }
  return { dispersed, target, colors, phases }
}

function Points({ compact, reduced }: { compact: boolean; reduced: boolean }) {
  const count = compact ? 14000 : 26000
  const [cloud, setCloud] = useState<PointCloud | null>(null)
  const points = useRef<THREE.Points>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorph: { value: reduced ? 1 : 0 },
  }), [reduced])

  useEffect(() => {
    let active = true
    sampleLogo(count, compact).then((next) => active && setCloud(next)).catch(() => undefined)
    return () => { active = false }
  }, [compact, count])

  useFrame((state) => {
    if (!material.current || !points.current) return
    if (reduced) {
      material.current.uniforms.uMorph.value = 1
      return
    }
    const elapsed = state.clock.elapsedTime
    const phase = elapsed % 12
    let morph = 0
    if (phase >= .4 && phase < 1.8) morph = THREE.MathUtils.smoothstep(phase, .4, 1.8)
    else if (phase >= 1.8 && phase < 10.2) morph = 1
    else if (phase >= 10.2 && phase < 11.6) morph = 1 - THREE.MathUtils.smoothstep(phase, 10.2, 11.6)
    material.current.uniforms.uTime.value = elapsed
    material.current.uniforms.uMorph.value = morph
  })

  if (!cloud) return null
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[cloud.dispersed, 3]} />
        <bufferAttribute attach="attributes-aTarget" args={[cloud.target, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[cloud.colors, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[cloud.phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
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

export function ParticleLogo() {
  const compact = useMediaQuery('(max-width: 760px)')
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  return (
    <div className={`particle-logo${reduced ? ' particle-logo--static' : ''}`} role="img" aria-label="Complete IMMOHRTAL logo rendered as particles">
      <img src="/brand/immohrtal-logo.png" alt="" aria-hidden="true" />
      {!reduced && (
        <Canvas
          dpr={[1, 1.45]}
          camera={{ position: [0, 0, compact ? 7.4 : 7.7], fov: compact ? 43 : 40 }}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        >
          <Points compact={compact} reduced={reduced} />
        </Canvas>
      )}
    </div>
  )
}
