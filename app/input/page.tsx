"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileStack, Plus, Trash2, X } from "lucide-react";
import { bandOf } from "@/components/coverage-analysis/calculations";
import { instantiateCategoryTemplate } from "@/components/coverage-analysis/categoryTemplates";
import { C } from "@/components/coverage-analysis/tokens";
import useCategoryTemplates from "@/components/coverage-analysis/useCategoryTemplates";
import { useProjects } from "@/components/projects/ProjectProvider";
import { useState } from "react";

export default function ProjectListPage() {
  const router = useRouter();
  const { projects, createProject, deleteProject } = useProjects();
  const { templates } = useCategoryTemplates();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleCreateProject = (templateId?: string) => {
    const template = templates.find((candidate) => candidate.id === templateId);
    const projectId = createProject(template ? instantiateCategoryTemplate(template).categories : undefined);
    router.push(`/input/${projectId}`);
  };

  const handleDeleteProject = (projectId: string, clientName: string) => {
    const displayName = clientName.trim() || "이름 없는 고객";
    if (
      window.confirm(
        `'${displayName}' 고객 프로젝트를 삭제할까요?\n삭제한 프로젝트는 복구할 수 없습니다.`,
      )
    ) {
      deleteProject(projectId);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-5 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">고객 프로젝트</h1>
        <p className="mt-1 text-sm" style={{ color: C.muted }}>
          고객을 선택해 보장분석을 편집하거나 새 프로젝트를 시작하세요.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <button
          onClick={() => setCreateOpen(true)}
          className="flex min-h-36 flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center"
          style={{ background: C.panel, borderColor: C.border, color: C.brand }}
        >
          <span
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "#EAF1F0" }}
          >
            <Plus size={20} />
          </span>
          <span className="font-bold">새 고객</span>
        </button>

        {projects.map((project) => {
          const itemCount = project.categories.reduce(
            (sum, category) => sum + category.items.length,
            0,
          );
          const shortCount = project.categories.reduce(
            (sum, category) =>
              sum + category.items.filter((item) => bandOf(item) !== "full").length,
            0,
          );
          return (
            <div
              key={project.id}
              className="relative min-h-36 rounded-xl border transition-shadow hover:shadow-sm"
              style={{ background: C.panel, borderColor: C.border }}
            >
              <Link href={`/input/${project.id}`} className="block min-h-36 p-5 pr-14">
                <div className="text-lg font-bold">{project.clientName || "이름 없는 고객"}</div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full px-2.5 py-1" style={{ background: C.track, color: C.muted }}>
                    담보 {itemCount}개
                  </span>
                  <span
                    className="rounded-full px-2.5 py-1"
                    style={{ background: `${shortCount ? C.low : C.full}18`, color: shortCount ? C.low : C.full }}
                  >
                    보완 필요 {shortCount}건
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => handleDeleteProject(project.id, project.clientName)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
                style={{ borderColor: C.border, background: C.panel, color: C.low }}
                aria-label={`${project.clientName || "이름 없는 고객"} 프로젝트 삭제`}
                title="고객 프로젝트 삭제"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>

      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-5"
          style={{ background: "rgba(28,37,48,.45)" }}
          role="dialog"
          aria-modal="true"
          aria-label="새 고객 프로젝트 시작"
        >
          <div
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border p-4 shadow-xl sm:max-w-xl sm:rounded-2xl sm:p-6"
            style={{ background: C.panel, borderColor: C.border }}
          >
            <div className="flex items-start gap-3">
              <div>
                <h2 className="text-lg font-extrabold">새 고객 프로젝트</h2>
                <p className="mt-1 text-xs" style={{ color: C.muted }}>
                  빈 구성으로 시작하거나 저장한 템플릿에서 시작하세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="ml-auto rounded-full p-2"
                style={{ background: C.track, color: C.muted }}
                aria-label="닫기"
              >
                <X size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleCreateProject()}
              className="mt-5 flex w-full items-center gap-3 rounded-xl border p-4 text-left"
              style={{ borderColor: selectedTemplateId === null ? C.brand : C.border }}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: C.track, color: C.brand }}>
                <Plus size={17} />
              </span>
              <span>
                <span className="block text-sm font-bold">빈 구성으로 바로 시작</span>
                <span className="mt-0.5 block text-xs" style={{ color: C.muted }}>카테고리와 담보를 직접 추가합니다.</span>
              </span>
            </button>

            <div className="my-4 flex items-center gap-3 text-xs" style={{ color: C.muted }}>
              <span className="h-px flex-1" style={{ background: C.border }} /> 템플릿에서 시작 <span className="h-px flex-1" style={{ background: C.border }} />
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto">
              {!templates.length && (
                <div className="rounded-xl border border-dashed p-5 text-center text-sm" style={{ borderColor: C.border, color: C.muted }}>
                  편집 화면의 [템플릿] 메뉴에서 먼저 구성을 저장할 수 있습니다.
                </div>
              )}
              {templates.map((template) => {
                const itemCount = template.categories.reduce((sum, category) => sum + category.items.length, 0);
                const active = selectedTemplateId === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(template.id)}
                    className="flex w-full items-center gap-3 rounded-xl border p-3 text-left"
                    style={{ borderColor: active ? C.brand : C.border, background: active ? "#F2F7F6" : C.panel }}
                  >
                    <FileStack size={17} style={{ color: C.brand }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{template.name}</span>
                      <span className="mt-0.5 block text-xs" style={{ color: C.muted }}>
                        카테고리 {template.categories.length} · 담보 {itemCount}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={!selectedTemplateId}
              onClick={() => selectedTemplateId && handleCreateProject(selectedTemplateId)}
              className="mt-4 w-full rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-35"
              style={{ background: C.brand }}
            >
              선택한 템플릿으로 시작
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
