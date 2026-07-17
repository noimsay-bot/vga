import { categoryAmounts, fmt } from "./calculations";
import { C } from "./tokens";
import type { CoverageCategory } from "./types";

export function CategoryAmountText({ category }: { category: CoverageCategory }) {
  const amounts = categoryAmounts(category);
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs tabular-nums" style={{ color: C.muted }}>
      <span>표준 {fmt(amounts.needed)}만원</span>
      <span>가입 {fmt(amounts.held)}만원</span>
      <strong style={{ color: amounts.shortage > 0 ? C.low : C.full }}>
        {amounts.shortage > 0 ? `부족 ${fmt(amounts.shortage)}만원` : "부족 없음"}
      </strong>
    </div>
  );
}

export function CategoryAmountGrid({ categories }: { categories: CoverageCategory[] }) {
  return (
    <div className="mt-3 grid gap-x-5 gap-y-2 border-t pt-3 sm:grid-cols-2" style={{ borderColor: C.border }}>
      {categories.map((category) => (
        <div key={category.id} className="min-w-0">
          <div className="text-xs font-bold">{category.name}</div>
          <CategoryAmountText category={category} />
        </div>
      ))}
    </div>
  );
}
