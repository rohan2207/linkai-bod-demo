export function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * clamp01(t);
}

export function remap(value: number, start: number, end: number) {
  if (end <= start) return 0;
  return clamp01((value - start) / (end - start));
}

export function smoothstep01(value: number) {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
}

export function splitWords(text: string) {
  return text
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type SceneRange<T extends string> = {
  id: T;
  vh: number;
  start: number;
  end: number;
};

export function buildSceneRanges<T extends string>(sceneVh: Record<T, number>): SceneRange<T>[] {
  const entries = Object.entries(sceneVh) as [T, number][];
  const total = entries.reduce((acc, [, vh]) => acc + vh, 0) || 1;
  let cursor = 0;
  return entries.map(([id, vh]) => {
    const start = cursor / total;
    cursor += vh;
    const end = cursor / total;
    return { id, vh, start, end };
  });
}
