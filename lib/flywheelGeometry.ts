/** Shared 200×200 SVG model space for flywheel + morph ring */

export const FW_CX = 100;
export const FW_CY = 100;
export const FW_RO = 90;
export const FW_RI = 54;
export const FW_GAP = 3;

/** Stable numeric strings across Node (SSR) and browsers — avoids hydration mismatches on SVG paths/transforms. */
export function fwRound(n: number, digits = 4): number {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

export function fwPolar(r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [fwRound(FW_CX + r * Math.cos(a)), fwRound(FW_CY + r * Math.sin(a))] as const;
}

export function fwArc(ro: number, ri: number, s: number, e: number) {
  const [x1, y1] = fwPolar(ro, s);
  const [x2, y2] = fwPolar(ro, e);
  const [x3, y3] = fwPolar(ri, e);
  const [x4, y4] = fwPolar(ri, s);
  const lg = e - s > 180 ? 1 : 0;
  return `M${x1} ${y1}A${ro} ${ro} 0 ${lg} 1 ${x2} ${y2}L${x3} ${y3}A${ri} ${ri} 0 ${lg} 0 ${x4} ${y4}Z`;
}

export function fwSegMidpoints(n: number) {
  const segDeg = 360 / n;
  return Array.from({ length: n }, (_, i) => {
    const sd = fwRound(i * segDeg + FW_GAP / 2, 6);
    const ed = fwRound((i + 1) * segDeg - FW_GAP / 2, 6);
    const md = fwRound((sd + ed) / 2, 6);
    const lr = (FW_RO + FW_RI) / 2;
    const [lx, ly] = fwPolar(lr, md);
    return { sd, ed, md, lx, ly, d: fwArc(FW_RO, FW_RI, sd, ed) };
  });
}
