import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import DumbbellView from "../components/coverage-analysis/DumbbellView";
import GapView from "../components/coverage-analysis/GapView";
import HeatmapView from "../components/coverage-analysis/HeatmapView";
import RadarView from "../components/coverage-analysis/RadarView";
import RingsView from "../components/coverage-analysis/RingsView";
import TriageView from "../components/coverage-analysis/TriageView";
import WaffleView from "../components/coverage-analysis/WaffleView";
import WaterlineView from "../components/coverage-analysis/WaterlineView";
import { buildFromSeed } from "../components/coverage-analysis/seed";
import type { CoverageCategory } from "../components/coverage-analysis/types";

const categories = buildFromSeed();
const views: Record<
  string,
  ComponentType<{ categories: CoverageCategory[] }>
> = {
  gap: GapView,
  radar: RadarView,
  heatmap: HeatmapView,
  waterline: WaterlineView,
  triage: TriageView,
  rings: RingsView,
  dumbbell: DumbbellView,
  waffle: WaffleView,
};

for (const [name, View] of Object.entries(views)) {
  const html = renderToStaticMarkup(createElement(View, { categories }));
  const standardCount = (html.match(/표준 [\d,]+만원/g) ?? []).length;
  const enrolledCount = (html.match(/가입 [\d,]+만원/g) ?? []).length;
  const shortageCount = (html.match(/부족 (?:[\d,]+만원|없음)/g) ?? []).length;

  if (
    standardCount !== categories.length ||
    enrolledCount !== categories.length ||
    shortageCount !== categories.length
  ) {
    throw new Error(
      `${name}: 금액 요약 개수 불일치 (표준 ${standardCount}, 가입 ${enrolledCount}, 부족 ${shortageCount})`,
    );
  }
}

console.log(`8종 시각화 × ${categories.length}개 카테고리 금액 표기 확인 완료`);
