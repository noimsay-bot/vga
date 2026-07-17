import type { CoverageProject, LegacyCoverageProject } from "@/components/coverage-analysis/types";

export const PROJECT_FILE_NAME = "보장분석-고객정보.json";
const DATABASE_NAME = "coverage-analysis-storage";
const STORE_NAME = "settings";
const DIRECTORY_HANDLE_KEY = "project-directory";
const STORAGE_MODE_KEY = "coverage-analysis-storage-mode";

export type ProjectStorageMode = "directory";

interface StoredProjectFile {
  version: 1;
  savedAt: string;
  projects: LegacyCoverageProject[];
}

type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: (options?: { mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>;
};

type PermissionAwareDirectoryHandle = FileSystemDirectoryHandle & {
  queryPermission: (options: { mode: "readwrite" }) => Promise<PermissionState>;
  requestPermission: (options: { mode: "readwrite" }) => Promise<PermissionState>;
};

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const readSetting = async <T,>(key: string): Promise<T | undefined> => {
  const database = await openDatabase();
  return new Promise<T | undefined>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
};

const writeSetting = async (key: string, value: unknown) => {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(value, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
};

const parseProjects = (raw: string): LegacyCoverageProject[] | null => {
  try {
    const parsed = JSON.parse(raw) as StoredProjectFile | LegacyCoverageProject[];
    const projects = Array.isArray(parsed) ? parsed : parsed.projects;
    return Array.isArray(projects) ? projects : null;
  } catch {
    return null;
  }
};

const serializeProjects = (projects: CoverageProject[]) =>
  JSON.stringify(
    {
      version: 1,
      savedAt: new Date().toISOString(),
      projects,
    } satisfies StoredProjectFile,
    null,
    2,
  );

export const supportsDirectoryStorage = () =>
  typeof window !== "undefined" &&
  typeof (window as DirectoryPickerWindow).showDirectoryPicker === "function";

export const getSavedStorageMode = () =>
  localStorage.getItem(STORAGE_MODE_KEY) as ProjectStorageMode | null;

export const getSavedDirectoryHandle = () =>
  readSetting<FileSystemDirectoryHandle>(DIRECTORY_HANDLE_KEY);

export const chooseDirectory = async () => {
  const handle = await (window as DirectoryPickerWindow).showDirectoryPicker?.({
    mode: "readwrite",
  });
  if (!handle) throw new Error("저장 폴더를 선택하지 않았습니다.");
  await writeSetting(DIRECTORY_HANDLE_KEY, handle);
  localStorage.setItem(STORAGE_MODE_KEY, "directory");
  return handle;
};

export const queryDirectoryPermission = (handle: FileSystemDirectoryHandle) =>
  (handle as PermissionAwareDirectoryHandle).queryPermission({ mode: "readwrite" });

export const requestDirectoryPermission = (handle: FileSystemDirectoryHandle) =>
  (handle as PermissionAwareDirectoryHandle).requestPermission({ mode: "readwrite" });

export const readProjectsFromDirectory = async (handle: FileSystemDirectoryHandle) => {
  try {
    const fileHandle = await handle.getFileHandle(PROJECT_FILE_NAME);
    const file = await fileHandle.getFile();
    return parseProjects(await file.text());
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") return null;
    throw error;
  }
};

export const writeProjectsToDirectory = async (
  handle: FileSystemDirectoryHandle,
  projects: CoverageProject[],
) => {
  const fileHandle = await handle.getFileHandle(PROJECT_FILE_NAME, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(serializeProjects(projects));
  await writable.close();
};
