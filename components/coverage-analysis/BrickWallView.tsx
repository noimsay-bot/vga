"use client";

import { useState } from "react";
import { CategoryAmountText } from "./CategoryAmounts";
import { bandOf, heldOf, ratioOf, scoreBand, scoreOf } from "./calculations";
import { bandColor, C } from "./tokens";
import type { CoverageCategory, CoverageItem } from "./types";

type BrickFilter = "all" | "short";

interface BrickEntry {
  item: CoverageItem;
  weight: number;
}

export const buildBrickRows = (items: CoverageItem[], maxWeight = 72) => {
  const rows: BrickEntry[][] = [];
  let row: BrickEntry[] = [];
  let used = 0;
  items.forEach((item) => {
    const weight = Math.min(Math.max(item.name.length * 2 + 14, 18), 34);
    if (row.length && used + weight > maxWeight) {
      rows.push(row);
      row = [];
      used = 0;
    }
    row.push({ item, weight });
    used += weight;
  });
  if (row.length) rows.push(row);
  return rows;
};

export default function BrickWallView({ categories }: { categories: CoverageCategory[] }) {
  const [filter, setFilter] = useState<BrickFilter>("all");

  return (
    <section data-brick-filter={filter}>
      <div className="no-print mb-3 flex justify-end">
        <div className="flex rounded-lg border p-0.5" style={{ borderColor: C.border, background: C.panel }}>
          {([
            ["all", "전체"],
            ["short", "부족·미흡만"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className="rounded-md px-3 py-1.5 text-xs font-semibold"
              style={filter === value ? { background: C.brand, color: C.panel } : { color: C.muted }}
              aria-pressed={filter === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const score = scoreOf(category);
          const scoreColor = bandColor(scoreBand(score));
          const items = category.items.filter(
            (item) => filter === "all" || bandOf(item) !== "full",
          );
          const rows = buildBrickRows(items);
          return (
            <section
              key={category.id}
              className="brick-category-print rounded-xl border p-4"
              style={{ background: C.panel, borderColor: C.border }}
            >
              <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-extrabold text-white"
                    style={{ background: scoreColor }}
                  >
                    {score}점
                  </span>
                  <strong>{category.name}</strong>
                </div>
                <CategoryAmountText category={category} />
              </header>

              <div className="space-y-1.5 overflow-hidden">
                {rows.map((row, rowIndex) => (
                  <div
                    key={row.map(({ item }) => item.id).join("-")}
                    className="flex gap-1.5"
                    style={
                      rowIndex % 2
                        ? { paddingLeft: "3.5%", paddingRight: "1.75%" }
                        : { paddingLeft: 0, paddingRight: "5.25%" }
                    }
                    data-brick-row={rowIndex}
                  >
                    {row.map(({ item, weight }) => {
                      const held = heldOf(item);
                      const missing = held === 0;
                      const band = bandOf(item);
                      const color = bandColor(band);
                      const percent = Math.round(Math.min(ratioOf(item), 1) * 100);
                      return (
                        <div
                          key={item.id}
                          className="brick-print min-w-0 rounded-md border px-2 py-2 text-center"
                          style={{
                            flexGrow: weight,
                            flexBasis: 0,
                            background: missing ? C.panel : color,
                            borderColor: missing ? C.low : color,
                            borderStyle: missing ? "dashed" : "solid",
                            color: missing ? C.low : C.panel,
                          }}
                          data-brick-missing={missing ? "true" : "false"}
                        >
                          <div className="break-keep text-xs font-bold leading-tight">{item.name}</div>
                          <div className="mt-1 text-[11px] font-semibold">
                            {missing ? "미보유" : `충족 ${percent}%`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                {!rows.length && (
                  <div className="py-5 text-center text-xs" style={{ color: C.muted }}>
                    표시할 담보가 없습니다.
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-4 border-t-2 pt-2 text-center text-xs font-bold" style={{ borderColor: C.ink }}>
        우리 가족
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs" style={{ color: C.muted }}>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: C.full }} />충분</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: `linear-gradient(90deg, ${C.partial} 50%, ${C.low} 50%)` }} />부족</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border border-dashed" style={{ borderColor: C.low }} />미보유(구멍)</span>
      </div>
    </section>
  );
}
