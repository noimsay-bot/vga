import { useId } from "react";
import { scoreBand } from "./calculations";
import { bandColor, C } from "./tokens";
import { reportBandGradientStops } from "./reportDesign";

interface DonutProps {
  score: number;
  premium?: boolean;
}

export default function Donut({ score, premium = false }: DonutProps) {
  const radius = 26;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const color = bandColor(scoreBand(score));
  const gradientId = `donut-${useId().replace(/:/g, "")}`;
  const [start, end] = reportBandGradientStops(scoreBand(score));

  return (
    <svg width="66" height="66" viewBox="0 0 66 66" className="shrink-0" role="img" aria-label={`${score}점`}>
      {premium && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={start} />
            <stop offset="100%" stopColor={end} />
          </linearGradient>
        </defs>
      )}
      <circle cx="33" cy="33" r={radius} fill="none" stroke={C.track} strokeWidth={strokeWidth} />
      <circle
        cx="33"
        cy="33"
        r={radius}
        fill="none"
        stroke={premium ? `url(#${gradientId})` : color}
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
