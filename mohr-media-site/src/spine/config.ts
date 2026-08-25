export interface SpineSection {
  id: string
  label: string
}

export interface SpineConfig {
  sections: SpineSection[]
  palette: [string, string, string]
  sampleAudio?: () => number | null
  dark?: boolean
}

export interface SpineHud {
  waypoint: number
  pct: string
}

export interface SpineEngine {
  destroy(): void
  pulse(v?: number): void
  recomputeRegistry(): void
  onHud(cb: (hud: SpineHud) => void): () => void
}

export const SPINE_SECTIONS: SpineSection[] = [
  { id: 'top', label: 'SIGNAL IN' },
  { id: 'align', label: 'ALIGN HCM' },
  { id: 'work', label: 'ALIGN SYSTEMS' },
  { id: 'motion', label: 'MOTION' },
  { id: 'vault', label: 'PUBLIC PROOF' },
  { id: 'contact', label: 'OPEN CHANNEL' },
]

export const SPINE_PALETTE: [string, string, string] = ['#287dff', '#18c8ff', '#58edb2']

export function hexToVec3(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}
