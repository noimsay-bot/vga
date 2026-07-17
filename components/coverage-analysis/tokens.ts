import type { CoverageBand } from "./types";

export const C = {
  bg: "#F4F6F8",
  panel: "#FFFFFF",
  ink: "#1C2530",
  muted: "#6B7682",
  border: "#E6E9ED",
  track: "#ECEFF2",
  brand: "#0E5C55",
  full: "#12897A",
  partial: "#D89A2C",
  low: "#D2483F",
} as const;

export const bandColor = (band: CoverageBand) =>
  band === "full" ? C.full : band === "partial" ? C.partial : C.low;

export const bandLabel = (band: CoverageBand) =>
  band === "full" ? "충분" : band === "partial" ? "부족" : "미흡";
