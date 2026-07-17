import { scoreBand, scoreOf } from "./calculations";
import { bandColor, C } from "./tokens";
import type { CoverageCategory } from "./types";
import { CategoryAmountText } from "./CategoryAmounts";

export default function WaterlineView({ categories }: { categories: CoverageCategory[] }) {
  return (
    <section
      className="rounded-xl border p-4"
      style={{ borderColor: C.border, background: C.panel }}
      aria-label="카테고리별 보장 수위"
    >
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold" style={{ color: C.muted }}>
        <span className="inline-block w-8 border-t border-dashed" style={{ borderColor: C.muted }} />
        필요 100%
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
                className="relative mx-auto h-52 w-full max-w-24 overflow-hidden rounded-b-xl border"
                style={{ background: C.track, borderColor: C.border }}
              >
                <div
                  className="absolute inset-x-0 top-0 border-t border-dashed"
                  style={{ borderColor: C.muted }}
                />
                <div
                  className="absolute inset-x-0 bottom-0"
                  style={{ height: `${fillHeight}%`, background: color }}
                >
                  {score > 0 && (
                    <div
                      className="absolute -top-1.5 left-0 h-3 w-full rounded-full"
                      style={{ background: `${color}B8` }}
                    />
                  )}
                </div>
                <span
                  className="absolute left-0 right-0 text-center text-sm font-extrabold"
                  style={{
                    bottom: `${scoreBottom}%`,
                    color: score >= 18 ? C.panel : C.ink,
                  }}
                >
                  {score}
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
