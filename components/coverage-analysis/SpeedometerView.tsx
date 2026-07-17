import { CategoryAmountText } from "./CategoryAmounts";
import { scoreBand, scoreOf } from "./calculations";
import { bandColor, bandLabel, C } from "./tokens";
import type { CoverageCategory } from "./types";

const ARC_PATH = "M 20 110 A 90 90 0 0 1 200 110";

export default function SpeedometerView({ categories }: { categories: CoverageCategory[] }) {
  return (
    <section
      className="grid gap-4 rounded-xl border p-4"
      style={{
        borderColor: C.border,
        background: C.panel,
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      }}
      aria-label="카테고리별 반원 스피드미터"
    >
      {categories.map((category) => {
        const score = scoreOf(category);
        const band = scoreBand(score);
        const color = bandColor(band);
        const angle = Math.PI - (Math.PI * score) / 100;
        const needleX = 110 + Math.cos(angle) * 68;
        const needleY = 110 - Math.sin(angle) * 68;
        const arcValue = score === 0 ? 1 : score;
        return (
          <div key={category.id} className="min-w-0 text-center">
            <svg
              viewBox="0 0 220 128"
              className="block h-auto w-full"
              role="img"
              aria-label={`${category.name} ${score}점 ${bandLabel(band)}`}
            >
              <path
                d={ARC_PATH}
                fill="none"
                stroke={C.track}
                strokeWidth="11"
                strokeLinecap="round"
                pathLength="100"
              />
              <path
                d={ARC_PATH}
                fill="none"
                stroke={color}
                strokeWidth="11"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray={`${arcValue} ${100 - arcValue}`}
              />
              <line
                x1="110"
                y1="110"
                x2={needleX}
                y2={needleY}
                stroke={score === 0 ? C.low : C.ink}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="110" cy="110" r="6" fill={score === 0 ? C.low : C.ink} />
              <text x="110" y="101" textAnchor="middle" fontSize="24" fontWeight="800" fill={color}>
                {score}
              </text>
            </svg>
            <div className="-mt-1 font-bold">{category.name}</div>
            <div className="text-xs font-semibold" style={{ color }}>
              {bandLabel(band)}
            </div>
            <div className="mt-1 flex justify-center text-left">
              <CategoryAmountText category={category} />
            </div>
          </div>
        );
      })}
    </section>
  );
}
