"use client";

import { Database, FolderOpen, ShieldCheck } from "lucide-react";
import { C } from "@/components/coverage-analysis/tokens";
import { useProjects } from "@/components/projects/ProjectProvider";
import { PROJECT_FILE_NAME } from "@/components/projects/projectStorage";

export default function ManagePage() {
  const {
    projects,
    storageMode,
    storageFolderName,
    storageError,
    directoryStorageSupported,
    changeStorageFolder,
  } = useProjects();

  return (
    <div className="mx-auto max-w-5xl p-5 md:p-8">
      <h1 className="text-2xl font-extrabold tracking-tight">관리</h1>
      <p className="mt-1 text-sm" style={{ color: C.muted }}>
        프로젝트 저장 방식과 설계사 계정 설정이 이곳에 연결됩니다.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-5" style={{ background: C.panel, borderColor: C.border }}>
          <Database size={22} style={{ color: C.brand }} />
          <div className="mt-3 font-bold">고객정보 저장</div>
          <div className="mt-1 text-2xl font-extrabold">{projects.length}개</div>
          <p className="mt-2 text-xs" style={{ color: C.muted }}>
            {storageMode === "directory"
              ? `${storageFolderName} 폴더의 ${PROJECT_FILE_NAME}에 자동 저장됩니다.`
              : "고객정보를 저장할 로컬 폴더를 설정해 주세요."}
          </p>
          {storageError && <p className="mt-2 text-xs" style={{ color: C.low }}>{storageError}</p>}
          {directoryStorageSupported && (
            <button
              type="button"
              onClick={() => void changeStorageFolder()}
              className="mt-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold"
              style={{ borderColor: C.border, color: C.brand }}
            >
              <FolderOpen size={15} />
              {storageMode === "directory" ? "저장 폴더 변경" : "저장 폴더 선택"}
            </button>
          )}
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
