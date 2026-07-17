"use client";

import Link from "next/link";
import { ArrowLeft, Pencil, Printer } from "lucide-react";
import { bandOf } from "./calculations";
import Preview from "./Preview";
import { C } from "./tokens";
import { useProjects } from "@/components/projects/ProjectProvider";

export default function VisualizationOnlyView({ projectId }: { projectId: string }) {
  const { projects, updateProject } = useProjects();
  const project = projects.find((candidate) => candidate.id === projectId);

  if (!project) {
    return (
      <div className="p-8 text-center">
        <div className="font-bold">프로젝트를 찾을 수 없습니다.</div>
        <Link href="/" className="mt-3 inline-block text-sm" style={{ color: C.brand }}>
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const totalShort = project.categories.reduce(
    (sum, category) =>
      sum + category.items.filter((item) => bandOf(item) !== "full").length,
    0,
  );

  const patchProject = (patch: Partial<typeof project>) =>
    updateProject(project.id, (current) => ({ ...current, ...patch }));

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          .no-print { display: none !important; }
          main { padding-left: 0 !important; padding-bottom: 0 !important; }
          body { background: #fff !important; }
          .visualization-view-content { max-width: none !important; padding: 0 !important; }
        }
      `}</style>

      <header
        className="no-print sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b px-4 py-3"
        style={{ background: C.panel, borderColor: C.border }}
      >
        <Link href="/" className="flex items-center gap-1 text-sm font-semibold" style={{ color: C.brand }}>
          <ArrowLeft size={16} /> 홈
        </Link>
        <div className="mx-1 h-4 w-px" style={{ background: C.border }} />
        <span className="font-bold">{project.clientName || "고객"} 시각화 자료</span>
        <div className="flex-1" />
        <Link
          href={`/input/${project.id}`}
          className="flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs"
          style={{ borderColor: C.border, color: C.muted }}
        >
          <Pencil size={13} /> 편집
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-white"
          style={{ background: C.brand }}
        >
          <Printer size={13} /> 선택 자료 인쇄
        </button>
      </header>

      <div className="visualization-view-content mx-auto max-w-5xl p-5 md:p-8">
        <Preview
          clientName={project.clientName}
          asOf={project.asOf}
          categories={project.categories}
          totalShort={totalShort}
          vizModes={project.vizModes}
          customerMode={project.customerMode}
          onVizModesChange={(vizModes) => patchProject({ vizModes })}
          onCustomerModeChange={(customerMode) => patchProject({ customerMode })}
        />
      </div>
    </div>
  );
}
