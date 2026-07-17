"use client";

import { useState } from "react";
import { CategoryAmountGrid } from "./CategoryAmounts";
import { bandOf, fmt, heldOf, ratioOf } from "./calculations";
import { bandColor, C } from "./tokens";
import type { CoverageCategory, CoverageItem } from "./types";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Weighted<T> {
  datum: T;
  value: number;
}

interface AreaWeighted<T> extends Weighted<T> {
  area: number;
}

interface TreemapRect<T> extends Rect {
  datum: T;
}

const worstRatio = <T,>(row: AreaWeighted<T>[], side: number) => {
  if (!row.length || side <= 0) return Number.POSITIVE_INFINITY;
  const sum = row.reduce((total, entry) => total + entry.area, 0);
  const largest = Math.max(...row.map((entry) => entry.area));
  const smallest = Math.min(...row.map((entry) => entry.area));
  if (smallest <= 0 || sum <= 0) return Number.POSITIVE_INFINITY;
  const sideSquared = side * side;
  const sumSquared = sum * sum;
  return Math.max(
    (sideSquared * largest) / sumSquared,
    sumSquared / (sideSquared * smallest),
  );
};

const placeRow = <T,>(row: AreaWeighted<T>[], rect: Rect) => {
  const rowArea = row.reduce((sum, entry) => sum + entry.area, 0);
  const tiles: TreemapRect<T>[] = [];

  if (rect.width >= rect.height) {
    const stripWidth = rect.height > 0 ? rowArea / rect.height : 0;
    let y = rect.y;
    row.forEach((entry, index) => {
      const height = stripWidth > 0 ? entry.area / stripWidth : 0;
      tiles.push({
        datum: entry.datum,
        x: rect.x,
        y,
        width: stripWidth,
        height: index === row.length - 1 ? rect.y + rect.height - y : height,
      });
      y += height;
    });
    return {
      tiles,
      remaining: {
        x: rect.x + stripWidth,
        y: rect.y,
        width: Math.max(rect.width - stripWidth, 0),
        height: rect.height,
      },
    };
  }

  const stripHeight = rect.width > 0 ? rowArea / rect.width : 0;
  let x = rect.x;
  row.forEach((entry, index) => {
    const width = stripHeight > 0 ? entry.area / stripHeight : 0;
    tiles.push({
      datum: entry.datum,
      x,
      y: rect.y,
      width: index === row.length - 1 ? rect.x + rect.width - x : width,
      height: stripHeight,
    });
    x += width;
  });
  return {
    tiles,
    remaining: {
      x: rect.x,
      y: rect.y + stripHeight,
      width: rect.width,
      height: Math.max(rect.height - stripHeight, 0),
    },
  };
};

export const squarify = <T,>(entries: Weighted<T>[], bounds: Rect): TreemapRect<T>[] => {
  const positive = entries.filter((entry) => entry.value > 0).sort((a, b) => b.value - a.value);
  const total = positive.reduce((sum, entry) => sum + entry.value, 0);
  if (!total || bounds.width <= 0 || bounds.height <= 0) return [];

  const scale = (bounds.width * bounds.height) / total;
  const pending: AreaWeighted<T>[] = positive.map((entry) => ({
    ...entry,
    area: entry.value * scale,
  }));
  const output: TreemapRect<T>[] = [];
  let remaining = { ...bounds };
  let row: AreaWeighted<T>[] = [];

  while (pending.length) {
    const next = pending[0];
    const side = Math.min(remaining.width, remaining.height);
    if (!row.length || worstRatio([...row, next], side) <= worstRatio(row, side)) {
      row.push(next);
      pending.shift();
    } else {
      const placed = placeRow(row, remaining);
      output.push(...placed.tiles);
      remaining = placed.remaining;
      row = [];
    }
  }
  if (row.length) output.push(...placeRow(row, remaining).tiles);
  return output;
};

type TreemapFilter = "all" | "short";

interface CategoryDatum {
  category: CoverageCategory;
  items: CoverageItem[];
}

export default function TreemapView({ categories }: { categories: CoverageCategory[] }) {
  const [filter, setFilter] = useState<TreemapFilter>("all");
  const groups: CategoryDatum[] = categories
    .map((category) => ({
      category,
      items: category.items.filter(
        (item) => item.needed > 0 && (filter === "all" || bandOf(item) !== "full"),
      ),
    }))
    .filter((group) => group.items.length > 0);
  const categoryRects = squarify(
    groups.map((group) => ({
      datum: group,
      value: group.items.reduce((sum, item) => sum + item.needed, 0),
    })),
    { x: 0, y: 0, width: 800, height: 460 },
  );

  return (
    <section
      className="rounded-xl border p-3 sm:p-4"
      style={{ borderColor: C.border, background: C.panel }}
      data-treemap-filter={filter}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs" style={{ color: C.muted }}>
          면적 = 필요보장 크기 · 색 = 충족 상태
        </p>
        <div className="no-print flex rounded-lg border p-0.5" style={{ borderColor: C.border }}>
          {([
            ["all", "전체 표시"],
            ["short", "부족·미흡만 표시"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className="rounded-md px-2.5 py-1.5 text-xs font-semibold"
              style={
                filter === value
                  ? { background: C.brand, color: C.panel }
                  : { background: C.panel, color: C.muted }
              }
              aria-pressed={filter === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {categoryRects.length ? (
        <svg
          viewBox="0 0 800 460"
          className="block h-auto w-full"
          role="img"
          aria-label={`담보별 필요보장 크기와 충족 상태 트리맵, ${filter === "all" ? "전체" : "부족 및 미흡"} 표시`}
        >
          {categoryRects.map((categoryRect) => {
            const { category, items } = categoryRect.datum;
            const showCategoryLabel = categoryRect.width >= 100 && categoryRect.height >= 58;
            const headerHeight = showCategoryLabel ? 22 : 0;
            const inner = {
              x: categoryRect.x + 3,
              y: categoryRect.y + headerHeight + 3,
              width: Math.max(categoryRect.width - 6, 0),
              height: Math.max(categoryRect.height - headerHeight - 6, 0),
            };
            const itemRects = squarify(
              items.map((item) => ({ datum: item, value: item.needed })),
              inner,
            );
            return (
              <g key={category.id}>
                <rect
                  x={categoryRect.x + 1}
                  y={categoryRect.y + 1}
                  width={Math.max(categoryRect.width - 2, 0)}
                  height={Math.max(categoryRect.height - 2, 0)}
                  fill={C.panel}
                  stroke={C.bg}
                  strokeWidth="3"
                />
                {showCategoryLabel && (
                  <text
                    x={categoryRect.x + 7}
                    y={categoryRect.y + 16}
                    fontSize="12"
                    fontWeight="700"
                    fill={C.ink}
                  >
                    {category.name}
                  </text>
                )}
                {itemRects.map((rect) => {
                  const item = rect.datum;
                  const band = bandOf(item);
                  const color = bandColor(band);
                  const held = heldOf(item);
                  const shortage = Math.max(item.needed - held, 0);
                  const percentage = Math.round(Math.min(ratioOf(item), 1) * 100);
                  const showText = rect.width >= 82 && rect.height >= 42;
                  const showAmounts = rect.width >= 112 && rect.height >= 62;
                  const tooltip = `${category.name} · ${item.name} · 충족 ${percentage}% · 필요 ${fmt(item.needed)}만원${shortage > 0 ? ` · ${fmt(shortage)}만원 부족` : ""}`;
                  return (
                    <g key={item.id}>
                      <title>{tooltip}</title>
                      <rect
                        x={rect.x}
                        y={rect.y}
                        width={Math.max(rect.width, 0)}
                        height={Math.max(rect.height, 0)}
                        fill={color}
                        stroke={C.bg}
                        strokeWidth="3"
                      />
                      {showText && (
                        <text x={rect.x + 7} y={rect.y + 17} fontSize="11" fontWeight="700" fill={C.panel}>
                          <tspan x={rect.x + 7}>{item.name}</tspan>
                          <tspan x={rect.x + 7} dy="15" fontSize="10" fontWeight="500">
                            충족 {percentage}%
                          </tspan>
                          {showAmounts && (
                            <tspan x={rect.x + 7} dy="14" fontSize="9" fontWeight="500">
                              필요 {fmt(item.needed)}만원
                            </tspan>
                          )}
                          {showAmounts && shortage > 0 && (
                            <tspan x={rect.x + 7} dy="13" fontSize="9" fontWeight="700">
                              {fmt(shortage)}만원 부족
                            </tspan>
                          )}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      ) : (
        <div className="py-16 text-center text-sm" style={{ color: C.muted }}>
          표시할 담보가 없습니다.
        </div>
      )}
      <CategoryAmountGrid categories={categories} />
    </section>
  );
}
