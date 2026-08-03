/**
 * Pulse channel between the CTAs and the hero particle field.
 *
 * Lives outside SignalScene.tsx on purpose: the CTAs need to fire a pulse, but
 * importing them from the scene module would drag three.js into the entry
 * chunk and undo the code split.
 */
const listeners = new Set<() => void>();

export function pulseSignal() {
  listeners.forEach((listener) => listener());
}

export function onPulse(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
