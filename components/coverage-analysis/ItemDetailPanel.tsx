import { bandOf, categoryAmounts, fmt, heldOf, ratioOf, scoreBand, scoreOf } from "./calculations";
import { bandColor, C } from "./tokens";
import type { CoverageCategory } from "./types";

export default function ItemDetailPanel({ categories }: { categories: CoverageCategory[] }) {
  return (
    <div className="mt-5 space-y-3" data-item-detail-panel>
      {categories.map((category) => {
        const score = scoreOf(category);
        const scoreColor = bandColor(scoreBand(score));
        const amounts = categoryAmounts(category);
        return (
          <section
            key={category.id}
            className="item-detail-category-print rounded-xl border p-4"
            style={{ borderColor: C.border, background: C.panel }}
          >
            <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-xs font-extrabold text-white"
                  style={{ background: scoreColor }}
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
                const color = bandColor(bandOf(item));
                return (
                  <div
                    key={item.id}
                    className="item-detail-row-print border-t py-2 first:border-t-0"
                    style={{ borderColor: C.border }}
                  >
                    <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-xs tabular-nums" style={{ color: C.muted }}>
                        <b style={{ color: C.ink }}>{fmt(held)}</b> / {fmt(item.needed)}만원
                        {shortage > 0 && <b style={{ color: C.low }}> ({fmt(shortage)}만원 부족)</b>}
                      </span>
                    </div>
                    <div
                      className="relative h-2 overflow-hidden rounded-full border"
                      style={{ background: C.track, borderColor: C.border }}
                    >
                      <div
                        className="absolute inset-y-0 left-0"
                        style={{ width: `${fill}%`, background: color }}
                      />
                      {shortage > 0 && (
                        <div
                          className="absolute inset-y-0 right-0"
                          style={{ width: `${100 - fill}%`, background: C.panel }}
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
