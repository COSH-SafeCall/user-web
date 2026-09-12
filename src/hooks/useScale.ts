import { useMemo } from "react";
import type { CSSProperties } from "react";

const W = 402;
const H = 874;

export function useScale(max = 1.15, min = 0.82) {
  return useMemo(() => ({
    "--screen-w": `${W}px`,
    "--screen-h": `${H}px`,
    "--scale-max": String(max),
    "--scale-min": String(min),
  }) as CSSProperties, [max, min]);
}
