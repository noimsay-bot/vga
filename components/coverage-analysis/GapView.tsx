import { bandOf, scoreOf } from "./calculations";
import Donut from "./Donut";
import Gauge from "./Gauge";
import { C } from "./tokens";
import type { CoverageCategory } from "./types";
import { CategoryAmountText } from "./CategoryAmounts";
import styles from "./ReportDesign.module.css";

export default function GapView({ categories }: { categories: CoverageCategory[] }) {
  return (
    <div className="space-y-5">
      {categories.map((category) => {
        const score = scoreOf(category);
        return (
          <section
            key={category.id}
            className={`gap-category-print p-4 sm:p-5 ${styles.sectionCard}`}
          >
            <div className="mb-4 flex items-center gap-3 border-b pb-4" style={{ borderColor: C.border }}>
              <Donut score={score} premium />
              <div>
                <div className="text-lg font-bold leading-tight">{category.name}</div>
                <div className="text-xs" style={{ color: C.muted }}>
                  {category.items.length}개 담보 · 보완 {category.items.filter((item) => bandOf(item) !== "full").length}건
                </div>
                <CategoryAmountText category={category} />
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: C.border }}>
              {category.items.map((item) => (
                <Gauge key={item.id} item={item} />
              ))}
              {category.items.length === 0 && (
                <div className="py-3 text-xs" style={{ color: C.muted }}>
                  항목을 추가하세요.
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
