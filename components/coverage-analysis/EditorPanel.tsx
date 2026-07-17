import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Star, Trash2 } from "lucide-react";
import { heldOf, fmt, scoreBand, scoreOf } from "./calculations";
import ExcelUploadPanel from "./ExcelUploadPanel";
import FavoritePicker from "./FavoritePicker";
import { bandColor, C } from "./tokens";
import useCoverageFavorites, { type FavoriteCoverage } from "./useCoverageFavorites";
import type { ImportedCoverageGroup, ImportMergeResult } from "./excelImport";
import type { CoverageCategory, CoverageItem, InsurerCoverage } from "./types";

interface EditorPanelProps {
  clientName: string;
  asOf: string;
  categories: CoverageCategory[];
  onClientNameChange: (value: string) => void;
  onAsOfChange: (value: string) => void;
  onCategoryNameChange: (categoryId: string, value: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddCategory: () => void;
  onAddItem: (categoryId: string) => void;
  onItemChange: (categoryId: string, itemId: string, patch: Partial<CoverageItem>) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
  onAddInsurer: (categoryId: string, itemId: string) => void;
  onEditInsurer: (
    categoryId: string,
    itemId: string,
    insurerId: string,
    patch: Partial<InsurerCoverage>,
  ) => void;
  onDeleteInsurer: (categoryId: string, itemId: string, insurerId: string) => void;
  onImportGroups: (
    groups: ImportedCoverageGroup[],
  ) => Pick<ImportMergeResult, "addedItems" | "createdCategories" | "warnings">;
  onAddFavoriteItems: (
    categoryId: string,
    favorites: FavoriteCoverage[],
  ) => { added: number; skipped: number };
}

export default function EditorPanel({
  clientName,
  asOf,
  categories,
  onClientNameChange,
  onAsOfChange,
  onCategoryNameChange,
  onDeleteCategory,
  onAddCategory,
  onAddItem,
  onItemChange,
  onDeleteItem,
  onAddInsurer,
  onEditInsurer,
  onDeleteInsurer,
  onImportGroups,
  onAddFavoriteItems,
}: EditorPanelProps) {
  const { favorites, toggleFavorite, deleteFavorite } = useCoverageFavorites();

  return (
    <>
      <ExcelUploadPanel onApply={onImportGroups} />
      <label className="text-xs font-semibold" style={{ color: C.muted }}>
        고객 이름
      </label>
      <input
        value={clientName}
        onChange={(event) => onClientNameChange(event.target.value)}
        placeholder="예: 정철원"
        className="w-full mt-1 mb-2 px-3 py-2 rounded-lg border text-lg font-bold"
        style={{ borderColor: C.border, background: C.panel }}
      />
      <label className="text-xs font-semibold" style={{ color: C.muted }}>
        분석 기준일
      </label>
      <input
        value={asOf}
        onChange={(event) => onAsOfChange(event.target.value)}
        placeholder="예: 2026.07.14"
        className="w-full mt-1 mb-4 px-3 py-1.5 rounded-lg border text-sm"
        style={{ borderColor: C.border, background: C.panel }}
      />

      {categories.map((category) => (
        <CategoryEditor
          key={category.id}
          category={category}
          onName={(value) => onCategoryNameChange(category.id, value)}
          onDelete={() => onDeleteCategory(category.id)}
          onAddItem={() => onAddItem(category.id)}
          onItem={(itemId, patch) => onItemChange(category.id, itemId, patch)}
          onDeleteItem={(itemId) => onDeleteItem(category.id, itemId)}
          onAddInsurer={(itemId) => onAddInsurer(category.id, itemId)}
          onEditInsurer={(itemId, insurerId, patch) =>
            onEditInsurer(category.id, itemId, insurerId, patch)
          }
          onDeleteInsurer={(itemId, insurerId) =>
            onDeleteInsurer(category.id, itemId, insurerId)
          }
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onDeleteFavorite={deleteFavorite}
          onAddFavoriteItems={(selected) => onAddFavoriteItems(category.id, selected)}
        />
      ))}

      <button
        onClick={onAddCategory}
        className="w-full mt-1 py-2.5 rounded-lg border-2 border-dashed text-sm font-medium flex items-center justify-center gap-1"
        style={{ borderColor: C.border, color: C.brand }}
      >
        <Plus size={15} /> 보장 카테고리 추가
      </button>
    </>
  );
}

interface CategoryEditorProps {
  category: CoverageCategory;
  onName: (value: string) => void;
  onDelete: () => void;
  onAddItem: () => void;
  onItem: (itemId: string, patch: Partial<CoverageItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddInsurer: (itemId: string) => void;
  onEditInsurer: (
    itemId: string,
    insurerId: string,
    patch: Partial<InsurerCoverage>,
  ) => void;
  onDeleteInsurer: (itemId: string, insurerId: string) => void;
  favorites: FavoriteCoverage[];
  onToggleFavorite: (item: Pick<CoverageItem, "name" | "needed">) => void;
  onDeleteFavorite: (favoriteId: string) => void;
  onAddFavoriteItems: (favorites: FavoriteCoverage[]) => { added: number; skipped: number };
}

function CategoryEditor({
  category,
  onName,
  onDelete,
  onAddItem,
  onItem,
  onDeleteItem,
  onAddInsurer,
  onEditInsurer,
  onDeleteInsurer,
  favorites,
  onToggleFavorite,
  onDeleteFavorite,
  onAddFavoriteItems,
}: CategoryEditorProps) {
  const [open, setOpen] = useState(true);
  const score = scoreOf(category);

  return (
    <div className="mb-3 rounded-xl border" style={{ borderColor: C.border, background: C.panel }}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button onClick={() => setOpen(!open)} style={{ color: C.muted }}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <input
          value={category.name}
          onChange={(event) => onName(event.target.value)}
          className="flex-1 font-bold bg-transparent"
        />
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: "#EEF2F1", color: bandColor(scoreBand(score)) }}
        >
          {score}점
        </span>
        <button
          onClick={onDelete}
          style={{ color: "#C0392B" }}
          className="opacity-50 hover:opacity-100"
        >
          <Trash2 size={15} />
        </button>
      </div>
      {open && (
        <div className="px-3 pb-3">
          <div
            className="flex gap-2 px-1 pb-1 text-[11px] font-semibold"
            style={{ color: C.muted }}
          >
            <span className="flex-1">담보명</span>
            <span className="w-16 text-right">표준</span>
            <span className="w-16 text-right">가입합계</span>
            <span className="w-16" />
          </div>
          {category.items.map((item) => (
            <ItemEditor
              key={item.id}
              item={item}
              onChange={(patch) => onItem(item.id, patch)}
              onDelete={() => onDeleteItem(item.id)}
              onAddInsurer={() => onAddInsurer(item.id)}
              onEditInsurer={(insurerId, patch) => onEditInsurer(item.id, insurerId, patch)}
              onDeleteInsurer={(insurerId) => onDeleteInsurer(item.id, insurerId)}
              isFavorite={favorites.some((favorite) => favorite.name === item.name)}
              onToggleFavorite={() => onToggleFavorite(item)}
            />
          ))}
          <div className="mt-1 flex flex-wrap gap-2">
            <button
              onClick={onAddItem}
              className="flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium"
              style={{ color: C.brand, background: "#F2F6F5" }}
            >
              <Plus size={13} /> 항목 추가
            </button>
            <FavoritePicker
              categoryName={category.name}
              favorites={favorites}
              onAdd={onAddFavoriteItems}
              onDelete={onDeleteFavorite}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface ItemEditorProps {
  item: CoverageItem;
  onChange: (patch: Partial<CoverageItem>) => void;
  onDelete: () => void;
  onAddInsurer: () => void;
  onEditInsurer: (insurerId: string, patch: Partial<InsurerCoverage>) => void;
  onDeleteInsurer: (insurerId: string) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

function ItemEditor({
  item,
  onChange,
  onDelete,
  onAddInsurer,
  onEditInsurer,
  onDeleteInsurer,
  isFavorite,
  onToggleFavorite,
}: ItemEditorProps) {
  const [open, setOpen] = useState(false);
  const hasInsurers = item.insurers.length > 0;
  const held = heldOf(item);
  const toNumber = (value: string) => {
    const parsed = Number.parseInt(String(value).replace(/[^0-9]/g, ""), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  return (
    <div className="rounded-lg mb-1.5 border" style={{ borderColor: C.border }}>
      <div className="flex items-center gap-2 px-2 py-1.5">
        <input
          value={item.name}
          onChange={(event) => onChange({ name: event.target.value })}
          className="flex-1 text-sm bg-transparent"
        />
        <input
          value={item.needed}
          onChange={(event) => onChange({ needed: toNumber(event.target.value) })}
          inputMode="numeric"
          className="w-16 text-sm text-right px-1.5 py-1 rounded border tabular-nums"
          style={{ borderColor: C.border }}
        />
        {hasInsurers ? (
          <span
            className="w-16 text-sm text-right tabular-nums font-semibold"
            style={{ color: C.ink }}
            title="보험사 합산"
          >
            {fmt(held)}
          </span>
        ) : (
          <input
            value={item.heldManual}
            onChange={(event) => onChange({ heldManual: toNumber(event.target.value) })}
            inputMode="numeric"
            className="w-16 text-sm text-right px-1.5 py-1 rounded border tabular-nums"
            style={{ borderColor: C.border }}
          />
        )}
        <button
          onClick={onToggleFavorite}
          className="flex w-5 justify-center"
          style={{ color: isFavorite ? C.partial : C.muted }}
          title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          aria-label={`${item.name} ${isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}`}
        >
          <Star size={14} fill={isFavorite ? C.partial : "none"} />
        </button>
        <button
          onClick={() => setOpen(!open)}
          className="w-5 flex justify-center"
          style={{ color: hasInsurers ? C.brand : C.muted }}
          title="보험사별 금액"
        >
          {open ? <ChevronDown size={15} /> : <Plus size={15} />}
        </button>
        <button
          onClick={onDelete}
          className="w-5 flex justify-center opacity-40 hover:opacity-100"
          style={{ color: "#C0392B" }}
        >
          <Trash2 size={13} />
        </button>
      </div>
      {open && (
        <div className="px-2 pb-2 pt-1 mx-1 mb-1 rounded-md" style={{ background: "#F7F9FA" }}>
          <div className="text-[11px] font-semibold mb-1" style={{ color: C.muted }}>
            가입 보험사별 금액
          </div>
          {item.insurers.map((insurer) => (
            <div key={insurer.id} className="flex items-center gap-1.5 mb-1">
              <input
                value={insurer.name}
                onChange={(event) => onEditInsurer(insurer.id, { name: event.target.value })}
                placeholder="보험사/상품명"
                className="flex-1 text-xs px-2 py-1 rounded border bg-white"
                style={{ borderColor: C.border }}
              />
              <input
                value={insurer.amount}
                onChange={(event) =>
                  onEditInsurer(insurer.id, { amount: toNumber(event.target.value) })
                }
                inputMode="numeric"
                className="w-16 text-xs text-right px-1.5 py-1 rounded border bg-white tabular-nums"
                style={{ borderColor: C.border }}
              />
              <button
                onClick={() => onDeleteInsurer(insurer.id)}
                className="opacity-50 hover:opacity-100"
                style={{ color: "#C0392B" }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={onAddInsurer}
            className="text-xs flex items-center gap-1 mt-0.5"
            style={{ color: C.brand }}
          >
            <Plus size={12} /> 보험사 추가
          </button>
          {hasInsurers && (
            <div className="text-[11px] mt-1" style={{ color: C.muted }}>
              가입합계는 보험사 금액의 합으로 자동 계산됩니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
