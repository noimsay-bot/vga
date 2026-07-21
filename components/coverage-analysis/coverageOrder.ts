import type { CoverageCategory, CoverageItem } from "./types";

const byStoredOrder = <T extends { order?: number }>(values: T[]) =>
  values
    .map((value, index) => ({ value, index }))
    .sort((left, right) => (left.value.order ?? left.index) - (right.value.order ?? right.index))
    .map(({ value }) => value);

export const assignCoverageOrder = (categories: CoverageCategory[]): CoverageCategory[] =>
  categories.map((category, categoryIndex) => ({
    ...category,
    order: categoryIndex,
    items: category.items.map((item, itemIndex) => ({
      ...item,
      order: itemIndex,
    })),
  }));

export const normalizeCoverageOrder = (categories: CoverageCategory[]): CoverageCategory[] =>
  assignCoverageOrder(
    byStoredOrder(categories).map((category) => ({
      ...category,
      items: byStoredOrder(category.items),
    })),
  );

export const reorderCategories = (
  categories: CoverageCategory[],
  activeId: string,
  overId: string,
) => {
  const ordered = normalizeCoverageOrder(categories);
  const from = ordered.findIndex((category) => category.id === activeId);
  const to = ordered.findIndex((category) => category.id === overId);
  if (from < 0 || to < 0 || from === to) return ordered;
  const next = [...ordered];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return assignCoverageOrder(next);
};

export const moveCategoryBy = (
  categories: CoverageCategory[],
  categoryId: string,
  offset: number,
) => {
  const ordered = normalizeCoverageOrder(categories);
  const from = ordered.findIndex((category) => category.id === categoryId);
  if (from < 0) return ordered;
  const to = Math.max(0, Math.min(ordered.length - 1, from + offset));
  return reorderCategories(ordered, categoryId, ordered[to].id);
};

interface ItemLocation {
  categoryIndex: number;
  itemIndex: number;
  item: CoverageItem;
}

const locateItem = (categories: CoverageCategory[], itemId: string): ItemLocation | null => {
  for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex += 1) {
    const itemIndex = categories[categoryIndex].items.findIndex((item) => item.id === itemId);
    if (itemIndex >= 0) {
      return { categoryIndex, itemIndex, item: categories[categoryIndex].items[itemIndex] };
    }
  }
  return null;
};

export const moveItem = (
  categories: CoverageCategory[],
  activeItemId: string,
  targetCategoryId: string,
  overItemId?: string,
) => {
  const ordered = normalizeCoverageOrder(categories);
  const source = locateItem(ordered, activeItemId);
  const targetCategoryIndex = ordered.findIndex((category) => category.id === targetCategoryId);
  if (!source || targetCategoryIndex < 0) return ordered;
  const originalTargetIndex = overItemId
    ? ordered[targetCategoryIndex].items.findIndex((item) => item.id === overItemId)
    : -1;

  const next = ordered.map((category) => ({ ...category, items: [...category.items] }));
  const [moved] = next[source.categoryIndex].items.splice(source.itemIndex, 1);
  const targetItems = next[targetCategoryIndex].items;
  let targetIndex = overItemId ? originalTargetIndex : targetItems.length;
  if (targetIndex < 0) targetIndex = targetItems.length;
  targetItems.splice(targetIndex, 0, moved);
  return assignCoverageOrder(next);
};

export const moveItemBy = (
  categories: CoverageCategory[],
  categoryId: string,
  itemId: string,
  offset: number,
) => {
  const ordered = normalizeCoverageOrder(categories);
  const category = ordered.find((candidate) => candidate.id === categoryId);
  if (!category) return ordered;
  const from = category.items.findIndex((item) => item.id === itemId);
  if (from < 0) return ordered;
  const to = Math.max(0, Math.min(category.items.length - 1, from + offset));
  if (to === from) return ordered;
  const targetId = category.items[to].id;
  const moved = moveItem(ordered, itemId, categoryId, targetId);
  if (offset > 0) {
    const target = moved.find((candidate) => candidate.id === categoryId);
    if (!target) return moved;
    const currentIndex = target.items.findIndex((item) => item.id === itemId);
    const next = normalizeCoverageOrder(moved).map((candidate) => ({
      ...candidate,
      items: [...candidate.items],
    }));
    const nextTarget = next.find((candidate) => candidate.id === categoryId);
    if (nextTarget && currentIndex < nextTarget.items.length - 1) {
      const [item] = nextTarget.items.splice(currentIndex, 1);
      nextTarget.items.splice(currentIndex + 1, 0, item);
    }
    return assignCoverageOrder(next);
  }
  return moved;
};

export const moveItemToAdjacentCategory = (
  categories: CoverageCategory[],
  categoryId: string,
  itemId: string,
  offset: number,
) => {
  const ordered = normalizeCoverageOrder(categories);
  const from = ordered.findIndex((category) => category.id === categoryId);
  if (from < 0) return ordered;
  const target = ordered[from + offset];
  return target ? moveItem(ordered, itemId, target.id) : ordered;
};
