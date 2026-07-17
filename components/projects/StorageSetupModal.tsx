"use client";

import { FolderOpen, ShieldCheck } from "lucide-react";
import { C } from "@/components/coverage-analysis/tokens";
import { PROJECT_FILE_NAME } from "@/components/projects/projectStorage";

interface StorageSetupModalProps {
  directorySupported: boolean;
  reconnecting: boolean;
  error: string;
  onChooseDirectory: () => void;
}

export default function StorageSetupModal({
  directorySupported,
  reconnecting,
  error,
  onChooseDirectory,
}: StorageSetupModalProps) {
  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(28, 37, 48, 0.54)" }}
    >
      <section
        className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl md:p-8"
        style={{ background: C.panel, borderColor: C.border }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="storage-setup-title"
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: "#EAF1F0", color: C.brand }}
        >
          <FolderOpen size={25} />
        </div>
        <h1 id="storage-setup-title" className="mt-5 text-2xl font-extrabold tracking-tight">
          고객정보 저장 위치 설정
        </h1>
        <p className="mt-2 text-sm leading-6" style={{ color: C.muted }}>
          고객 프로젝트를 보관할 폴더를 한 번 선택해 주세요. 선택한 폴더에
          <strong style={{ color: C.ink }}> {PROJECT_FILE_NAME}</strong> 파일을 만들고 변경할
          때마다 자동 저장합니다.
        </p>

        <div
          className="mt-5 flex gap-3 rounded-xl border p-4 text-xs leading-5"
          style={{ borderColor: C.border, background: C.bg, color: C.muted }}
        >
          <ShieldCheck className="mt-0.5 shrink-0" size={18} style={{ color: C.brand }} />
          폴더 권한은 이 앱에서 고객정보 파일을 읽고 쓰는 데만 사용됩니다. 브라우저 보안상
          폴더는 반드시 직접 선택해야 합니다.
        </div>

        {error && (
          <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "#FBECEB", color: C.low }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onChooseDirectory}
          disabled={!directorySupported}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: C.brand }}
        >
          <FolderOpen size={18} />
          {reconnecting ? "저장 폴더 다시 연결" : "저장 폴더 선택"}
        </button>

        {!directorySupported && (
          <p className="mt-3 rounded-lg px-3 py-3 text-center text-xs leading-5" style={{ background: C.bg, color: C.muted }}>
            이 브라우저는 로컬 폴더 저장을 지원하지 않습니다. 데스크톱 Chrome 또는 Edge에서
            실행해 주세요.
          </p>
        )}
      </section>
    </div>
  );
}
