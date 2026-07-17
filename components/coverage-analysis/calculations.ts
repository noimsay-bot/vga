import type { CoverageBand, CoverageCategory, CoverageItem } from "./types";

export const fmt = (value: number) => (value || 0).toLocaleString("ko-KR");

export const heldOf = (item: CoverageItem) =>
  item.insurers.length
    ? item.insurers.reduce((sum, insurer) => sum + (insurer.amount || 0), 0)
    : item.heldManual || 0;

export const ratioOf = (item: CoverageItem) => {
  const held = heldOf(item);
  return item.needed > 0 ? held / item.needed : held > 0 ? 1 : 0;
};

export const bandOf = (item: CoverageItem): CoverageBand => {
  const ratio = ratioOf(item);
  return ratio >= 1 ? "full" : ratio >= 0.3 ? "partial" : "low";
};

export const scoreOf = (category: CoverageCategory) =>
  category.items.length
    ? Math.round(
        (category.items.reduce((sum, item) => sum + Math.min(ratioOf(item), 1), 0) /
          category.items.length) *
          100,
      )
    : 0;

export const scoreBand = (score: number): CoverageBand =>
  score >= 60 ? "full" : score >= 35 ? "partial" : "low";

export const categoryAmounts = (category: CoverageCategory) =>
  category.items.reduce(
    (totals, item) => {
      const held = heldOf(item);
      totals.needed += item.needed || 0;
      totals.held += held;
      totals.shortage += Math.max((item.needed || 0) - held, 0);
      return totals;
    },
    { needed: 0, held: 0, shortage: 0 },
  );
