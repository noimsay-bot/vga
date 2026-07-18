import { bandOf, categoryAmounts, fmt, heldOf, ratioOf, scoreBand, scoreOf } from "./calculations";
import { C } from "./tokens";
import { reportBandGradient } from "./reportDesign";
import styles from "./ReportDesign.module.css";
import type { CoverageCategory } from "./types";

export default function ItemDetailPanel({ categories }: { categories: CoverageCategory[] }) {
  return (
    <div className="mt-5 space-y-3" data-item-detail-panel>
      {categories.map((category) => {
        const score = scoreOf(category);
        const amounts = categoryAmounts(category);
        return (
          <section
            key={category.id}
            className={`item-detail-category-print p-4 ${styles.sectionCard}`}
          >
            <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-xs font-extrabold text-white"
                  style={{ background: reportBandGradient(scoreBand(score)) }}
                >
                  {score}
                </span>
                <div>
                  <div className="font-bold">{category.name}</div>
                  <div className="text-xs tabular-nums" style={{ color: C.muted }}>
                    표준 {fmt(amounts.needed)}만원 · 가입 {fmt(amounts.held)}만원
                  </div>
                </div>
              </div>
              <strong className="text-xs tabular-nums" style={{ color: amounts.shortage ? C.low : C.full }}>
                {amounts.shortage ? `${fmt(amounts.shortage)}만원 부족` : "부족 없음"}
              </strong>
            </header>

            <div>
              {category.items.map((item) => {
                const held = heldOf(item);
                const shortage = Math.max(item.needed - held, 0);
                const fill = Math.min(ratioOf(item), 1) * 100;
                const band = bandOf(item);
                const isEmpty = held === 0 && item.needed > 0;
                return (
                  <div
                    key={item.id}
                    className={`item-detail-row-print border-t py-2 first:border-t-0 ${isEmpty ? styles.zeroRow : ""}`}
                    style={{ borderColor: C.border }}
                  >
                    <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-xs tabular-nums" style={{ color: C.muted }}>
                        <b style={{ color: C.ink }}>{fmt(held)}</b> / {fmt(item.needed)}만원
                        {shortage > 0 && (
                          <b style={{ color: C.low }}>
                            {isEmpty ? ` (미보유 · 전액 부족 ${fmt(shortage)}만원)` : ` (${fmt(shortage)}만원 부족)`}
                          </b>
                        )}
                      </span>
                    </div>
                    <div
                      className={`${styles.track} ${styles.itemTrack} ${isEmpty ? styles.zeroTrack : ""}`}
                    >
                      {isEmpty ? (
                        <span className={styles.zeroStub} aria-hidden="true" />
                      ) : (
                        <div
                          className={styles.fill}
                          style={{ width: `${fill}%`, background: reportBandGradient(band) }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
              {category.items.length === 0 && (
                <div className="py-3 text-xs" style={{ color: C.muted }}>
                  담보 항목이 없습니다.
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
