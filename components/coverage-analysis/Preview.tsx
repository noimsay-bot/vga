import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import CoverageLegend from "./CoverageLegend";
import DumbbellView from "./DumbbellView";
import GapView from "./GapView";
import HeatmapView from "./HeatmapView";
import InsuranceDetails from "./InsuranceDetails";
import RadarView from "./RadarView";
import RingsView from "./RingsView";
import TriageView from "./TriageView";
import WaterlineView from "./WaterlineView";
import WaffleView from "./WaffleView";
import { C } from "./tokens";
import type { CoverageCategory, VizMode } from "./types";

interface PreviewProps {
  clientName: string;
  asOf: string;
  categories: CoverageCategory[];
  totalShort: number;
  vizModes: VizMode[];
  customerMode: boolean;
  onVizModesChange: (modes: VizMode[]) => void;
  onCustomerModeChange: (enabled: boolean) => void;
}

const PRIMARY_MODES: Array<[VizMode, string]> = [
  ["gap", "갭 바"],
  ["radar", "레이더"],
  ["waterline", "보장 수위"],
  ["waffle", "블록 미터"],
];

const MORE_MODES: Array<[VizMode, string]> = [
  ["heatmap", "히트맵"],
  ["triage", "우선순위"],
  ["rings", "동심원"],
  ["dumbbell", "목표 격차"],
];

const ALL_MODES = [...PRIMARY_MODES, ...MORE_MODES];

export default function Preview({
  clientName,
  asOf,
  categories,
  totalShort,
  vizModes,
  customerMode,
  onVizModesChange,
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

        <label className="flex cursor-pointer items-center justify-between gap-3 text-xs font-semibold xl:mt-6 xl:justify-start">
          <span>
            고객 노출 모드
            <span className="ml-1 font-normal" style={{ color: C.muted }}>
              보험사/상품명 숨김
            </span>
          </span>
          <input
            type="checkbox"
            className="sr-only"
            checked={customerMode}
            onChange={(event) => onCustomerModeChange(event.target.checked)}
          />
          <span
            className="relative h-6 w-11 rounded-full transition-colors"
            style={{ background: customerMode ? C.brand : C.track }}
            aria-hidden="true"
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
              style={{ left: 2, transform: `translateX(${customerMode ? 20 : 0}px)` }}
            />
          </span>
        </label>
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
                <CoverageLegend />
              </section>
            );
          })}
          {!customerMode && <InsuranceDetails categories={categories} />}
        </div>
      )}
    </>
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
