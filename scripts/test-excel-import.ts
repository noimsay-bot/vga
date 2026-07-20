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

const xlsBytes = XLSX.write(workbook, { bookType: "xls", type: "array" });
const parsedXls = parseCoverageWorkbook(xlsBytes);
assert.equal(parsedXls.headerErrors.length, 0);
assert.equal(parsedXls.rows.length, 6);
assert.equal(parsedXls.groups.length, 3);
assert.equal(
  parsedXls.groups.find((group) => group.name === "테스트담보")?.insurers.length,
  2,
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

const productCoverageHtml = `
<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head>
<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
</head><body><table border="0" cellspacing="0"<tr>
<td>구분</td><td></td><td>가입회사명</td><td></td><td></td><td>보험사A</td><td>보험사B</td></tr>
<tr><td></td><td></td><td>가입상품명</td><td></td><td></td><td>상품A</td><td>상품B</td></tr>
<tr><td>가입담보</td><td></td><td>표준금액</td><td>가입합계</td><td>준비</td><td>가입금액</td><td>가입금액</td></tr>
<tr><td rowspan="2">가족보장</td><td>테스트사망</td><td>1,000</td><td>600</td><td>△</td><td>400</td><td>200</td></tr>
<tr><td>테스트후유장해</td><td>500</td><td>250</td><td>△</td><td>0</td><td>250</td></tr>
<tr><td>기타보장</td><td>수동합계담보</td><td>300</td><td>100</td><td>△</td><td>0</td><td>0</td></tr>
</table></body></html>`;
const parsedProductCoverage = parseCoverageWorkbook(
  new TextEncoder().encode(productCoverageHtml).buffer,
);
assert.equal(parsedProductCoverage.headerErrors.length, 0);
assert.equal(parsedProductCoverage.rows.length, 3);
assert.equal(parsedProductCoverage.groups.length, 3);
assert.equal(parsedProductCoverage.groups[0].category, "가족보장");
assert.equal(parsedProductCoverage.groups[0].insurers.length, 2);
assert.equal(
  parsedProductCoverage.groups[0].insurers.reduce((sum, insurer) => sum + insurer.amount, 0),
  600,
);
assert.match(parsedProductCoverage.groups[0].insurers[0].name, /보험사A · 상품A/);
assert.equal(parsedProductCoverage.groups[2].heldManual, 100);
assert.equal(parsedProductCoverage.groups[2].insurers.length, 0);

console.log("XLSX/XLS/CSV/HTML-XLS parse, grouping, validation, and merge checks passed.");
