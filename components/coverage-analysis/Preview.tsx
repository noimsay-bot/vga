import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import CoverageLegend from "./CoverageLegend";
import BrickWallView from "./BrickWallView";
import DumbbellView from "./DumbbellView";
import GapView from "./GapView";
import HeatmapView from "./HeatmapView";
import InsuranceDetails from "./InsuranceDetails";
import ItemDetailPanel from "./ItemDetailPanel";
import MoneyUnitsView from "./MoneyUnitsView";
import RadarView from "./RadarView";
import RingsView from "./RingsView";
import ReportCardView from "./ReportCardView";
import SpeedometerView from "./SpeedometerView";
import TriageView from "./TriageView";
import TreemapView from "./TreemapView";
import WaterlineView from "./WaterlineView";
import WaffleView from "./WaffleView";
import { scoreOf } from "./calculations";
import { C } from "./tokens";
import type { CoverageCategory, VizMode } from "./types";

interface PreviewProps {
  clientName: string;
  asOf: string;
  categories: CoverageCategory[];
  totalShort: number;
  vizModes: VizMode[];
  showItemDetail: boolean;
  customerMode: boolean;
  onVizModesChange: (modes: VizMode[]) => void;
  onShowItemDetailChange: (enabled: boolean) => void;
  onCustomerModeChange: (enabled: boolean) => void;
}

const PRIMARY_MODES: Array<[VizMode, string]> = [
  ["gap", "갭 바"],
  ["radar", "레이더"],
  ["waterline", "보장 수위"],
  ["waffle", "블록 미터"],
  ["treemap", "트리맵"],
  ["reportcard", "진단 리포트"],
];

const MORE_MODES: Array<[VizMode, string]> = [
  ["heatmap", "히트맵"],
  ["triage", "우선순위"],
  ["rings", "동심원"],
  ["dumbbell", "목표 격차"],
  ["speedometer", "스피드미터"],
  ["brickwall", "벽돌 담장"],
  ["moneyunits", "금액 유닛"],
];

const ALL_MODES = [...PRIMARY_MODES, ...MORE_MODES];
const DETAIL_MODES = new Set<VizMode>([
  "radar",
  "waterline",
  "triage",
  "rings",
  "dumbbell",
  "waffle",
  "speedometer",
  "moneyunits",
  "reportcard",
]);

export default function Preview({
  clientName,
  asOf,
  categories,
  totalShort,
  vizModes,
  showItemDetail,
  customerMode,
  onVizModesChange,
  onShowItemDetailChange,
  onCustomerModeChange,
}: PreviewProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const selectedModes = ALL_MODES.filter(([mode]) => vizModes.includes(mode));
  const selectedMoreCount = MORE_MODES.filter(([mode]) => vizModes.includes(mode)).length;

  const toggleMode = (mode: VizMode, enabled: boolean) => {
    onVizModesChange(
      ALL_MODES.map(([candidate]) => candidate).filter((candidate) =>
        candidate === mode ? enabled : vizModes.includes(candidate),
      ),
    );
  };

  const renderModeChoices = (modes: Array<[VizMode, string]>) =>
    modes.map(([mode, label]) => {
      const selected = vizModes.includes(mode);
      return (
        <label
          key={mode}
          className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
          style={
            selected
              ? { background: "#EAF1F0", borderColor: C.brand, color: C.brand }
              : { background: C.panel, borderColor: C.border, color: C.muted }
          }
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => toggleMode(mode, event.target.checked)}
            style={{ accentColor: C.brand }}
          />
          {label}
        </label>
      );
    });

  return (
    <>
      <div className="no-print mb-5 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <fieldset className="min-w-0 flex-1">
          <legend className="mb-1.5 text-xs font-semibold" style={{ color: C.muted }}>
            출력할 시각화
          </legend>
          <div className="flex flex-wrap gap-2">{renderModeChoices(PRIMARY_MODES)}</div>
          <button
            type="button"
            onClick={() => setMoreOpen((current) => !current)}
            className="mt-2 flex items-center gap-1 text-xs font-semibold"
            style={{ color: C.brand }}
            aria-expanded={moreOpen}
          >
            {moreOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            더보기{selectedMoreCount ? ` · ${selectedMoreCount}개 선택` : ""}
          </button>
          {moreOpen && (
            <div className="mt-2 flex flex-wrap gap-2">{renderModeChoices(MORE_MODES)}</div>
          )}
        </fieldset>

        <div className="space-y-2 xl:mt-6">
          <PreviewSwitch
            label="세부 담보 표시"
            hint="종합 점수형 자료"
            checked={showItemDetail}
            onChange={onShowItemDetailChange}
          />
          <PreviewSwitch
            label="고객 노출 모드"
            hint="보험사/상품명 숨김"
            checked={customerMode}
            onChange={onCustomerModeChange}
          />
        </div>
      </div>

      {categories.length === 0 ? (
        <div
          className="rounded-xl border-2 border-dashed p-10 text-center text-sm"
          style={{ borderColor: C.border, color: C.muted }}
        >
          편집 화면에서 고객 이름과 보장 카테고리를 추가하면 여기에 시각화됩니다.
        </div>
      ) : selectedModes.length === 0 ? (
        <div
          className="rounded-xl border-2 border-dashed p-10 text-center text-sm"
          style={{ borderColor: C.border, color: C.muted }}
        >
          상단에서 출력할 시각화를 한 개 이상 선택하세요.
        </div>
      ) : (
        <div className="space-y-6 print:space-y-0">
          {selectedModes.map(([mode], index) => {
            const radarUnavailable = mode === "radar" && categories.length < 3;
            const breakAfter = index < selectedModes.length - 1;
            const detailCategories =
              mode === "triage"
                ? [...categories].sort((left, right) => scoreOf(left) - scoreOf(right))
                : categories;
            const renderItemDetail =
              showItemDetail && DETAIL_MODES.has(mode) && !radarUnavailable;
            return (
              <section
                key={mode}
                className={`visualization-sheet ${breakAfter ? "print-break-after-page" : ""}`}
                data-viz-mode={mode}
              >
                <ReportHeader
                  clientName={clientName}
                  asOf={asOf}
                  categories={categories}
                  totalShort={totalShort}
                />
                {radarUnavailable && (
                  <div
                    className="mb-4 rounded-lg border px-3 py-2 text-xs"
                    style={{ borderColor: C.partial, background: `${C.partial}14`, color: C.partial }}
                  >
                    레이더는 카테고리가 3개 이상일 때 사용할 수 있어 갭 바로 표시합니다.
                  </div>
                )}
                {mode === "gap" && <GapView categories={categories} />}
                {mode === "radar" &&
                  (radarUnavailable ? <GapView categories={categories} /> : <RadarView categories={categories} />)}
                {mode === "waterline" && <WaterlineView categories={categories} />}
                {mode === "waffle" && <WaffleView categories={categories} />}
                {mode === "heatmap" && <HeatmapView categories={categories} />}
                {mode === "triage" && <TriageView categories={categories} />}
                {mode === "rings" && <RingsView categories={categories} />}
                {mode === "dumbbell" && <DumbbellView categories={categories} />}
                {mode === "treemap" && <TreemapView categories={categories} />}
                {mode === "speedometer" && <SpeedometerView categories={categories} />}
                {mode === "brickwall" && <BrickWallView categories={categories} />}
                {mode === "moneyunits" && <MoneyUnitsView categories={categories} />}
                {mode === "reportcard" && <ReportCardView categories={categories} />}
                {renderItemDetail && <ItemDetailPanel categories={detailCategories} />}
                {mode !== "brickwall" && <CoverageLegend />}
              </section>
            );
          })}
          {!customerMode && <InsuranceDetails categories={categories} />}
        </div>
      )}
    </>
  );
}

function PreviewSwitch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-xs font-semibold xl:justify-start">
      <span>
        {label}
        <span className="ml-1 font-normal" style={{ color: C.muted }}>
          {hint}
        </span>
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
        style={{ background: checked ? C.brand : C.track }}
        aria-hidden="true"
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
          style={{ left: 2, transform: `translateX(${checked ? 20 : 0}px)` }}
        />
      </span>
    </label>
  );
}

interface ReportHeaderProps {
  clientName: string;
  asOf: string;
  categories: CoverageCategory[];
  totalShort: number;
}

function ReportHeader({
  clientName,
  asOf,
  categories,
  totalShort,
}: ReportHeaderProps) {
  return (
    <header className="mb-5">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {clientName || "고객"} 님 보장분석
          </h1>
        </div>
        <span className="shrink-0 text-xs" style={{ color: C.muted }}>
          {asOf}
        </span>
      </div>
      <p className="text-xs" style={{ color: C.muted }}>
        총 {categories.reduce((sum, category) => sum + category.items.length, 0)}개 담보 · 보완 필요 {totalShort}건
        <span className="ml-1">(단위: 만원)</span>
      </p>
    </header>
  );
}
