"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, RotateCcw } from "lucide-react";
import { bandOf } from "./calculations";
import { normalizeCoverageOrder } from "./coverageOrder";
import { instantiateCategoryTemplate, mergeCategoryTemplate } from "./categoryTemplates";
import EditorPanel from "./EditorPanel";
import Preview from "./Preview";
import { mergeImportedCoverages, type ImportedCoverageGroup } from "./excelImport";
import { buildFromSeed, uid } from "./seed";
import { C } from "./tokens";
import { useProjects } from "@/components/projects/ProjectProvider";
import type { FavoriteCoverage } from "./useCoverageFavorites";
import type { CategoryTemplate } from "./categoryTemplateRepository";
import type { TemplateApplyMode } from "./TemplateMenu";
import type {
  CoverageCategory,
  CoverageItem,
  CoverageProject,
  InsurerCoverage,
} from "./types";

type MobileView = "edit" | "preview";

export default function CoverageAnalysis({ projectId }: { projectId: string }) {
  const { projects, updateProject } = useProjects();
  const project = projects.find((candidate) => candidate.id === projectId);
  const [mobileView, setMobileView] = useState<MobileView>("edit");

  if (!project) {
    return (
      <div className="p-8 text-center">
        <div className="font-bold">프로젝트를 찾을 수 없습니다.</div>
        <Link href="/input" className="mt-3 inline-block text-sm" style={{ color: C.brand }}>
          고객 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <ProjectEditor
      project={project}
      updateProject={(update) => updateProject(project.id, update)}
      mobileView={mobileView}
      onMobileViewChange={setMobileView}
    />
  );
}

interface ProjectEditorProps {
  project: CoverageProject;
  updateProject: (update: (project: CoverageProject) => CoverageProject) => void;
  mobileView: MobileView;
  onMobileViewChange: (view: MobileView) => void;
}

function ProjectEditor({
  project,
  updateProject,
  mobileView,
  onMobileViewChange,
}: ProjectEditorProps) {
  const [highlightedItemIds, setHighlightedItemIds] = useState<Set<string>>(() => new Set());
  const orderedCategories = useMemo(
    () => normalizeCoverageOrder(project.categories),
    [project.categories],
  );
  const setCategories = (
    update: (categories: CoverageCategory[]) => CoverageCategory[],
  ) =>
    updateProject((current) => ({
      ...current,
      categories: normalizeCoverageOrder(update(normalizeCoverageOrder(current.categories))),
    }));

  const patchProject = (patch: Partial<CoverageProject>) =>
    updateProject((current) => ({ ...current, ...patch }));

  const patchCategory = (categoryId: string, patch: Partial<CoverageCategory>) =>
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId ? { ...category, ...patch } : category,
      ),
    );

  const patchItem = (categoryId: string, itemId: string, patch: Partial<CoverageItem>) => {
    setCategories((current) =>
      current.map((category) =>
        category.id !== categoryId
          ? category
          : {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId ? { ...item, ...patch } : item,
              ),
            },
      ),
    );
    if (Object.hasOwn(patch, "heldManual")) {
      setHighlightedItemIds((current) => {
        const next = new Set(current);
        next.delete(itemId);
        return next;
      });
    }
  };

  const addCategory = () =>
    setCategories((current) => [...current, { id: uid(), name: "새 보장", items: [] }]);

  const deleteCategory = (categoryId: string) =>
    setCategories((current) => current.filter((category) => category.id !== categoryId));

  const addItem = (categoryId: string) =>
    setCategories((current) =>
      current.map((category) =>
        category.id !== categoryId
          ? category
          : {
              ...category,
              items: [
                ...category.items,
                {
                  id: uid(),
                  name: "새 항목",
                  needed: 0,
                  heldManual: 0,
                  insurers: [],
                },
              ],
            },
      ),
    );

  const deleteItem = (categoryId: string, itemId: string) =>
    setCategories((current) =>
      current.map((category) =>
        category.id !== categoryId
          ? category
          : { ...category, items: category.items.filter((item) => item.id !== itemId) },
      ),
    );

  const patchInsurers = (
    categoryId: string,
    itemId: string,
    update: (insurers: InsurerCoverage[]) => InsurerCoverage[],
  ) =>
    setCategories((current) =>
      current.map((category) =>
        category.id !== categoryId
          ? category
          : {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId ? { ...item, insurers: update(item.insurers) } : item,
              ),
            },
      ),
    );

  const totalShort = useMemo(
    () =>
      orderedCategories.reduce(
        (sum, category) =>
          sum + category.items.filter((item) => bandOf(item) !== "full").length,
        0,
      ),
    [orderedCategories],
  );

  const loadSample = () => {
    if (window.confirm("현재 프로젝트를 샘플 데이터로 되돌릴까요?")) {
      patchProject({
        clientName: "정철원",
        asOf: "2026.07.14",
        categories: normalizeCoverageOrder(buildFromSeed()),
      });
    }
  };

  const importGroups = (groups: ImportedCoverageGroup[]) => {
    const result = mergeImportedCoverages(orderedCategories, groups);
    patchProject({ categories: normalizeCoverageOrder(result.categories) });
    return {
      addedItems: result.addedItems,
      createdCategories: result.createdCategories,
      warnings: result.warnings,
    };
  };

  const addFavoriteItems = (categoryId: string, favorites: FavoriteCoverage[]) => {
    const category = orderedCategories.find((candidate) => candidate.id === categoryId);
    if (!category) return { added: 0, skipped: favorites.length };
    const existingNames = new Set(category.items.map((item) => item.name));
    const additions = favorites.filter((favorite) => !existingNames.has(favorite.name));
    patchCategory(categoryId, {
      items: [
        ...category.items,
        ...additions.map((favorite) => ({
          id: uid(),
          name: favorite.name,
          needed: favorite.needed,
          heldManual: 0,
          insurers: [],
        })),
      ],
    });
    return { added: additions.length, skipped: favorites.length - additions.length };
  };

  const applyTemplate = (template: CategoryTemplate, mode: TemplateApplyMode) => {
    if (mode === "replace") {
      const result = instantiateCategoryTemplate(template);
      patchProject({ categories: result.categories });
      setHighlightedItemIds(new Set(result.itemIds));
      return [];
    }
    const result = mergeCategoryTemplate(orderedCategories, template);
    patchProject({ categories: result.categories });
    setHighlightedItemIds(new Set(result.itemIds));
    return result.warnings;
  };

  const clearAmountHighlight = (itemId: string) =>
    setHighlightedItemIds((current) => {
      const next = new Set(current);
      next.delete(itemId);
      return next;
    });

  return (
    <div style={{ background: C.bg, color: C.ink, minHeight: "100vh" }} className="w-full">
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          .no-print { display: none !important; }
          .print-full { display: block !important; width: 100% !important; padding: 0 !important; }
          main { padding-left: 0 !important; padding-bottom: 0 !important; }
          body { background: #fff !important; }
        }
        input:focus { outline: none; }
      `}</style>

      <div
        className="no-print sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b px-4 py-3"
        style={{ background: C.panel, borderColor: C.border }}
      >
        <Link href="/input" className="flex items-center gap-1 text-sm font-semibold" style={{ color: C.brand }}>
          <ArrowLeft size={16} /> 목록
        </Link>
        <div className="mx-1 h-4 w-px" style={{ background: C.border }} />
        <span className="font-bold tracking-tight">{project.clientName || "새 고객"} 보장분석</span>
        <div className="flex-1" />
        <button
          onClick={loadSample}
          className="flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs"
          style={{ borderColor: C.border, color: C.muted }}
        >
          <RotateCcw size={13} /> 샘플
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-white"
          style={{ background: C.brand }}
        >
          <Printer size={13} /> 인쇄
        </button>
      </div>

      <div
        className="no-print flex gap-2 border-b p-2 lg:hidden"
        style={{ background: C.panel, borderColor: C.border }}
      >
        {(["edit", "preview"] as MobileView[]).map((view) => (
          <button
            key={view}
            onClick={() => onMobileViewChange(view)}
            className="flex-1 rounded-md py-1.5 text-sm font-medium"
            style={
              mobileView === view
                ? { background: C.brand, color: "#fff" }
                : { background: C.track, color: C.muted }
            }
          >
            {view === "edit" ? "편집" : "미리보기"}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row">
        <div
          className={`no-print p-4 lg:block lg:w-[42%] ${mobileView === "edit" ? "block" : "hidden"}`}
          style={{ borderRight: `1px solid ${C.border}` }}
        >
          <EditorPanel
            clientName={project.clientName}
            asOf={project.asOf}
            categories={orderedCategories}
            highlightedItemIds={highlightedItemIds}
            onClientNameChange={(clientName) => patchProject({ clientName })}
            onAsOfChange={(asOf) => patchProject({ asOf })}
            onCategoryNameChange={(categoryId, value) => patchCategory(categoryId, { name: value })}
            onDeleteCategory={deleteCategory}
            onAddCategory={addCategory}
            onAddItem={addItem}
            onItemChange={patchItem}
            onDeleteItem={deleteItem}
            onAddInsurer={(categoryId, itemId) => {
              patchInsurers(categoryId, itemId, (insurers) => [
                ...insurers,
                { id: uid(), name: "", amount: 0 },
              ]);
            }}
            onEditInsurer={(categoryId, itemId, insurerId, patch) => {
              if (Object.hasOwn(patch, "amount")) clearAmountHighlight(itemId);
              patchInsurers(categoryId, itemId, (insurers) =>
                insurers.map((insurer) =>
                  insurer.id === insurerId ? { ...insurer, ...patch } : insurer,
                ),
              );
            }}
            onDeleteInsurer={(categoryId, itemId, insurerId) =>
              patchInsurers(categoryId, itemId, (insurers) =>
                insurers.filter((insurer) => insurer.id !== insurerId),
              )
            }
            onImportGroups={importGroups}
            onAddFavoriteItems={addFavoriteItems}
            onCategoriesChange={(categories) => setCategories(() => categories)}
            onApplyTemplate={applyTemplate}
          />
        </div>

        <div
          className={`print-full p-5 lg:block lg:w-[58%] ${mobileView === "preview" ? "block" : "hidden"}`}
        >
          <Preview
            clientName={project.clientName}
            asOf={project.asOf}
            categories={orderedCategories}
            totalShort={totalShort}
            vizModes={project.vizModes}
            showItemDetail={project.showItemDetail}
            customerMode={project.customerMode}
            onVizModesChange={(vizModes) => patchProject({ vizModes })}
            onShowItemDetailChange={(showItemDetail) => patchProject({ showItemDetail })}
            onCustomerModeChange={(customerMode) => patchProject({ customerMode })}
          />
        </div>
      </div>
    </div>
  );
}
