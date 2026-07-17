import * as XLSX from "xlsx";
import { uid } from "./seed";
import type { CoverageCategory, InsurerCoverage } from "./types";

export const COVERAGE_HEADERS = [
  "카테고리",
  "담보명",
  "필요보장",
  "보유",
  "보험사",
  "보험사금액",
] as const;

const REQUIRED_HEADERS = ["카테고리", "담보명", "필요보장"] as const;

export interface UploadPreviewRow {
  rowNumber: number;
  category: string;
  name: string;
  needed: number | null;
  heldManual: number | null;
  insurerName: string;
  insurerAmount: number | null;
  errors: string[];
}

export interface ImportedCoverageGroup {
  category: string;
  name: string;
  needed: number;
  heldManual: number;
  insurers: Array<{ name: string; amount: number }>;
  sourceRows: number[];
}

export interface ParsedCoverageWorkbook {
  rows: UploadPreviewRow[];
  groups: ImportedCoverageGroup[];
  headerErrors: string[];
}

export interface ImportMergeResult {
  categories: CoverageCategory[];
  addedItems: number;
  createdCategories: number;
  warnings: string[];
}

const textOf = (value: unknown) => String(value ?? "").trim();

const amountOf = (
  value: unknown,
  label: string,
  required: boolean,
  errors: string[],
) => {
  const text = textOf(value).replace(/,/g, "");
  if (!text) {
    if (required) errors.push(`${label} 필수값 누락`);
    return null;
  }
  const amount = Number(text);
  if (!Number.isFinite(amount) || amount < 0) {
    errors.push(`${label} 숫자 형식 오류`);
    return null;
  }
  return amount;
};

export function parseCoverageWorkbook(data: ArrayBuffer): ParsedCoverageWorkbook {
  const workbook = XLSX.read(data, { type: "array", codepage: 65001 });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { rows: [], groups: [], headerErrors: ["워크시트가 없습니다."] };
  }

  const sheet = workbook.Sheets[firstSheetName];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  });
  const headers = (matrix[0] ?? []).map(textOf);
  const headerErrors = REQUIRED_HEADERS.filter((header) => !headers.includes(header)).map(
    (header) => `필수 헤더 '${header}'가 없습니다.`,
  );
  if (headerErrors.length) return { rows: [], groups: [], headerErrors };

  const indexOf = (header: string) => headers.indexOf(header);
  const rows: UploadPreviewRow[] = matrix.slice(1).flatMap((values, rowIndex) => {
    const hasValue = values.some((value) => textOf(value) !== "");
    if (!hasValue) return [];

    const errors: string[] = [];
    const category = textOf(values[indexOf("카테고리")]);
    const name = textOf(values[indexOf("담보명")]);
    if (!category) errors.push("카테고리 필수값 누락");
    if (!name) errors.push("담보명 필수값 누락");

    const needed = amountOf(values[indexOf("필요보장")], "필요보장", true, errors);
    const heldManual = amountOf(values[indexOf("보유")], "보유", false, errors);
    const insurerName = textOf(values[indexOf("보험사")]);
    const insurerAmount = amountOf(
      values[indexOf("보험사금액")],
      "보험사금액",
      false,
      errors,
    );
    if (!insurerName && insurerAmount !== null) {
      errors.push("보험사 없이 보험사금액 입력");
    }

    return [
      {
        rowNumber: rowIndex + 2,
        category,
        name,
        needed,
        heldManual,
        insurerName,
        insurerAmount,
        errors,
      },
    ];
  });

  const grouped = new Map<string, ImportedCoverageGroup>();
  for (const row of rows) {
    if (row.errors.length || row.needed === null) continue;
    const key = `${row.category}\u0000${row.name}`;
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, {
        category: row.category,
        name: row.name,
        needed: row.needed,
        heldManual: row.heldManual ?? 0,
        insurers: row.insurerName
          ? [{ name: row.insurerName, amount: row.insurerAmount ?? 0 }]
          : [],
        sourceRows: [row.rowNumber],
      });
      continue;
    }
    existing.sourceRows.push(row.rowNumber);
    if (row.insurerName) {
      existing.insurers.push({ name: row.insurerName, amount: row.insurerAmount ?? 0 });
    }
  }

  const groups = Array.from(grouped.values()).map((group) => ({
    ...group,
    heldManual: group.insurers.length ? 0 : group.heldManual,
  }));
  return { rows, groups, headerErrors: [] };
}

export function mergeImportedCoverages(
  currentCategories: CoverageCategory[],
  groups: ImportedCoverageGroup[],
): ImportMergeResult {
  const categories = currentCategories.map((category) => ({
    ...category,
    items: [...category.items],
  }));
  const warnings: string[] = [];
  let addedItems = 0;
  let createdCategories = 0;

  for (const group of groups) {
    let category = categories.find((candidate) => candidate.name === group.category);
    if (!category) {
      category = { id: uid(), name: group.category, items: [] };
      categories.push(category);
      createdCategories += 1;
    }
    if (category.items.some((item) => item.name === group.name)) {
      warnings.push(`${group.category} / ${group.name}: 기존 담보와 중복되어 건너뜀`);
      continue;
    }
    const insurers: InsurerCoverage[] = group.insurers.map((insurer) => ({
      id: uid(),
      name: insurer.name,
      amount: insurer.amount,
    }));
    category.items.push({
      id: uid(),
      name: group.name,
      needed: group.needed,
      heldManual: insurers.length ? 0 : group.heldManual,
      insurers,
    });
    addedItems += 1;
  }

  return { categories, addedItems, createdCategories, warnings };
}

export function downloadCoverageTemplate() {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([
    [...COVERAGE_HEADERS],
    ["큰병보장", "암진단비", 7000, 0, "", ""],
    ["큰병보장", "뇌혈관질환진단비", 2000, "", "현대해상(예시상품)", 1000],
    ["큰병보장", "뇌혈관질환진단비", 2000, "", "삼성화재(예시상품)", 500],
  ]);
  sheet["!cols"] = [
    { wch: 16 },
    { wch: 24 },
    { wch: 12 },
    { wch: 12 },
    { wch: 26 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(workbook, sheet, "담보입력");
  const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "보장분석_담보입력_템플릿.xlsx";
  link.click();
  URL.revokeObjectURL(url);
}
