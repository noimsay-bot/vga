"use client";

import { useParams } from "next/navigation";
import VisualizationOnlyView from "@/components/coverage-analysis/VisualizationOnlyView";

export default function VisualizationViewRoute() {
  const params = useParams<{ projectId: string }>();
  return <VisualizationOnlyView projectId={params.projectId} />;
}
