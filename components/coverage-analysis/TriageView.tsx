import { scoreBand, scoreOf } from "./calculations";
import { bandColor, bandLabel, C } from "./tokens";
import type { CoverageCategory } from "./types";
import { CategoryAmountText } from "./CategoryAmounts";

export default function TriageView({ categories }: { categories: CoverageCategory[] }) {
  const ranked = categories
    .map((category) => ({ category, score: scoreOf(category) }))
    .sort((left, right) => left.score - right.score);

  return (
    <section
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: C.border, background: C.panel }}
      aria-label="카테고리별 채움 우선순위"
    >
      {ranked.map(({ category, score }, index) => {
        const band = scoreBand(score);
        const color = bandColor(band);
        return (
          <div
            key={category.id}
            className="relative flex flex-col gap-2 border-b px-4 py-3 last:border-b-0 sm:flex-row sm:items-center"
            style={{ borderColor: C.border }}
          >
            <span className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />
            <div className="flex min-w-0 items-center gap-3 sm:w-56">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: color }}
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{category.name}</div>
                <div className="text-xs font-semibold" style={{ color }}>
                  {bandLabel(band)}
                </div>
                <CategoryAmountText category={category} />
              </div>
            </div>
            <div className="flex flex-1 items-center gap-3 pl-10 sm:pl-0">
              <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: C.track }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${score === 0 ? 0 : score}%`, background: color }}
                />
                {score === 0 && <div className="h-full w-1" style={{ background: color }} />}
              </div>
              <span className="w-10 text-right text-sm font-bold tabular-nums">{score}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
