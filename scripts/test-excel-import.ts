import assert from "node:assert/strict";
import * as XLSX from "xlsx";
import { buildFromSeed } from "../components/coverage-analysis/seed";
import {
  mergeImportedCoverages,
  parseCoverageWorkbook,
} from "../components/coverage-analysis/excelImport";

const workbook = XLSX.utils.book_new();
const sheet = XLSX.utils.aoa_to_sheet([
  ["카테고리", "담보명", "필요보장", "보유", "보험사", "보험사금액"],
  ["가족보장", "질병사망", "10,000", 0, "", ""],
  ["테스트보장", "테스트담보", 3000, "", "보험사A", "1,000"],
  ["테스트보장", "테스트담보", 3000, "", "보험사B", 500],
  ["테스트보장", "수동담보", 2000, 750, "", ""],
  ["테스트보장", "오류담보", "숫자아님", 0, "", ""],
  ["", "카테고리누락", 1000, 0, "", ""],
]);
XLSX.utils.book_append_sheet(workbook, sheet, "담보입력");
const xlsxBytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
const parsed = parseCoverageWorkbook(xlsxBytes);

assert.equal(parsed.headerErrors.length, 0);
assert.equal(parsed.rows.length, 6);
assert.equal(parsed.rows.filter((row) => row.errors.length).length, 2);
assert.equal(parsed.groups.length, 3);

const insuredGroup = parsed.groups.find((group) => group.name === "테스트담보");
assert.ok(insuredGroup);
assert.equal(insuredGroup.insurers.length, 2);
assert.equal(insuredGroup.insurers.reduce((sum, insurer) => sum + insurer.amount, 0), 1500);
assert.equal(insuredGroup.heldManual, 0);

const manualGroup = parsed.groups.find((group) => group.name === "수동담보");
assert.ok(manualGroup);
assert.equal(manualGroup.heldManual, 750);
assert.equal(manualGroup.insurers.length, 0);

const merged = mergeImportedCoverages(buildFromSeed(), parsed.groups);
assert.equal(merged.addedItems, 2);
assert.equal(merged.createdCategories, 1);
assert.equal(merged.warnings.length, 1);
assert.match(merged.warnings[0], /기존 담보와 중복/);

const mergedCategory = merged.categories.find((category) => category.name === "테스트보장");
assert.ok(mergedCategory);
assert.deepEqual(
  mergedCategory.items.map((item) => item.name),
  ["테스트담보", "수동담보"],
);

const csv = [
  "담보명,카테고리,보유,필요보장,보험사금액,보험사",
  "CSV담보,CSV보장,250,\"1,500\",,",
].join("\n");
const csvBytes = new TextEncoder().encode(csv).buffer;
const parsedCsv = parseCoverageWorkbook(csvBytes);
assert.equal(parsedCsv.headerErrors.length, 0);
assert.equal(parsedCsv.groups.length, 1);
assert.equal(parsedCsv.groups[0].category, "CSV보장");
assert.equal(parsedCsv.groups[0].needed, 1500);
assert.equal(parsedCsv.groups[0].heldManual, 250);

console.log("Excel/CSV parse, grouping, validation, and merge checks passed.");
