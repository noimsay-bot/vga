import { useRef, useState, type ChangeEvent } from "react";
import { Download, FileSpreadsheet, X } from "lucide-react";
import {
  downloadCoverageTemplate,
  parseCoverageWorkbook,
  type ImportedCoverageGroup,
  type ImportMergeResult,
  type ParsedCoverageWorkbook,
} from "./excelImport";
import { fmt } from "./calculations";
import { C } from "./tokens";

interface ExcelUploadPanelProps {
  onApply: (
    groups: ImportedCoverageGroup[],
  ) => Pick<ImportMergeResult, "addedItems" | "createdCategories" | "warnings">;
}

export default function ExcelUploadPanel({ onApply }: ExcelUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ParsedCoverageWorkbook | null>(null);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [notice, setNotice] = useState<{ message: string; warnings: string[] } | null>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setParseError("");
    setNotice(null);
    try {
      const parsed = parseCoverageWorkbook(await file.arrayBuffer());
      setFileName(file.name);
      setPreview(parsed);
    } catch {
      setParseError("파일을 읽지 못했습니다. .xlsx, .xls 또는 .csv 형식과 헤더를 확인하세요.");
    }
  };

  const applyPreview = () => {
    if (!preview?.groups.length || preview.headerErrors.length) return;
    const result = onApply(preview.groups);
    setNotice({
      message: `${result.addedItems}개 담보를 추가했습니다.${result.createdCategories ? ` 새 카테고리 ${result.createdCategories}개를 만들었습니다.` : ""}`,
      warnings: result.warnings,
    });
    setPreview(null);
  };

  const invalidCount = preview?.rows.filter((row) => row.errors.length).length ?? 0;

  return (
    <div className="mb-4">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        className="hidden"
        onChange={handleFile}
      />
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white"
          style={{ background: C.brand }}
        >
          <FileSpreadsheet size={15} /> 엑셀로 담보 추가
        </button>
        <button
          onClick={downloadCoverageTemplate}
          className="flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold"
          style={{ borderColor: C.border, background: C.panel, color: C.brand }}
        >
          <Download size={15} /> 엑셀 템플릿 다운로드
        </button>
      </div>
      {parseError && (
        <div className="mt-2 rounded-md px-3 py-2 text-xs" style={{ background: `${C.low}12`, color: C.low }}>
          {parseError}
        </div>
      )}
      {notice && (
        <div className="mt-2 rounded-md px-3 py-2 text-xs" style={{ background: "#EAF1F0", color: C.brand }}>
          <div>{notice.message}</div>
          {notice.warnings.map((warning) => (
            <div key={warning} className="mt-1" style={{ color: C.partial }}>
              {warning}
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" style={{ background: "rgba(28,37,48,.45)" }}>
          <div
            className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-xl border shadow-xl"
            style={{ background: C.panel, borderColor: C.border }}
            role="dialog"
            aria-modal="true"
            aria-label="엑셀 담보 추가 미리보기"
          >
            <div className="flex items-start gap-3 border-b px-4 py-3" style={{ borderColor: C.border }}>
              <div className="flex-1">
                <div className="font-bold">엑셀 담보 추가 미리보기</div>
                <div className="text-xs" style={{ color: C.muted }}>
                  {fileName} · 반영 대상 {preview.groups.length}개 · 오류 제외 {invalidCount}행
                </div>
              </div>
              <button onClick={() => setPreview(null)} aria-label="미리보기 닫기" style={{ color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            <div className="overflow-auto p-4">
              {preview.headerErrors.length > 0 && (
                <div className="mb-3 rounded-lg px-3 py-2 text-sm" style={{ background: `${C.low}12`, color: C.low }}>
                  {preview.headerErrors.map((error) => (
                    <div key={error}>{error}</div>
                  ))}
                </div>
              )}
              <table className="w-full min-w-[780px] border-collapse text-xs">
                <thead>
                  <tr style={{ background: C.track, color: C.muted }}>
                    {['행', '카테고리', '담보명', '필요보장', '보유', '보험사', '보험사금액', '상태'].map((header) => (
                      <th key={header} className="border-b px-2 py-2 text-left font-semibold" style={{ borderColor: C.border }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => (
                    <tr key={row.rowNumber} style={{ background: row.errors.length ? `${C.low}0A` : C.panel }}>
                      <td className="border-b px-2 py-2" style={{ borderColor: C.border }}>{row.rowNumber}</td>
                      <td className="border-b px-2 py-2" style={{ borderColor: C.border }}>{row.category || "-"}</td>
                      <td className="border-b px-2 py-2" style={{ borderColor: C.border }}>{row.name || "-"}</td>
                      <td className="border-b px-2 py-2 text-right" style={{ borderColor: C.border }}>{row.needed === null ? "-" : fmt(row.needed)}</td>
                      <td className="border-b px-2 py-2 text-right" style={{ borderColor: C.border }}>{row.heldManual === null ? "-" : fmt(row.heldManual)}</td>
                      <td className="border-b px-2 py-2" style={{ borderColor: C.border }}>{row.insurerName || "-"}</td>
                      <td className="border-b px-2 py-2 text-right" style={{ borderColor: C.border }}>{row.insurerAmount === null ? "-" : fmt(row.insurerAmount)}</td>
                      <td className="border-b px-2 py-2" style={{ borderColor: C.border, color: row.errors.length ? C.low : C.full }}>
                        {row.errors.length ? row.errors.join(", ") : "반영 가능"}
                      </td>
                    </tr>
                  ))}
                  {preview.rows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center" style={{ color: C.muted }}>
                        데이터 행이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 border-t px-4 py-3" style={{ borderColor: C.border }}>
              <button
                onClick={() => setPreview(null)}
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: C.border, color: C.muted }}
              >
                취소
              </button>
              <button
                onClick={applyPreview}
                disabled={!preview.groups.length || preview.headerErrors.length > 0}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: C.brand }}
              >
                이대로 반영
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
