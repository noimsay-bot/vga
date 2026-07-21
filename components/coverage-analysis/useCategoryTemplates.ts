"use client";

import { useSyncExternalStore } from "react";
import {
  LOCAL_ADVISOR_OWNER_ID,
  localCategoryTemplateRepository,
  type CategoryTemplate,
} from "./categoryTemplateRepository";

const EMPTY: CategoryTemplate[] = [];
let cachedRaw = "";
let cachedTemplates: CategoryTemplate[] = EMPTY;

const getSnapshot = () => {
  const next = localCategoryTemplateRepository.list(LOCAL_ADVISOR_OWNER_ID);
  const raw = JSON.stringify(next);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedTemplates = next;
  }
  return cachedTemplates;
};

const subscribe = (notify: () => void) =>
  localCategoryTemplateRepository.subscribe(LOCAL_ADVISOR_OWNER_ID, notify);

export default function useCategoryTemplates() {
  const templates = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  const persist = (next: CategoryTemplate[]) =>
    localCategoryTemplateRepository.replace(LOCAL_ADVISOR_OWNER_ID, next);

  const save = (template: CategoryTemplate) => {
    const withoutSame = templates.filter((candidate) => candidate.id !== template.id);
    persist([template, ...withoutSame]);
  };

  const rename = (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (templates.some((template) => template.id !== id && template.name === trimmed)) return false;
    persist(
      templates.map((template) =>
        template.id === id ? { ...template, name: trimmed, updatedAt: Date.now() } : template,
      ),
    );
    return true;
  };

  const remove = (id: string) => persist(templates.filter((template) => template.id !== id));

  return { templates, save, rename, remove };
}
