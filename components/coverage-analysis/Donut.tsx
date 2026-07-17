import { scoreBand } from "./calculations";
import { bandColor, C } from "./tokens";

interface DonutProps {
  score: number;
}

export default function Donut({ score }: DonutProps) {
  const radius = 26;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const color = bandColor(scoreBand(score));

  return (
    <svg width="66" height="66" viewBox="0 0 66 66" className="shrink-0">
      <circle cx="33" cy="33" r={radius} fill="none" stroke={C.track} strokeWidth={strokeWidth} />
      <circle
        cx="33"
        cy="33"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - Math.min(score, 100) / 100)}
        transform="rotate(-90 33 33)"
      />
      <text x="33" y="31" textAnchor="middle" fontSize="17" fontWeight="800" fill={C.ink}>
        {score}
      </text>
      <text x="33" y="44" textAnchor="middle" fontSize="9" fill={C.muted}>
        점
      </text>
    </svg>
  );
}
