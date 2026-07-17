import { scoreBand, scoreOf } from "./calculations";
import { bandColor, C } from "./tokens";
import type { CoverageCategory } from "./types";
import { CategoryAmountGrid } from "./CategoryAmounts";

export default function RingsView({ categories }: { categories: CoverageCategory[] }) {
  const scored = categories.map((category) => ({ category, score: scoreOf(category) }));
  const average = scored.length
    ? Math.round(scored.reduce((sum, entry) => sum + entry.score, 0) / scored.length)
    : 0;
  const gap = scored.length > 1 ? Math.min(18, 88 / (scored.length - 1)) : 18;

  return (
    <section
      className="rounded-xl border p-3 sm:p-4"
      style={{ borderColor: C.border, background: C.panel }}
    >
      <svg
        viewBox="0 0 560 330"
        className="block h-auto w-full"
        role="img"
        aria-label={`동심원 게이지, 전체 평균 ${average}점`}
      >
        {scored.map(({ category, score }, index) => {
          const radius = 118 - index * gap;
          const circumference = 2 * Math.PI * radius;
          const color = bandColor(scoreBand(score));
          return (
            <g key={category.id}>
              <circle
                cx="175"
                cy="165"
                r={radius}
                fill="none"
                stroke={C.track}
                strokeWidth="11"
              />
              {score > 0 && (
                <circle
                  cx="175"
                  cy="165"
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - score / 100)}
                  transform="rotate(-90 175 165)"
                />
              )}
            </g>
          );
        })}
        <text x="175" y="158" textAnchor="middle" fontSize="30" fontWeight="800" fill={C.ink}>
          {average}
        </text>
        <text x="175" y="181" textAnchor="middle" fontSize="11" fill={C.muted}>
          전체 평균
        </text>

        {scored.map(({ category, score }, index) => {
          const color = bandColor(scoreBand(score));
          const y = 76 + index * 43;
          return (
            <g key={`legend-${category.id}`}>
              <circle cx="340" cy={y - 4} r="5" fill={color} />
              <text x="354" y={y} fontSize="13" fontWeight="700" fill={C.ink}>
                {category.name}
              </text>
              <text x="520" y={y} textAnchor="end" fontSize="13" fontWeight="700" fill={color}>
                {score}점
              </text>
            </g>
          );
        })}
      </svg>
      <CategoryAmountGrid categories={categories} />
    </section>
  );
}
