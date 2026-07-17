"use client";

import { useParams } from "next/navigation";
import CoverageAnalysis from "@/components/coverage-analysis/CoverageAnalysis";

export default function ProjectDetailRoute() {
  const params = useParams<{ projectId: string }>();
  return <CoverageAnalysis projectId={params.projectId} />;
}
