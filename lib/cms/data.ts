import "server-only";
import type { Project } from "@/types";
import { getDataAdapter } from "./server";

/**
 * Backend-agnostic CMS reads. These delegate to whichever data adapter
 * `DATA_BACKEND` selected, so every server read uses the configured store.
 * Adapters already return plain, serialized objects.
 */

export function fetchCollection<T = Record<string, unknown>>(
  collection: string,
) {
  return getDataAdapter().fetchCollection<T>(collection);
}

export function fetchById<T = Record<string, unknown>>(
  collection: string,
  id: string,
) {
  return getDataAdapter().fetchById<T>(collection, id);
}

export function getProjectById(id: string) {
  return getDataAdapter().fetchById<Project>("projects", id);
}
