// IMMOHRTAL brand palette — pulled from immohrtal-site (chrome/night aesthetic)
export const C = {
  bgDeep: '#05070c',
  bgNavy: '#0a101c',
  bgSlate: '#0d1623',
  green: '#35d18f',
  greenSoft: '#7cf3bd',
  blue: '#35a7ff',
  blueSoft: '#8bd0ff',
  ice: '#bde5ff',
  steel: '#8aa0bd',
  white: '#f4f8ff',
} as const;

export const FPS = 30;

// Calm logo intro before the song starts.
export const AUDIO_OFFSET_SEC = 2.4;

// Fade-to-black tail after the audio ends.
export const OUTRO_TAIL_SEC = 1.6;

export const FONT_FAMILY = `'Anton', 'Arial Narrow', sans-serif`;

// Chrome-style extruded 3D text shadow stack.
export const extrude = (depth: number, color = '#020408'): string => {
  const layers: string[] = [];
  for (let i = 1; i <= depth; i++) {
    layers.push(`${i * 0.9}px ${i * 1.1}px 0 ${color}`);
  }
  return layers.join(', ');
};
