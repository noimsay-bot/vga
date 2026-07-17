import { bandOf, scoreOf } from "./calculations";
import Donut from "./Donut";
import { bandColor, C } from "./tokens";
import type { CoverageCategory } from "./types";

export default function HeatmapView({ categories }: { categories: CoverageCategory[] }) {
  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <section
          key={category.id}
          className="rounded-xl border p-4"
          style={{ borderColor: C.border, background: C.panel }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex shrink-0 items-center gap-3 sm:w-48">
              <Donut score={scoreOf(category)} />
              <div>
                <div className="font-bold">{category.name}</div>
                <div className="text-xs" style={{ color: C.muted }}>
                  {category.items.length}개 담보
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-wrap gap-2">
              {category.items.map((item) => {
                const band = bandOf(item);
                const color = bandColor(band);
                return (
                  <span
                    key={item.id}
                    className="rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{ background: `${color}1F`, color }}
                  >
                    {item.name}
                  </span>
                );
              })}
              {category.items.length === 0 && (
                <span className="text-xs" style={{ color: C.muted }}>
                  항목을 추가하세요.
                </span>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
