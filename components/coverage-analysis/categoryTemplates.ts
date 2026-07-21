import { normalizeCoverageOrder } from "./coverageOrder";
import { uid } from "./seed";
import type { CategoryTemplate } from "./categoryTemplateRepository";
import type { CoverageCategory } from "./types";

export const categoryTemplateFromCoverage = (
  name: string,
  categories: CoverageCategory[],
  existing?: CategoryTemplate,
): CategoryTemplate => {
  const now = Date.now();
  const ordered = normalizeCoverageOrder(categories);
  return {
    id: existing?.id ?? `template-${now}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    categories: ordered.map((category, categoryIndex) => ({
      name: category.name,
      order: categoryIndex,
      items: category.items.map((item, itemIndex) => ({
        name: item.name,
        needed: item.needed,
        order: itemIndex,
      })),
    })),
  };
};

export const instantiateCategoryTemplate = (template: CategoryTemplate) => {
  const itemIds: string[] = [];
  const categories: CoverageCategory[] = [...template.categories]
    .sort((left, right) => left.order - right.order)
    .map((category, categoryIndex) => ({
      id: uid(),
      name: category.name,
      order: categoryIndex,
      items: [...category.items]
        .sort((left, right) => left.order - right.order)
        .map((item, itemIndex) => {
          const id = uid();
          itemIds.push(id);
          return {
            id,
            name: item.name,
            needed: item.needed,
            heldManual: 0,
            insurers: [],
            order: itemIndex,
          };
        }),
    }));
  return { categories: normalizeCoverageOrder(categories), itemIds };
};

export const mergeCategoryTemplate = (
  current: CoverageCategory[],
  template: CategoryTemplate,
) => {
  const next = normalizeCoverageOrder(current).map((category) => ({
    ...category,
    items: [...category.items],
  }));
  const itemIds: string[] = [];
  const warnings: string[] = [];

  [...template.categories]
    .sort((left, right) => left.order - right.order)
    .forEach((templateCategory) => {
      let category = next.find((candidate) => candidate.name.trim() === templateCategory.name.trim());
      if (!category) {
        category = {
          id: uid(),
          name: templateCategory.name,
          items: [],
          order: next.length,
        };
        next.push(category);
      }
      const existingNames = new Set(category.items.map((item) => item.name.trim()));
      [...templateCategory.items]
        .sort((left, right) => left.order - right.order)
        .forEach((templateItem) => {
          if (existingNames.has(templateItem.name.trim())) {
            warnings.push(`${templateCategory.name} · ${templateItem.name}: 이미 있어 건너뜀`);
            return;
          }
          const id = uid();
          itemIds.push(id);
          existingNames.add(templateItem.name.trim());
          category.items.push({
            id,
            name: templateItem.name,
            needed: templateItem.needed,
            heldManual: 0,
            insurers: [],
            order: category.items.length,
          });
        });
    });

  return { categories: normalizeCoverageOrder(next), itemIds, warnings };
};
