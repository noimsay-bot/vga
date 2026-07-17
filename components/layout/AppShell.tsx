"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusSquare, Settings } from "lucide-react";
import { C } from "@/components/coverage-analysis/tokens";
import type { ReactNode } from "react";

const MENU = [
  { href: "/", label: "홈", icon: Home },
  { href: "/input", label: "입력", icon: PlusSquare },
  { href: "/manage", label: "관리", icon: Settings },
] as const;

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div style={{ background: C.bg, color: C.ink, minHeight: "100vh" }}>
      <aside
        className="no-print fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r md:flex"
        style={{ background: C.panel, borderColor: C.border }}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ background: C.brand }}
          >
            보
          </div>
          <div>
            <div className="font-bold tracking-tight">보장분석</div>
            <div className="text-[11px]" style={{ color: C.muted }}>
              시각화 도구
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {MENU.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium"
                style={
                  active
                    ? { background: "#EAF1F0", color: C.brand }
                    : { color: C.muted }
                }
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="min-h-screen pb-20 md:pl-56 md:pb-0">{children}</main>

      <nav
        className="no-print fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-3 border-t md:hidden"
        style={{ background: C.panel, borderColor: C.border }}
      >
        {MENU.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 text-[11px] font-semibold"
              style={{ color: active ? C.brand : C.muted }}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
