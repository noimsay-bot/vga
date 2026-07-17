import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import BrickWallView, { buildBrickRows } from "../components/coverage-analysis/BrickWallView";
import DumbbellView from "../components/coverage-analysis/DumbbellView";
import GapView from "../components/coverage-analysis/GapView";
import HeatmapView from "../components/coverage-analysis/HeatmapView";
import RadarView from "../components/coverage-analysis/RadarView";
import RingsView from "../components/coverage-analysis/RingsView";
import SpeedometerView from "../components/coverage-analysis/SpeedometerView";
import TriageView from "../components/coverage-analysis/TriageView";
import TreemapView, { squarify } from "../components/coverage-analysis/TreemapView";
import WaffleView from "../components/coverage-analysis/WaffleView";
import WaterlineView from "../components/coverage-analysis/WaterlineView";
import ItemDetailPanel from "../components/coverage-analysis/ItemDetailPanel";
import MoneyUnitsView, {
  moneyUnitSummary,
  selectMoneyUnit,
} from "../components/coverage-analysis/MoneyUnitsView";
import Preview from "../components/coverage-analysis/Preview";
import ReportCardView from "../components/coverage-analysis/ReportCardView";
import type { VizMode } from "../components/coverage-analysis/types";
import { migrateProject } from "../components/projects/ProjectProvider";
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
  treemap: TreemapView,
  speedometer: SpeedometerView,
  brickwall: BrickWallView,
  reportcard: ReportCardView,
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

const detailHtml = renderToStaticMarkup(createElement(ItemDetailPanel, { categories }));
const itemCount = categories.reduce((sum, category) => sum + category.items.length, 0);
if ((detailHtml.match(/item-detail-row-print/g) ?? []).length !== itemCount) {
  throw new Error("ItemDetailPanel 담보 행 개수 불일치");
}
if (detailHtml.includes("현대해상") || detailHtml.includes("삼성화재")) {
  throw new Error("ItemDetailPanel에 보험사명이 노출됨");
}

const layout = squarify(
  [
    { datum: "a", value: 60 },
    { datum: "b", value: 30 },
    { datum: "zero", value: 0 },
    { datum: "c", value: 10 },
  ],
  { x: 0, y: 0, width: 800, height: 460 },
);
if (layout.length !== 3 || layout.some((rect) => !Number.isFinite(rect.width * rect.height))) {
  throw new Error("트리맵 레이아웃 또는 0값 제외 규칙 오류");
}

const allModes: VizMode[] = [
  "gap",
  "radar",
  "waterline",
  "waffle",
  "treemap",
  "reportcard",
  "heatmap",
  "triage",
  "rings",
  "dumbbell",
  "speedometer",
  "brickwall",
  "moneyunits",
];
const previewHtml = renderToStaticMarkup(
  createElement(Preview, {
    clientName: "정철원",
    asOf: "2026.07.14",
    categories,
    totalShort: 23,
    vizModes: allModes,
    showItemDetail: true,
    customerMode: true,
    onVizModesChange: () => undefined,
    onShowItemDetailChange: () => undefined,
    onCustomerModeChange: () => undefined,
  }),
);
if ((previewHtml.match(/data-viz-mode=/g) ?? []).length !== 13) {
  throw new Error("Preview 13종 렌더 개수 불일치");
}
if ((previewHtml.match(/data-item-detail-panel=/g) ?? []).length !== 9) {
  throw new Error("카테고리 단위 9종의 ItemDetailPanel 연결 불일치");
}
if ((previewHtml.match(/print-break-after-page/g) ?? []).length !== 12) {
  throw new Error("13종 출력 세트 페이지 분리 개수 불일치");
}

const brickHtml = renderToStaticMarkup(createElement(BrickWallView, { categories }));
const missingItems = categories.flatMap((category) => category.items).filter((item) => {
  const insured = item.insurers.length
    ? item.insurers.reduce((sum, insurer) => sum + insurer.amount, 0)
    : item.heldManual;
  return insured === 0;
}).length;
if ((brickHtml.match(/data-brick-missing="true"/g) ?? []).length !== missingItems) {
  throw new Error("벽돌 담장 미보유 구멍 개수 불일치");
}
if (!brickHtml.includes("data-brick-row=\"1\"") || !brickHtml.includes("우리 가족")) {
  throw new Error("벽돌 담장 엇갈림 행 또는 지면 라벨 누락");
}
if (!buildBrickRows(categories[1].items).length) {
  throw new Error("벽돌 담장 행 배치 실패");
}

if (selectMoneyUnit(categories) !== 5000) {
  throw new Error("시드 금액 유닛 자동 산정 오류");
}
const largeNeededCategory: CoverageCategory = {
  id: "large",
  name: "대형",
  items: [{ id: "large-item", name: "대형담보", needed: 150000, heldManual: 0, insurers: [] }],
};
if (selectMoneyUnit([largeNeededCategory]) !== 10000) {
  throw new Error("20칸 초과 금액 유닛 상향 오류");
}
const familyUnits = moneyUnitSummary(categories[0], selectMoneyUnit(categories));
if (familyUnits.totalCells !== 9 || familyUnits.filledCells !== 4 || familyUnits.shortage !== 22000) {
  throw new Error("금액 유닛 칸수 또는 부족액 계산 오류");
}
const moneyHtml = renderToStaticMarkup(createElement(MoneyUnitsView, { categories }));
if (!moneyHtml.includes('data-money-unit="5000"') || !moneyHtml.includes("전액 부족")) {
  throw new Error("금액 유닛 캡션 또는 전액 부족 표시 누락");
}

const reportHtml = renderToStaticMarkup(createElement(ReportCardView, { categories }));
if (!reportHtml.includes("위험 1") || !reportHtml.includes("주의 2") || !reportHtml.includes("양호 2")) {
  throw new Error("진단 리포트 상태 카운트 오류");
}
if (!reportHtml.includes('data-branding-card="true"') || !reportHtml.includes("0%")) {
  throw new Error("진단 리포트 브랜딩 카드 또는 0점 강조 누락");
}

const legacyBase = {
  id: "legacy",
  clientName: "기존고객",
  asOf: "2026.07.17",
  categories,
  vizModes: ["radar" as const],
  customerMode: true,
  updatedAt: 1,
};
if (!migrateProject(legacyBase).showItemDetail) {
  throw new Error("기존 프로젝트의 세부 담보 기본 ON 마이그레이션 오류");
}
if (migrateProject({ ...legacyBase, showItemDetail: false }).showItemDetail) {
  throw new Error("프로젝트별 세부 담보 OFF 상태 보존 오류");
}
const migratedNewModes = migrateProject({
  ...legacyBase,
  vizModes: ["brickwall", "moneyunits", "reportcard"],
}).vizModes;
if (migratedNewModes.join(",") !== "brickwall,moneyunits,reportcard") {
  throw new Error("신규 시각화 프로젝트별 선택 상태 마이그레이션 오류");
}

console.log(`13종 시각화, 신규 3종 경계값 및 세부 담보 표기 확인 완료`);
