import assert from "node:assert/strict";
import { uid } from "../components/coverage-analysis/seed";
import { repairProjectIdentities } from "../components/projects/projectIdentity";
import type { CoverageProject } from "../components/coverage-analysis/types";

const generated = Array.from({ length: 2_000 }, () => uid());
assert.equal(new Set(generated).size, generated.length, "런타임 ID가 중복되었습니다.");

const baseProject: CoverageProject = {
  id: "duplicate-project",
  clientName: "기존 고객",
  asOf: "2026.07.22",
  categories: [
    {
      id: "duplicate-category",
      name: "첫 카테고리",
      items: [
        {
          id: "duplicate-item",
          name: "첫 담보",
          needed: 100,
          heldManual: 10,
          insurers: [{ id: "duplicate-insurer", name: "보험사 A", amount: 10 }],
        },
      ],
    },
    {
      id: "duplicate-category",
      name: "둘째 카테고리",
      items: [
        {
          id: "duplicate-item",
          name: "둘째 담보",
          needed: 200,
          heldManual: 20,
          insurers: [{ id: "duplicate-insurer", name: "보험사 B", amount: 20 }],
        },
      ],
    },
  ],
  vizModes: ["radar"],
  showItemDetail: true,
  customerMode: true,
  updatedAt: 1,
};

const secondProject: CoverageProject = {
  ...baseProject,
  clientName: "새 고객",
  categories: baseProject.categories.map((category) => ({
    ...category,
    items: category.items.map((item) => ({
      ...item,
      insurers: item.insurers.map((insurer) => ({ ...insurer })),
    })),
  })),
};

const repaired = repairProjectIdentities([baseProject, secondProject]);
assert.equal(repaired.projects.length, 2, "중복 ID 복구 중 고객 프로젝트가 유실되었습니다.");
assert.equal(new Set(repaired.projects.map((project) => project.id)).size, 2);
assert.deepEqual(repaired.projects.map((project) => project.clientName), ["기존 고객", "새 고객"]);

for (const project of repaired.projects) {
  const categories = project.categories;
  const items = categories.flatMap((category) => category.items);
  const insurers = items.flatMap((item) => item.insurers);
  assert.equal(new Set(categories.map((category) => category.id)).size, categories.length);
  assert.equal(new Set(items.map((item) => item.id)).size, items.length);
  assert.equal(new Set(insurers.map((insurer) => insurer.id)).size, insurers.length);
}

assert.ok(repaired.repairedIds >= 5, "예상한 중복 ID가 복구되지 않았습니다.");
console.log("project identity generation and duplicate recovery passed");
