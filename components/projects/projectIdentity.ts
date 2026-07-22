import { uid } from "@/components/coverage-analysis/seed";
import type { CoverageProject } from "@/components/coverage-analysis/types";

export interface ProjectIdentityRepairResult {
  projects: CoverageProject[];
  repairedIds: number;
}

const claimUniqueId = (preferredId: string, used: Set<string>) => {
  if (preferredId && !used.has(preferredId)) {
    used.add(preferredId);
    return { id: preferredId, repaired: false };
  }

  let id = uid();
  while (used.has(id)) id = uid();
  used.add(id);
  return { id, repaired: true };
};

export const repairProjectIdentities = (
  projects: CoverageProject[],
): ProjectIdentityRepairResult => {
  const projectIds = new Set<string>();
  let repairedIds = 0;

  const repairedProjects = projects.map((project) => {
    const projectIdentity = claimUniqueId(project.id, projectIds);
    if (projectIdentity.repaired) repairedIds += 1;

    const categoryIds = new Set<string>();
    const itemIds = new Set<string>();
    const insurerIds = new Set<string>();
    const categories = project.categories.map((category) => {
      const categoryIdentity = claimUniqueId(category.id, categoryIds);
      if (categoryIdentity.repaired) repairedIds += 1;

      const items = category.items.map((item) => {
        const itemIdentity = claimUniqueId(item.id, itemIds);
        if (itemIdentity.repaired) repairedIds += 1;

        const insurers = item.insurers.map((insurer) => {
          const insurerIdentity = claimUniqueId(insurer.id, insurerIds);
          if (insurerIdentity.repaired) repairedIds += 1;
          return { ...insurer, id: insurerIdentity.id };
        });

        return { ...item, id: itemIdentity.id, insurers };
      });

      return { ...category, id: categoryIdentity.id, items };
    });

    return { ...project, id: projectIdentity.id, categories };
  });

  return { projects: repairedProjects, repairedIds };
};
