import { bandColor, C } from "./tokens";
import type { CoverageBand } from "./types";

const LEGEND: Array<[CoverageBand, string]> = [
  ["full", "충분 · 100% 이상"],
  ["partial", "부족 · 30% 이상"],
  ["low", "미흡 · 30% 미만"],
];

export default function CoverageLegend() {
  return (
    <div className="mt-5 flex flex-wrap gap-4 border-t pt-3 text-xs" style={{ borderColor: C.border }}>
      {LEGEND.map(([band, text]) => (
        <div key={band} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: bandColor(band) }} />
          <span style={{ color: C.muted }}>{text}</span>
        </div>
      ))}
    </div>
  );
}
