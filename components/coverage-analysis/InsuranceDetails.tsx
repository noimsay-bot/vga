import { fmt } from "./calculations";
import { C } from "./tokens";
import type { CoverageCategory } from "./types";

export default function InsuranceDetails({ categories }: { categories: CoverageCategory[] }) {
  const coveredItems = categories.flatMap((category) =>
    category.items
      .filter((item) => item.insurers.length > 0)
      .map((item) => ({ categoryName: category.name, item })),
  );

  if (coveredItems.length === 0) return null;

  return (
    <section
      className="mt-4 rounded-xl border p-4"
      style={{ borderColor: C.border, background: C.panel }}
    >
      <div className="mb-3 font-bold">가입 보험사·상품 상세</div>
      <div className="space-y-3">
        {coveredItems.map(({ categoryName, item }) => (
          <div key={item.id} className="border-b pb-3 last:border-b-0 last:pb-0" style={{ borderColor: C.border }}>
            <div className="text-xs" style={{ color: C.muted }}>
              {categoryName}
            </div>
            <div className="text-sm font-semibold">{item.name}</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {item.insurers.map((insurer) => (
                <span
                  key={insurer.id}
                  className="rounded-md px-2 py-1 text-xs"
                  style={{ background: C.track, color: C.ink }}
                >
                  {insurer.name || "보험사/상품명 없음"} · {fmt(insurer.amount)}만원
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
