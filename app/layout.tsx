import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import ProjectProvider from "@/components/projects/ProjectProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "보장분석 시각화",
  description: "고객 보장분석 편집 및 시각화",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <ProjectProvider>
          <AppShell>{children}</AppShell>
        </ProjectProvider>
      </body>
    </html>
  );
}
