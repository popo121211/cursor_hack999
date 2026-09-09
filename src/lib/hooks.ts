"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getCapsuleById,
  getCapsules,
  subscribeCapsules,
} from "./storage";
import { Capsule } from "./types";

export function useCapsules(): Capsule[] {
  return useSyncExternalStore(subscribeCapsules, getCapsules, () => []);
}

export function useCapsule(id: string): Capsule | null {
  const getSnapshot = useCallback(() => getCapsuleById(id), [id]);
  return useSyncExternalStore(subscribeCapsules, getSnapshot, () => null);
}
