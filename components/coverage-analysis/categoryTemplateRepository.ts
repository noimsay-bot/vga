export const LOCAL_ADVISOR_OWNER_ID = "local-advisor";

export interface CategoryTemplateItem {
  name: string;
  needed: number;
  order: number;
}

export interface CategoryTemplateCategory {
  name: string;
  order: number;
  items: CategoryTemplateItem[];
}

export interface CategoryTemplate {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  categories: CategoryTemplateCategory[];
}

export interface CategoryTemplateRepository {
  list(ownerId: string): CategoryTemplate[];
  replace(ownerId: string, templates: CategoryTemplate[]): void;
  subscribe(ownerId: string, notify: () => void): () => void;
}

const keyFor = (ownerId: string) => `coverage-analysis:category-templates:v1:${ownerId}`;
const eventFor = (ownerId: string) => `coverage-category-templates-changed:${ownerId}`;

const isTemplate = (value: unknown): value is CategoryTemplate => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as CategoryTemplate;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.createdAt === "number" &&
    typeof candidate.updatedAt === "number" &&
    Array.isArray(candidate.categories)
  );
};

export const localCategoryTemplateRepository: CategoryTemplateRepository = {
  list(ownerId) {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(keyFor(ownerId)) ?? "[]");
      return Array.isArray(parsed)
        ? parsed.filter(isTemplate).sort((left, right) => right.updatedAt - left.updatedAt)
        : [];
    } catch {
      return [];
    }
  },
  replace(ownerId, templates) {
    localStorage.setItem(keyFor(ownerId), JSON.stringify(templates));
    window.dispatchEvent(new Event(eventFor(ownerId)));
  },
  subscribe(ownerId, notify) {
    const onStorage = (event: StorageEvent) => {
      if (event.key === keyFor(ownerId)) notify();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(eventFor(ownerId), notify);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(eventFor(ownerId), notify);
    };
  },
};
