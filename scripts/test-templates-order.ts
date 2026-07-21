import assert from "node:assert/strict";
import { scoreOf } from "../components/coverage-analysis/calculations";
import {
  instantiateCategoryTemplate,
  mergeCategoryTemplate,
  categoryTemplateFromCoverage,
} from "../components/coverage-analysis/categoryTemplates";
import {
  moveItem,
  moveItemBy,
  normalizeCoverageOrder,
  reorderCategories,
} from "../components/coverage-analysis/coverageOrder";
import { migrateProject } from "../components/projects/ProjectProvider";
import type { CoverageCategory } from "../components/coverage-analysis/types";

const source: CoverageCategory[] = normalizeCoverageOrder([
  {
    id: "c1",
    name: "첫째",
    items: [
      { id: "a", name: "A", needed: 100, heldManual: 50, insurers: [] },
      { id: "b", name: "B", needed: 100, heldManual: 100, insurers: [] },
    ],
  },
  {
    id: "c2",
    name: "둘째",
    items: [{ id: "c", name: "C", needed: 200, heldManual: 0, insurers: [] }],
  },
]);

const beforeScores = source.map(scoreOf);
const reordered = reorderCategories(source, "c1", "c2");
assert.deepEqual(reordered.map((category) => category.id), ["c2", "c1"]);
assert.deepEqual(reordered.map((category) => category.order), [0, 1]);
assert.deepEqual(reordered.map(scoreOf), beforeScores.reverse());

const itemDown = moveItemBy(source, "c1", "a", 1);
assert.deepEqual(itemDown[0].items.map((item) => item.id), ["b", "a"]);
assert.equal(scoreOf(itemDown[0]), scoreOf(source[0]));

const crossed = moveItem(source, "a", "c2");
assert.deepEqual(crossed[0].items.map((item) => item.id), ["b"]);
assert.deepEqual(crossed[1].items.map((item) => item.id), ["c", "a"]);
assert.deepEqual(crossed.flatMap((category) => category.items.map((item) => item.order)), [0, 0, 1]);

const template = categoryTemplateFromCoverage("개인정보 제외", source);
const serialized = JSON.stringify(template);
assert.equal(serialized.includes("heldManual"), false);
assert.equal(serialized.includes("insurers"), false);
assert.equal(serialized.includes("clientName"), false);
assert.deepEqual(Object.keys(template.categories[0].items[0]).sort(), ["name", "needed", "order"]);

const instantiated = instantiateCategoryTemplate(template);
assert.ok(instantiated.categories.every((category) => category.items.every((item) => item.heldManual === 0)));
assert.ok(instantiated.categories.every((category) => category.items.every((item) => item.insurers.length === 0)));
assert.equal(instantiated.itemIds.length, 3);

const merged = mergeCategoryTemplate(source, template);
assert.equal(merged.itemIds.length, 0);
assert.equal(merged.warnings.length, 3);
assert.equal(merged.categories.length, 2);

const migrated = migrateProject({
  id: "ordered",
  clientName: "고객",
  asOf: "",
  categories: [
    { ...source[0], order: 1 },
    { ...source[1], order: 0 },
  ],
  vizModes: ["radar"],
  customerMode: true,
  updatedAt: 1,
});
assert.deepEqual(migrated.categories.map((category) => category.id), ["c2", "c1"]);
assert.deepEqual(migrated.categories.map((category) => category.order), [0, 1]);

console.log("template/order scenarios passed");
