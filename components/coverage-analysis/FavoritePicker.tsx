import { useState } from "react";
import { Plus, Star, Trash2, X } from "lucide-react";
import { fmt } from "./calculations";
import { C } from "./tokens";
import type { FavoriteCoverage } from "./useCoverageFavorites";

interface FavoritePickerProps {
  categoryName: string;
  favorites: FavoriteCoverage[];
  onAdd: (favorites: FavoriteCoverage[]) => { added: number; skipped: number };
  onDelete: (favoriteId: string) => void;
}

export default function FavoritePicker({
  categoryName,
  favorites,
  onAdd,
  onDelete,
}: FavoritePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  const toggleSelection = (favoriteId: string, selected: boolean) =>
    setSelectedIds((current) =>
      selected
        ? [...current, favoriteId]
        : current.filter((candidate) => candidate !== favoriteId),
    );

  const addSelected = () => {
    const selected = favorites.filter((favorite) => selectedIds.includes(favorite.id));
    const result = onAdd(selected);
    setSelectedIds([]);
    setNotice(
      `${result.added}개 추가${result.skipped ? ` · 중복 ${result.skipped}개 건너뜀` : ""}`,
    );
    if (result.added > 0) setOpen(false);
  };

  const deleteOne = (favoriteId: string) => {
    onDelete(favoriteId);
    setSelectedIds((current) => current.filter((candidate) => candidate !== favoriteId));
  };

  return (
    <>
      <button
        onClick={() => {
          setNotice("");
          setOpen(true);
        }}
        className="flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium"
        style={{ color: C.brand, background: "#F2F6F5" }}
      >
        <Star size={13} /> 즐겨찾기에서 추가
      </button>
      {notice && (
        <div className="basis-full text-right text-[11px]" style={{ color: C.muted }}>
          {notice}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ background: "rgba(28,37,48,.45)" }}>
          <div
            className="w-full max-w-md rounded-xl border shadow-xl"
            style={{ background: C.panel, borderColor: C.border }}
            role="dialog"
            aria-modal="true"
            aria-label={`${categoryName} 즐겨찾기 담보 추가`}
          >
            <div className="flex items-center border-b px-4 py-3" style={{ borderColor: C.border }}>
              <div className="flex-1">
                <div className="font-bold">즐겨찾기에서 추가</div>
                <div className="text-xs" style={{ color: C.muted }}>
                  {categoryName}에 선택한 담보를 추가합니다.
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="즐겨찾기 닫기" style={{ color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            <div className="max-h-80 overflow-auto p-3">
              {favorites.length === 0 ? (
                <div className="py-8 text-center text-sm" style={{ color: C.muted }}>
                  담보 행의 별을 눌러 즐겨찾기를 먼저 저장하세요.
                </div>
              ) : (
                <div className="space-y-2">
                  {favorites.map((favorite) => (
                    <div
                      key={favorite.id}
                      className="flex items-center gap-2 rounded-lg border px-3 py-2"
                      style={{ borderColor: C.border }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(favorite.id)}
                        onChange={(event) => toggleSelection(favorite.id, event.target.checked)}
                        aria-label={`${favorite.name} 선택`}
                        style={{ accentColor: C.brand }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{favorite.name}</div>
                        <div className="text-xs" style={{ color: C.muted }}>
                          필요보장 {fmt(favorite.needed)}만원
                        </div>
                      </div>
                      <button
                        onClick={() => deleteOne(favorite.id)}
                        aria-label={`${favorite.name} 즐겨찾기 삭제`}
                        style={{ color: C.low }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t px-4 py-3" style={{ borderColor: C.border }}>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: C.border, color: C.muted }}
              >
                취소
              </button>
              <button
                onClick={addSelected}
                disabled={selectedIds.length === 0}
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: C.brand }}
              >
                <Plus size={14} /> 선택 담보 추가
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
