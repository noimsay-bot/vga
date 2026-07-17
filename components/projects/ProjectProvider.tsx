"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { buildFromSeed, uid } from "@/components/coverage-analysis/seed";
import type {
  CoverageProject,
  LegacyCoverageProject,
  VizMode,
} from "@/components/coverage-analysis/types";

interface ProjectContextValue {
  projects: CoverageProject[];
  createProject: () => string;
  updateProject: (
    projectId: string,
    update: (project: CoverageProject) => CoverageProject,
  ) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

const migrateProject = (project: LegacyCoverageProject): CoverageProject => {
  const legacyMode = project.vizMode;
  const vizModes: VizMode[] = project.vizModes?.length
    ? project.vizModes
    : legacyMode
      ? [legacyMode]
      : ["gap", "radar"];
  const { vizMode: _legacyVizMode, ...rest } = project;
  void _legacyVizMode;
  return { ...rest, vizModes };
};

const buildInitialProjects = (): CoverageProject[] => [
  migrateProject({
    id: "seed-project",
    clientName: "정철원",
    asOf: "2026.07.14",
    categories: buildFromSeed(),
    vizModes: ["gap", "radar"],
    customerMode: true,
    updatedAt: Date.now(),
  }),
];

export default function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<CoverageProject[]>(buildInitialProjects);

  const createProject = () => {
    const projectId = uid();
    setProjects((current) => [
      {
        id: projectId,
        clientName: "",
        asOf: "",
        categories: [],
        vizModes: ["gap", "radar"],
        customerMode: true,
        updatedAt: Date.now(),
      },
      ...current,
    ]);
    return projectId;
  };

  const updateProject = (
    projectId: string,
    update: (project: CoverageProject) => CoverageProject,
  ) =>
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? { ...update(project), updatedAt: Date.now() }
          : project,
      ),
    );

  return (
    <ProjectContext.Provider value={{ projects, createProject, updateProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used inside ProjectProvider");
  }
  return context;
}
