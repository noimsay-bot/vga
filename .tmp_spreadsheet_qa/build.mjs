import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "D:/vga/.tmp_spreadsheet_qa/output";
await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("담보입력");
sheet.showGridLines = false;
sheet.freezePanes.freezeRows(1);
sheet.getRange("A1:F7").values = [
  ["카테고리", "담보명", "필요보장", "보유", "보험사", "보험사금액"],
  ["가족보장", "질병사망", 10000, 0, "", ""],
  ["테스트보장", "테스트담보", 3000, "", "보험사A", 1000],
  ["테스트보장", "테스트담보", 3000, "", "보험사B", 500],
  ["테스트보장", "수동담보", 2000, 750, "", ""],
  ["테스트보장", "오류담보", "숫자아님", 0, "", ""],
  ["", "카테고리누락", 1000, 0, "", ""],
];
sheet.getRange("A1:F1").format = {
  fill: "#0E5C55",
  font: { bold: true, color: "#FFFFFF" },
  rowHeight: 26,
};
sheet.getRange("A2:F7").format.borders = {
  preset: "inside",
  style: "thin",
  color: "#E6E9ED",
};
sheet.getRange("C2:D7").format.numberFormat = "#,##0";
sheet.getRange("F2:F7").format.numberFormat = "#,##0";
sheet.getRange("A1:A7").format.columnWidth = 16;
sheet.getRange("B1:B7").format.columnWidth = 22;
sheet.getRange("C1:D7").format.columnWidth = 12;
sheet.getRange("E1:E7").format.columnWidth = 22;
sheet.getRange("F1:F7").format.columnWidth = 14;

const inspection = await workbook.inspect({
  kind: "table",
  range: "담보입력!A1:F7",
  include: "values,formulas",
  tableMaxRows: 10,
  tableMaxCols: 8,
});
console.log(inspection.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "formula error scan",
});
console.log(errors.ndjson);

const preview = await workbook.render({
  sheetName: "담보입력",
  range: "A1:F7",
  scale: 1.5,
  format: "png",
});
await fs.writeFile(`${outputDir}/coverage-import-test.png`, new Uint8Array(await preview.arrayBuffer()));
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(`${outputDir}/coverage-import-test.xlsx`);
