import { bandOf, fmt, heldOf } from "./calculations";
import { bandColor, C } from "./tokens";
import type { CoverageItem } from "./types";

interface GaugeProps {
  item: CoverageItem;
}

export default function Gauge({ item }: GaugeProps) {
  const held = heldOf(item);
  const band = bandOf(item);
  const color = bandColor(band);
  const percentage =
    item.needed > 0 ? Math.min(held / item.needed, 1) * 100 : held > 0 ? 100 : 3;
  const shortage = Math.max(item.needed - held, 0);

  return (
    <div className="gap-item-print py-1.5">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm" style={{ color: C.ink }}>
          {item.name}
        </span>
        <span className="text-xs tabular-nums" style={{ color: C.muted }}>
          <b style={{ color: C.ink }}>{fmt(held)}</b> / {fmt(item.needed)}만원
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="relative h-2 flex-1 overflow-hidden rounded-full border"
          style={{ background: C.panel, borderColor: C.border }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-l-full"
            style={{
              width: `${percentage}%`,
              background: color,
              transition: "width .35s ease",
            }}
          />
        </div>
        <span
          className="text-[11px] font-semibold w-24 text-right tabular-nums"
          style={{ color: shortage > 0 ? C.low : C.full }}
        >
          {shortage > 0 ? `${fmt(shortage)}만원 부족` : "충분"}
        </span>
      </div>
    </div>
  );
}
