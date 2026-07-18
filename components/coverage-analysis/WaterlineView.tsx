import { scoreBand, scoreOf } from "./calculations";
import { bandColor, C } from "./tokens";
import { REPORT_DESIGN, reportBandGradient } from "./reportDesign";
import styles from "./ReportDesign.module.css";
import type { CoverageCategory } from "./types";
import { CategoryAmountText } from "./CategoryAmounts";

export default function WaterlineView({ categories }: { categories: CoverageCategory[] }) {
  return (
    <section
      className={`p-4 sm:p-5 ${styles.sectionCard}`}
      aria-label="카테고리별 보장 수위"
    >
      <div
        className="mb-5 grid items-center gap-3 text-xs font-semibold"
        style={{ color: C.muted, gridTemplateColumns: "1fr auto 1fr" }}
      >
        <span className={styles.referenceLine} />
        <span>필요 100%</span>
        <span className={styles.referenceLine} />
      </div>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(84px, 1fr))" }}
      >
        {categories.map((category) => {
          const score = scoreOf(category);
          const color = bandColor(scoreBand(score));
          const fillHeight = score === 0 ? 3 : Math.max(score, 3);
          const scoreBottom = score === 0 ? 7 : Math.max(fillHeight - 14, 7);
          return (
            <div key={category.id} className="min-w-0 text-center">
              <div
                className={`mx-auto h-52 w-full max-w-24 ${styles.waterTrack} ${score === 0 ? styles.waterZero : ""}`}
              >
                <div
                  className="absolute inset-x-0 top-0 border-t border-dashed"
                  style={{ borderColor: REPORT_DESIGN.faint }}
                />
                <div
                  className={styles.waterFill}
                  style={{ height: `${fillHeight}%`, background: reportBandGradient(scoreBand(score)) }}
                >
                  {score > 0 && (
                    <div
                      className="absolute -top-1.5 left-0 h-3 w-full rounded-full"
                      style={{ background: `${color}B8` }}
                    />
                  )}
                </div>
                {score === 0 && <span className={styles.zeroStub} aria-hidden="true" />}
                <span
                  className="absolute left-0 right-0 text-center text-sm font-extrabold"
                  style={{
                    bottom: `${scoreBottom}%`,
                    zIndex: 3,
                    color: score === 0 ? C.low : score >= 18 ? C.panel : C.ink,
                  }}
                >
                  {score}점
                </span>
              </div>
              <div className="mt-2 break-keep text-xs font-semibold">{category.name}</div>
              <div className="mt-1 text-left">
                <CategoryAmountText category={category} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
