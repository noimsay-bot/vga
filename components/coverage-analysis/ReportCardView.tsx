"use client";

import { useId, useState } from "react";
import { CategoryAmountText } from "./CategoryAmounts";
import { scoreBand, scoreOf } from "./calculations";
import { bandColor, C } from "./tokens";
import { REPORT_DESIGN, reportBandGradient, reportBandGradientStops } from "./reportDesign";
import styles from "./ReportDesign.module.css";
import type { CoverageBand, CoverageCategory } from "./types";

const STAMP: Record<CoverageBand, string> = {
  full: "양호",
  partial: "주의",
  low: "위험",
};

function ReportDonut({ score, band }: { score: number; band: CoverageBand }) {
  const radius = 31;
  const circumference = 2 * Math.PI * radius;
  const color = bandColor(band);
  const gradientId = `report-donut-${useId().replace(/:/g, "")}`;
  const [start, end] = reportBandGradientStops(band);
  return (
    <svg width="82" height="82" viewBox="0 0 82 82" role="img" aria-label={`${score}%`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={start} />
          <stop offset="100%" stopColor={end} />
        </linearGradient>
      </defs>
      <circle cx="41" cy="41" r={radius} fill="none" stroke={C.track} strokeWidth="8" />
      <circle cx="41" cy="41" r={radius} fill="none" stroke={C.border} strokeWidth="8" strokeDasharray="0.5 5" opacity="0.7" />
      {score > 0 && (
        <circle
          cx="41"
          cy="41"
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.min(score, 100) / 100)}
          transform="rotate(-90 41 41)"
        />
      )}
      <text x="41" y="45" textAnchor="middle" fontSize="15" fontWeight="800" fill={score === 0 ? C.low : color}>
        {score}%
      </text>
    </svg>
  );
}

export default function ReportCardView({ categories }: { categories: CoverageCategory[] }) {
  const [showBranding, setShowBranding] = useState(true);
  const scored = categories.map((category) => ({ category, score: scoreOf(category) }));
  const average = scored.length
    ? Math.round(scored.reduce((sum, entry) => sum + entry.score, 0) / scored.length)
    : 0;
  const counts = scored.reduce(
    (result, entry) => {
      result[scoreBand(entry.score)] += 1;
      return result;
    },
    { full: 0, partial: 0, low: 0 } as Record<CoverageBand, number>,
  );

  return (
    <section data-branding-visible={showBranding ? "true" : "false"}>
      <div
        className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5 text-white"
        style={{
          background: REPORT_SUMMARY_GRADIENT,
          boxShadow: REPORT_DESIGN.brandPanelShadow,
        }}
      >
        <div>
          <div className="text-sm font-bold">보장 종합 진단</div>
          <div className="mt-1 text-4xl font-extrabold tabular-nums">{average}점</div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <span>위험 {counts.low}</span>
          <span>주의 {counts.partial}</span>
          <span>양호 {counts.full}</span>
        </div>
        <label className="no-print flex cursor-pointer items-center gap-2 text-xs font-semibold">
          브랜딩 카드
          <input
            type="checkbox"
            checked={showBranding}
            onChange={(event) => setShowBranding(event.target.checked)}
            style={{ accentColor: C.full }}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scored.map(({ category, score }) => {
          const band = scoreBand(score);
          const color = bandColor(band);
          return (
            <article
              key={category.id}
              className={`report-card-print p-4 ${styles.sectionCard}`}
              style={{ borderColor: band === "low" ? C.low : undefined }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold">{category.name}</div>
                  <div className="mt-1 text-3xl font-extrabold tabular-nums" style={{ color }}>
                    {score}
                  </div>
                </div>
                <span
                  className="rounded-md px-2 py-1 text-xs font-extrabold"
                  style={{ background: `${color}26`, color, boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)" }}
                >
                  {STAMP[band]}
                </span>
              </div>
              <div className="mt-1 flex justify-center">
                <ReportDonut score={score} band={band} />
              </div>
              <CategoryAmountText category={category} />
            </article>
          );
        })}

        {showBranding && (
          <article
            className="report-card-print flex min-h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center"
            style={{ borderColor: C.border, color: C.muted }}
            data-branding-card
          >
            <div className="font-bold" style={{ color: C.ink }}>설계사 정보</div>
            <div className="mt-2 text-xs">이름 · 연락처</div>
            <div className="mt-4 rounded-lg border border-dashed px-6 py-3 text-xs" style={{ borderColor: C.border }}>
              로고 영역
            </div>
          </article>
        )}
      </div>
    </section>
  );
}

const REPORT_SUMMARY_GRADIENT = reportBandGradient("full");
