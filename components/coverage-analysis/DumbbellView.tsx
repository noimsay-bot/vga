import { scoreBand, scoreOf } from "./calculations";
import { bandColor, C } from "./tokens";
import type { CoverageCategory } from "./types";
import { CategoryAmountGrid } from "./CategoryAmounts";

export default function DumbbellView({ categories }: { categories: CoverageCategory[] }) {
  const rowHeight = 70;
  const top = 54;
  const height = Math.max(150, top + categories.length * rowHeight);
  const startX = 170;
  const endX = 650;

  return (
    <section
      className="rounded-xl border p-2 sm:p-4"
      style={{ borderColor: C.border, background: C.panel }}
    >
      <svg
        viewBox={`0 0 720 ${height}`}
        className="block h-auto w-full"
        role="img"
        aria-label="카테고리별 현재 점수와 필요 100점 간격"
      >
        <text x={startX} y="24" fontSize="11" fill={C.muted}>현재</text>
        <text x={endX} y="24" textAnchor="middle" fontSize="11" fill={C.muted}>필요 100</text>
        {categories.map((category, index) => {
          const score = scoreOf(category);
          const band = scoreBand(score);
          const color = bandColor(band);
          const y = top + index * rowHeight;
          const currentX = startX + ((endX - startX) * score) / 100;
          return (
            <g key={category.id}>
              <text x="8" y={y + 5} fontSize="13" fontWeight="700" fill={C.ink}>
                {category.name}
              </text>
              <line x1={startX} y1={y} x2={currentX} y2={y} stroke={C.track} strokeWidth="5" />
              <line
                x1={currentX}
                y1={y}
                x2={endX}
                y2={y}
                stroke={band === "low" ? `${C.low}55` : C.border}
                strokeWidth="3"
              />
              <circle cx={currentX} cy={y} r={score === 0 ? 5 : 8} fill={color} />
              <text x={currentX} y={y - 13} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
                {score}
              </text>
              <circle cx={endX} cy={y} r="7" fill={C.panel} stroke={C.border} strokeWidth="2" />
            </g>
          );
        })}
      </svg>
      <CategoryAmountGrid categories={categories} />
    </section>
  );
}
