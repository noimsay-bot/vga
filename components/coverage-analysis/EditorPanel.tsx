import { useState, type CSSProperties } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  GripVertical,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { heldOf, fmt, scoreBand, scoreOf } from "./calculations";
import {
  moveCategoryBy,
  moveItem,
  moveItemBy,
  moveItemToAdjacentCategory,
  reorderCategories,
} from "./coverageOrder";
import ExcelUploadPanel from "./ExcelUploadPanel";
import FavoritePicker from "./FavoritePicker";
import TemplateMenu, { type TemplateApplyMode } from "./TemplateMenu";
import { bandColor, C } from "./tokens";
import useCoverageFavorites, { type FavoriteCoverage } from "./useCoverageFavorites";
import type { CategoryTemplate } from "./categoryTemplateRepository";
import type { ImportedCoverageGroup, ImportMergeResult } from "./excelImport";
import type { CoverageCategory, CoverageItem, InsurerCoverage } from "./types";

interface EditorPanelProps {
  clientName: string;
  asOf: string;
  categories: CoverageCategory[];
  highlightedItemIds: ReadonlySet<string>;
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
  onCategoriesChange: (categories: CoverageCategory[]) => void;
  onApplyTemplate: (template: CategoryTemplate, mode: TemplateApplyMode) => string[];
}

const categoryDragId = (id: string) => `category:${id}`;
const itemDragId = (id: string) => `item:${id}`;
const rawId = (id: string) => id.slice(id.indexOf(":") + 1);

const transformStyle = (transform: ReturnType<typeof useSortable>["transform"]): CSSProperties =>
  transform
    ? {
        transform: `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0) scaleX(${transform.scaleX ?? 1}) scaleY(${transform.scaleY ?? 1})`,
      }
    : {};

export default function EditorPanel({
  clientName,
  asOf,
  categories,
  highlightedItemIds,
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
  onCategoriesChange,
  onApplyTemplate,
}: EditorPanelProps) {
  const { favorites, toggleFavorite, deleteFavorite } = useCoverageFavorites();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const activeData = active.data.current as { type?: string; categoryId?: string } | undefined;
    const overData = over.data.current as { type?: string; categoryId?: string } | undefined;
    if (activeData?.type === "category") {
      const targetCategoryId =
        overData?.type === "category"
          ? rawId(String(over.id))
          : overData?.type === "item"
            ? overData.categoryId
            : undefined;
      if (targetCategoryId) {
        onCategoriesChange(reorderCategories(categories, rawId(String(active.id)), targetCategoryId));
      }
      return;
    }
    if (activeData?.type !== "item") return;
    const targetCategoryId =
      overData?.type === "item" ? overData.categoryId : overData?.type === "category" ? rawId(String(over.id)) : undefined;
    if (!targetCategoryId) return;
    onCategoriesChange(
      moveItem(
        categories,
        rawId(String(active.id)),
        targetCategoryId,
        overData?.type === "item" ? rawId(String(over.id)) : undefined,
      ),
    );
  };

  return (
    <>
      <TemplateMenu categories={categories} onApply={onApplyTemplate} />
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

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={categories.map((category) => categoryDragId(category.id))}
          strategy={verticalListSortingStrategy}
        >
          {categories.map((category, categoryIndex) => (
            <CategoryEditor
              key={category.id}
              category={category}
              categoryIndex={categoryIndex}
              categoryCount={categories.length}
              highlightedItemIds={highlightedItemIds}
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
              onMoveCategory={(offset) => onCategoriesChange(moveCategoryBy(categories, category.id, offset))}
              onMoveItem={(itemId, offset) =>
                onCategoriesChange(moveItemBy(categories, category.id, itemId, offset))
              }
              onMoveItemCategory={(itemId, offset) =>
                onCategoriesChange(moveItemToAdjacentCategory(categories, category.id, itemId, offset))
              }
            />
          ))}
        </SortableContext>
      </DndContext>

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
  categoryIndex: number;
  categoryCount: number;
  highlightedItemIds: ReadonlySet<string>;
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
  onMoveCategory: (offset: number) => void;
  onMoveItem: (itemId: string, offset: number) => void;
  onMoveItemCategory: (itemId: string, offset: number) => void;
}

function CategoryEditor({
  category,
  categoryIndex,
  categoryCount,
  highlightedItemIds,
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
  onMoveCategory,
  onMoveItem,
  onMoveItemCategory,
}: CategoryEditorProps) {
  const [open, setOpen] = useState(true);
  const score = scoreOf(category);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({
      id: categoryDragId(category.id),
      data: { type: "category", categoryId: category.id },
    });

  return (
    <div
      ref={setNodeRef}
      className="mb-3 rounded-xl border"
      style={{
        borderColor: isOver ? C.brand : C.border,
        background: C.panel,
        transition,
        opacity: isDragging ? 0.38 : 1,
        boxShadow: isOver ? `0 0 0 2px ${C.brand}22` : undefined,
        ...transformStyle(transform),
      }}
    >
      <div className="flex min-w-0 items-center gap-1.5 px-2 py-2.5 sm:gap-2 sm:px-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-1 active:cursor-grabbing"
          style={{ color: C.muted }}
          aria-label={`${category.name} 카테고리 순서 이동`}
          title="카테고리 드래그"
        >
          <GripVertical size={16} />
        </button>
        <button onClick={() => setOpen(!open)} style={{ color: C.muted }}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <input
          value={category.name}
          onChange={(event) => onName(event.target.value)}
          className="min-w-0 flex-1 bg-transparent font-bold"
        />
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold"
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
        <span className="flex sm:hidden">
          <button
            type="button"
            onClick={() => onMoveCategory(-1)}
            disabled={categoryIndex === 0}
            className="p-1 disabled:opacity-25"
            aria-label={`${category.name} 위로 이동`}
          >
            <ChevronsUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => onMoveCategory(1)}
            disabled={categoryIndex === categoryCount - 1}
            className="p-1 disabled:opacity-25"
            aria-label={`${category.name} 아래로 이동`}
          >
            <ChevronsDown size={14} />
          </button>
        </span>
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
          <SortableContext
            items={category.items.map((item) => itemDragId(item.id))}
            strategy={verticalListSortingStrategy}
          >
            {category.items.map((item, itemIndex) => (
              <ItemEditor
                key={item.id}
                item={item}
                categoryId={category.id}
                itemIndex={itemIndex}
                itemCount={category.items.length}
                categoryIndex={categoryIndex}
                categoryCount={categoryCount}
                needsAmount={highlightedItemIds.has(item.id)}
                onChange={(patch) => onItem(item.id, patch)}
                onDelete={() => onDeleteItem(item.id)}
                onAddInsurer={() => onAddInsurer(item.id)}
                onEditInsurer={(insurerId, patch) => onEditInsurer(item.id, insurerId, patch)}
                onDeleteInsurer={(insurerId) => onDeleteInsurer(item.id, insurerId)}
                isFavorite={favorites.some((favorite) => favorite.name === item.name)}
                onToggleFavorite={() => onToggleFavorite(item)}
                onMove={(offset) => onMoveItem(item.id, offset)}
                onMoveCategory={(offset) => onMoveItemCategory(item.id, offset)}
              />
            ))}
          </SortableContext>
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
  categoryId: string;
  itemIndex: number;
  itemCount: number;
  categoryIndex: number;
  categoryCount: number;
  needsAmount: boolean;
  onChange: (patch: Partial<CoverageItem>) => void;
  onDelete: () => void;
  onAddInsurer: () => void;
  onEditInsurer: (insurerId: string, patch: Partial<InsurerCoverage>) => void;
  onDeleteInsurer: (insurerId: string) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onMove: (offset: number) => void;
  onMoveCategory: (offset: number) => void;
}

function ItemEditor({
  item,
  categoryId,
  itemIndex,
  itemCount,
  categoryIndex,
  categoryCount,
  needsAmount,
  onChange,
  onDelete,
  onAddInsurer,
  onEditInsurer,
  onDeleteInsurer,
  isFavorite,
  onToggleFavorite,
  onMove,
  onMoveCategory,
}: ItemEditorProps) {
  const [open, setOpen] = useState(false);
  const hasInsurers = item.insurers.length > 0;
  const held = heldOf(item);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({
      id: itemDragId(item.id),
      data: { type: "item", categoryId },
    });
  const toNumber = (value: string) => {
    const parsed = Number.parseInt(String(value).replace(/[^0-9]/g, ""), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  return (
    <div
      ref={setNodeRef}
      className="mb-1.5 rounded-lg border"
      style={{
        borderColor: needsAmount ? C.partial : isOver ? C.brand : C.border,
        background: needsAmount ? `${C.partial}0D` : C.panel,
        transition,
        opacity: isDragging ? 0.35 : 1,
        boxShadow: isOver ? `inset 0 3px 0 ${C.brand}` : undefined,
        ...transformStyle(transform),
      }}
    >
      {needsAmount && (
        <div className="px-2 pt-1.5 text-[10px] font-bold" style={{ color: C.partial }}>
          보유 금액 입력 필요
        </div>
      )}
      <div className="flex min-w-0 items-center gap-1.5 px-2 py-1.5 sm:gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab touch-none rounded p-0.5 active:cursor-grabbing"
          style={{ color: C.muted }}
          aria-label={`${item.name} 담보 순서 또는 카테고리 이동`}
          title="담보 드래그"
        >
          <GripVertical size={14} />
        </button>
        <input
          value={item.name}
          onChange={(event) => onChange({ name: event.target.value })}
          className="min-w-0 flex-1 bg-transparent text-sm"
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
      <div className="flex items-center justify-end gap-1 px-2 pb-1.5 sm:hidden">
        <span className="mr-auto text-[10px]" style={{ color: C.muted }}>순서/카테고리 이동</span>
        <button type="button" onClick={() => onMove(-1)} disabled={itemIndex === 0} className="rounded border p-1 disabled:opacity-25" style={{ borderColor: C.border }} aria-label={`${item.name} 위로 이동`}><ChevronsUp size={12} /></button>
        <button type="button" onClick={() => onMove(1)} disabled={itemIndex === itemCount - 1} className="rounded border p-1 disabled:opacity-25" style={{ borderColor: C.border }} aria-label={`${item.name} 아래로 이동`}><ChevronsDown size={12} /></button>
        <button type="button" onClick={() => onMoveCategory(-1)} disabled={categoryIndex === 0} className="rounded border p-1 disabled:opacity-25" style={{ borderColor: C.border }} aria-label={`${item.name} 이전 카테고리로 이동`}><ChevronLeft size={12} /></button>
        <button type="button" onClick={() => onMoveCategory(1)} disabled={categoryIndex === categoryCount - 1} className="rounded border p-1 disabled:opacity-25" style={{ borderColor: C.border }} aria-label={`${item.name} 다음 카테고리로 이동`}><ChevronRight size={12} /></button>
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
