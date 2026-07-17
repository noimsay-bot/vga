import { scoreOf } from "./calculations";
import { C } from "./tokens";
import type { CoverageCategory } from "./types";
import { CategoryAmountGrid } from "./CategoryAmounts";

const CENTER_X = 260;
const CENTER_Y = 190;
const RADIUS = 132;
const LABEL_RADIUS = 172;

const pointAt = (index: number, count: number, radius: number) => {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
  return {
    x: CENTER_X + Math.cos(angle) * radius,
    y: CENTER_Y + Math.sin(angle) * radius,
  };
};

const pointsString = (points: Array<{ x: number; y: number }>) =>
  points.map(({ x, y }) => `${x},${y}`).join(" ");

export default function RadarView({ categories }: { categories: CoverageCategory[] }) {
  const count = categories.length;
  const outerPoints = categories.map((_, index) => pointAt(index, count, RADIUS));
  const middlePoints = categories.map((_, index) => pointAt(index, count, RADIUS * 0.5));
  const values = categories.map((category) => scoreOf(category));
  const valuePoints = values.map((score, index) =>
    pointAt(index, count, RADIUS * (score / 100)),
  );

  return (
    <section
      className="rounded-xl border p-4"
      style={{ borderColor: C.border, background: C.panel }}
    >
      <div className="mb-2 text-center">
        <div className="text-xs" style={{ color: C.muted }}>
          바깥 링은 카테고리별 필요 수준 100점입니다.
        </div>
      </div>
      <svg
        viewBox="0 0 520 390"
        className="mx-auto block h-auto w-full max-w-2xl"
        role="img"
        aria-label={`카테고리별 보장 점수 레이더: ${categories.map((category, index) => `${category.name} ${values[index]}점`).join(", ")}`}
      >
        <polygon
          points={pointsString(outerPoints)}
          fill="none"
          stroke={C.border}
          strokeWidth="1.5"
        />
        <polygon
          points={pointsString(middlePoints)}
          fill="none"
          stroke={C.border}
          strokeWidth="1"
        />
        <text x={CENTER_X + 8} y={CENTER_Y - RADIUS * 0.5 + 4} fontSize="10" fill={C.muted}>
          50%
        </text>
        <text x={CENTER_X + 8} y={CENTER_Y - RADIUS + 4} fontSize="10" fill={C.muted}>
          100%
        </text>

        {outerPoints.map((point, index) => (
          <line
            key={`axis-${categories[index].id}`}
            x1={CENTER_X}
            y1={CENTER_Y}
            x2={point.x}
            y2={point.y}
            stroke={C.border}
            strokeWidth="1"
          />
        ))}

        <polygon
          points={pointsString(valuePoints)}
          fill={C.full}
          fillOpacity="0.22"
          stroke={C.full}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {valuePoints.map((point, index) => (
          <circle
            key={`value-${categories[index].id}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={C.full}
            stroke={C.panel}
            strokeWidth="2"
          />
        ))}

        {categories.map((category, index) => {
          const label = pointAt(index, count, LABEL_RADIUS);
          const anchor = label.x < CENTER_X - 12 ? "end" : label.x > CENTER_X + 12 ? "start" : "middle";
          return (
            <text
              key={`label-${category.id}`}
              x={label.x}
              y={label.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize="12"
              fontWeight="700"
              fill={C.ink}
            >
              <tspan x={label.x} dy="0">{category.name}</tspan>
              <tspan x={label.x} dy="15" fontSize="10" fontWeight="500" fill={C.muted}>
                {values[index]}점
              </tspan>
            </text>
          );
        })}
      </svg>
      <CategoryAmountGrid categories={categories} />
    </section>
  );
}
