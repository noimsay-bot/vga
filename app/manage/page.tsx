"use client";

import { Database, ShieldCheck } from "lucide-react";
import { C } from "@/components/coverage-analysis/tokens";
import { useProjects } from "@/components/projects/ProjectProvider";

export default function ManagePage() {
  const { projects } = useProjects();

  return (
    <div className="mx-auto max-w-5xl p-5 md:p-8">
      <h1 className="text-2xl font-extrabold tracking-tight">관리</h1>
      <p className="mt-1 text-sm" style={{ color: C.muted }}>
        프로젝트 저장 방식과 설계사 계정 설정이 이곳에 연결됩니다.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-5" style={{ background: C.panel, borderColor: C.border }}>
          <Database size={22} style={{ color: C.brand }} />
          <div className="mt-3 font-bold">로컬 프로젝트</div>
          <div className="mt-1 text-2xl font-extrabold">{projects.length}개</div>
          <p className="mt-2 text-xs" style={{ color: C.muted }}>
            현재는 메모리 상태이며 새로고침하면 초기화됩니다. Supabase 저장은 다음 단계입니다.
          </p>
        </div>
        <div className="rounded-xl border p-5" style={{ background: C.panel, borderColor: C.border }}>
          <ShieldCheck size={22} style={{ color: C.brand }} />
          <div className="mt-3 font-bold">설계사별 접근 제어</div>
          <p className="mt-2 text-xs" style={{ color: C.muted }}>
            로그인과 RLS 정책은 Supabase 연동 단계에서 설정됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
