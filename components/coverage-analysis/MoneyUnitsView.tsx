import { categoryAmounts, fmt, heldOf, scoreBand, scoreOf } from "./calculations";
import { bandColor, C } from "./tokens";
import type { CoverageCategory } from "./types";

const UNIT_CANDIDATES = [1000, 2000, 5000, 10000] as const;

const neededTotal = (category: CoverageCategory) =>
  category.items.reduce((sum, item) => sum + (item.needed || 0), 0);

export const selectMoneyUnit = (categories: CoverageCategory[]) => {
  const maximumNeeded = Math.max(0, ...categories.map(neededTotal));
  return (
    UNIT_CANDIDATES.find((unit) => Math.ceil(maximumNeeded / unit) <= 20) ??
    UNIT_CANDIDATES[UNIT_CANDIDATES.length - 1]
  );
};

export const moneyUnitSummary = (category: CoverageCategory, unit: number) => {
  const needed = neededTotal(category);
  const heldCapped = category.items.reduce(
    (sum, item) => sum + Math.min(heldOf(item), item.needed || 0),
    0,
  );
  const shortage = category.items.reduce(
    (sum, item) => sum + Math.max((item.needed || 0) - heldOf(item), 0),
    0,
  );
  const totalCells = Math.ceil(needed / unit);
  const filledCells = Math.min(Math.round(heldCapped / unit), totalCells);
  return { needed, heldCapped, shortage, totalCells, filledCells };
};

export default function MoneyUnitsView({ categories }: { categories: CoverageCategory[] }) {
  const unit = selectMoneyUnit(categories);
  const rows = categories
    .map((category) => ({ category, summary: moneyUnitSummary(category, unit) }))
    .filter(({ summary }) => summary.needed > 0);

  return (
    <section
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: C.border, background: C.panel }}
      data-money-unit={unit}
    >
      <div className="border-b px-4 py-3 text-xs font-semibold" style={{ borderColor: C.border, color: C.muted }}>
        1칸 = {fmt(unit)}만원
      </div>
      {rows.map(({ category, summary }) => {
        const color = bandColor(scoreBand(scoreOf(category)));
        const allMissing = summary.heldCapped === 0;
        const amounts = categoryAmounts(category);
        return (
          <div
            key={category.id}
            className="money-unit-row-print border-b px-4 py-3 last:border-b-0"
            style={{ borderColor: C.border }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="shrink-0 sm:w-36">
                <div className="text-sm font-bold">{category.name}</div>
                <div className="text-xs tabular-nums" style={{ color: C.muted }}>
                  필요 {fmt(summary.needed)}만원 · 가입 {fmt(amounts.held)}만원
                </div>
              </div>
              <div
                className="grid min-w-0 flex-1 gap-1"
                style={{ gridTemplateColumns: `repeat(${summary.totalCells}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: summary.totalCells }, (_, index) => {
                  const filled = index < summary.filledCells;
                  return (
                    <span
                      key={index}
                      className="block h-6 rounded-sm border"
                      style={{
                        background: allMissing ? C.panel : filled ? color : C.track,
                        borderColor: allMissing ? C.low : filled ? color : C.border,
                        borderStyle: allMissing ? "dashed" : "solid",
                      }}
                      aria-hidden="true"
                    />
                  );
                })}
              </div>
              <div
                className="shrink-0 text-right text-xs font-bold tabular-nums sm:w-24"
                style={{ color: summary.shortage ? C.low : C.full }}
              >
                {allMissing
                  ? "전액 부족"
                  : summary.shortage > 0
                    ? `${fmt(summary.shortage)}만원 부족`
                    : ""}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
