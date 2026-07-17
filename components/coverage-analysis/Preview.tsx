import { bandColor, C } from "./tokens";
import GapView from "./GapView";
import HeatmapView from "./HeatmapView";
import InsuranceDetails from "./InsuranceDetails";
import RadarView from "./RadarView";
import type { CoverageBand, CoverageCategory, VizMode } from "./types";

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

const LEGEND: Array<[CoverageBand, string]> = [
  ["full", "충분 · 100% 이상"],
  ["partial", "부족 · 30% 이상"],
  ["low", "미흡 · 30% 미만"],
];

const MODES: Array<[VizMode, string]> = [
  ["gap", "갭 바"],
  ["radar", "레이더"],
  ["heatmap", "히트맵"],
];

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
  const selectedModes = MODES.filter(([mode]) => vizModes.includes(mode));

  const toggleMode = (mode: VizMode, enabled: boolean) => {
    onVizModesChange(
      MODES.map(([candidate]) => candidate).filter((candidate) =>
        candidate === mode ? enabled : vizModes.includes(candidate),
      ),
    );
  };

  return (
    <>
      <div className="no-print mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <fieldset>
          <legend className="mb-1.5 text-xs font-semibold" style={{ color: C.muted }}>
            출력할 시각화
          </legend>
          <div className="flex flex-wrap gap-2">
            {MODES.map(([mode, label]) => {
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
            })}
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-center justify-between gap-3 text-xs font-semibold xl:justify-start">
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
          {selectedModes.map(([mode, label], index) => {
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
                  visualizationLabel={label}
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
                {mode === "heatmap" && <HeatmapView categories={categories} />}
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
  visualizationLabel: string;
}

function ReportHeader({
  clientName,
  asOf,
  categories,
  totalShort,
  visualizationLabel,
}: ReportHeaderProps) {
  return (
    <header className="mb-5">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <div>
          <div className="mb-1 text-xs font-semibold" style={{ color: C.brand }}>
            {visualizationLabel}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {clientName || "고객"} 님 보장분석
          </h1>
        </div>
        <span className="shrink-0 text-xs" style={{ color: C.muted }}>
          {asOf}
        </span>
      </div>
      <p className="mb-4 text-xs" style={{ color: C.muted }}>
        총 {categories.reduce((sum, category) => sum + category.items.length, 0)}개 담보 · 보완 필요 {totalShort}건
        <span className="ml-1">(단위: 만원)</span>
      </p>
      <div className="flex flex-wrap gap-4 text-xs">
        {LEGEND.map(([band, text]) => (
          <div key={band} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: bandColor(band) }} />
            <span style={{ color: C.muted }}>{text}</span>
          </div>
        ))}
      </div>
    </header>
  );
}
