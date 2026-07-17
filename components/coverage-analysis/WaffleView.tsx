import { scoreBand, scoreOf } from "./calculations";
import { bandColor, bandLabel, C } from "./tokens";
import type { CoverageCategory } from "./types";
import { CategoryAmountText } from "./CategoryAmounts";

export default function WaffleView({ categories }: { categories: CoverageCategory[] }) {
  return (
    <section
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: C.border, background: C.panel }}
      aria-label="카테고리별 10칸 블록 미터"
    >
      {categories.map((category) => {
        const score = scoreOf(category);
        const band = scoreBand(score);
        const color = bandColor(band);
        const filled = Math.round(score / 10);
        return (
          <div
            key={category.id}
            className="border-b px-4 py-4 last:border-b-0"
            style={{ borderColor: C.border }}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="font-bold">{category.name}</div>
              <div className="flex items-center gap-2 text-sm font-bold tabular-nums">
                <span style={{ color }}>{bandLabel(band)}</span>
                <span>{score}점</span>
              </div>
            </div>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}>
              {Array.from({ length: 10 }, (_, index) => {
                const isFilled = index < filled;
                return (
                  <span
                    key={index}
                    className="block h-8 rounded-sm border"
                    style={{
                      background: isFilled ? color : C.track,
                      borderColor: isFilled ? color : C.border,
                    }}
                    aria-hidden="true"
                  />
                );
              })}
            </div>
            <div className="mt-2">
              <CategoryAmountText category={category} />
            </div>
          </div>
        );
      })}
    </section>
  );
}
