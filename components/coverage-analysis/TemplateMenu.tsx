"use client";

import { useMemo, useState } from "react";
import { CopyPlus, Eye, FileStack, Pencil, Trash2, X } from "lucide-react";
import { categoryTemplateFromCoverage } from "./categoryTemplates";
import useCategoryTemplates from "./useCategoryTemplates";
import { C } from "./tokens";
import type { CategoryTemplate } from "./categoryTemplateRepository";
import type { CoverageCategory } from "./types";

export type TemplateApplyMode = "replace" | "merge";

interface TemplateMenuProps {
  categories: CoverageCategory[];
  onApply: (template: CategoryTemplate, mode: TemplateApplyMode) => string[];
}

const templateCounts = (template: CategoryTemplate) => ({
  categories: template.categories.length,
  items: template.categories.reduce((sum, category) => sum + category.items.length, 0),
});

export default function TemplateMenu({ categories, onApply }: TemplateMenuProps) {
  const { templates, save, rename, remove } = useCategoryTemplates();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const selected = useMemo(
    () => templates.find((template) => template.id === selectedId) ?? templates[0],
    [selectedId, templates],
  );

  const saveCurrent = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage("템플릿 이름을 입력해 주세요.");
      return;
    }
    if (!categories.length) {
      setMessage("저장할 카테고리가 없습니다.");
      return;
    }
    const duplicate = templates.find((template) => template.name === trimmed);
    if (duplicate && !window.confirm(`'${trimmed}' 템플릿을 현재 구성으로 덮어쓸까요?`)) return;
    const template = categoryTemplateFromCoverage(trimmed, categories, duplicate);
    save(template);
    setSelectedId(template.id);
    setName("");
    setMessage("현재 구성을 저장했습니다. 고객명과 가입금액은 저장되지 않습니다.");
  };

  const apply = (mode: TemplateApplyMode) => {
    if (!selected) return;
    if (
      mode === "replace" &&
      !window.confirm("현재 카테고리와 입력 금액이 모두 사라집니다. 템플릿으로 교체할까요?")
    ) {
      return;
    }
    const warnings = onApply(selected, mode);
    setMessage(
      warnings.length
        ? `적용했습니다. 중복 담보 ${warnings.length}건은 건너뛰었습니다: ${warnings.slice(0, 3).join(" / ")}`
        : "템플릿을 적용했습니다. 표시된 담보의 보유 금액만 채워 주세요.",
    );
  };

  const handleRename = (template: CategoryTemplate) => {
    const next = window.prompt("새 템플릿 이름", template.name)?.trim();
    if (!next || next === template.name) return;
    if (!rename(template.id, next)) setMessage("같은 이름의 템플릿이 이미 있습니다.");
  };

  const handleDelete = (template: CategoryTemplate) => {
    if (!window.confirm(`'${template.name}' 템플릿을 삭제할까요?`)) return;
    remove(template.id);
    setSelectedId(null);
    setMessage("템플릿을 삭제했습니다.");
  };

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold"
        style={{ borderColor: C.border, background: C.panel, color: C.brand }}
      >
        <FileStack size={16} /> 템플릿
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-5"
          style={{ background: "rgba(28,37,48,.45)" }}
          role="dialog"
          aria-modal="true"
          aria-label="카테고리 구성 템플릿"
        >
          <div
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border p-4 shadow-xl sm:max-w-3xl sm:rounded-2xl sm:p-6"
            style={{ background: C.panel, borderColor: C.border }}
          >
            <div className="mb-5 flex items-center gap-3">
              <div>
                <h2 className="text-lg font-extrabold">카테고리 구성 템플릿</h2>
                <p className="mt-0.5 text-xs" style={{ color: C.muted }}>
                  카테고리·담보명·필요보장액만 local-advisor 저장소에 보관합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto rounded-full p-2"
                style={{ background: C.track, color: C.muted }}
                aria-label="닫기"
              >
                <X size={17} />
              </button>
            </div>

            <section className="rounded-xl border p-3" style={{ borderColor: C.border }}>
              <div className="mb-2 text-sm font-bold">현재 구성을 템플릿으로 저장</div>
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="예: 기본 가족 보장"
                  className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: C.border }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveCurrent();
                  }}
                />
                <button
                  type="button"
                  onClick={saveCurrent}
                  className="rounded-lg px-4 py-2 text-sm font-bold text-white"
                  style={{ background: C.brand }}
                >
                  저장
                </button>
              </div>
            </section>

            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <section className="min-w-0">
                <h3 className="mb-2 text-sm font-bold">저장된 템플릿</h3>
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {!templates.length && (
                    <div className="rounded-xl border border-dashed p-5 text-center text-sm" style={{ borderColor: C.border, color: C.muted }}>
                      저장된 템플릿이 없습니다.
                    </div>
                  )}
                  {templates.map((template) => {
                    const counts = templateCounts(template);
                    const active = selected?.id === template.id;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedId(template.id)}
                        className="w-full rounded-xl border p-3 text-left"
                        style={{
                          borderColor: active ? C.brand : C.border,
                          background: active ? "#F2F7F6" : C.panel,
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-bold">{template.name}</div>
                            <div className="mt-1 text-[11px]" style={{ color: C.muted }}>
                              카테고리 {counts.categories} · 담보 {counts.items} · {new Date(template.updatedAt).toLocaleDateString("ko-KR")}
                            </div>
                          </div>
                          <span className="flex gap-1">
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRename(template);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") handleRename(template);
                              }}
                              className="rounded p-1"
                              aria-label={`${template.name} 이름 변경`}
                            >
                              <Pencil size={13} />
                            </span>
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDelete(template);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") handleDelete(template);
                              }}
                              className="rounded p-1"
                              style={{ color: C.low }}
                              aria-label={`${template.name} 삭제`}
                            >
                              <Trash2 size={13} />
                            </span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="min-w-0 rounded-xl border p-3" style={{ borderColor: C.border }}>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Eye size={15} /> 미리보기
                </div>
                {selected ? (
                  <>
                    <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                      {[...selected.categories]
                        .sort((left, right) => left.order - right.order)
                        .map((category) => (
                          <div key={`${selected.id}-${category.order}`}>
                            <div className="text-sm font-bold">{category.name}</div>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {[...category.items]
                                .sort((left, right) => left.order - right.order)
                                .map((item) => (
                                  <span
                                    key={`${item.order}-${item.name}`}
                                    className="rounded-full px-2 py-1 text-[11px]"
                                    style={{ background: C.track, color: C.muted }}
                                  >
                                    {item.name} · {item.needed.toLocaleString()}만원
                                  </span>
                                ))}
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => apply("merge")}
                        className="flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-sm font-bold"
                        style={{ borderColor: C.brand, color: C.brand }}
                      >
                        <CopyPlus size={14} /> 병합
                      </button>
                      <button
                        type="button"
                        onClick={() => apply("replace")}
                        className="rounded-lg px-3 py-2 text-sm font-bold text-white"
                        style={{ background: C.brand }}
                      >
                        교체
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-sm" style={{ color: C.muted }}>
                    미리볼 템플릿을 선택하세요.
                  </div>
                )}
              </section>
            </div>

            {message && (
              <div className="mt-4 rounded-lg px-3 py-2 text-xs" style={{ background: "#F2F6F5", color: C.brand }}>
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
