import type { CoverageBand } from "./types";

export const REPORT_DESIGN = {
  background: "radial-gradient(120% 80% at 50% -10%, #F2F4F7, #ECEFF3 55%)",
  auxiliary: "#8A94A0",
  faint: "#B9C2CE",
  divider: "#E4E8ED",
  trackBorder: "#E4E8ED",
  itemTrackBorder: "#E7EBF0",
  waterTrack: "linear-gradient(180deg, #ECEFF4, #F5F7FA)",
  zeroTrack: "linear-gradient(180deg, #FBEEEC, #FDF5F4)",
  brandGradient: "linear-gradient(150deg, #17A38F, #0B4F49)",
  brandPanelShadow:
    "0 10px 26px -12px rgba(11,79,73,.35), inset 0 1px 0 rgba(255,255,255,.18)",
  bandGradients: {
    full: "linear-gradient(180deg, #17A38F, #0B4F49)",
    partial: "linear-gradient(180deg, #EBBA5E, #B27818)",
    low: "linear-gradient(180deg, #E0655B, #B4322A)",
  },
  bandGradientStops: {
    full: ["#17A38F", "#0B4F49"],
    partial: ["#EBBA5E", "#B27818"],
    low: ["#E0655B", "#B4322A"],
  },
} as const;

export const reportBandGradient = (band: CoverageBand) =>
  REPORT_DESIGN.bandGradients[band];

export const reportBandGradientStops = (band: CoverageBand) =>
  REPORT_DESIGN.bandGradientStops[band];

export const reportStatusMessage = (band: CoverageBand) =>
  band === "full"
    ? "현재 보장이 충분한 단계입니다"
    : band === "partial"
      ? "보완이 필요한 단계입니다"
      : "우선 보완이 필요한 단계입니다";
