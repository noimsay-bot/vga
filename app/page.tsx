"use client";

import Link from "next/link";
import { ArrowRight, FolderOpen, PlusSquare } from "lucide-react";
import { bandOf } from "@/components/coverage-analysis/calculations";
import { C } from "@/components/coverage-analysis/tokens";
import { useProjects } from "@/components/projects/ProjectProvider";

export default function HomePage() {
  const { projects } = useProjects();
  const customerProjects = [...projects].sort(
    (left, right) => right.updatedAt - left.updatedAt,
  );

  return (
    <div className="mx-auto max-w-6xl p-5 md:p-8">
      <header className="mb-8">
        <p className="mb-1 text-sm font-semibold" style={{ color: C.brand }}>
          보장분석 시각화
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">고객의 보장 공백을 한눈에 확인하세요.</h1>
        <p className="mt-2 text-sm" style={{ color: C.muted }}>
          입력 메뉴에서 고객 프로젝트를 만들고, 목적에 맞는 시각화로 상담 자료를 준비할 수 있습니다.
        </p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/input"
          className="rounded-xl border p-5 transition-shadow hover:shadow-sm"
          style={{ background: C.panel, borderColor: C.border }}
        >
          <PlusSquare size={24} style={{ color: C.brand }} />
          <div className="mt-4 font-bold">고객 보장 입력</div>
          <div className="mt-1 text-sm" style={{ color: C.muted }}>
            고객 목록에서 새 분석을 시작하거나 기존 프로젝트를 이어서 편집합니다.
          </div>
        </Link>
        <div className="rounded-xl border p-5" style={{ background: C.panel, borderColor: C.border }}>
          <FolderOpen size={24} style={{ color: C.brand }} />
          <div className="mt-4 font-bold">보관 중인 프로젝트</div>
          <div className="mt-1 text-3xl font-extrabold">{projects.length}</div>
          <div className="text-xs" style={{ color: C.muted }}>
            현재 브라우저 세션의 로컬 상태
          </div>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">고객 시각화 자료</h2>
            <p className="text-xs" style={{ color: C.muted }}>
              고객 이름을 선택하면 편집 화면 없이 출력 자료가 열립니다.
            </p>
          </div>
          <Link href="/input" className="flex items-center gap-1 text-xs font-semibold" style={{ color: C.brand }}>
            입력 관리 <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {customerProjects.map((project) => {
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
                href={`/view/${project.id}`}
                className="rounded-xl border p-4"
                style={{ background: C.panel, borderColor: C.border }}
              >
                <div className="font-bold">{project.clientName || "이름 없는 고객"}</div>
                <div className="mt-2 flex gap-2 text-xs" style={{ color: C.muted }}>
                  <span>{itemCount}개 담보</span>
                  <span>·</span>
                  <span style={{ color: shortCount ? C.low : C.full }}>보완 {shortCount}건</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
