import { scoreBand, scoreOf } from "./calculations";
import { bandColor } from "./tokens";
import { reportBandGradient, reportStatusMessage } from "./reportDesign";
import styles from "./ReportDesign.module.css";
import type { CoverageBand, CoverageCategory } from "./types";

export const REPORT_LABELS = {
  gap: "COVERAGE GAP · 담보별 부족 보장",
  radar: "COVERAGE RADAR · 보장 균형 분석",
  waterline: "COVERAGE WATERLINE · 보장 수위 분석",
  reportcard: "COVERAGE DIAGNOSIS REPORT · 보장 진단 리포트",
} as const;

export type ReskinnedReportMode = keyof typeof REPORT_LABELS;

interface ReportHeaderProps {
  mode: ReskinnedReportMode;
  clientName: string;
  asOf: string;
  categories: CoverageCategory[];
}

export function ReportDesignHeader({ mode, clientName, asOf, categories }: ReportHeaderProps) {
  const scores = categories.map(scoreOf);
  const overall = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;
  const band = scoreBand(overall);
  const itemCount = categories.reduce((sum, category) => sum + category.items.length, 0);

  return (
    <header className={styles.header}>
      <div>
        <div className={styles.eyebrow}>
          <span className={styles.brandMark} aria-hidden="true" />
          <span>{REPORT_LABELS[mode]}</span>
        </div>
        <div className={styles.customerName}>
          {clientName || "고객"} <span className={styles.honorific}>님</span>
        </div>
        <div className={styles.meta}>기준일 {asOf} · 담보 {itemCount}개 항목 분석</div>
      </div>
      <div className={styles.scoreBlock}>
        <div className={styles.scoreLabel}>종합 보장 점수</div>
        <div className={styles.scoreLine}>
          <span className={styles.scoreValue}>{overall}</span>
          <span className={styles.scoreDenominator}>/ 100</span>
        </div>
        <div className={styles.status} style={{ color: bandColor(band) }}>
          {reportStatusMessage(band)}
        </div>
      </div>
    </header>
  );
}

const LEGEND: Array<[CoverageBand, string]> = [
  ["full", "충분 · 100% 이상"],
  ["partial", "부족 · 30% 이상"],
  ["low", "미흡·미보유 · 30% 미만"],
];

export function ReportDesignFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.legend}>
        {LEGEND.map(([band, label]) => (
          <div key={band} className={styles.legendItem}>
            <span
              className={styles.legendChip}
              style={{ background: reportBandGradient(band) }}
              aria-hidden="true"
            />
            <b>{label}</b>
          </div>
        ))}
      </div>
      <p className={styles.guide}>
        충족률은 필요 보장 대비 현재 준비 수준을 나타낸 안내 지표입니다. 본 자료는 보장 현황 안내용이며 특정 상품의 가입·변경을 권유하지 않습니다.
      </p>
    </footer>
  );
}

