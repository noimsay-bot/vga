"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { bandOf } from "@/components/coverage-analysis/calculations";
import { C } from "@/components/coverage-analysis/tokens";
import { useProjects } from "@/components/projects/ProjectProvider";

export default function ProjectListPage() {
  const router = useRouter();
  const { projects, createProject } = useProjects();

  const handleCreateProject = () => {
    const projectId = createProject();
    router.push(`/input/${projectId}`);
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
          onClick={handleCreateProject}
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
            <Link
              key={project.id}
              href={`/input/${project.id}`}
              className="min-h-36 rounded-xl border p-5 transition-shadow hover:shadow-sm"
              style={{ background: C.panel, borderColor: C.border }}
            >
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
          );
        })}
      </div>
    </div>
  );
}
