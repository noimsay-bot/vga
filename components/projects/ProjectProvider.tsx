"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { buildFromSeed, uid } from "@/components/coverage-analysis/seed";
import { normalizeCoverageOrder } from "@/components/coverage-analysis/coverageOrder";
import StorageSetupModal from "@/components/projects/StorageSetupModal";
import {
  chooseDirectory,
  getSavedDirectoryHandle,
  getSavedStorageMode,
  queryDirectoryPermission,
  readProjectsFromDirectory,
  requestDirectoryPermission,
  supportsDirectoryStorage,
  writeProjectsToDirectory,
  type ProjectStorageMode,
} from "@/components/projects/projectStorage";
import type {
  CoverageProject,
  CoverageCategory,
  LegacyCoverageProject,
  VizMode,
} from "@/components/coverage-analysis/types";

interface ProjectContextValue {
  projects: CoverageProject[];
  storageMode: ProjectStorageMode | null;
  storageFolderName: string;
  storageError: string;
  directoryStorageSupported: boolean;
  createProject: (categories?: CoverageCategory[]) => string;
  deleteProject: (projectId: string) => void;
  updateProject: (
    projectId: string,
    update: (project: CoverageProject) => CoverageProject,
  ) => void;
  changeStorageFolder: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);
const subscribeDirectorySupport = () => () => undefined;
const VALID_VIZ_MODES = new Set<VizMode>([
  "gap",
  "radar",
  "heatmap",
  "waterline",
  "triage",
  "rings",
  "dumbbell",
  "waffle",
  "treemap",
  "speedometer",
  "brickwall",
  "moneyunits",
  "reportcard",
]);

export const migrateProject = (project: LegacyCoverageProject): CoverageProject => {
  const legacyMode = project.vizMode;
  const vizModes: VizMode[] = Array.isArray(project.vizModes)
    ? project.vizModes.filter((mode) => VALID_VIZ_MODES.has(mode))
    : legacyMode
      ? VALID_VIZ_MODES.has(legacyMode)
        ? [legacyMode]
        : ["radar", "waterline"]
      : ["radar", "waterline"];
  const { vizMode: _legacyVizMode, ...rest } = project;
  void _legacyVizMode;
  return {
    ...rest,
    categories: normalizeCoverageOrder(project.categories),
    vizModes,
    showItemDetail: project.showItemDetail ?? true,
  };
};

const buildInitialProjects = (): CoverageProject[] => [
  migrateProject({
    id: "seed-project",
    clientName: "정철원",
    asOf: "2026.07.14",
    categories: buildFromSeed(),
    vizModes: ["radar", "waterline"],
    showItemDetail: true,
    customerMode: true,
    updatedAt: Date.now(),
  }),
];

export default function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<CoverageProject[]>(buildInitialProjects);
  const [storageMode, setStorageMode] = useState<ProjectStorageMode | null>(null);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [storageChecked, setStorageChecked] = useState(false);
  const [storageFolderName, setStorageFolderName] = useState("");
  const [storageError, setStorageError] = useState("");
  const [reconnecting, setReconnecting] = useState(false);
  const directoryStorageSupported = useSyncExternalStore(
    subscribeDirectorySupport,
    supportsDirectoryStorage,
    () => false,
  );
  const skipNextSave = useRef(true);

  const loadProjects = (stored: LegacyCoverageProject[] | null) => {
    if (stored?.length) setProjects(stored.map(migrateProject));
    skipNextSave.current = false;
    setStorageChecked(true);
    setStorageReady(true);
  };

  useEffect(() => {
    let active = true;

    const initializeStorage = async () => {
      try {
        const savedMode = getSavedStorageMode();
        if (savedMode === "directory") {
          const handle = await getSavedDirectoryHandle();
          if (!active) return;
          if (!handle) {
            setStorageChecked(true);
            return;
          }
          setDirectoryHandle(handle);
          setStorageFolderName(handle.name);
          setStorageMode("directory");
          const permission = await queryDirectoryPermission(handle);
          if (permission === "granted") {
            loadProjects(await readProjectsFromDirectory(handle));
          } else {
            setReconnecting(true);
            setStorageChecked(true);
          }
          return;
        }
        if (active) setStorageChecked(true);
      } catch {
        if (active) {
          setStorageChecked(true);
          setStorageError("기존 저장 위치를 불러오지 못했습니다. 폴더를 다시 선택해 주세요.");
        }
      }
    };

    void initializeStorage();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        if (storageMode === "directory" && directoryHandle) {
          await writeProjectsToDirectory(directoryHandle, projects);
        }
        setStorageError("");
      } catch {
        setStorageError("고객정보 자동 저장에 실패했습니다. 관리 화면에서 저장 위치를 확인해 주세요.");
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [directoryHandle, projects, storageMode, storageReady]);

  const connectDirectory = async () => {
    try {
      setStorageError("");
      let handle = directoryHandle;
      if (reconnecting && handle) {
        const permission = await requestDirectoryPermission(handle);
        if (permission !== "granted") return;
      } else {
        handle = await chooseDirectory();
      }
      setDirectoryHandle(handle);
      setStorageFolderName(handle.name);
      setStorageMode("directory");
      setReconnecting(false);
      const stored = await readProjectsFromDirectory(handle);
      loadProjects(stored);
      if (!stored) await writeProjectsToDirectory(handle, projects);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStorageError("저장 폴더를 연결하지 못했습니다. 다시 시도해 주세요.");
    }
  };

  const changeStorageFolder = async () => {
    setReconnecting(false);
    setStorageError("");
    try {
      const handle = await chooseDirectory();
      setDirectoryHandle(handle);
      setStorageFolderName(handle.name);
      setStorageMode("directory");
      setStorageReady(true);
      await writeProjectsToDirectory(handle, projects);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStorageError("새 저장 폴더를 연결하지 못했습니다.");
    }
  };

  const createProject = (categories: CoverageCategory[] = []) => {
    const projectId = uid();
    setProjects((current) => [
      {
        id: projectId,
        clientName: "",
        asOf: "",
        categories: normalizeCoverageOrder(categories),
        vizModes: ["radar", "waterline"],
        showItemDetail: true,
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

  const deleteProject = (projectId: string) =>
    setProjects((current) => current.filter((project) => project.id !== projectId));

  return (
    <ProjectContext.Provider
      value={{
        projects,
        storageMode,
        storageFolderName,
        storageError,
        directoryStorageSupported,
        createProject,
        deleteProject,
        updateProject,
        changeStorageFolder,
      }}
    >
      {children}
      {storageChecked && !storageReady && (
        <StorageSetupModal
          directorySupported={directoryStorageSupported}
          reconnecting={reconnecting}
          error={storageError}
          onChooseDirectory={() => void connectDirectory()}
        />
      )}
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
