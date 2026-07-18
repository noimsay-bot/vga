import { bandOf, fmt, heldOf } from "./calculations";
import { bandColor, C } from "./tokens";
import { reportBandGradient } from "./reportDesign";
import styles from "./ReportDesign.module.css";
import type { CoverageItem } from "./types";

interface GaugeProps {
  item: CoverageItem;
}

export default function Gauge({ item }: GaugeProps) {
  const held = heldOf(item);
  const band = bandOf(item);
  const color = bandColor(band);
  const percentage = item.needed > 0 ? Math.min(held / item.needed, 1) * 100 : held > 0 ? 100 : 0;
  const shortage = Math.max(item.needed - held, 0);
  const isEmpty = held === 0;

  return (
    <div className="gap-item-print py-3">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-sm font-semibold" style={{ color: isEmpty ? C.low : C.ink }}>
          {item.name}
        </span>
        <span className="text-xs tabular-nums" style={{ color: C.muted }}>
          <b style={{ color: C.ink }}>{fmt(held)}</b> / {fmt(item.needed)}만원
        </span>
      </div>
      <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_112px]">
        <div
          className={`${styles.track} ${styles.gapTrack} ${isEmpty ? styles.zeroTrack : ""}`}
        >
          {isEmpty ? (
            <>
              <span className={styles.zeroStub} aria-hidden="true" />
              <span className={styles.zeroMessage}>미보유 · 전액 부족</span>
            </>
          ) : (
            <div
              className={styles.fill}
              style={{
                width: `${percentage}%`,
                background: reportBandGradient(band),
              }}
            />
          )}
        </div>
        <span
          className="text-right text-xs font-semibold tabular-nums"
          style={{ color: shortage > 0 ? (isEmpty ? C.low : color) : C.full }}
        >
          {shortage > 0 ? `${fmt(shortage)}만원 부족` : "충분"}
        </span>
      </div>
    </div>
  );
}
